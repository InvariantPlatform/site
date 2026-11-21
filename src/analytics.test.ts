// node --test src/  — what a page view records, and what it never records.

import { test } from "node:test";
import assert from "node:assert/strict";
import { countView, viewOf } from "./analytics.ts";

const HOST = "invariant-platform.io";
const req = (headers: Record<string, string> = {}, method = "GET") =>
  new Request(`https://${HOST}/security-posture/?utm=x`, { method, headers });
const url = new URL(`https://${HOST}/security-posture/?utm=x`);

test("a page view records the path, the referring host and nothing else", () => {
  const v = viewOf(req({ referer: "https://www.linkedin.com/feed/update/123?trk=abc", "user-agent": "Mozilla/5.0" }), url, 200, "text/html; charset=utf-8", HOST);
  assert.deepEqual(v, { path: "/security-posture/", referrer: "www.linkedin.com", country: "" });
});

test("the query string, the referrer's path and the user agent are never kept", () => {
  const v = viewOf(req({ referer: "https://news.example/item?id=42", "user-agent": "Mozilla/5.0 secret-ua" }), url, 200, "text/html", HOST)!;
  const recorded = JSON.stringify(v);
  for (const leak of ["utm", "id=42", "item", "secret-ua", "Mozilla"]) assert.ok(!recorded.includes(leak), leak);
});

test("moving between this site's own pages is not a referral", () => {
  assert.equal(viewOf(req({ referer: `https://${HOST}/` }), url, 200, "text/html", HOST)!.referrer, "");
});

test("only a 200 HTML page fetched with GET by a person counts", () => {
  assert.equal(viewOf(req(), url, 404, "text/html", HOST), null);
  assert.equal(viewOf(req(), url, 200, "image/png", HOST), null);
  assert.equal(viewOf(req({}, "HEAD"), url, 200, "text/html", HOST), null);
  for (const ua of ["Googlebot/2.1", "LinkedInBot/1.0", "curl/8.0", "facebookexternalhit/1.1", "Mozilla/5.0 HeadlessChrome"]) {
    assert.equal(viewOf(req({ "user-agent": ua }), url, 200, "text/html", HOST), null, ua);
  }
});

test("no binding, or a failing write, never breaks the page", () => {
  const v = viewOf(req(), url, 200, "text/html", HOST);
  countView({}, v);
  countView({ VIEWS: { writeDataPoint: () => { throw new Error("down"); } } as unknown as AnalyticsEngineDataset }, v);
  const seen: unknown[] = [];
  countView({ VIEWS: { writeDataPoint: (d: unknown) => seen.push(d) } as unknown as AnalyticsEngineDataset }, v);
  assert.deepEqual(seen, [{ blobs: ["/security-posture/", "", ""], indexes: ["/security-posture/"] }]);
});
