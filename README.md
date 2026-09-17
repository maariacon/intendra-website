# Intendra Website — Build Plan & Handoff Notes

## What this is
A static HTML/CSS/JS prototype of the Intendra marketing site. It is meant to be
visually and behaviorally complete (content, styles, animations, assets) so the
engineering team can port it directly into whatever stack they deploy on
(React, a CMS, etc.) without having to guess at design intent.

## Design source of truth
Two sources feed this build, in order of priority:

1. **Live reference build** — https://blue-water-0fa0c7500.2.azurestaticapps.net/
   is the actual visual/content target. All page copy (hero, problem section,
   platform tabs, how-it-works, outcomes, founder bios, timeline, books,
   articles/podcasts intros) was transcribed directly from that build. If it
   changes, re-check this site against it.
2. **"Intendra AI Design System"** project on claude.ai/design — supplies the
   raw brand tokens (color/type/spacing/radii/shadow) in `css/variables.css`.
   The semantic aliases (`--bg-page`, `--text-primary`, etc.) were then
   **remapped to a dark-first theme** to match the reference build, since the
   design system's own defaults are light-first. Raw brand color values
   (`--color-brilliant-green`, `--color-obsidian`, etc.) are unchanged from
   that project.

Notable flagged substitutions:
- **Typeface**: the reference build uses **Outfit** (Google Fonts), not the
  design system's spec (Hanken Grotesk / Acumin Pro). Went with Outfit to
  match what's actually live. `css/variables.css` deliberately avoids a
  render-blocking `@import` for it — wire up Outfit via your own font-loading
  strategy (self-hosted woff2, `next/font`, `@fontsource/outfit`, etc.).
- **Danger/error color**: not in the brand kit; derived via oklch to stay
  tonally consistent (`--color-danger`).
- **Button/card shape**: reference build uses fully pill-shaped buttons
  (`--radius-pill`) and 16px card corners (`--radius-lg`) — overrides the
  design system's default `--radius-md` buttons.

## Pages
- `index.html` — Home
- `about.html` — About (founders, timeline, thought-leadership books)
- `services.html` — Product (deep-dive on Pulse / Profile / Compass / Reveal)
- `articles.html` — Articles
- `podcasts.html` — Podcasts & Video
- `contact.html` — Request a Demo (contact form)

Nav is Home / About / Articles / Podcasts + a "Request Demo" pill CTA on
every page, matching the reference build (no separate "Contact" nav item —
the demo-request page is reached via the CTA button everywhere).

All pages share the same `<header>` (nav) and `<footer>` markup, duplicated
per file on purpose — this is a prototype, not a build system. Engineering
should componentize header/footer/nav during real implementation.

## Folder structure
```
/
├── index.html
├── about.html
├── services.html      (Product page)
├── articles.html
├── podcasts.html
├── contact.html        (Request a Demo)
├── css/
│   ├── variables.css     — design tokens: color, type, spacing, radius, shadow
│   ├── base.css           — reset + base typography/element styles
│   ├── layout.css         — header, nav, footer, grid/section containers
│   ├── components.css     — buttons, cards, forms, badges, nav toggle
│   └── animations.css     — keyframes + scroll-reveal / hover transition classes
├── js/
│   ├── main.js            — mobile nav toggle, general UI interactions
│   └── animations.js      — IntersectionObserver-based scroll-reveal trigger
├── assets/
│   ├── images/
│   │   ├── team/           — team headshots (About page)
│   │   ├── products/       — Compass / Profile / Pulse / Reveal product icons (Services page)
│   │   ├── photos/         — supporting photography + diagrams (hero visual, outcomes diagram, etc.)
│   │   └── _source-dump-not-for-handoff/ — raw "save page as" dump the extra assets were pulled from;
│   │       reference only, EXCLUDE from what goes to engineering (full of tracking scripts, not real assets)
│   ├── icons/              — single-color line icon set (feature/value cards)
│   ├── logos/
│   │   ├── symbol/         — mark only, transparent PNG, 4 color variants (used in-page)
│   │   ├── wordmark/       — "intendra ai" wordmark, transparent PNG, 4 color variants (used in-page)
│   │   ├── official-master/ — flattened JPGs straight from the design system's locked master
│   │   │   files (no transparency — reference/provenance only, don't use directly in markup)
│   │   └── favicon/        — favicon + touch icons
│   └── fonts/              — self-hosted font files, if not using a font CDN
└── README.md               — this file
```

## Status
- [x] Folder structure scaffolded
- [x] Full token set (color, type, spacing, radii, shadow) synced from the Intendra AI Design System
- [x] Semantic tokens remapped to dark-first theme + pill buttons/16px cards to match the live reference
- [x] Real logos/favicon wired into header + footer on all pages
- [x] Real images wired in: hero visual, product icons, team photos, feature/value/problem icons
- [x] Home page rebuilt with real reference copy (hero, problem, platform tabs, how-it-works, outcomes, CTA)
- [x] About page rebuilt with real founder bios, timeline, and books
- [x] Nav restructured to Home/About/Articles/Podcasts + Request Demo CTA; Articles + Podcasts pages added
- [x] Product (services.html) and Request a Demo (contact.html) pages restyled to match
- [ ] Font is Outfit via system-stack fallback only right now — no webfont actually wired up yet (see note above)
- [ ] Profile™ and Reveal™ product copy — the reference build doesn't expose full descriptions for these two yet (marked `TODO` on Home + Product pages); Pulse™ and Compass™ have real copy
- [ ] Articles/Podcasts pages only have the one real item each shown on the reference build — everything else is the "more coming" state, already matches source
- [ ] Responsive pass (mobile / tablet / desktop)
- [ ] Final review in browser before handoff

## Engineering handoff notes (fill in / confirm before sending)
- Animation approach: CSS transitions + `IntersectionObserver` for scroll
  reveals, no external animation library — keeps the handoff dependency-free.
  Flag here if the team would rather standardize on GSAP/Framer Motion.
- Product tabs (Home page "Platform" section): plain JS click-toggle in
  `js/main.js` (`.product-tabs button` / `.product-panel`), no framework.
- Fonts: reference build uses Outfit — not wired up as a webfont here to avoid
  a render-blocking `@import`; engineering should add it via their own
  pipeline (see "Design source of truth" above).
- Forms: Contact/demo-request form markup is static HTML — engineering wires
  up the actual submit endpoint.
- Breakpoints: mobile `<640px`, tablet `640–1024px`, desktop `>1024px`
  (adjust once a responsive QA pass is done — not yet verified against the
  reference build's mobile layout).
