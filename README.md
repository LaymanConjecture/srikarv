# Srikar's valley

A Zelda-inspired illustrated landing scene for srikarv.com. Vanilla HTML, CSS and JavaScript. Built-in image generation produced the landscape; see ASSET_PROMPTS.md.

## Development

Run `npm ci`, then `npm run dev`. The local server serves only the allowlisted `dist/` output. `npm run build` creates that output; `npm test` runs browser checks in Chromium and WebKit (install engines with `npx playwright install chromium webkit`).

The landing page shows an illustrated valley with subtle pointer parallax and animated motes. The minimal title contains “Hello, wanderer”, “I'm Srikar.” and “Learn More”. Learn More opens an explorable island map. Header/footer branding stays removed from the landing page. A moon symbol switches to night, starts quiet synthesized owl calls, and brings an owl gliding into the tree. Click the resting owl to mute/unmute it; daylight stops the calls. Night preference persists, but reloads and synchronized tabs stay silent until a click. Reduced-motion preferences skip the flight.

## World map

The map contains eight place labels and one Srikar character. No toolbar, footer, other characters, walking avatar, route indicators, visit counters or zoom controls remain. Touch scrolling, mouse dragging and keyboard focus keep offscreen labels reachable. Escape returns to the landing. The map inherits the landing's day/night choice and mutes owl calls when entered.

Eternis links directly to https://eternis.ai and Freysa to https://freysa.ai. About Me opens `about.html`, with an unfolding parchment (reduced motion skips the animation). Investments opens `investments.html`; its list is intentionally empty until the user supplies companies. Both pages have a return link to `/#world` and a theme toggle, with no footer. Blog remains unpublished; the other unconfigured destinations retain short coming-soon panels.

Clicking Srikar opens an agent panel. **Live chat is not connected:** no agent URL or API endpoint has been supplied. The panel states this clearly and sends no messages. Replace this unavailable state with the user's actual agent integration once provided; never put private agent credentials in this static repository. Biography and investment copy also await the user.

Public assets are explicitly allowlisted in `scripts/build.mjs`, `Dockerfile` and `.dockerignore`. When changing frontend assets, update their URL version in index.html to avoid stale CDN combinations.

## Content

The user requested all blog posts remain unpublished. Local `unpublished/` contains 32 individual archived articles plus the original data and standalone Atlas. It is gitignored, absent from the build, and excluded by the Docker context and explicit COPY rules. Never include it in a commit or deployment without an explicit user request. Original source remains in the separate personal_blog directory.

## Deployment

Established repository: `LaymanConjecture/srikarv`, branch `public`. GitHub Pages serves the root at https://srikarv.com. This replacement removes the old blog scripts and Atlas from the published tree; earlier commits remain in Git history.

Ink deployment: workspace `eternis`, project/service `srikar-homepage`, same GitHub repository and `public` branch. Docker serves an explicit allowlist using nginx on port 80. Verify both the GitHub Pages build revision and Ink active revision after pushing.

The original personal_blog checkout has separate unpublished work. Do not push its stale public branch over this replacement. Continue website work in this homepage checkout.
