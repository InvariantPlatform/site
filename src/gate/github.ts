// GitHub, as the gate uses it (ADR-185, ADR-210). Two identities, never mixed:
//   - the READER signs in through the GitHub App's user authorization. The
//     user token is used once, to learn who they are, and then dropped; the
//     gate never stores it and asks for no scopes.
//   - the APP answers "is this login a member of the org?" with a short-lived
//     installation token (Organization members: read). Never an org-admin PAT.
// Every function throws on anything it does not understand; the caller turns
// a throw into "no access", so the gate fails closed.

import { b64url } from "./session.ts";

export type Fetch = (input: Request | string | URL, init?: RequestInit) => Promise<Response>;

export interface AppConfig {
  org: string;
  /** Slug of the team every member joins; it grants read on the platform's source (ADR-211). */
  team: string;
  appId: string;
  installationId: string;
  clientId: string;
  clientSecret: string;
  /** PKCS#8 PEM ("BEGIN PRIVATE KEY"). GitHub issues PKCS#1; convert once with openssl. */
  privateKey: string;
}

const API = "https://api.github.com";
// GitHub rejects API calls without a User-Agent.
const UA = "invariant-platform-gate";

function apiHeaders(auth: string): HeadersInit {
  return { authorization: auth, accept: "application/vnd.github+json", "user-agent": UA, "x-github-api-version": "2022-11-28" };
}

export function authorizeUrl(clientId: string, redirectUri: string, state: string): string {
  const u = new URL("https://github.com/login/oauth/authorize");
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("state", state);
  u.searchParams.set("allow_signup", "true");
  return u.toString();
}

/** Trade the callback's code for the reader's identity. */
export async function signedInUser(cfg: AppConfig, code: string, redirectUri: string, fetcher: Fetch): Promise<{ login: string; id: number }> {
  const res = await fetcher("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json", "user-agent": UA },
    body: JSON.stringify({ client_id: cfg.clientId, client_secret: cfg.clientSecret, code, redirect_uri: redirectUri }),
  });
  const tok = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !tok.access_token) throw new Error(`code exchange refused: ${tok.error ?? res.status}`);
  const me = await fetcher(`${API}/user`, { headers: apiHeaders(`Bearer ${tok.access_token}`) });
  const user = (await me.json()) as { login?: string; id?: number };
  if (!me.ok || typeof user.login !== "string" || typeof user.id !== "number") throw new Error(`/user answered ${me.status}`);
  return { login: user.login, id: user.id };
}

function pemBody(pem: string): Uint8Array<ArrayBuffer> {
  if (pem.includes("BEGIN RSA PRIVATE KEY")) {
    throw new Error("GITHUB_APP_PRIVATE_KEY is PKCS#1; convert it: openssl pkcs8 -topk8 -nocrypt -in app.pem -out app.pkcs8.pem");
  }
  const b64 = pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "").replace(/\s+/g, "");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** The App's own JWT (RS256), valid nine minutes, backdated one for clock skew. */
