#!/usr/bin/env python3
"""Capture HydraDB public marketing HTML without changing the source documents.

The inventory distinguishes render dependencies from outbound links. This script
does not enter authenticated subdomains or download private application state.
"""

import concurrent.futures
import hashlib
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ORIGIN = "https://hydradb.com"
ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "source"
ALLOWED_HOSTS = {"hydradb.com", "www.hydradb.com"}
BLOCKED_PREFIXES = (
    "/api/", "/admin/", "/dashboard/", "/account/", "/auth/",
    "/login/", "/signup/", "/preview/", "/search/",
)
HEADERS = {"User-Agent": "Mozilla/5.0 (public site source capture)", "Accept": "text/html,*/*"}
URL_PATTERN = re.compile(r"https?://[^\s\"'<>\\)]+")
CAPTURE_METADATA = {}


def canonical_route(url, base=ORIGIN + "/"):
    parsed = urllib.parse.urlsplit(urllib.parse.urljoin(base, html.unescape(url)))
    if parsed.hostname not in ALLOWED_HOSTS:
        return None
    path = parsed.path or "/"
    if any(path == prefix.rstrip("/") or path.startswith(prefix) for prefix in BLOCKED_PREFIXES):
        return None
    if re.search(r"\.(?:css|js|mjs|json|xml|txt|png|webp|jpe?g|svg|ico|pdf|woff2?|ttf|mp4|webm)$", path, re.I):
        return None
    return ORIGIN + path.rstrip("/") if path != "/" else ORIGIN + "/"


def fetch(url):
    for attempt in range(3):
        try:
            request_url = url
            for redirect in range(6):
                request = urllib.request.Request(request_url, headers=HEADERS)
                try:
                    with urllib.request.urlopen(request, timeout=35) as response:
                        return response.read(), {
                            "source_url": url,
                            "final_url": response.url,
                            "status": response.status,
                            "content_type": response.headers.get("Content-Type", ""),
                        }
                except urllib.error.HTTPError as error:
                    # The host's bundled urllib does not automatically follow 308.
                    if error.code not in {301, 302, 303, 307, 308} or not error.headers.get("Location"):
                        raise
                    destination = urllib.parse.urljoin(request_url, error.headers["Location"])
                    if urllib.parse.urlsplit(destination).hostname not in ALLOWED_HOSTS:
                        raise OSError("public route redirects outside the capture scope")
                    request_url = destination
            raise OSError("public route exceeded the redirect limit")
        except (OSError, urllib.error.URLError) as error:
            if attempt == 2:
                return None, {"source_url": url, "error": str(error)}
            time.sleep(0.5 * (attempt + 1))


def route_file(url):
    path = urllib.parse.urlsplit(url).path
    if path == "/":
        return SOURCE / "home.html"
    parts = [urllib.parse.quote(urllib.parse.unquote(part), safe="-_.()") for part in path.strip("/").split("/")]
    return SOURCE / "routes" / Path(*parts) / "index.html"


class DependencyParser(HTMLParser):
    def __init__(self, url):
        super().__init__()
        self.url = url
        self.dependencies = {}
        self.routes = set()
        self.outbound_links = set()
        self.modules = set()
        self.title = []
        self.in_title = False
        self.hydration = False
        self.ssr = False

    def asset(self, url, kind):
        if not url or url.startswith(("data:", "#", "blob:")):
            return
        absolute = urllib.parse.urljoin(self.url, html.unescape(url))
        if urllib.parse.urlsplit(absolute).scheme not in {"http", "https"}:
            return
        self.dependencies.setdefault(absolute, set()).add(kind)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "title":
            self.in_title = True
        if attrs.get("id") == "main" or attrs.get("data-framer-name"):
            self.ssr = True
        if tag == "a" and attrs.get("href"):
            target = urllib.parse.urljoin(self.url, attrs["href"])
            route = canonical_route(target, self.url)
            if route:
                self.routes.add(route)
            elif urllib.parse.urlsplit(target).scheme in {"http", "https"}:
                self.outbound_links.add(target)
        if tag == "script":
            self.asset(attrs.get("src"), "script")
            if attrs.get("type") == "module" and attrs.get("src"):
                self.modules.add(urllib.parse.urljoin(self.url, attrs["src"]))
            if attrs.get("type") == "framer/handover":
                self.hydration = True
        if tag == "link":
            rel = attrs.get("rel", "")
            if rel in {"stylesheet", "preload", "modulepreload", "icon", "shortcut icon", "apple-touch-icon"}:
                self.asset(attrs.get("href"), "link:" + rel)
        if tag in {"img", "video", "source", "audio", "iframe"}:
            self.asset(attrs.get("src"), tag)
            self.asset(attrs.get("poster"), "poster")
            for candidate in attrs.get("srcset", "").split(","):
                self.asset(candidate.strip().split(" ")[0], "srcset")
        if tag == "meta" and attrs.get("property", attrs.get("name", "")).endswith(":image"):
            self.asset(attrs.get("content"), "social-image")

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title.append(data)


