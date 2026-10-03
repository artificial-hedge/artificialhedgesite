#!/usr/bin/env python3
"""Build a local, editable mirror from the preserved HydraDB capture.

Original captures and assets stay byte-for-byte intact in src/source.
Generated UI is in src/site; generated runtime resources are in public/assets.
"""
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit, unquote
import importlib.util
import html
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'src/source'
SITE = ROOT / 'src/site'
PUBLIC = ROOT / 'public'
ORIGIN = 'https://hydradb.com'


def clean_url(value):
    return value.split('#', 1)[0]


def main():
    manifest = json.loads((SOURCE / 'asset-manifest.json').read_text())
    inventory = json.loads((SOURCE / 'route-inventory.json').read_text())
    records = [a for a in manifest['assets'] if a['status'] == 'downloaded']
    mapping = {}
    for asset in records:
        local = '/assets/' + Path(asset['local_path']).name
        # A source scanner can capture CSS syntax after an otherwise valid URL.
        # Keep those downloads for provenance, but never replace closing quotes
        # or parentheses as though they were part of a runtime resource address.
        if re.search(r'[\"\'`\s<>]', asset['source_url']):
            continue
        for remote in [asset['source_url'], asset.get('final_url')]:
            if remote:
                mapping[clean_url(remote)] = local
    # Responsive variants remain available, while dynamically constructed queries
    # can fall back to a downloaded asset at the same immutable source pathname.
    for remote, local in list(mapping.items()):
        mapping.setdefault(remote.split('?', 1)[0], local)
    url_pattern = re.compile(r'https?://[^\s\"\'<>`\\(){}\[\]]+')

    def replace_urls(text):
        def replacement(match):
            original = match[0]
            token = original.rstrip(',;')
            suffix = original[len(token):]
            remote = html.unescape(token)
            local = mapping.get(remote)
            if local:
                return local + suffix
            base, marker, query = remote.partition('?')
            if marker and base in mapping:
                return mapping[base] + '?' + query + suffix
            return original
        return url_pattern.sub(replacement, text)

    spec = importlib.util.spec_from_file_location('hydra_patches', ROOT / 'scripts/hydra-runtime-patches.py')
    patches = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(patches)

    assets_dir = PUBLIC / 'assets'
    assets_dir.mkdir(parents=True, exist_ok=True)
    relative_pattern = re.compile(r'([\"\'])(\.{1,2}/[^\"\'\n]+)\1')

    def replace_relative(m, base):
        remote = clean_url(urljoin(base, m[2]))
        if remote in mapping:
            return m[1] + mapping[remote] + m[1]
        return m[0]

    patched_modules = []
    for asset in records:
        src = ROOT / asset['local_path']
        dst = assets_dir / src.name
        suffix = src.suffix.lower()
        content_type = asset.get('content_type', '')
        is_scene = 'assets.unicorn.studio/embeds/' in asset['source_url']
        is_module = suffix in ['.js', '.mjs'] and not is_scene
        is_text = is_module or is_scene or suffix in ['.css', '.json', '.svg', '.html']
        # CMS files contain absolute offsets. They must never be text rewritten.
        if suffix == '.framercms' or not is_text:
            shutil.copyfile(src, dst)
            continue
        try:
            text = src.read_text()
        except UnicodeDecodeError:
            shutil.copyfile(src, dst)
            continue
        if is_module:
            text = patches.patch_module(text, asset['source_url'], mapping)
            text = relative_pattern.sub(lambda m: replace_relative(m, asset['source_url']), text)
            patched_modules.append(asset['source_url'])
        text = replace_urls(text)
        if is_module:
            text = text.replace('https://hydradb.com/', '/')
        dst.write_text(text)

    shutil.copyfile(ROOT / 'src/local-runtime.js', PUBLIC / 'local-runtime.js')
    (PUBLIC / 'asset-map.json').write_text(json.dumps(mapping, separators=(',', ':')))
    SITE.mkdir(parents=True, exist_ok=True)
    routes, redirects = {}, {}
    scripts = re.compile(r'<script\b[^>]*>.*?</script>', re.S | re.I)
    trackers = re.compile(r'intercom|googletagmanager|\bgtag\(|posthog|static\.reo\.dev|events\.framer\.com|__framer_force_showing_editorbar|hydra_first_touch_utm', re.I)
    attrs = re.compile(r'\b(href|src|action|data-nested-link)=(\"|\')(.*?)\2', re.S)
    inline_map = '<script>window.__HYDRA_ASSET_MAP__=' + json.dumps(mapping, separators=(',', ':')).replace('</', '<\\/') + ';</script><script src="/local-runtime.js"></script>'

    def rewrite_attribute(m, base):
        name, quote, value = m[1], m[2], html.unescape(m[3])
        if name == 'href' or name == 'action':
            if value.startswith(('./', '../', ORIGIN)):
                url = urlsplit(urljoin(base, value))
                if url.netloc in ('hydradb.com', 'www.hydradb.com'):
                    value = urlunsplit(('', '', url.path or '/', url.query, url.fragment))
        return name + '=' + quote + html.escape(value, quote=True) + quote

    def rewrite_html(text, base):
        text = scripts.sub(lambda m: '' if trackers.search(m[0]) else m[0], text)
        text = re.sub(r'<link\b[^>]*rel=[\"\'](?:preconnect|dns-prefetch)[\"\'][^>]*>', '', text, flags=re.I)
        # Style is raw text. Decode captured entities before finding resource
        # URLs so encoded CSS delimiters remain outside the URL token.
        text = re.sub(r'(<style\b[^>]*>)(.*?)(</style>)', lambda m: m[1] + html.unescape(m[2]) + m[3], text, flags=re.S | re.I)
        text = attrs.sub(lambda m: rewrite_attribute(m, base), text)
        text = replace_urls(text)
        text = text.replace('https://hydradb.com', 'http://localhost:5173')
        return text.replace('</head>', inline_map + '</head>', 1)

    for route in inventory['routes']:
        if route.get('status') != 200 or not route.get('capture_path'):
            continue
        canonical = urlsplit(route['final_url']).path.rstrip('/') or '/'
        original = urlsplit(route['source_url']).path.rstrip('/') or '/'
        if original != canonical:
            redirects[original] = canonical
            continue
        if canonical in routes:
            continue
        text = (ROOT / route['capture_path']).read_text()
        text = rewrite_html(text, route['final_url'])
        relative = 'index.html' if canonical == '/' else canonical.lstrip('/') + '/index.html'
        dest = SITE / unquote(relative)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text)
        routes[canonical] = unquote(relative)
    if (SOURCE / '404.html').exists():
        (SITE / '404.html').write_text(rewrite_html((SOURCE / '404.html').read_text(), ORIGIN + '/demo'))
    (SITE / 'route-map.json').write_text(json.dumps({'routes': routes, 'redirects': redirects}, indent=2))
    (SITE / 'localization-report.json').write_text(json.dumps({
        'canonical_pages': len(routes), 'redirect_aliases': len(redirects),
        'downloaded_assets': len(records), 'asset_bytes': sum(a['bytes'] for a in records),
        'module_files': len(patched_modules), 'source': ORIGIN,
        'external_services': ['app.hydradb.com', 'dashboard.hydradb.com', 'docs.hydradb.com', 'research.hydradb.com', 'trust.hydradb.com', 'cal.com'],
        'source_unavailable_references': [a['source_url'] for a in manifest['assets'] if a['status'] == 'failed'],
    }, indent=2))
    print(f'Localized {len(routes)} pages, {len(redirects)} redirects, {len(records)} assets.')


if __name__ == '__main__':
    main()
