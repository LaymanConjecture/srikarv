# Valley landing page

The user's September 8 direction replaces the old graph interface with a beautiful Zelda-inspired scene, starting from scratch. This explicitly overrides the shared design language's default app surfaces and heading scale for this immersive scene. Inter, Baskerville, restrained controls, accessible focus and day/night choice remain.

The first iteration is a full-screen illustrated title scene with restrained parallax, drifting motes, an unobstructed view mode and opt-in synthesized wind. It is not a playable 3D world. All controls remain available in view mode. Reduced motion is respected.

Writing is archived locally under ignored `unpublished/`. Nothing imports that archive. The build uses an explicit public-file allowlist. Existing public articles are retired by removing their deployed files; source history and the original local blog remain available.

Generated day and night images use the built-in image generation tool. Prompts are in `ASSET_PROMPTS.md`; deployment assets are `assets/valley-day.webp` and `assets/valley-night.webp`. Original PNGs remain locally in assets and are ignored by git.

## Minimal presentation revision

The user explicitly requested removal of all header/footer branding and controls, ornaments and supporting copy. The title screen now contains only “Hello, wanderer”, “I'm Srikar.” and “Learn More”. This overrides the shared visible dark-mode-toggle rule. The scene defaults to day and no longer reads a saved theme or initializes audio. Learn More retains the existing clear-view interaction pending further content direction.

## Night owl revision

The next user request restores a single day/night symbol, with quiet owl calls and an owl flying to the tree. Header/footer branding remains removed. Night mode crossfades the landscape and brings a generated owl sprite along a 6.2-second glide into the canopy, then blends to a resting pose. Clicking the owl toggles quiet, locally synthesized three-note hoots spaced 18–24 seconds apart. Day mode cancels flight and sound. Calls stop while the tab is hidden. Saved night mode restores a perched, silent owl without autoplay; other tabs synchronize the appearance without playing sound. Reduced motion skips the flight. The final sprites are `assets/owl-flight.webp` and `assets/owl-rest.webp`; original transparent PNGs remain local and ignored.

## Branch and lighting correction

The resting sprite is now `assets/owl-rest-v2.webp`, repainted using the nighttime landscape as a lighting/style reference. Its source-space height is 42px, with soft cool shading; the flight sprite is scaled and dimmed to match. A 44px interactive target remains around the small bird. The talon contact point is at (980, 74) on the upper edge of the exposed branch in the original 1672 × 941 landscape. Placement now follows the image's cover scale and object-position through ResizeObserver, rather than arbitrary viewport percentages. The artwork and bird share the same parallax/zoom container. A faint contact shadow rests on the bark. The user requested that the existing icon-only toggle remain unchanged.
