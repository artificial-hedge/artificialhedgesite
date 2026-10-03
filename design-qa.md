# Design QA

## Current revision: artificial hedge / fx-1 & fx-1 lite

The public site is rebranded as a company building frontier financial language models, with 14 authored pages and 263 legacy route redirects. The HydraDB source archive remains intact; its database articles and product comparisons are no longer presented as artificial hedge research.

Reviewed the homepage at 1440 × 1000, 1333 × 977 and 390 × 844, plus the model overviews, architecture, benchmark section, model subscriptions/API pricing and contact flow. The paired desktop hero review uses `evidence/hydra/source-home-desktop-hero.jpg` and `evidence/rebrand/final-home.png` (hero) and `evidence/rebrand/model-family-two-models.png` (current model addition). The original fonts, black/orange palette and local pixel-tree scene are retained. Copy, application anatomy, workflow diagrams and evaluation content are intentionally updated for the new company.

- The evaluation ledger contains all 23 user-supplied results/statuses. GDPval-AA v2 uses the latest 1732 Elo; GPQA Diamond alone uses 97.3%. Status rows retain supported/evaluated. The HLE-Full graph compares 45.7 with 61.0 for fx-1 + dipcatcher using a plain score axis.
- Finance filtering displays four entries; restoring all displays 23. Mobile table width is 348 px inside a 390 px viewport, with Elo units preserved and no page overflow.
- The model comparison, model overviews and architecture distinguish fx-1 (3.4T total / ~128B active per token) from fx-1 lite (2.4T total / ~49B active per token). All evaluation scores remain attributed to fx-1.
- All five proposed monthly subscription prices and tier names remain intact. Economy and extended provide lite access; frontier economy and frontier extended provide fx-1; warp+ provides both. API rates are separately labelled USD per million tokens: fx-1 $10 input/$30 output; lite $5/$15. Dipcatcher is under development and releasing soon with a direct waitlist CTA. When available, it will be bundled free until the research preview ends on December 12, 2026. Subscription enquiries carry the chosen model and tier; retired access-mode fields and controls are removed. The dipcatcher waitlist link opens the contact page with the development waitlist context. The economy subscription link carries fx-1 lite and economy with no mode parameter. The updated pricing introduction and waitlist banner were inspected at 1440 × 1000 and 390 × 844.
- Contact uses a native POST to FormSubmit for advaith@artificialhedge.co, keeping default CAPTCHA and a honeypot. No email submission was performed. Actual delivery needs the inbox owner's activation; endpoint configuration and visible form state were inspected only.
- Desktop and mobile model comparisons, the lite profile, architecture and API pricing were inspected. Reviewed mobile documents have no width overflow at 390 px. The final homepage browser console has no errors or warnings. Reduced motion and offscreen pausing are implemented for the original tree scene.

`npm run build` passed. Generated branded HTML and the required Sites output files were inspected. No automated test suite was added or run. Latest evidence is in `evidence/rebrand/`, including `subscriptions-dipcatcher-waitlist.png` for the subscription/development revision.

## Archived clone baseline

**Result: passed**

Source: https://hydradb.com/

Local preview: http://localhost:5173/

## Scope and evidence

The preserved source contains 252 canonical public pages and eight redirect aliases. All are generated locally. The capture includes 1,846 downloaded assets (318,785,052 bytes), all 88 primary runtime modules, the original Unicorn Studio scene, fonts, media, and eight complete CMS binaries. Source provenance and download outcomes remain in `src/source/`.

The representative homepage, blog listing/article, use-case listing/detail, alternatives listing/detail, contact, legal, blank source about route, and source 404 page were opened locally. Representative templates were compared with source screenshots; this does not claim individual visual inspection of every blog article.

- Desktop homepage geometry: 1440 × 10773.
- Mobile homepage geometry: 390 × 18450.
- Contact desktop geometry: 1440 × 1732; mobile has no document width overflow at 390 px.
- Original typography, palette, copy, grids, spacing, buttons, graphics and responsive component anatomy match the source in reviewed views.
- Source and local screenshots are paired in `evidence/hydra/compare-desktop.jpg`; detailed visual findings are in `evidence/hydra/visual-review.md`.

## Behavior observed

Desktop Resources and mobile menus open; primary-domain links stay local. Use-case selectors change their content, FAQs expand and collapse, blog search returns local results, and Load More increases the article count from 28 to 55 links. Comparison navigation loads the matching detail page. Source-style anchor navigation and the original pixel-tree animation work locally.

Contact and newsletter confirmations explicitly describe browser-local drafts. Chat explicitly describes a disconnected local preview. Original form validation and controls are retained. Production analytics and editor injection are disabled.

## Repairs completed

- Localized static and lazy module imports and decoded CMS record URLs.
- Implemented exact inclusive CMS query-range delivery without modifying binary offsets.
- Preserved CSS syntax when replacing font URLs; removed malformed parser URL aliases from runtime replacement.
- Decoded captured raw style text before URL replacement to make server and client styles agree.
- Restored and compared the complete contact panel, labels, chips, fields and orange submit button.

No confirmed P0, P1 or P2 application defects remain in the reviewed evidence. Different animation/ticker phases and offscreen reveal states are expected; matched warm viewport captures were used when full-page captures showed a different transient state.

## Build and limits

`npm run build` completed successfully and generated `dist/client/index.html`, all captured route pages, `dist/server/index.js`, and `dist/.openai/hosting.json`. No automated test suite was added or run.

External authenticated apps, dashboards, documentation, research, trust and booking services remain outgoing links. Seven referenced PDFs were unavailable on their source servers; their URLs and errors are recorded in the manifest and README. A future hosting handoff needs the CMS range adapter used by the local Vite delivery plugin.
