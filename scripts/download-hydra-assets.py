#!/usr/bin/env python3
"""Capture public HydraDB visual assets and recursive module dependencies.

Downloads stay immutable in src/source/assets. Source HTML remains intact; a
separate localisation layer can use the manifest's full-URL to local-path map.
Run again after capturing more pages to extend the graph without redownloading.
"""
from __future__ import annotations
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from hashlib import sha256
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import time
from urllib.parse import urldefrag, urljoin, urlsplit
import requests

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src/source'
ASSETS = SOURCE / 'assets'
MANIFEST = SOURCE / 'asset-manifest.json'
EXTENSIONS = {'.css','.js','.mjs','.cjs','.map','.json','.woff','.woff2','.ttf','.otf','.eot','.png','.jpg','.jpeg','.webp','.gif','.avif','.svg','.ico','.mp4','.webm','.mov','.mp3','.wav','.ogg','.glb','.gltf','.bin','.wasm','.glsl','.frag','.vert','.hdr','.exr','.ktx','.ktx2','.pdf','.framercms'}
BLOCKED = ('googletagmanager.com','google-analytics.com','events.framer.com','intercom.io','intercomcdn.com','intercomassets.com','js.intercomcdn.com','reodotdev','reo.dev','doubleclick.net','facebook.net','connect.facebook.net','api.segment.io','cdn.segment.com','api.amplitude.com','hotjar.com','clarity.ms','posthog.com','posthog.eu')
ASSET_HOSTS = ('framerusercontent.com','fonts.gstatic.com','fonts.googleapis.com','cdn.jsdelivr.net','unpkg.com','esm.sh','cdn.unicorn.studio','unicorn.studio','assets.unicorn.studio','hydradb.com','www.hydradb.com')
CMS_URL_RE = re.compile(r'new\s+URL\(\s*[\"\'`]([^\"\'`]+\.framercms)[\"\'`]\s*,\s*(?:[\"\'`]([^\"\'`]+)[\"\'`]|import\.meta\.url)\s*\)\.href\.replace\(\s*[\"\'`]/modules/[\"\'`]\s*,\s*[\"\'`]/cms/[\"\'`]\s*\)')
URL_RE = re.compile(r'https?://[^\s<>"\'`\\]+')
QUOTED_RE = re.compile(r'["\'`]([^"\'`\s<>]+)["\'`]')
CSS_URL_RE = re.compile(r'(?<!new )url\(\s*["\']?([^\s)"\']+)', re.I)
IMPORTED_RE = re.compile(r'(?:from\s*|import\s*\(|import\s*|export\s*[^;]{0,90}?from\s*)["\']([^"\']+)["\']')
SOURCE_MAP_RE = re.compile(r'[#@]\s*sourceMappingURL=([^\s*]+)')


def normalise(value, base):
    value = unescape(value).replace('\\/', '/').replace('\\u0026','&').strip()
    if not value or value.startswith(('data:','blob:','#','mailto:','tel:','javascript:')):
        return None
    absolute = urldefrag(urljoin(base, value))[0]
    parts = urlsplit(absolute)
    return absolute if parts.scheme in ('http','https') and parts.netloc else None


def blocked(url):
    host = urlsplit(url).hostname or ''
    return any(host == domain or host.endswith('.' + domain) for domain in BLOCKED) or '/edit/' in url or 'widget.intercom.io' in url


def is_asset(url):
    if blocked(url) or any(token in url for token in ('${', '%7B', '%7D', '{', '}', '$')): return False
    parts = urlsplit(url)
    ext = Path(parts.path).suffix.lower()
    host = parts.hostname or ''
    if ext in EXTENSIONS: return True
    if host == 'fonts.googleapis.com' and '/css' in parts.path: return True
    # Scene JSON can use a project identifier instead of an extension.
    if host.endswith('unicorn.studio') and any(x in parts.path for x in ('scene','project','asset','file','texture')): return True
    return False