export async function appJwt(appId: string, privateKeyPem: string, nowSec: number): Promise<string> {
  const key = await crypto.subtle.importKey("pkcs8", pemBody(privateKeyPem), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const enc = new TextEncoder();
  const head = b64url(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const body = b64url(enc.encode(JSON.stringify({ iat: nowSec - 60, exp: nowSec + 540, iss: appId })));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

// One installation token per isolate, reused until five minutes before it
// expires. Isolates are short-lived, so this saves calls without holding a
// credential for long.
let cached: { token: string; expiresMs: number } | null = null;

export function resetTokenCache(): void {
  cached = null;
}

async function installationToken(cfg: AppConfig, fetcher: Fetch, nowMs: number): Promise<string> {
  if (cached && cached.expiresMs - nowMs > 5 * 60_000) return cached.token;
  const jwt = await appJwt(cfg.appId, cfg.privateKey, Math.floor(nowMs / 1000));
  const res = await fetcher(`${API}/app/installations/${cfg.installationId}/access_tokens`, {
    method: "POST",
    headers: apiHeaders(`Bearer ${jwt}`),
  });
  const body = (await res.json()) as { token?: string; expires_at?: string };
  if (res.status !== 201 || !body.token || !body.expires_at) throw new Error(`installation token refused: ${res.status}`);
  cached = { token: body.token, expiresMs: Date.parse(body.expires_at) };
  return body.token;
}

/** true = member, false = GitHub says not a member. Anything else throws. */
export async function isOrgMember(cfg: AppConfig, login: string, fetcher: Fetch, nowMs: number): Promise<boolean> {
  const token = await installationToken(cfg, fetcher, nowMs);
  const res = await fetcher(`${API}/orgs/${encodeURIComponent(cfg.org)}/members/${encodeURIComponent(login)}`, {
    headers: apiHeaders(`Bearer ${token}`),
    redirect: "manual",
  });
  if (res.status === 204) return true;
  if (res.status === 404) return false;
  throw new Error(`membership check answered ${res.status}`);
}

export type OrgState = "active" | "pending" | "none";

/**
 * The reader's standing in the org: a member ("active"), invited and not yet
 * accepted ("pending"), or neither. Read before inviting, so reloading the
 * join page never sends a second invitation email. Needs members: read.
 */
export async function orgMembership(cfg: AppConfig, login: string, fetcher: Fetch, nowMs: number): Promise<OrgState> {
  const token = await installationToken(cfg, fetcher, nowMs);
  const res = await fetcher(`${API}/orgs/${encodeURIComponent(cfg.org)}/memberships/${encodeURIComponent(login)}`, {
    headers: apiHeaders(`Bearer ${token}`),
    redirect: "manual",
  });
  if (res.status === 404) return "none";
  const body = (await res.json()) as { state?: string };
  if (res.status === 200 && (body.state === "active" || body.state === "pending")) return body.state;
  throw new Error(`membership lookup answered ${res.status}`);
}

/**
 * Invite `login` into the members team as a plain member, which invites them
 * to the org too. GitHub emails the invitation; the reader accepts it on
 * github.com, and from then on can read the platform's source (ADR-211). Needs members: write, the ONE write permission
 * the App holds. Never an owner role, whatever the caller passes.
 */
export async function inviteToOrg(cfg: AppConfig, login: string, fetcher: Fetch, nowMs: number): Promise<OrgState> {
  const token = await installationToken(cfg, fetcher, nowMs);
  // The team endpoint invites a reader who is not yet in the org, and they
  // join the team (and so can read the source) the moment they accept.
  const res = await fetcher(`${API}/orgs/${encodeURIComponent(cfg.org)}/teams/${encodeURIComponent(cfg.team)}/memberships/${encodeURIComponent(login)}`, {
    method: "PUT",
    headers: { ...apiHeaders(`Bearer ${token}`), "content-type": "application/json" },
    body: JSON.stringify({ role: "member" }),
    redirect: "manual",
  });
  const body = (await res.json()) as { state?: string; role?: string };
  if (res.status === 200 && body.role === "member" && (body.state === "active" || body.state === "pending")) return body.state;
  throw new Error(`invitation answered ${res.status}`);
}

/**
 * The current login of GitHub account `githubId`, or null if the account is
 * gone. The NUMBER never changes; a login can be renamed or recycled.
 */
async function loginOf(token: string, githubId: number, fetcher: Fetch): Promise<string | null> {
  const res = await fetcher(`${API}/user/${githubId}`, { headers: apiHeaders(`Bearer ${token}`), redirect: "manual" });
  if (res.status === 404) return null;
  const user = (await res.json()) as { login?: string; id?: number };
  if (res.status !== 200 || typeof user.login !== "string" || user.id !== githubId) throw new Error(`user lookup answered ${res.status}`);
  return user.login;
}

/**
 * Invite GitHub account `githubId` unless it is already a member or already
 * invited: the half of joining that runs when the provider says the email is
 * confirmed, wherever the reader clicked the link. Reading first means a
 * redelivered event never sends a second invitation email.
 */
export async function inviteById(cfg: AppConfig, githubId: number, fetcher: Fetch, nowMs: number): Promise<OrgState | "gone"> {
  const token = await installationToken(cfg, fetcher, nowMs);
  const login = await loginOf(token, githubId, fetcher);
  if (login === null) return "gone";
  const state = await orgMembership(cfg, login, fetcher, nowMs);
  return state === "none" ? inviteToOrg(cfg, login, fetcher, nowMs) : state;
}

export type Removal = "removed" | "not-a-member" | "owner-kept";

/**
 * Take GitHub account `githubId` out of the org: the other half of joining
 * (ADR-210). The account is named by its NUMBER, which never changes; the
 * login is looked up fresh, because a renamed account would otherwise be
 * missed and a recycled login could name someone else. A pending invitation
 * is cancelled the same way. An owner (role admin) is never removed, whatever
 * list they unsubscribe from: the App removes plain members only.
 */
export async function removeFromOrg(cfg: AppConfig, githubId: number, fetcher: Fetch, nowMs: number): Promise<Removal> {
  const token = await installationToken(cfg, fetcher, nowMs);
  const login = await loginOf(token, githubId, fetcher);
  if (login === null) return "not-a-member"; // the account itself is gone

  const path = `${API}/orgs/${encodeURIComponent(cfg.org)}/memberships/${encodeURIComponent(login)}`;
  const memRes = await fetcher(path, { headers: apiHeaders(`Bearer ${token}`), redirect: "manual" });
  if (memRes.status === 404) return "not-a-member";
  const mem = (await memRes.json()) as { role?: string; state?: string };
  if (memRes.status !== 200) throw new Error(`membership lookup answered ${memRes.status}`);
  if (mem.role !== "member") return "owner-kept";

  const del = await fetcher(path, { method: "DELETE", headers: apiHeaders(`Bearer ${token}`), redirect: "manual" });
  if (del.status === 204 || del.status === 404) return "removed";
  throw new Error(`removal answered ${del.status}`);
}
