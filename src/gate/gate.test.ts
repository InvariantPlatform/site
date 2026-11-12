// node --test src/gate/   (Node 22.6+ runs TypeScript directly)
// GitHub and the members origin are mocked; the crypto is real.

import { test } from "node:test";
import assert from "node:assert/strict";
import { gate, isGated, safeNext, RECHECK_SECONDS, SESSION_COOKIE, OAUTH_COOKIE, type GateEnv } from "./index.ts";
import { seal, unseal, b64url, unb64url } from "./session.ts";
import { appJwt, resetTokenCache, type Fetch } from "./github.ts";

const ORIGIN = "https://invariant-platform.io";
const NOW = Date.parse("2026-10-27T12:00:00Z");
const NOW_S = Math.floor(NOW / 1000);

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
  MEMBERS_ORIGIN: "https://members-origin.example",
  MEMBERS_ORIGIN_SECRET: "origin-secret",
};

interface Call { url: string; init?: RequestInit }

/** A fake GitHub + origin. `membership` is the status /orgs/:org/members/:login answers. */
function fakeGitHub(opts: { membership?: number; tokenStatus?: number } = {}): { fetch: Fetch; calls: Call[] } {
  const calls: Call[] = [];
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const fetcher: Fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (url === "https://github.com/login/oauth/access_token") return json(200, { access_token: "user-token" });
    if (url === "https://api.github.com/user") return json(200, { login: "reader", id: 42 });
    if (url.endsWith("/app/installations/456/access_tokens")) {
      return opts.tokenStatus && opts.tokenStatus !== 201
        ? json(opts.tokenStatus, {})
        : json(201, { token: "inst-token", expires_at: new Date(NOW + 3_600_000).toISOString() });
    }
    if (url === "https://api.github.com/orgs/InvariantPlatform/members/reader") return new Response(null, { status: opts.membership ?? 204 });
    if (url.startsWith("https://members-origin.example/")) {
      return new Response("<h1>members content</h1>", { status: 200, headers: { "content-type": "text/html", "set-cookie": "origin=leak" } });
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  return { fetch: fetcher, calls };
}

function req(path: string, cookie?: string, method = "GET"): [Request, URL] {
  const url = new URL(path, ORIGIN);
  return [new Request(url, { method, headers: cookie ? { cookie } : {} }), url];
}

async function sessionCookie(member: boolean, checkedAgo = 0): Promise<string> {
  const v = await seal({ login: "reader", id: 42, member, checked: NOW_S - checkedAgo, exp: NOW_S + 86_400 }, ENV.SESSION_SECRET!);
  return `${SESSION_COOKIE}=${v}`;
}

function assertPrivate(res: Response) {
  assert.equal(res.headers.get("cache-control"), "private, no-store");
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
}

test("only /members and /auth/ are the gate's", () => {
  assert.ok(isGated("/members"));
  assert.ok(isGated("/members/adr/209/"));
  assert.ok(!isGated("/membership"));
  assert.ok(!isGated("/"));
});

test("safeNext keeps readers on this site", () => {
  assert.equal(safeNext("/members/x?y=1", ORIGIN), "/members/x?y=1");
  for (const bad of [null, "", "https://evil.example/", "//evil.example/", "/\\evil.example", "members/x"]) {
    assert.equal(safeNext(bad, ORIGIN), "/members/", String(bad));
  }
});

test("a sealed value round-trips, and tampering, expiry or a different key all reject", async () => {
  const s = ENV.SESSION_SECRET!;
  const v = await seal({ login: "reader", exp: NOW_S + 60 }, s);
  assert.equal((await unseal<{ login: string; exp: number }>(v, s, NOW_S))?.login, "reader");
  assert.equal(await unseal(v, s, NOW_S + 61), null);
  assert.equal(await unseal(v, "another-secret", NOW_S), null);
  const [body, sig] = v.split(".");
  const forged = b64url(new TextEncoder().encode(JSON.stringify({ login: "admin", exp: NOW_S + 60 })));
  assert.equal(await unseal(`${forged}.${sig}`, s, NOW_S), null);
  assert.equal(await unseal(`${body}.${sig}x`, s, NOW_S), null);
  assert.equal(await unseal("garbage", s, NOW_S), null);
});

test("the App JWT verifies with the App's public key; a PKCS#1 key is refused with the fix", async () => {
  const jwt = await appJwt("123", PEM, NOW_S);
  const [h, b, sig] = jwt.split(".");
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", keys.publicKey, unb64url(sig), new TextEncoder().encode(`${h}.${b}`));
  assert.ok(ok);
  const claims = JSON.parse(new TextDecoder().decode(unb64url(b)));
  assert.deepEqual(claims, { iat: NOW_S - 60, exp: NOW_S + 540, iss: "123" });
  await assert.rejects(appJwt("123", "-----BEGIN RSA PRIVATE KEY-----\nAAAA\n-----END RSA PRIVATE KEY-----", NOW_S), /openssl pkcs8/);
});

test("public paths are not the gate's business", async () => {
  const gh = fakeGitHub();
  const [r, u] = req("/security-posture/");
  assert.equal(await gate(r, ENV, u, gh.fetch, NOW), null);
  assert.equal(gh.calls.length, 0);
});

test("missing configuration fails closed", async () => {
  for (const key of ["SESSION_SECRET", "GITHUB_APP_PRIVATE_KEY", "GITHUB_ORG"] as const) {
    const [r, u] = req("/members/", await sessionCookie(true));
    const res = (await gate(r, { ...ENV, [key]: undefined }, u, fakeGitHub().fetch, NOW))!;
    assert.equal(res.status, 503, key);
    assert.doesNotMatch(await res.text(), /members content/);
  }
});

test("no session: sent to sign in, remembering where they were going", async () => {
  const [r, u] = req("/members/adr/?x=1");
  const res = (await gate(r, ENV, u, fakeGitHub().fetch, NOW))!;
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "/auth/login?next=%2Fmembers%2Fadr%2F%3Fx%3D1");
  assertPrivate(res);
});

