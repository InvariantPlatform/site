// node --test src/gate/   — the join flow, with GitHub and Buttondown mocked
// and the crypto real. The property under test: no invitation is ever sent
// unless the provider says THIS GitHub account's address is confirmed.

import { test } from "node:test";
import assert from "node:assert/strict";
import { gate, JOIN_COOKIE, SESSION_COOKIE, type GateEnv } from "./index.ts";
import { isNoreply, validEmail } from "./join.ts";
import { seal, unseal } from "./session.ts";
import { resetTokenCache, type Fetch } from "./github.ts";

const ORIGIN = "https://invariant-platform.io";
const NOW = Date.parse("2026-11-12T12:00:00Z");
const NOW_S = Math.floor(NOW / 1000);
const SECRET = "test-session-secret-0123456789abcdef";

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
  SESSION_SECRET: SECRET,
  BUTTONDOWN_API_KEY: "bd-key",
};

interface Call { url: string; method: string; body?: string; headers: Headers }

interface Fake {
  create?: number;                       // POST /subscribers status
  subscriber?: { type: string; metadata: Record<string, unknown> } | null | number; // GET by email; number = status
  membership?: "active" | "pending" | 404 | 500;
  invite?: number;
}

function fake(opts: Fake = {}): { fetch: Fetch; calls: Call[] } {
  const calls: Call[] = [];
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const fetcher: Fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, method: init?.method ?? "GET", body: init?.body as string | undefined, headers: new Headers(init?.headers) });
    if (url === "https://api.buttondown.com/v1/subscribers") return json(opts.create ?? 201, {});
    if (url.startsWith("https://api.buttondown.com/v1/subscribers/")) {
      const s = opts.subscriber === undefined ? { type: "unactivated", metadata: { github_id: "42" } } : opts.subscriber;
      if (s === null) return json(404, {});
      if (typeof s === "number") return json(s, {});
      return json(200, { id: "sub-1", email_address: "reader@example.com", ...s });
    }
    if (url.endsWith("/app/installations/456/access_tokens")) return json(201, { token: "inst-token", expires_at: new Date(NOW + 3_600_000).toISOString() });
    if (url === "https://api.github.com/orgs/InvariantPlatform/memberships/reader") {
      if (init?.method === "PUT") return json(opts.invite ?? 200, { state: "pending", role: "member" });
      const m = opts.membership ?? 404;
      return typeof m === "number" ? json(m, {}) : json(200, { state: m, role: "member" });
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  return { fetch: fetcher, calls };
}

const session = (member = false) => seal({ login: "reader", id: 42, member, checked: NOW_S, exp: NOW_S + 86_400 }, SECRET);
const pendingFor = (id = 42, email = "reader@example.com") => seal({ email, id, exp: NOW_S + 86_400 }, SECRET);

async function cookies(...pairs: [string, Promise<string>][]): Promise<string> {
  return (await Promise.all(pairs.map(async ([n, v]) => `${n}=${await v}`))).join("; ");
}

function get(path: string, cookie?: string): [Request, URL] {
  const url = new URL(path, ORIGIN);
  return [new Request(url, { headers: cookie ? { cookie } : {} }), url];
}

function post(fields: Record<string, string>, cookie: string, origin: string | null = ORIGIN): [Request, URL] {
  const url = new URL("/join/apply", ORIGIN);
  const body = new URLSearchParams(fields).toString();
  const headers: Record<string, string> = { cookie, "content-type": "application/x-www-form-urlencoded", "content-length": String(body.length), "cf-connecting-ip": "203.0.113.7" };
  if (origin) headers.origin = origin;
  return [new Request(url, { method: "POST", headers, body }), url];
}

const run = (r: [Request, URL], env: GateEnv, f: Fetch) => gate(r[0], env, r[1], f, NOW) as Promise<Response>;
const invited = (calls: Call[]) => calls.some((c) => c.method === "PUT");
const toProvider = (calls: Call[]) => calls.filter((c) => c.url.startsWith("https://api.buttondown.com"));

test("join is closed (503) without the provider key, and touches nothing", async () => {
  const f = fake();
  const res = await run(get("/join/apply", await cookies([SESSION_COOKIE, session()])), { ...ENV, BUTTONDOWN_API_KEY: undefined }, f.fetch);
  assert.equal(res.status, 503);
  assert.equal(f.calls.length, 0);
});

test("join is closed (503) when the gate itself is not configured", async () => {
  const res = await run(get("/join/apply"), { BUTTONDOWN_API_KEY: "bd-key" }, fake().fetch);
  assert.equal(res.status, 503);
});

test("the static /join/ page is not the flow's", async () => {
  const [r, u] = get("/join/");
  assert.equal(await gate(r, ENV, u, fake().fetch, NOW), null);
});

test("signed out: sent to sign in, and back to the same join page", async () => {
  const res = await run(get("/join/status"), ENV, fake().fetch);
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "/auth/login?next=%2Fjoin%2Fstatus");
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
});

