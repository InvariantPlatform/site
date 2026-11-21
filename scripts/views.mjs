#!/usr/bin/env node
// Page views for invariant-platform.io, from Workers Analytics Engine
// (src/analytics.ts writes them). Read-only.
//
//   node scripts/views.mjs            last 7 days
//   node scripts/views.mjs 30         last 30 days
//
// Needs, in the environment or in ~/.config/cloudflare/analytics.env:
//   CLOUDFLARE_ACCOUNT_ID   the account the Worker runs in
//   CLOUDFLARE_API_TOKEN    a token with ONLY "Account Analytics: Read"
// The token is sent to Cloudflare's API and nowhere else, and never printed.

import { readFileSync } from "node:fs";
import { homedir } from "node:os";

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("usage: node scripts/views.mjs [days]   (default 7; reads only)");
  process.exit(0);
}

const env = { ...process.env };
try {
  for (const line of readFileSync(`${homedir()}/.config/cloudflare/analytics.env`, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  // no file: the environment must carry both values
}
const account = env.CLOUDFLARE_ACCOUNT_ID;
const token = env.CLOUDFLARE_API_TOKEN;
if (!account || !token) {
  console.error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Account Analytics: Read), or put them in ~/.config/cloudflare/analytics.env");
  process.exit(2);
}

const days = Math.max(1, Math.min(90, Number(process.argv[2] ?? 7) || 7));
const DATASET = "invariant_page_views";

async function sql(query) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/analytics_engine/sql`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: query,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Analytics Engine answered ${res.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text).data ?? [];
}

// _sample_interval: Analytics Engine samples at high volume; summing it gives
// the estimated true count rather than the number of rows kept.
const since = `timestamp > NOW() - INTERVAL '${days}' DAY`;
const [pages, refs, countries] = await Promise.all([
  sql(`SELECT blob1 AS page, SUM(_sample_interval) AS views FROM ${DATASET} WHERE ${since} GROUP BY page ORDER BY views DESC LIMIT 30`),
  sql(`SELECT blob2 AS site, SUM(_sample_interval) AS views FROM ${DATASET} WHERE ${since} AND blob2 != '' GROUP BY site ORDER BY views DESC LIMIT 15`),
  sql(`SELECT blob3 AS country, SUM(_sample_interval) AS views FROM ${DATASET} WHERE ${since} AND blob3 != '' GROUP BY country ORDER BY views DESC LIMIT 10`),
]);

const table = (title, rows, key) => {
  console.log(`\n${title}`);
  if (rows.length === 0) return console.log("  (none yet)");
  const w = Math.max(...rows.map((r) => String(r[key]).length));
  for (const r of rows) console.log(`  ${String(r[key]).padEnd(w)}  ${Math.round(Number(r.views))}`);
};
const total = pages.reduce((a, r) => a + Number(r.views), 0);
console.log(`Page views, last ${days} day${days === 1 ? "" : "s"}: ${Math.round(total)}`);
table("By page", pages, "page");
table("Referring sites", refs, "site");
table("Countries", countries, "country");