class HTMLAssets(HTMLParser):
    def __init__(self, base):
        super().__init__(convert_charrefs=True); self.base=base; self.assets=set(); self.excluded=set()
    def handle_starttag(self, tag, attrs):
        attributes=dict(attrs)
        values=[]
        if tag in ('script','img','video','audio','source','iframe','embed','object','input'):
            values += [attributes.get(x,'') for x in ('src','poster','data')]
        if tag == 'link' and set(attributes.get('rel','').lower().split()) & {'stylesheet','icon','shortcut','apple-touch-icon','preload','modulepreload','manifest'}:
            values.append(attributes.get('href',''))
        if tag in ('img','source'):
            for item in attributes.get('srcset','').split(','):
                if item.strip(): values.append(item.strip().split()[0])
        for value in values:
            url=normalise(value,self.base)
            if url and blocked(url): self.excluded.add(url)
            elif url and is_asset(url): self.assets.add(url)


def discover(text, base, kind):
    found=set(); excluded=set()
    if kind == 'map': return found, excluded
    if kind == 'cms':
        # Framer binary strings carry length prefixes, so stop at non-printable
        # boundaries. Never mutate these bytes or their record offsets.
        for raw in re.findall(r'https?://[A-Za-z0-9_~:/?#\[\]@!$&()*+,;=.%+-]+',text):
            url=normalise(raw,base)
            if url and is_asset(url): found.add(url)
        return found, excluded
    for path, literal_base in CMS_URL_RE.findall(text):
        found.add(urljoin(literal_base or base,path).replace('/modules/','/cms/'))
    if kind == 'html':
        parser=HTMLAssets(base); parser.feed(text); found.update(parser.assets); excluded.update(parser.excluded)
    for raw in URL_RE.findall(text):
        url=normalise(raw,base)
        if not url: continue
        if blocked(url): excluded.add(url)
        elif is_asset(url): found.add(url)
    raw_candidates=CSS_URL_RE.findall(text)
    if kind in ('script','css','json'):
        raw_candidates += IMPORTED_RE.findall(text) + SOURCE_MAP_RE.findall(text)
        for value in QUOTED_RE.findall(text):
            path=urlsplit(value).path
            if Path(path).suffix.lower() in EXTENSIONS and not value.endswith('.framercms') and value.startswith(('./','../','http','//')) and not value.startswith(('application/','image/','video/')): raw_candidates.append(value)
    for raw in raw_candidates:
        url=normalise(raw,base)
        if not url: continue
        if blocked(url): excluded.add(url)
        elif is_asset(url): found.add(url)
    return found, excluded


def path_for(url, content_type=''):
    parts=urlsplit(url); ext=Path(parts.path).suffix.lower()
    if ext not in EXTENSIONS:
        ext={ 'text/css':'.css','application/javascript':'.mjs','text/javascript':'.mjs','application/json':'.json','image/png':'.png','image/jpeg':'.jpg','image/svg+xml':'.svg','application/octet-stream':'.bin' }.get(content_type.split(';')[0],'.bin')
    slug=re.sub(r'[^A-Za-z0-9_-]','-',Path(parts.path).stem or 'asset')[:65]
    return ASSETS / f'{sha256(url.encode()).hexdigest()[:16]}-{slug}{ext}'