test("a forged session cookie is treated as no session", async () => {
  const [r, u] = req("/members/", `${SESSION_COOKIE}=eyJsb2dpbiI6InJlYWRlciJ9.AAAA`);
  const res = (await gate(r, ENV, u, fakeGitHub().fetch, NOW))!;
  assert.equal(res.status, 302);
});

test("sign-in → GitHub → callback → members content, end to end", async () => {
  resetTokenCache();
  const gh = fakeGitHub();
  const [r1, u1] = req("/auth/login?next=/members/adr/");
  const login = (await gate(r1, ENV, u1, gh.fetch, NOW))!;
  assert.equal(login.status, 302);
  const to = new URL(login.headers.get("location")!);
  assert.equal(to.origin + to.pathname, "https://github.com/login/oauth/authorize");
  assert.equal(to.searchParams.get("redirect_uri"), `${ORIGIN}/auth/callback`);
  const state = to.searchParams.get("state")!;
  const oauth = login.headers.get("set-cookie")!.split(";")[0];
  assert.ok(oauth.startsWith(`${OAUTH_COOKIE}=`));

  const [r2, u2] = req(`/auth/callback?code=abc&state=${state}`, oauth);
  const cb = (await gate(r2, ENV, u2, gh.fetch, NOW))!;
  assert.equal(cb.status, 302);
  assert.equal(cb.headers.get("location"), "/members/adr/");
  const session = cb.headers.getSetCookie().find((c) => c.startsWith(`${SESSION_COOKIE}=`))!.split(";")[0];
  assert.match(cb.headers.getSetCookie().join("\n"), /__Host-ip_session=.*HttpOnly; Secure; SameSite=Lax/);

  const [r3, u3] = req("/members/adr/", session);
  const res = (await gate(r3, ENV, u3, gh.fetch, NOW))!;
  assert.equal(res.status, 200);
  assert.match(await res.text(), /members content/);
  assertPrivate(res);
  assert.equal(res.headers.get("set-cookie"), null, "the origin's cookies never reach the reader");
  const originCall = gh.calls.find((c) => c.url.startsWith("https://members-origin.example/"))!;
  const sent = new Headers(originCall.init!.headers);
  assert.equal(sent.get("x-invariant-gate"), "origin-secret");
  assert.equal(sent.get("cookie"), null, "the reader's cookies never reach the origin");
  assert.equal(gh.calls.filter((c) => c.url.includes("/user")).length, 1);
});

