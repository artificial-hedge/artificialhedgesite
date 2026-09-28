# monolayer.dev — full offline mirror

Exact replica of https://www.monolayer.dev captured 2026-09-28.

## Run

```
python3 serve.py          # http://localhost:8901/www.monolayer.dev/index.html
```

Must be served from this root (root-relative asset paths `/host/...`).

## What's included

| Path | Source |
|---|---|
| `www.monolayer.dev/` | Marketing site — home, /news (18 articles), /terms, /privacy |
| `app.monolayer.dev/` | Docs site + log-in/sign-up pages (Next.js) |
| `sdk-docs` under `app.monolayer.dev/` | VitePress API reference |
| `tour.monolayer.dev/` | Product tour |
| `sso.monolayer.dev/` | Cognito hosted-UI login/signup/forgot-password pages |
| `cdn.prod.website-files.com/` | Webflow CDN (css, js, favicons, fonts, og image) |
| `cdn.odyn.dev/` | Site bundle (animations, scramble, unicorn glue) |
| `cdn.jsdelivr.net/` | gsap, barba, lenis, unicornstudio |
| `d3e54v103j8qbb.cloudfront.net/` | jquery, webflow badge imgs |
| `d8mvw3yuxp9od / d1dkulh9pqc6xi / d8sdinqd7i1db .cloudfront.net` | Cognito UI chunks/icons/theme |
| `storage.googleapis.com/unicornstudio-production/` | UnicornStudio scene JSON (localized) |
| `assets.unicorn.studio/` | Scene glyph + matcap textures (localized) |

## Notes

- `integrity` attributes were stripped (file bytes change when links are rewritten; SRI would block them).
- The UnicornStudio scene + WebGL assets are patched to local paths inside
  `unicornStudio.umd.js` — the hero glyph animation works fully offline.
- Login/signup forms post to the real `sso.monolayer.dev` (auth can't be mirrored).
- `posthog` analytics + the bare `cdn.prod.website-files.com` preconnect remain remote,
  same as the live site.
- Docs sidebar links to `/sdk-docs/reference/api/{main,introspection,test-helpers}`
  404 — they 404 on the live site too.
- Filenames containing `?` (e.g. `login?redirect_uri=...html`, `_next/image?url=...`)
  are intentional: the HTML references them percent-encoded (`%3F`) and Python's
  http.server decodes them back. Keep `serve.py` (or any server that unquotes
  the path) as the server.
