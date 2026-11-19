// node --test src/gate/   — unsubscribing ends the membership. Buttondown and
// GitHub mocked, the HMAC real. The properties under test: nothing is read
// without a valid signature; the CURRENT subscriber state decides; an owner is
// never removed; any doubt is a 503 so Buttondown retries.

import { test } from "node:test";
import assert from "node:assert/strict";
import { gate, type GateEnv } from "./index.ts";
import { verifySignature, WEBHOOK_PATH } from "./unsubscribe.ts";
import { resetTokenCache, type Fetch } from "./github.ts";

const NOW = Date.parse("2026-11-19T12:00:00Z");
const HOOK_SECRET = "hook-signing-key";

const keys = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true, ["sign", "verify"],
) as CryptoKeyPair;
const pkcs8 = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keys.privateKey));
const PEM = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...pkcs8)).replace(/(.{64})/g, "$1\n")}\n-----END PRIVATE KEY-----\n`;

const ENV: GateEnv = {
  GITHUB_ORG: "InvariantPlatform",
  GITHUB_APP_ID: "123",
  GITHUB_APP_INSTALLATION_ID: "456",
  GITHUB_APP_CLIENT_ID: "Iv1.client",
  GITHUB_APP_CLIENT_SECRET: "client-secret",
  GITHUB_APP_PRIVATE_KEY: PEM,
  SESSION_SECRET: "test-session-secret-0123456789abcdef",
  BUTTONDOWN_API_KEY: "bd-key",
  BUTTONDOWN_WEBHOOK_SECRET: HOOK_SECRET,
};

interface Fake {
  subscriber?: { type: string; metadata: Record<string, unknown> } | null | number;
  user?: number;                 // GET /user/{id} status
  role?: "member" | "admin" | 404;
  del?: number;
}
interface Call { url: string; method: string }

function fake(opts: Fake = {}): { fetch: Fetch; calls: Call[] } {
  const calls: Call[] = [];
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const fetcher: Fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method ?? "GET";
    calls.push({ url, method });
    if (url === "https://api.buttondown.com/v1/subscribers/sub-1") {
      const s = opts.subscriber === undefined ? { type: "unsubscribed", metadata: { github_id: "42" } } : opts.subscriber;
      if (s === null) return json(404, {});
      if (typeof s === "number") return json(s, {});
      return json(200, { id: "sub-1", ...s });
    }
    if (url.endsWith("/app/installations/456/access_tokens")) return json(201, { token: "inst-token", expires_at: new Date(NOW + 3_600_000).toISOString() });
    if (url === "https://api.github.com/user/42") {
      const st = opts.user ?? 200;
      return json(st, st === 200 ? { login: "renamed-reader", id: 42 } : {});
    }
    if (url === "https://api.github.com/orgs/InvariantPlatform/memberships/renamed-reader") {
      if (method === "DELETE") return new Response(null, { status: opts.del ?? 204 });
      const r = opts.role ?? "member";
      return r === 404 ? json(404, {}) : json(200, { role: r, state: "active" });
    }
    throw new Error(`unexpected fetch ${method} ${url}`);
  };
  return { fetch: fetcher, calls };
}

async function sign(body: string, secret = HOOK_SECRET): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  return `sha256=${[...mac].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

const EVENT = JSON.stringify({ id: "evt-1", event_type: "subscriber.unsubscribed", data: { subscriber: "sub-1" } });

async function hook(f: { fetch: Fetch }, opts: { body?: string; signature?: string | null; env?: GateEnv; method?: string } = {}): Promise<Response> {
  resetTokenCache();
  const body = opts.body ?? EVENT;
  const headers: Record<string, string> = { "content-type": "application/json" };
  const sig = opts.signature === undefined ? await sign(body) : opts.signature;
  if (sig !== null) headers["x-buttondown-signature"] = sig;
  const method = opts.method ?? "POST";
  const url = new URL(WEBHOOK_PATH, "https://invariant-platform.io");
  const req = new Request(url, { method, headers, body: method === "POST" ? body : undefined });
  return (await gate(req, opts.env ?? ENV, url, f.fetch, NOW))!;
}

const removed = (calls: Call[]) => calls.some((c) => c.method === "DELETE");

test("signature check: right key passes, anything else fails", async () => {
  const raw = new TextEncoder().encode(EVENT).buffer as ArrayBuffer;
  assert.ok(await verifySignature(raw, await sign(EVENT), HOOK_SECRET));
  assert.ok(await verifySignature(raw, (await sign(EVENT)).toUpperCase().replace("SHA256=", "sha256="), HOOK_SECRET));
  assert.ok(!(await verifySignature(raw, await sign(EVENT, "other-key"), HOOK_SECRET)));
  assert.ok(!(await verifySignature(raw, await sign(EVENT + " "), HOOK_SECRET)));
  for (const bad of [null, "", "sha256=", "sha256=zz", "md5=abc"]) assert.ok(!(await verifySignature(raw, bad, HOOK_SECRET)), String(bad));
});

test("a confirmed unsubscribe removes the member, found by account number", async () => {
  const f = fake();
  const res = await hook(f);
  assert.equal(res.status, 204);
  const del = f.calls.find((c) => c.method === "DELETE")!;
  assert.equal(del.url, "https://api.github.com/orgs/InvariantPlatform/memberships/renamed-reader");
});

test("unsigned, wrongly signed or tampered events read nothing", async () => {
  for (const signature of [null, await sign(EVENT, "attacker"), await sign(EVENT.replace("sub-1", "sub-2"))]) {
    const f = fake();
    const res = await hook(f, { signature });
    assert.equal(res.status, 401);
    assert.equal(f.calls.length, 0, "not even Buttondown is asked");
  }
});

test("without the signing key, nothing happens and Buttondown retries", async () => {
  const f = fake();
  const res = await hook(f, { env: { ...ENV, BUTTONDOWN_WEBHOOK_SECRET: undefined } });
  assert.equal(res.status, 503);
  assert.equal(f.calls.length, 0);
});

test("only POST", async () => {
  assert.equal((await hook(fake(), { method: "GET" })).status, 405);
});

test("other event types are acknowledged and ignored", async () => {
  const body = JSON.stringify({ id: "evt-2", event_type: "subscriber.confirmed", data: { subscriber: "sub-1" } });
  const f = fake();
  assert.equal((await hook(f, { body })).status, 204);
  assert.equal(f.calls.length, 0);
});

test("the current state decides: re-subscribed means nobody is removed", async () => {
  for (const type of ["regular", "premium"]) {
    const f = fake({ subscriber: { type, metadata: { github_id: "42" } } });
    assert.equal((await hook(f)).status, 204);
    assert.ok(!removed(f.calls), type);
  }
});

test("a subscriber the join flow did not invite is left alone", async () => {
  for (const metadata of [{}, { github_id: "" }, { github_id: "42; rm" }, { github_id: 42.5 }]) {
    const f = fake({ subscriber: { type: "unsubscribed", metadata } });
    assert.equal((await hook(f)).status, 204);
    assert.ok(!f.calls.some((c) => c.url.includes("api.github.com")), JSON.stringify(metadata));
  }
  const gone = fake({ subscriber: null });
  assert.equal((await hook(gone)).status, 204);
});

test("an owner is never removed", async () => {
  const f = fake({ role: "admin" });
  assert.equal((await hook(f)).status, 204);
  assert.ok(!removed(f.calls));
});

test("already out of the org, or the account is gone: done, nothing deleted", async () => {
  for (const opts of [{ role: 404 as const }, { user: 404 }]) {
    const f = fake(opts);
    assert.equal((await hook(f)).status, 204);
    assert.ok(!removed(f.calls), JSON.stringify(opts));
  }
});

test("any doubt is a 503 so Buttondown retries", async () => {
  for (const opts of [{ subscriber: 500 }, { user: 500 }, { del: 403 }] as Fake[]) {
    assert.equal((await hook(fake(opts))).status, 503, JSON.stringify(opts));
  }
});

test("malformed signed payloads are refused", async () => {
  for (const body of ["not json", JSON.stringify({ event_type: "subscriber.unsubscribed", data: {} }), JSON.stringify({ event_type: "subscriber.unsubscribed", data: { subscriber: "../x" } })]) {
    assert.equal((await hook(fake(), { body })).status, 400, body);
  }
});