test("callback with the wrong state is refused", async () => {
  const sealed = await seal({ state: "expected", next: "/members/", exp: NOW_S + 60 }, ENV.SESSION_SECRET!);
  const [r, u] = req("/auth/callback?code=abc&state=attacker", `${OAUTH_COOKIE}=${sealed}`);
  const res = (await gate(r, ENV, u, fakeGitHub().fetch, NOW))!;
  assert.equal(res.status, 400);
});

test("signed in but not a member: 403 with the way to join, no content", async () => {
  const gh = fakeGitHub();
  const [r, u] = req("/members/", await sessionCookie(false));
  const res = (await gate(r, ENV, u, gh.fetch, NOW))!;
  assert.equal(res.status, 403);
  const body = await res.text();
  assert.match(body, /href="\/join\/"/);
  assert.doesNotMatch(body, /members content/);
  assert.ok(!gh.calls.some((c) => c.url.includes("members-origin")));
});

test("a stale answer is re-asked: removed from the org means 403 from then on", async () => {
  resetTokenCache();
  const [r, u] = req("/members/", await sessionCookie(true, RECHECK_SECONDS));
  const res = (await gate(r, ENV, u, fakeGitHub({ membership: 404 }).fetch, NOW))!;
  assert.equal(res.status, 403);
  const fresh = res.headers.getSetCookie().find((c) => c.startsWith(`${SESSION_COOKIE}=`))!;
  const v = await unseal<{ member: boolean; checked: number; exp: number }>(fresh.split(";")[0].split("=").slice(1).join("="), ENV.SESSION_SECRET!, NOW_S);
  assert.equal(v?.member, false);
  assert.equal(v?.checked, NOW_S);
});

test("a stale answer that cannot be re-asked is a 503, never the old yes", async () => {
  for (const opts of [{ membership: 500 }, { tokenStatus: 401 }, { membership: 302 }]) {
    resetTokenCache();
    const [r, u] = req("/members/", await sessionCookie(true, RECHECK_SECONDS + 1));
    const res = (await gate(r, ENV, u, fakeGitHub(opts).fetch, NOW))!;
    assert.equal(res.status, 503, JSON.stringify(opts));
    assert.doesNotMatch(await res.text(), /members content/);
  }
});

test("a member before the members site exists gets a plain 503, not a public page", async () => {
  const [r, u] = req("/members/", await sessionCookie(true));
  const res = (await gate(r, { ...ENV, MEMBERS_ORIGIN: undefined }, u, fakeGitHub().fetch, NOW))!;
  assert.equal(res.status, 503);
  assert.match(await res.text(), /not published yet/);
});

test("writes are refused", async () => {
  const [r, u] = req("/members/", await sessionCookie(true), "POST");
  assert.equal((await gate(r, ENV, u, fakeGitHub().fetch, NOW))!.status, 405);
});

test("sign out clears the session", async () => {
  const [r, u] = req("/auth/logout", await sessionCookie(true));
  const res = (await gate(r, ENV, u, fakeGitHub().fetch, NOW))!;
  assert.equal(res.status, 302);
  assert.match(res.headers.get("set-cookie")!, /__Host-ip_session=; Path=\/; Max-Age=0/);
});
