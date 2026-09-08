# Srikar's valley

A Zelda-inspired illustrated landing scene for srikarv.com. Vanilla HTML, CSS and JavaScript. Built-in image generation produced the landscape; see ASSET_PROMPTS.md.

## Development

Run `npm ci`, then `npm run dev`. The local server serves only the allowlisted `dist/` output. `npm run build` creates that output; `npm test` runs browser checks in Chromium and WebKit (install engines with `npx playwright install chromium webkit`).

The landing page shows an illustrated valley with subtle pointer parallax and animated motes. The minimal title contains “Hello, wanderer”, “I'm Srikar.” and “Learn More”. Learn More opens an explorable island map. Header/footer branding stays removed from the landing page. A moon symbol switches to night, starts quiet synthesized owl calls, and brings an owl gliding into the tree. Click the resting owl to mute/unmute it; daylight stops the calls. Night preference persists, but reloads and synchronized tabs stay silent until a click. Reduced-motion preferences skip the flight.

## World map

Eight landmarks open About Me, Blog, Science of Progress, Eternis, Autonomous Government, Freysa, Holons and Investments. The content and coordinates are in `map.js`; all destination content is short introductory/coming-soon copy. No archived articles are imported.

Click a place and the traveller follows connected paths to it. Click open ground to walk to the nearest path; arrow keys or WASD allow wandering on the island, and Enter/E interacts with a nearby destination or character. Srikar's guide, the archivist and the keeper offer authored dialogue choices. These are game characters, not live chat or an AI impersonation. Full collision physics and a 3D engine are outside this iteration.

On phones the map can be panned. Places provides direct destination access; zoom and Find my traveller manage the view. Visits are stored locally when available. Dialogs support keyboard focus and Escape; Escape closes a dialog or Places first, then returns from the world to the landing. Day/night applies to the map and dialogs too. The map adds a mute control for the existing owl calls.

Public assets are explicitly allowlisted in `scripts/build.mjs`, `Dockerfile` and `.dockerignore`. When changing frontend assets, update their URL version in index.html to avoid stale CDN combinations.

## Content

The user requested all blog posts remain unpublished. Local `unpublished/` contains 32 individual archived articles plus the original data and standalone Atlas. It is gitignored, absent from the build, and excluded by the Docker context and explicit COPY rules. Never include it in a commit or deployment without an explicit user request. Original source remains in the separate personal_blog directory.

## Deployment

Established repository: `LaymanConjecture/srikarv`, branch `public`. GitHub Pages serves the root at https://srikarv.com. This replacement removes the old blog scripts and Atlas from the published tree; earlier commits remain in Git history.

Ink deployment: workspace `eternis`, project/service `srikar-homepage`, same GitHub repository and `public` branch. Docker serves an explicit allowlist using nginx on port 80. Verify both the GitHub Pages build revision and Ink active revision after pushing.

The original personal_blog checkout has separate unpublished work. Do not push its stale public branch over this replacement. Continue website work in this homepage checkout.
