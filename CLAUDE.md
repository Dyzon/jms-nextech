# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static marketing website for JMS Nextech (a security systems integrator). Plain HTML/CSS/JS —
no framework, no bundler, no package manager, no build step, no test suite, no linter config.

## Running / previewing

There is no build or dev-server command. Preview by opening the HTML files directly in a browser,
or serve the directory with any static file server (e.g. `python -m http.server` or the VS Code
"Live Server" extension) from the repo root so root-relative asset paths resolve correctly.

There is nothing to lint, build, or test — verify changes by opening the affected page(s) in a browser.

## Structure

- `index.html`, `about.html`, `contact.html`, `services.html` — top-level pages, at repo root.
- `services/*.html` — one page per service (cctv, drone-surveillance, fire-alarm, cyber-security,
  access-control, anpr, traffic-management, building-management, pa-system, ai-solutions),
  one directory level deep.
- `css/style.css` — single shared stylesheet for the entire site (~1000 lines, numbered sections:
  Reset, Custom Properties, Base, Gradient Utilities, Buttons, Section Utilities, ...).
- `js/main.js` — single shared script for the entire site, loaded on every page.
- `images/hero/`, `images/services/`, `images/logo.png` — static assets.

## Critical: relative paths differ by directory depth

Root pages reference assets as `css/style.css`, `images/...`, `services/cctv.html`. Pages inside
`services/` reference the same assets one level up: `../css/style.css`, `../images/...`, and link to
sibling service pages directly (`cctv.html`, not `services/cctv.html`). When copying markup between
a root page and a `services/*.html` page (or creating a new service page), all asset and nav links
must be re-prefixed accordingly — this is a common source of broken links/images.

## Critical: nav/footer are duplicated, not templated

There is no templating/includes system. The full site nav (including the 10-item mega-dropdown
"Services" menu), mobile overlay menu, and footer (with the same 10 service links, contact info,
and social links) are copy-pasted verbatim into every single HTML file. Any change to navigation
items, footer content, contact details, or the services list must be manually replicated across
**all** HTML files (currently 14: `index.html`, `about.html`, `contact.html`, `services.html` +
10 files under `services/`).
Search across the whole tree (not just the file you're editing) when making these changes.

**Note**: There is no "Blog" or "Clients" nav item (both removed; no `clients.html`). The primary
nav/CTA button reads "Enquire Now". The fire service is titled "Fire Alarm & Intrusion Protection"
everywhere. The homepage hero is a JS-driven carousel (`#heroCarousel` in `js/main.js`) with 4
slides (CCTV, Drone, Access Control, Video Analytics with AI) — each slide needs a matching
`.hero-slide-text[data-slide]`, `.hero-dot[data-slide]`, and `.hero-visual-img[data-slide]`; the JS
counts slides dynamically. After "Why Choose Us" the homepage has a "Global Partners" auto-scrolling
logo marquee (`.partners-marquee` in `css/style.css`).

## Service page template

Every file in `services/` follows the same structure: breadcrumb hero → intro copy + bullet list +
image → 3-card feature grid → CTA banner → "related services" card grid (3 other services) → shared
footer. When adding a new service, copy an existing `services/*.html` file as the starting template
rather than writing one from scratch, and remember to also add it to: the nav mega-dropdown, mobile
services panel, and footer service list on every page, plus `services.html`'s overview grid, plus
other service pages' "related services" sections where relevant.

## Styling conventions

- Brand colors and shared tokens live in `:root` custom properties in `css/style.css` (`--red`,
  `--orange`, `--gold`, `--gradient`, `--dark-bg`/`--dark-surf`/`--card-bg` for dark sections,
  `--light-bg`/`--light-surf` for light sections, plus spacing/radius/shadow tokens). Use these
  instead of hardcoding colors.
- Sections alternate `section-light` / `section-dark` / `section-gradient` wrapper classes.
- Icons are inline SVGs (Feather-style, `stroke="currentColor"`, `stroke-width="2"`) directly in the
  HTML, not an icon font or sprite sheet — copy an existing `<svg>` block when adding a new icon.
- Scroll-in animations use the `animate-on-scroll` class (fades/slides in via `IntersectionObserver`
  in `main.js`); grids that should stagger their children's animation need the parent to also carry
  `data-stagger`.

## `js/main.js` behavior (applies site-wide, one file for every page)

- Sticky nav shadow on scroll, mobile hamburger overlay, desktop/keyboard-accessible services
  dropdown (click to toggle, closes on outside click/Escape).
- Smooth-scroll for in-page `#anchor` links.
- `IntersectionObserver`-driven reveal animations (`.animate-on-scroll` → `.visible`) and animated
  stat counters (`[data-counter]` + `data-suffix`).
- Contact form (`#contactForm` on `contact.html`) is progressively enhanced: submits via `fetch` to
  Web3Forms as JSON, shows a loading spinner, swaps in `#formSuccess` on success. The form itself
  still has a normal `action`/`method` so it degrades to a plain POST if JS fails.
- Active nav link highlighting is done by comparing `location.pathname`'s basename against each nav
  link's href basename — no router involved.

## Contact form backend

`contact.html`'s form posts to Web3Forms (`https://api.web3forms.com/submit`) with a hidden
`access_key` field — currently a placeholder (`YOUR_WEB3FORMS_KEY`) that must be replaced with a
real key from web3forms.com for the form to actually deliver submissions. There is no server-side
code in this repo.