def fetch(url):
    error=None
    for attempt in range(3):
        try:
            response=requests.get(url,timeout=(15,70),headers={'User-Agent':'Mozilla/5.0 (compatible; local-prototype-asset-capture/1.0)','Referer':'https://hydradb.com/'},allow_redirects=True)
            response.raise_for_status()
            mime=response.headers.get('Content-Type','')
            if 'text/html' in mime and Path(urlsplit(url).path).suffix.lower() != '.html':
                raise ValueError('asset URL returned HTML rather than the expected asset')
            data=response.content
            path=path_for(url,mime); path.write_bytes(data)
            entry={'source_url':url,'final_url':response.url,'local_path':str(path.relative_to(ROOT)),'content_type':mime,'http_status':response.status_code,'status':'downloaded','bytes':len(data),'sha256':sha256(data).hexdigest(),'captured_at':datetime.now(timezone.utc).isoformat()}
            suffix=path.suffix
            if suffix in ('.css','.js','.mjs','.cjs','.json','.map','.svg','.gltf','.frag','.vert','.glsl','.framercms'):
                text=data.decode('utf-8','replace')
                kind='cms' if suffix == '.framercms' else 'css' if suffix == '.css' else 'map' if suffix=='.map' else 'json' if suffix in ('.json','.gltf') else 'script'
                dependencies, excluded=discover(text,response.url,kind)
            else: dependencies,excluded=set(),set()
            return entry,dependencies,excluded
        except Exception as exc:
            error=f'{type(exc).__name__}: {exc}'
            if attempt < 2: time.sleep(.5*(attempt+1))
    return {'source_url':url,'status':'failed','error':error},set(),set()


def source_pages():
    # The homepage is at source/home.html; all recursive page captures are found
    # without coupling this capture graph to the page crawler's filename scheme.
    for path in SOURCE.rglob('*.html'):
        if ASSETS in path.parents: continue
        yield path


def non_runtime_reason(row):
    url=row['source_url']; host=urlsplit(url).hostname or ''; refs=row.get('discovered_from',[])
    if any(token in url for token in ('${','{','}','$')): return 'unresolved template expression, not a literal asset request'
    if host=='preview.framercdn.com': return 'editor-only preview module'
    if host=='cdn.jsdelivr.net' and url.endswith('/unicornstudio.js'): return 'SDK repository prefix, not a distribution file'
    if host=='github.com' and refs and all(ref.endswith('.map') for ref in refs): return 'source-map documentation reference'
    if host=='framerusercontent.com' and not url.endswith('.framercms'):
        if '/framerusercontent.com/' in url or '/node_modules/' in url: return 'source-map virtual source filename'
        if refs and all(ref.endswith('.map') for ref in refs): return 'source-map virtual source filename'
        if any(token in url for token in ('/src/','/pages/','/static/array.js','/application/','/image/vnd.','/video/vnd.','/App.js','/app.component.css','/public/bundle.css','/styles.css')): return 'embedded code example or MIME registry string'
        if url=='https://framerusercontent.com/index.js': return 'embedded code example filename'
    return None


def save(entries, excluded, page_count):
    # Source maps and code examples contain virtual paths. Preserve diagnostics
    # without describing those strings as missing runtime assets.
    for row in entries.values():
        if row['status']=='failed':
            reason=non_runtime_reason(row)
            if reason: row['status']='skipped_non_runtime'; row['reason']=reason
    records=sorted(entries.values(),key=lambda row:row['source_url'])
    summary=dict(Counter(row['status'] for row in records)); summary['bytes']=sum(row.get('bytes',0) for row in records)
    payload={'source_site':'https://hydradb.com/','captured_at':datetime.now(timezone.utc).isoformat(),'scope':'public visual and runtime assets; immutable original bytes','source_page_count':page_count,'summary':summary,'excluded_tracking_and_editor_urls':sorted(excluded),'assets':records}
    tmp=MANIFEST.with_suffix('.json.tmp'); tmp.write_text(json.dumps(payload,indent=2)); tmp.replace(MANIFEST)