test("the form names the account, escapes it, and leaves consent unticked", async () => {
  const s = seal({ login: "<b>x</b>", id: 42, member: false, checked: NOW_S, exp: NOW_S + 86_400 }, SECRET);
  const res = await run(get("/join/apply", await cookies([SESSION_COOKIE, s])), ENV, fake().fetch);
  const html = await res.text();
  assert.equal(res.status, 200);
  assert.ok(html.includes("&#60;b&#62;x&#60;/b&#62;"));
  assert.ok(!html.includes("<b>x</b>"));
  assert.ok(!/checkbox[^>]*checked/.test(html));
});

test("a member is told so, not offered the form", async () => {
  const res = await run(get("/join/apply", await cookies([SESSION_COOKIE, session(true)])), ENV, fake().fetch);
  assert.match(await res.text(), /already a member/);
});

test("a POST from another origin (or none) is refused before the provider is asked", async () => {
  for (const origin of ["https://evil.example", null]) {
    const f = fake();
    const res = await run(post({ email: "reader@example.com", consent: "yes" }, await cookies([SESSION_COOKIE, session()]), origin), ENV, f.fetch);
    assert.equal(res.status, 403);
    assert.equal(f.calls.length, 0);
  }
});

test("bad address, noreply address and missing consent: 400, provider never asked", async () => {
  for (const fields of [{ email: "not-an-email", consent: "yes" }, { email: "1+reader@users.noreply.github.com", consent: "yes" }, { email: "reader@example.com" }]) {
    const f = fake();
    const res = await run(post(fields, await cookies([SESSION_COOKIE, session()])), ENV, f.fetch);
    assert.equal(res.status, 400, JSON.stringify(fields));
    assert.equal(f.calls.length, 0);
  }
});

test("a good POST: unactivated subscriber tied to the GitHub id, consent recorded, then status", async () => {
  const f = fake();
  const res = await run(post({ email: " reader@example.com ", consent: "yes" }, await cookies([SESSION_COOKIE, session()])), ENV, f.fetch);
  assert.equal(res.status, 303);
  assert.equal(res.headers.get("location"), "/join/status");
  const [create] = toProvider(f.calls);
  assert.equal(create.method, "POST");
  assert.equal(create.headers.get("authorization"), "Token bd-key");
  const body = JSON.parse(create.body!);
  assert.equal(body.email_address, "reader@example.com");
  assert.equal(body.type, "unactivated");
  assert.equal(body.ip_address, "203.0.113.7");
  assert.equal(body.metadata.github_id, "42");
  assert.equal(body.metadata.github_login, "reader");
  assert.equal(body.metadata.consent_at, "2026-11-12T12:00:00.000Z");
  assert.ok(body.metadata.consent_text.length > 20);
  assert.ok(!invited(f.calls));
  const set = res.headers.getSetCookie().find((c) => c.startsWith(`${JOIN_COOKIE}=`))!;
  const pending = await unseal<{ email: string; id: number; exp: number }>(set.split(";")[0].slice(JOIN_COOKIE.length + 1), SECRET, NOW_S);
  assert.deepEqual([pending?.email, pending?.id], ["reader@example.com", 42]);
});

test("an address already on the list under ANOTHER account is refused, without saying whose", async () => {
  const f = fake({ create: 400, subscriber: { type: "regular", metadata: { github_id: "999" } } });
  const res = await run(post({ email: "reader@example.com", consent: "yes" }, await cookies([SESSION_COOKIE, session()])), ENV, f.fetch);
  assert.equal(res.status, 409);
  assert.ok(!res.headers.getSetCookie().some((c) => c.startsWith(`${JOIN_COOKIE}=`)));
  assert.ok(!invited(f.calls));
});

test("the same reader giving the same address again (another device) goes on to status", async () => {
  const f = fake({ create: 400, subscriber: { type: "regular", metadata: { github_id: "42" } } });
  const res = await run(post({ email: "reader@example.com", consent: "yes" }, await cookies([SESSION_COOKIE, session()])), ENV, f.fetch);
  assert.equal(res.status, 303);
});

test("a 400 for an address that does not read back is a failure, not 'exists'", async () => {
  const res = await run(post({ email: "reader@example.com", consent: "yes" }, await cookies([SESSION_COOKIE, session()])), ENV, fake({ create: 400, subscriber: null }).fetch);
  assert.equal(res.status, 503);
});

test("provider errors and rate limits are a 503", async () => {
  for (const create of [500, 429, 401]) {
    const res = await run(post({ email: "reader@example.com", consent: "yes" }, await cookies([SESSION_COOKIE, session()])), ENV, fake({ create }).fetch);
    assert.equal(res.status, 503, String(create));
  }
});