def inspect_route(url):
    target = route_file(url)
    if target.exists():
        data = target.read_bytes()
        final_url = CAPTURE_METADATA.get(url, {}).get("final_url", url)
        info = {"source_url": url, "final_url": final_url, "status": 200, "content_type": "text/html", "cached": True}
    else:
        data, info = fetch(url)
        if data is None:
            return info
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    document = data.decode("utf-8", errors="replace")
    parser = DependencyParser(url)
    parser.feed(document)
    for asset_url in URL_PATTERN.findall(html.unescape(document)):
        host = urllib.parse.urlsplit(asset_url).hostname or ""
        if host in {"framerusercontent.com", "fonts.gstatic.com", "fonts.googleapis.com"}:
            parser.asset(asset_url.rstrip(";,]}"), "embedded-url")
    for asset_url in re.findall(r"url\(\s*['\"]?([^)'\"\s]+)", document):
        parser.asset(asset_url, "css-url")
    info.update({
        "route": urllib.parse.urlsplit(url).path,
        "capture_path": str(target.relative_to(ROOT)),
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "title": "".join(parser.title),
        "framer_ssr": parser.ssr,
        "framer_handover": parser.hydration,
        "module_entries": sorted(parser.modules),
        "linked_public_routes": sorted(parser.routes),
        "outbound_links": sorted(parser.outbound_links),
        "dependencies": [{"url": dependency, "kinds": sorted(kinds)} for dependency, kinds in sorted(parser.dependencies.items())],
    })
    return info


def main():
    SOURCE.mkdir(parents=True, exist_ok=True)
    previous_inventory = SOURCE / "route-inventory.json"
    if previous_inventory.exists():
        CAPTURE_METADATA.update({item["source_url"]: item for item in json.loads(previous_inventory.read_text()).get("routes", [])})
    sitemap_data = None
    for endpoint in ["robots.txt", "sitemap.xml"]:
        target = SOURCE / endpoint
        data = target.read_bytes() if target.exists() else fetch(ORIGIN + "/" + endpoint)[0]
        if data is not None:
            target.write_bytes(data)
        if endpoint == "sitemap.xml":
            sitemap_data = data
    seeds = {ORIGIN + "/"}
    if sitemap_data:
        for item in ET.fromstring(sitemap_data).iter():
            if item.tag.endswith("}loc") or item.tag == "loc":
                route = canonical_route(item.text or "")
                if route:
                    seeds.add(route)
    pending = seeds
    seen = set()
    results = []
    while pending:
        batch = sorted(pending - seen)
        if not batch:
            break
        seen.update(batch)
        pending = set()
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            for result in executor.map(inspect_route, batch):
                results.append(result)
                pending.update(result.get("linked_public_routes", []))
        print(f"captured {len(results)} public pages; {sum('error' in item for item in results)} errors", flush=True)
    results.sort(key=lambda item: item["source_url"])
    inventory = {
        "origin": ORIGIN,
        "captured_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "scope": "Public primary-domain marketing pages; authenticated subdomains excluded.",
        "robots_excluded_prefixes": list(BLOCKED_PREFIXES),
        "routes": results,
    }
    (SOURCE / "route-inventory.json").write_text(json.dumps(inventory, indent=2) + "\n")
    assets = {}
    for route in results:
        for dependency in route.get("dependencies", []):
            asset = assets.setdefault(dependency["url"], {"url": dependency["url"], "kinds": set(), "referenced_by": set()})
            asset["kinds"].update(dependency["kinds"])
            asset["referenced_by"].add(route["source_url"])
    asset_inventory = [dict(url=asset["url"], kinds=sorted(asset["kinds"]), referenced_by=sorted(asset["referenced_by"])) for asset in assets.values()]
    asset_inventory.sort(key=lambda item: item["url"])
    (SOURCE / "asset-source-inventory.json").write_text(json.dumps({"assets": asset_inventory}, indent=2) + "\n")
    successes = sum("capture_path" in item for item in results)
    route_lines = ["# HydraDB public source captures", "", f"Discovered {len(results)} primary-domain routes and captured {successes} successful source documents; dependencies are listed in asset-source-inventory.json.", "", "Raw HTML is preserved verbatim. Framer SSR includes inline CSS, responsive DOM, SVG icons, appear animation data, and handover payloads. Module dependencies must be mirrored recursively to preserve hydration. Outbound docs/research/application destinations remain external public links; private or authenticated application state was not captured.", "", "## Routes", ""]
    route_lines += [f"- `{item.get('route', urllib.parse.urlsplit(item['source_url']).path)}` — {item.get('capture_path', item.get('error'))}" for item in results]
    (SOURCE / "README.md").write_text("\n".join(route_lines) + "\n")
    print(json.dumps({"routes": len(results), "assets": len(asset_inventory), "errors": [item for item in results if "error" in item]}), flush=True)


if __name__ == "__main__":
    main()
