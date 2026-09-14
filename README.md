# invariant-platform.io

The public site for Invariant Platform. Next.js 16 / React 19 / Tailwind 4 —
the same stack, versions and palette as bradpenney.io, so the two sites share
one vocabulary and one upgrade path.

**Status: prototype.** Every teaser page is built; the members mechanism
(organization join, email, members routes — ADR-185) is not. `site.joinOpen`
is `false` and every Join CTA reads it; the Join page says joining is not open.

## Where things live

```
site.config.ts        the site's claims: stats, nav, joinOpen. Change numbers HERE only (ADR-173).
app/layout.tsx        fonts, <Header>, <Footer> — the chrome exists once
app/components/ui.tsx Intro, Card, CardGrid, RowList, Flow, Scorecard, MembersStrip, JoinCta
app/components/       Header, Footer, Terminal (posture-check output as data), ContextView (the model's public view)
content/*.ts          the copy for each page, typed, no markup
app/<route>/page.tsx  seven routes; each composes components over its content module
public/logo/          favicons and the chevron lockup (source: notes/invariant_platform_site_design/logo)
```

A change to the nav, a stat, or the footer is one edit. A new section is a
content module plus a page that composes existing components.

## Run

    npm install
    npm run dev          # http://localhost:3000
    npm run lint
    npm run build        # static export to out/

## Deploy

`next.config.ts` sets `output: "export"`: Cloudflare Pages serves `out/` with
nothing running (build command `npm run build`, output directory `out`).
When the members routes arrive, that line goes, the app gains `middleware.ts`
for the organization check, and it runs as an app instead — nothing else changes.

`invariant-platform.io` must first be delegated to Cloudflare; its nameservers
are still at the registrar's parking.

## Claims

Every number on the site is a number the platform keeps. The posture-check
output on the home page is a real run with its finding, kept on purpose;
replace it with a newer run, never with a cleaner one.