test("status, unconfirmed: check your inbox, and GitHub is not asked", async () => {
  const f = fake();
  const res = await run(get("/join/status", await cookies([SESSION_COOKIE, session()], [JOIN_COOKIE, pendingFor()])), ENV, f.fetch);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Check your inbox/);
  assert.ok(!f.calls.some((c) => c.url.includes("api.github.com")));
});

test("status, confirmed and not yet invited: ONE invitation, as a plain member; membership rechecked next", async () => {
  resetTokenCache();
  const f = fake({ subscriber: { type: "regular", metadata: { github_id: "42" } }, membership: 404 });
  const res = await run(get("/join/status", await cookies([SESSION_COOKIE, session()], [JOIN_COOKIE, pendingFor()])), ENV, f.fetch);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Invitation sent/);
  const puts = f.calls.filter((c) => c.method === "PUT");
  assert.equal(puts.length, 1);
  assert.deepEqual(JSON.parse(puts[0].body!), { role: "member" });
  const set = res.headers.getSetCookie().find((c) => c.startsWith(`${SESSION_COOKIE}=`))!;
  const s = await unseal<{ checked: number }>(set.split(";")[0].slice(SESSION_COOKIE.length + 1), SECRET, NOW_S);
  assert.equal(s?.checked, 0);
});

test("status, already invited or already a member: no second invitation", async () => {
  for (const membership of ["pending", "active"] as const) {
    resetTokenCache();
    const f = fake({ subscriber: { type: "regular", metadata: { github_id: "42" } }, membership });
    const res = await run(get("/join/status", await cookies([SESSION_COOKIE, session()], [JOIN_COOKIE, pendingFor()])), ENV, f.fetch);
    assert.equal(res.status, 200);
    assert.ok(!invited(f.calls), membership);
  }
});

test("status: a confirmed address whose metadata names another account invites nobody", async () => {
  const f = fake({ subscriber: { type: "regular", metadata: { github_id: "999" } } });
  const res = await run(get("/join/status", await cookies([SESSION_COOKIE, session()], [JOIN_COOKIE, pendingFor()])), ENV, f.fetch);
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "/join/apply");
  assert.ok(!invited(f.calls));
});

test("status: a join cookie made for another GitHub id is thrown away", async () => {
  const f = fake({ subscriber: { type: "regular", metadata: { github_id: "42" } } });
  const res = await run(get("/join/status", await cookies([SESSION_COOKIE, session()], [JOIN_COOKIE, pendingFor(7)])), ENV, f.fetch);
  assert.equal(res.headers.get("location"), "/join/apply");
  assert.equal(f.calls.length, 0);
});

test("status: a forged join cookie is thrown away", async () => {
  const forged = seal({ email: "reader@example.com", id: 42, exp: NOW_S + 86_400 }, "another-secret-entirely-0123456789");
  const f = fake({ subscriber: { type: "regular", metadata: { github_id: "42" } } });
  const res = await run(get("/join/status", await cookies([SESSION_COOKIE, session()], [JOIN_COOKIE, forged])), ENV, f.fetch);
  assert.equal(res.headers.get("location"), "/join/apply");
  assert.equal(f.calls.length, 0);
});

test("status: unsubscribed or bounced invites nobody", async () => {
  for (const type of ["unsubscribed", "undeliverable", "blocked"]) {
    const f = fake({ subscriber: { type, metadata: { github_id: "42" } } });
    const res = await run(get("/join/status", await cookies([SESSION_COOKIE, session()], [JOIN_COOKIE, pendingFor()])), ENV, f.fetch);
    assert.equal(res.status, 403, type);
    assert.ok(!invited(f.calls));
  }
});

test("status: GitHub failing to look up or to invite is a 503, never a success page", async () => {
  for (const opts of [{ membership: 500 as const }, { membership: 404 as const, invite: 422 }]) {
    resetTokenCache();
    const f = fake({ subscriber: { type: "regular", metadata: { github_id: "42" } }, ...opts });
    const res = await run(get("/join/status", await cookies([SESSION_COOKIE, session()], [JOIN_COOKIE, pendingFor()])), ENV, f.fetch);
    assert.equal(res.status, 503, JSON.stringify(opts));
  }
});

test("status: the provider failing is a 503 and no invitation", async () => {
  const f = fake({ subscriber: 500 });
  const res = await run(get("/join/status", await cookies([SESSION_COOKIE, session()], [JOIN_COOKIE, pendingFor()])), ENV, f.fetch);
  assert.equal(res.status, 503);
  assert.ok(!invited(f.calls));
});

test("email shape checks", () => {
  assert.ok(validEmail("a@b.io"));
  assert.ok(!validEmail("a@b"));
  assert.ok(!validEmail("a b@c.io"));
  assert.ok(!validEmail(`${"a".repeat(250)}@b.io`));
  assert.ok(isNoreply("12+x@users.noreply.github.com"));
  assert.ok(!isNoreply("x@github.com"));
});
