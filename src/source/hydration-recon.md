# HydraDB local runtime reconnaissance

## Viable strategy

Mirror the captured server-rendered pages and hydrate them with the source Framer ES modules. The graph has 88 modules (5,155,652 bytes) and 17 route definitions. Static and lazy imports use relative module filenames; preserve one common module directory and the original filenames, or rewrite every import edge consistently. No npm React/Framer package installation is needed for this strategy.

The homepage has approximately 1.22 MB of server-rendered HTML. Preserve its `data-framer-hydrate-v2`, route IDs, breakpoints, handover content and appearance metadata. Rewrite the same asset URLs in HTML and JS to avoid hydration mismatch. Serve `.mjs` with JavaScript MIME. Leave third-party app/auth destinations external and do not mirror private application pages.

## Routes and canonical origin

The source entry module is `script_main.Dzk7djLD.mjs`; complete routes and dependency edges are in `hydration-recon.json`. Its router hardcodes `siteCanonicalURL: https://hydradb.com`; patch that property to `location.origin` for local navigation. Public route types include homepage anchors, legal pages, manifesto, contact, about, alternatives, blog/CMS articles and use-case/CMS records. The router can issue HEAD requests with `Framer-Navigation: true`; the local server must resolve the same public routes for GET and HEAD.

## CMS data protocol

Five collection modules resolve eight binary `.framercms` files under Framer `/cms/` URLs. They construct these from their original `/modules/` URL base and then replace the directory segment. Resolved URLs and original expressions are in `hydration-recon.json.cms`. Download full files once.

The collection reader requests `?range=0-15,32-47` and expects HTTP200 with the requested inclusive byte slices concatenated. This is not HTTP Range/206 behavior. A full binary response for a range query fails the runtime's length check.

Do not text-rewrite CMS binary content: record pointers and indexes rely on byte offsets. Asset references embedded inside records should be recursively rewritten after record deserialization, before the data reaches the UI. The record decoder has the form `function Je(e){let t={},n=e.readUint16(); ... t[n]=D.read(e);return t}` with local variable names varying across collection modules. A shared `globalThis.__hydraLocalizeValue` helper can safely rewrite the parsed object. Download assets found in the binary strings without modifying the binary bytes.

## Assets outside the Framer module graph

The homepage embeds Unicorn Studio SDK2.1.11 with scene `oUvrbeOq0WuFIWyfR7ZD`. Its scene JSON references an MP4, thumbnail, font atlas and glyph image. SDK, scene JSON and exact dependency URLs are in `hydration-recon.json.unicorn`. Localize the SDK's dynamically built CDN URL and project JSON fetch; a normal literal-only URL scanner will miss these. Use local `projectJSON` or patch the SDK embed base to a local path.

Blog search reads `meta[name=framer-search-index]` and its fallback. Capture both current search index JSON URLs recorded in the report. The contact component adds a Google Fonts CSS @import; download that CSS and its font files and rewrite the @import inside both SSR HTML and the page JS.

Image query strings are asset identities. Rewrite full URL variants, including `srcset` candidates and HTML-escaped ampersands. Preserve descriptors. Source-map virtual filenames and code example imports are not browser runtime dependencies.

## Public interactions and source services

Keep source stateful components for tabs, accordions, navigation, search and graphs. The chat component posts messages to a production workers.dev service, and the contact form posts user fields to Formspree then navigates to a booking page. For a local frontend clone, retain the controls and validation but route submissions to transparent local preview responses. Do not send prototype messages to the source company.

Initial HTML includes Google Analytics, Framer Events, Intercom, Reo and PostHog. Framer's `eRvDxNVcwfeK5KnVIpdtgKBXVlR6X4iguklpUg-VCBg._6Fb5PRq.mjs` also injects tracking snippets on client navigation. Remove these from the active clone while preserving raw source snapshots. The module can retain its public exports while `getSnippets()` returns empty `bodyEnd`, `bodyStart`, `headEnd` and `headStart` arrays. Source PostHog configuration is missing a comma and already causes a syntax issue.

## Import findings

No import.meta use was found in88modules. Regex bare-import candidates in the CodeBlock/language modules were examples and language grammars; parsing their actual dependency specifiers confirmed all imports are relative bundled files. Framer has one computed `import(n)` fallback for registered modules, and the collection richtext modules directly register CodeBlock for the source content. Framer's optional editor module points to `framer.com/edit/init.mjs`; local preview does not need the editorbar.

This report is technical source inspection. No app scaffold, UI implementation or tests were performed by this subtask.
