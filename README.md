# brian.invests — website

A plain HTML/CSS/JS site. No build step, no framework, no dependencies —
open `index.html` in a browser and it works. That's intentional: it keeps
this easy to keep extending yourself (or hand to anyone else) without a
toolchain to maintain.

## Structure

```
index.html                        Landing page
tools/net-worth-calculator.html   First free tool (client-side, no backend)
assets/css/styles.css             All shared styles + design tokens (:root vars at the top)
assets/js/main.js                 Shared behavior: mobile nav, email capture form
assets/js/net-worth-calculator.js Logic for the net worth calculator only
assets/img/                       Put images/logo here
```

## Before this goes live — things to fill in

- **Wealth OS link**: `index.html` has a placeholder `href="#"` on the
  "Get Wealth OS on Gumroad" button (search `#wealth-os` section) — swap in
  your real Gumroad product link.
- **Instagram link**: footer link points to `instagram.com/brian.invests` —
  confirm that's the current handle.
- **Email capture**: the join form currently just shows a local "you're on
  the list" message — it doesn't actually collect emails yet. Open
  `assets/js/main.js` and search `TODO: EMAIL PROVIDER` for where to wire in
  a real provider (ConvertKit, Beehiiv, Mailchimp, or a simple Formspree
  endpoint all work with a no-build static site like this).

## How to add a new tool/calculator

This is the main way the site is meant to grow. To add one (e.g. a
retirement calculator):

1. Copy `tools/net-worth-calculator.html` to `tools/retirement-calculator.html`.
2. Update the `<title>`, `<h1>`, and the input fields for the new calculator.
3. Copy `assets/js/net-worth-calculator.js` to `assets/js/retirement-calculator.js`
   and change the calculation logic.
4. Update the `<script src="...">` tag at the bottom of the new HTML file to
   point at the new JS file.
5. On `index.html`, find the matching "Coming soon" card in the `#tools`
   section and turn it into a real link (remove the `aria-disabled` /
   `pointer-events:none` styling, point `href` at the new page).

Each tool is a fully separate, self-contained page — nothing breaks if you
add, remove, or rework one.

## Design system

All colors, fonts, and spacing tokens live at the top of
`assets/css/styles.css` under `:root` (and a `prefers-color-scheme: dark`
override below it). Change a value there and it updates everywhere. Fonts
are loaded from Google Fonts (Lora for headings, Inter for body text) —
swap the `<link>` tags in each HTML file's `<head>` if you want different
fonts.

## Deploying

No build step means any static host works. Easiest options, roughly in
order of simplicity:

- **Netlify** or **Vercel**: drag-and-drop this folder in their dashboard,
  or connect it to a GitHub repo for auto-deploys on every push.
- **GitHub Pages**: push this folder to a repo, enable Pages on the `main`
  branch.
- Any other static host (Cloudflare Pages, S3 + CloudFront, etc.) works the
  same way — there's nothing to compile.

## Roadmap (per the brian.invests business plan)

Per the plan tracked in the "Strider Resiliency System" project, the site
is meant to stay minimal until each addition is actually requested by the
audience. Suggested order, once there's demand signal for each:

1. ~~Landing page + email capture~~ ✅
2. ~~Net worth calculator~~ ✅
3. Retirement / FI calculator
4. Budget planner
5. Portfolio tracker
6. Community / membership tier (Discord-based) — intentionally last; this
   is the "recurring revenue" layer that should wait until there's a
   repeatable content → product funnel proven out first.
