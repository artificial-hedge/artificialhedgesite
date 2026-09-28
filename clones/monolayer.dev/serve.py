#!/usr/bin/env python3
"""Serve the monolayer.dev mirror. Must run from the clone root so
root-relative asset paths (/<host>/...) and percent-encoded filenames
(*%3F* -> literal '?' files) resolve correctly."""
import http.server, os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8901
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))
    # extensionless payloads (unicorn scene json) still serve fine
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '': 'application/octet-stream'}

http.server.ThreadingHTTPServer.allow_reuse_address = True
with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), H) as s:
    print(f"serving clone at http://localhost:{PORT}/www.monolayer.dev/index.html")
    s.serve_forever()