def main():
    args=argparse.ArgumentParser(); args.add_argument('--workers',type=int,default=12); args.add_argument('--retry-failed',action='store_true'); args.add_argument('--extra-url',action='append',default=[]); options=args.parse_args()
    ASSETS.mkdir(parents=True,exist_ok=True)
    entries={}; excluded=set(); visited=set(); origins={}; pending=set()
    if MANIFEST.exists():
        previous=json.loads(MANIFEST.read_text()); entries={row['source_url']:row for row in previous.get('assets',[])}; excluded.update(previous.get('excluded_tracking_and_editor_urls',[]))
        for url, row in entries.items():
            path=ROOT / row.get('local_path','missing')
            if row.get('status')=='downloaded' and path.is_file(): visited.add(url)
            elif row.get('status')=='skipped_non_runtime': visited.add(url)
            elif row.get('status')=='failed' and not options.retry_failed: visited.add(url)
    def enqueue(url,origin):
        origins.setdefault(url,set()).add(origin)
        if url not in visited: pending.add(url)
    pages=list(source_pages())
    for page in pages:
        # Absolute asset URLs dominate Framer HTML. Relative public assets are
        # resolved against the site's corresponding source path when possible.
        base='https://hydradb.com/'
        if page.name != 'home.html':
            name=str(page.relative_to(SOURCE)).removesuffix('.html')
            if name.startswith('pages/'): name=name[6:]
            if name.startswith('routes/'): name=name[7:]
            if name.endswith('/index'): name=name[:-6]
            base=urljoin(base,name)
        dependencies,skip=discover(page.read_text(),base,'html'); excluded.update(skip)
        for url in dependencies: enqueue(url,str(page.relative_to(ROOT)))
    extra_urls=list(options.extra_url)
    recon_path=SOURCE/'hydration-recon.json'
    if recon_path.exists():
        recon=json.loads(recon_path.read_text()); unicorn=recon.get('unicorn',{})
        extra_urls += [unicorn.get('sdkUrl',''),unicorn.get('projectUrl','')] + unicorn.get('assetUrls',[])
        extra_urls += [row.get('url','') for row in recon.get('modules',[])]
        extra_urls += [row.get('url','') for row in recon.get('cms',{}).get('urlExpressions',[])]
    for url in extra_urls:
        cleaned=normalise(url,'https://hydradb.com/')
        if cleaned and not blocked(cleaned): enqueue(cleaned,'explicit runtime discovery')
    # Re-scan previously captured text assets to pick up newer scanner rules.
    for url,row in list(entries.items()):
        path=ROOT/row.get('local_path','missing')
        if row.get('status')=='downloaded' and path.is_file() and path.suffix in ('.css','.js','.mjs','.cjs','.json','.map','.svg','.gltf','.frag','.vert','.glsl','.framercms'):
            dependencies,skip=discover(path.read_text(errors='replace'),row.get('final_url',url),'cms' if path.suffix=='.framercms' else 'css' if path.suffix=='.css' else 'map' if path.suffix=='.map' else 'script');excluded.update(skip)
            for dep in dependencies:enqueue(dep,url)
    round_number=0
    while pending:
        batch=sorted(pending);pending.clear();visited.update(batch);round_number+=1
        print(f'asset graph round {round_number}: {len(batch)} downloads',flush=True)
        with ThreadPoolExecutor(max_workers=options.workers) as executor:
            futures={executor.submit(fetch,url):url for url in batch}
            for count,future in enumerate(as_completed(futures),1):
                url=futures[future]; row,deps,skip=future.result(); entries[url]=row;excluded.update(skip)
                for dep in deps: enqueue(dep,url)
                row['dependencies']=sorted(deps)
                if row['status']=='failed': print(f'failed: {url} — {row["error"]}',flush=True)
                elif count%50==0: print(f'  {count}/{len(batch)} complete',flush=True)
                if count%40==0: save(entries,excluded,len(pages))
        for url,row in entries.items():row['discovered_from']=sorted(set(row.get('discovered_from',[]))|origins.get(url,set()))
        save(entries,excluded,len(pages))
    for url,row in entries.items():row['discovered_from']=sorted(set(row.get('discovered_from',[]))|origins.get(url,set()))
    save(entries,excluded,len(pages))
    print(json.dumps({'source_pages':len(pages),'summary':dict(Counter(row['status'] for row in entries.values())),'bytes':sum(row.get('bytes',0)for row in entries.values()),'excluded':len(excluded)},indent=2),flush=True)

if __name__=='__main__':main()
