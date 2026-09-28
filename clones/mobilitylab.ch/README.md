# mobilitylab.ch — full offline mirror

Exact replica of https://www.mobilitylab.ch captured 2026-09-28.

## Run

```
python3 serve.py          # http://localhost:8902/www.mobilitylab.ch/index.html
```

Must be served from this root.

## What's included

| Path | Source |
|---|---|
| `www.mobilitylab.ch/` | All 216 pages — FR + EN (`/en/`), /news (all articles), /clusters/*, legal |
| `cdn.prod.website-files.com/` | Webflow CDN — all images (avif/jpg/png/svg), css, js, fonts |
| `cdn.jsdelivr.net/` | gsap + plugins |
| `cdn.weglot.com/` | weglot.min.js (FR/DE toggle) |
| `d3e54v103j8qbb.cloudfront.net/` | jquery |
| `player.vimeo.com/` | 4 hero/background mp4 videos (11–18 MB each, full files) |

## Notes

- `integrity` attributes stripped (SRI blocks link-rewritten files).
- Vimeo `file.mp4?loc=external&signature=...` filenames contain `?` by design —
  refs are percent-encoded (`%3F`) and decode correctly through `serve.py`.
- One vimeo iframe embed (`player.vimeo.com/video/706429545`) stays remote — it's
  Vimeo's player page, not a downloadable asset.
- weglot's translation API calls go to the live weglot service, same as the live site.
- `plugins/Basic/assets/placeholder.60f9b1840c.svg` 403s — same on the live site
  (it's an invisible placeholder for empty CMS fields).
