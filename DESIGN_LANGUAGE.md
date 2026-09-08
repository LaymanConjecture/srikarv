# Shared product design language

Version 1.1 · September 6, 2026

This is the shared visual language for every project in `allprojects_latest_sep5`:
Axion Hedge Fund, Axion VC, Eternisland, Gap Map, Holon, Jarvis, QMarket,
Self Health and Writing. Read it before designing or changing a user-facing
surface. It applies to apps, dashboards, forms, cards, reading views and reports.

The master lives at `allprojects_latest_sep5/DESIGN_LANGUAGE.md`. An identical
copy lives at each project's root so the guidance travels with that project.
When the shared language changes, update the master and all project copies.
Keep project-specific exceptions in a separate note. The user's explicit design
direction takes precedence over older visual guidelines.

## Intent

Sleek, modern, calm and easy to understand. Use generous spacing, purposeful
type and quiet surfaces. A person should immediately see what matters, what a
card means, and which action to take. Every label must earn its place.

The reference is [Marvin Schwaibold's grid walkthrough](https://x.com/MSchwaibold/status/2096306405649318139).
Its explicit rules are an 8px base grid, 24px card corners and insets, Inter and
Baskerville, and at most three text sizes and weights per component. Its video
separates grid, padding, content structure and typography. The prompts below
adapt those rules for these products; they are not unpublished prompts quoted
from the author. The initial implementation is the hedge-fund app's
`earnings_jury/static/cards.css`.

## Layout and spacing

- Use an 8px rhythm: 8, 16, 24, 32, 48 and 64px. A 4px optical adjustment is
  acceptable inside a compact control; avoid arbitrary spacing everywhere else.
- Give ordinary cards 24px corners and 24px internal padding. Give related
  controls or inset sections 12px corners. Use fully rounded ends for compact
  navigation, status pills and primary composer actions.
- Group each card into context, main content and actions. Use 16–24px between
  groups, with smaller spacing inside a group. Align their content edges.
- Let content determine height. Align comparable card footers where practical.
  Do not clip the question or conclusion to force identical card heights.
- Separate components with whitespace or a subtle divider. Avoid redundant
  containers, repeated borders and decorative cards around other cards.
- Bound long feeds and board columns so they cannot bury adjacent workspaces.
  Give scroll regions an accessible name, keyboard access and visible focus.

## Typography

Use only two primary families: **Inter** for the interface and **Baskerville**
for expressive headlines, the main question, and reading titles. Prefer local
Baskerville where available, with Libre Baskerville and Georgia as fallbacks.
Use readable system sans-serif fallbacks for Inter.

| Role | Typical size | Weight | Use |
|---|---:|---:|---|
| Context | 12px | 400 or 500 | Status, time, tags, secondary actions |
| Supporting content | 14px | 400 or 500 | Explanations, labels and card prose |
| Main thought | 20 or 24px | 400 | The card's question or conclusion |

Keep a component to three text sizes and no more than three weights: 400, 500,
600. A page heading may use 32–48px and a long-form reader may use 16px body
text. These are separate components, not extra competing styles inside a card.
Use 1.3–1.4 line height for titles and 1.65–1.8 for prose. Reading columns should
usually stay within 65–75 characters. Use sentence case. Use tabular numerals
for financial values and counters; reserve monospace for literal code.

## Color and surfaces

These defaults match the implemented reference. Give each value a shared token;
components should consume tokens rather than introduce one-off colors.

```css
:root {
  --bg: #f7f7f4;
  --card: #ffffff;
  --surface-2: #eaece5;
  --surface-3: #f5f6f2;
  --line: #e2e5de;
  --border-dim: #eceee8;
  --ink: #202720;
  --muted: #646d63;
  --accent: #55755b;
  --accent-text: #3b6345;
  --accent-light: #edf3e9;
  --radius-card: 24px;
  --radius-control: 12px;
  --shadow-card: 0 2px 3px -2px #2432220a,
                 0 8px 24px -16px #24322214;
}
```

Use near-black primary buttons with white text. Keep secondary buttons quiet.
Use muted green for focus, selection and ordinary interaction. Preserve each
product's meaningful success, warning and error colors. Color must support a
text label or icon, not carry status alone. Keep real logos and brand assets.
Avoid decorative gradients, heavy shadows, glow effects and invented graphs.
Check contrast against the actual background, including disabled and muted text.

## Light and dark appearance

The light palette above is the base. Every deployed interface offers a visible
Dark mode toggle, including its reading pages and sign-in screen. The dark
palette keeps the same typography, spacing, hierarchy and card shapes:

| Role | Light | Dark |
|---|---|---|
| Canvas | `#f7f7f4` | `#111612` |
| Card | `#ffffff` | `#19211b` |
| Inset | `#f5f6f2` | `#1d271f` |
| Raised inset | `#eaece5` | `#263329` |
| Border | `#e2e5de` | `#344438` |
| Primary text | `#202720` | `#edf2eb` |
| Secondary text | `#646d63` | `#a6b2a4` |
| Interactive text | `#3b6345` | `#9ac6a4` |
| Selected surface | `#edf3e9` | `#263b2b` |

Start in light mode until the person chooses dark. Save that choice in local
storage per site and apply it before the first paint. Toggle without navigation,
reloading, losing drafts, or changing app data. Synchronize tabs of the same
site. Storage restrictions must not prevent toggling during the current visit.
The toggle has a stable accessible name, pressed state, visible keyboard focus,
and a 40px or larger target. Keep its icon and switch visible on narrow screens.
Change palettes atomically so text never flashes against the previous surface.

Use semantic color tokens for cards, text, controls, dialogs, tables and status
colors. Preserve logos and illustrations, adapting only their surrounding UI.
Check both themes at desktop, tablet, 390px and 320px widths, including expanded
details, long content, sign-in and form drafts. The shared implementation is
`design-theme.css` and `design-theme.js` at the workspace root; deployed copies
travel with each app. Keep these copies synchronized.

## Cards and controls

**Research or task card.** Lead with the actual question. Put kind/status above
it and related ticker/topic labels together below it. Keep details and provenance
expandable. Group the main action and state transitions in a footer; keep pin,
feedback and similar utilities small, aligned and consistently positioned.

**Data or opportunity card.** Lead with the useful value or conclusion. Show its
unit, time and evidence where relevant. Give the reason and next action clear
sections. Never fabricate numbers, trend lines, confidence or success to make a
design feel complete. Keep meaningful data gaps visible at the affected decision.

**Composer.** Use an inviting input, a quiet label and a clear save/send action.
Keep any logo in its own layout cell. Preserve the draft across navigation and
dialogs. On phones, keep both the action label and icon legible; never compress
an icon into a narrow fixed-width button with excessive padding.

**Reader.** Present the answer or conclusion first, then reasoning, uncertainty
and next checks. Use short paragraphs, useful lists and generous line spacing.
Keep complete original material accessible without making it the default wall
of text. Do not rewrite authoritative content merely to fit a layout.

**Dialog.** Use the same surfaces and spacing. Give it an obvious title and close
action. Keep focus inside modal dialogs and return focus to the trigger on exit.
Escape should dismiss the topmost dialog. Preserve unsaved work. Group secondary
configuration inside Settings where that fits the product's information design.

**Controls.** Target at least 40px height, preferably 44px on touch devices.
Smaller icon controls need adequate spacing and clear accessible names. Provide
hover, focus, disabled, loading and selected states. Match field, select and
scrollbar styling to the product. Keep semantic HTML and keyboard behavior.

## Responsive behavior

- Keep desktop content within the viewport. Four board columns must not be
  squeezed into an unreadable sidebar layout; give the board a full row.
- Use two columns on tablets when necessary. On phones, use one content column
  or a clearly contained horizontal board with a visible hint of the next column.
- Keep the page itself free of horizontal overflow. Tables and boards may scroll
  within their own named containers. Do not hide overflow to conceal broken text.
- Preserve 24px card padding where possible, with at least 16px page gutters on
  phones. Keep navigation and primary actions reachable at 320px width.
- Make sticky navigation genuinely sticky; avoid ancestor overflow settings
  that silently turn it into an ordinary scrolling header.
- Honor reduced-motion preferences. Use short, restrained state transitions;
  no movement is needed simply to make the page appear modern.

## Writing and information hierarchy

Use plain human language. Put the main point first and show just enough context
to act. Prefer a short action label to repeated explanations of how the product
works. Do not show internal IDs, object names or implementation details in the
main flow unless they help a user make a decision. Put audit detail in disclosures.

Avoid repeated boilerplate and decorative copy. Keep uncertainty, permission
boundaries or safety information where it actually changes the user's decision.
Removing explanatory text does not change access control or underlying behavior.
An empty state should explain the next useful step without forcing fake content.

Prefer one heading per section. Remove motivational eyebrows such as “Follow the
question,” subtitles that repeat the heading, and instructions already clear
from a labeled control. Keep evidence, uncertainty, freshness, price gaps and
decision blockers. Shorten interface copy without rewriting stored research or
removing features. Put full supporting material behind existing disclosures.

## Reusable design prompt

> Apply this project's DESIGN_LANGUAGE.md to the existing interface. Make each
> component communicate one primary thought. Use the 8px spacing rhythm, 24px
> card corners and insets, Inter plus Baskerville, and no more than three text
> sizes and weights per component. Separate context, content and actions. Use
> quiet white surfaces on the shared off-white canvas, restrained borders and
> clear interactive states. Preserve actual data, all working controls, accessible
> behavior and unsaved input. Keep the result responsive and human-readable.
> Inspect realistic content, long titles, empty states and expanded details in
> the browser before calling the implementation finished.

For a new component, specify its purpose, real content, available actions and
states after this prompt. For a redesign, reuse existing application structure
and behavior. Translate these tokens into the project's existing CSS or component
system; do not add a framework just to change appearance.

## Delivery check

Inspect desktop and mobile screenshots with real or clearly labeled fixture data.
Check long titles, empty/error/loading states, expanded content, keyboard focus,
touch controls and unsaved drafts. Check 1440px and 390px, plus narrow 320px and
tablet layouts when relevant. Verify in Chromium and WebKit for changed controls.
Run the relevant existing checks; add tests only for meaningful new behavior.

Preserve unrelated files and user changes. Update project specifications when
their contracts change. Follow the workspace's existing Ink deployment policy
for actual app changes. This design document itself is guidance; copying it into
a project does not mean that project's existing interface has been redesigned.
