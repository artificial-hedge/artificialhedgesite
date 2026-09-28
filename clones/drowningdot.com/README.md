# drowningdot.com — full offline mirror

Exact replica of https://drowningdot.com captured 2026-09-28.

## Run

```
python3 serve.py          # http://localhost:8903/drowningdot.com/index.html
```

Must be served from this root.

## What's included

- `drowningdot.com/` — all 9 pages: index, work/ (+grooz, jukuna, killarney-stem),
  process/, contact/, terms, privacy + all images, css, js (incl. pleat.js hero effect),
  og.png.

## Notes

- Hand-coded static site; no integrity attributes, no build step — cleanest clone of the three.
- The contact form posts to `drowningdot.com/api/contact` (live backend, can't be mirrored).
- Outbound links (vercel project sites, awwwards, etc.) remain remote, same as live.
