# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Current project: artificial hedge / fx-1 & fx-1 lite

The user requested a downloaded HydraDB clone, then asked to rebrand the entire public site to `artificial hedge`, a company building frontier financial LLMs and quantitative models. The models are `fx-1` and `fx-1 lite`. This is a model company, not an AI-native fund. Keep editable brand copy lowercase and retain the captured black/orange design, pixel typography, and animated tree. Replace database product messaging, unrelated customer endorsements, inherited metrics, graphs and diagrams with relevant financial model content.

Preserve originals in `src/source/` and their provenance manifests. Generate the captured resources through `scripts/localize-hydra.py`, then generate the editable branded UI from `src/rebrand/` through `scripts/build-rebrand.mjs`. Keep Framer CMS binary files byte-exact. Legacy database articles and comparison URLs redirect to relevant branded pages; do not present source articles as artificial hedge research.

## Reported model evaluations

The user states that fx-1 has 3.4T total parameters and approximately 128B active parameters per token. fx-1 lite has 2.4T total parameters and approximately 49B active parameters per token. Display total and active specifications distinctly in the model overview and architecture diagram. Market fx-1 as a state-of-the-art frontier model for finance and demanding mathematics, and fx-1 lite as a highly capable model optimized for finance and mathematics at economy pricing. Do not infer additional architecture or throughput details. No fx-1 lite benchmark scores have been supplied; do not attribute fx-1 scores to lite.

Use only the user-supplied fx-1 values in `src/rebrand/visuals.js`. Scores are plain numbers, except GPQA Diamond is explicitly 97.3% and rating benchmarks use Elo. GDPval-AA v2 is 1,732 Elo; this latest value supersedes the earlier 1,823. Show Tau cube banking as supported and CorpFin v2 as evaluated. HLE-Full is 45.7 for fx-1 and 61.0 with dipcatcher. Do not invent competitor scores, evaluation protocols, unprovided metrics, customer claims or certifications.

## Model access and dipcatcher

Keep a dedicated pricing page for model usage subscriptions, API pricing and dipcatcher. Use research preview, Usage, and tiers. Remove BYOK, bring-your-own-key options, provider-key copy and access-mode controls from the UI and contact flow. Monthly planned model usage subscriptions are economy $20* and extended $50* for fx-1 lite, frontier economy $100* and frontier extended $500* for fx-1, and warp+ $1,000* for both models. Prices are subject to change and calls to action are waitlist options. Warp+ plans industry grade compliance and data and the highest access limits; do not imply a completed certification. Dipcatcher is currently under development and will release soon; offer a waitlist for now. When available, it will be bundled free with model subscriptions until the research preview ends on December 12, 2026. Do not suggest it is available now or invent charges after that deadline.

Show API pricing separately from monthly subscription tiers: fx-1 costs $10 per million input tokens and $30 per million output tokens; fx-1 lite costs $5 per million input tokens and $15 per million output tokens. Do not imply unlimited tokens, included API credit, unprovided usage quotas, or free model inference because dipcatcher is free during research preview.

All public navigation should stay on the artificial hedge site. At the user's request, contact and dipcatcher enquiries submit through the free HTML FormSubmit endpoint `https://formsubmit.co/advaith@artificialhedge.co` with a native POST. Keep its default CAPTCHA, named input fields, email reply-to, and selected model and subscription tier. Do not preserve a legacy access mode in contact submissions. The inbox owner must confirm the first FormSubmit activation email before delivery works. Do not send test mail unless asked. Do not save contact messages to browser storage. Keep source telemetry and editor tools disabled. Support reduced motion and pause the source animation offscreen.
