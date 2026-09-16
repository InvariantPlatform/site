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

Cloudflare Workers, static assets only, declared in `wrangler.jsonc`: the
git-connected Worker `invariant-platform` runs `npm run build` and
`npx wrangler deploy`, which uploads `out/` and runs no server code.
`wrangler` is pinned in `devDependencies`; without a `wrangler.jsonc` in the
repo, `wrangler deploy` auto-configures OpenNext, which is wrong for a static
export (and does not support this Next version) — that was the first build.

When the members routes arrive, the route gate is a `main` script in the
same `wrangler.jsonc`, in front of the same assets. `output: "export"` stays.

`invariant-platform.io` must first be delegated to Cloudflare; its nameservers
are still at the registrar's parking.

## The status strip and the hero terminal (ADR-194)

`src/worker.ts` fills the strip under the header, and the terminal on the
home page, from Cloudflare KV, key `posture`, on every HTML response. The
document is written by the nightly `posture-check --record` on the host tier
and sent by `substrate publish-status` (v0.2.4), pass or fail:

    {"ran_at":"2026-09-16T00:22:21Z","provisioner":"0.2.4",
     "invariants":15,"held":15,"findings":[],
     "lines":[{"status":"ok","text":"pod security: 19/19 namespaces enforced"}, ...]}

No document → "no run recorded" and the static sample terminal. Older than
26 h → "stale — no run for N days", in amber. Garbage → treated as no
document. A document without `lines` fills the strip only. Nothing that
names a machine is rendered, whatever the document carries.

Every element the Worker rewrites is rendered with `dangerouslySetInnerHTML`
(`lib/terminal-html.ts` builds the terminal body for both the export and the
Worker). This is not optional: React 19 treats a single mismatched text node
as a hydration failure and re-renders the whole root on the client, which
puts the static text back over the published run everywhere at once.

To try it locally: a dev config with a local KV binding, then
`wrangler dev --local` and `wrangler kv key put --local --binding STATUS posture --path <file>`.

## Claims

Every number on the site is a number the platform keeps. The posture-check
output on the home page is a real run with its finding, kept on purpose;
replace it with a newer run, never with a cleaner one.
