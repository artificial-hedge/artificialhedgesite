# artificial hedge

A local website for **artificial hedge**, a company building frontier financial language models and quantitative intelligence. The current site introduces **fx-1**, **fx-1 lite**, and **dipcatcher**, an autonomous trading harness under development and releasing soon. Its visual foundation comes from the preserved HydraDB website capture, including the local fonts and animated hero tree.

Local preview: `http://localhost:5173/`.

## Authoring and generated output

Edit the current website in `src/rebrand/`:

- `content.js` — company positioning, applications, capabilities, questions, and metadata.
- `site.js` / `site.css` — shared navigation, homepage, footer, and layout.
- `visuals.js` / `visuals.css` — semantic workflow graphics and the evaluation ledger.
- `pages.js` / `pages.css` — models, research, contact, pricing, documentation, application details, and legal preview pages.
- `app.js` — browser interactions.

`scripts/build-rebrand.mjs` generates the current HTML pages in `src/site/` and copies browser modules/styles to `public/rebrand/`. Generated files should not be edited directly. `scripts/localize-hydra.py` prepares the archived resources and local asset map before the rebrand build.

The current routes include `/models`, `/research`, `/contact`, `/pricing`, `/docs`, `/use-cases`, five application detail pages, `/privacy-policy`, and `/terms-and-conditions`. Legacy HydraDB blog URLs redirect to `/research`; alternatives redirect to `/models`; former use-case URLs redirect to the current applications. Source articles are preserved in the archive rather than relabelled as artificial hedge research.

## Development commands

```sh
npm run dev        # serve the current local site
npm run rebrand    # regenerate authored pages after src/rebrand edits
npm run localize   # prepare captured resources and regenerate the current site
npm run build      # regenerate and create production output
```

The archive can be updated separately with `npm run capture` and `npm run assets`. Those scripts reuse existing captures and downloads; their provenance inventories remain in `src/source/`.

## Models and API pricing

The model specifications and rates below were supplied by the user. Total parameters and active parameters per token are displayed separately. API rates are in **USD per 1 million tokens**.

| Model | Focus | Total parameters | Active parameters per token | API input | API output |
| --- | --- | --- | --- | --- | --- |
| fx-1 | Frontier finance and mathematics | 3.4T | ~128B | $10 | $30 |
| fx-1 lite | Economy-optimised finance and mathematics | 2.4T | ~49B | $5 | $15 |

The model overview, architecture diagram, documentation and pricing page describe both profiles. API token rates are listed separately from monthly subscription prices.

## Model usage subscriptions and dipcatcher waitlist

The research preview offers waitlist enquiries for five proposed monthly model usage subscriptions:

| Plan | Monthly price (USD) | Model access |
| --- | --- | --- |
| economy | $20* | fx-1 lite |
| extended | $50* | fx-1 lite |
| frontier economy | $100* | fx-1 |
| frontier extended | $500* | fx-1 |
| warp+ | $1,000* | fx-1 and fx-1 lite |

\* Subject to change. Exact allowances, included usage and top-up details remain provisional. Warp+ provides the highest planned access limits, with planned industry grade compliance tooling and data access.

**dipcatcher is currently under development and will release soon; join its waitlist for now.** When available, it will be bundled free with model subscriptions until the research preview ends on December 12, 2026. Model usage subscriptions and API token usage retain their own pricing.

## Reported fx-1 evaluations

The site presents **23 reported fx-1 evaluation results supplied by the user**. All reported results apply to **fx-1**. Preserve their original scales when editing the ledger: **GDPval-AA v2 is 1732 Elo**, not a percentage; **GPQA Diamond is 97.3%**. Scores, percentages, and Elo ratings use different scales. The HLE-Full comparison shows **45.7 for fx-1** and **61.0 for fx-1 with dipcatcher**, using plain score units. Evaluation configurations and methodology will accompany the technical release.

## Contact delivery

Contact and dipcatcher enquiries submit using a native HTML POST to `https://formsubmit.co/advaith@artificialhedge.co`. FormSubmit is a free HTML form backend. The inbox owner must confirm the activation email triggered by the first submission before regular delivery works. The form keeps the provider's default CAPTCHA, a honeypot, named fields, the sender email for replies, and a table email template. Selected interest, model and subscription tier travel with the enquiry. Legacy access-mode parameters are ignored. After submission, the provider returns to this site's contact page. No test mail has been sent.

Current documentation and research pages are authored locally. The archived HydraDB assistant, contact, and newsletter adapters remain excluded from the branded UI; source telemetry, tracking, support loaders, and editor tools are disabled. Authentication, production dashboards, model inference, and trading services are outside this website prototype.

## Preserved HydraDB archive

`src/source/` contains the original public-site material and provenance:

- **252 canonical public pages**, represented by **260 successful raw HTML captures** including eight legacy redirect aliases.
- **1,846 downloaded assets**, approximately **319 MB**, including runtime modules, CMS data, fonts, images, SVGs, video, shaders, and available referenced documents.
- Exact source HTTP 404 responses for four stale links, with status and hash records in `404-provenance.json`.
- `route-inventory.json`, `redirect-aliases.json`, and `asset-manifest.json` with URLs, capture paths, hashes, dependencies, and download status.

Keep captured source and CMS binary files unchanged. Seven PDF references were unavailable at their source: the two HydraDB research/benchmark PDF URLs return or redirect to HTTP 404, and five OpenReview PDF URLs return HTTP 403. Their references and errors remain in the manifest; no replacement documents were invented. Browser evidence is archived in `evidence/hydra/`.

## Sites compatibility

Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact. The production build must leave:

- `dist/client/index.html`
- `dist/server/index.js`
- `dist/.openai/hosting.json`

For an explicitly requested Sites handoff, run `npm run build` and `npm run test:sites` before publishing. No deployment is implied by local generation.
