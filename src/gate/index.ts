// The members gate (ADR-185, ADR-210): gated paths on the public hostname,
// enforced here, in front of everything else. It is the whole access decision,
// so it is written to fail closed — every path that is not a positive,
// current "member" ends in a redirect to sign in, a 403, or a 503, and never
// in members content:
//   - no session or a bad signature    → sign in
//   - signed in, not a member          → 403, pointing at /join/
//   - membership older than RECHECK    → asked again; an error is a 503, not
//                                        a fall back to the old answer
//   - any configuration missing        → 503
// Members content is never in the static export or the public repository. It
// is fetched from MEMBERS_ORIGIN (private, origin-locked) with a shared secret
// header, and every gated or auth response is private, uncached and noindex.
// The join flow's two paths (/join/apply, /join/status) are routed from here
// to join.ts, which shares this file's sign-in and fails closed the same way.

import { authorizeUrl, isOrgMember, signedInUser, type Fetch } from "./github.ts";
import { clearCookie, readCookie, seal, setCookie, unseal } from "./session.ts";
import { GATED_PREFIX, OAUTH_COOKIE, SESSION_COOKIE, appConfig, escapeHtml, page, privateHeaders, redirect, unavailable, type GateEnv, type Session } from "./common.ts";
import { JOIN_PATHS, join } from "./join.ts";

export { GATED_PREFIX, OAUTH_COOKIE, SESSION_COOKIE, JOIN_COOKIE, type GateEnv } from "./common.ts";

const SESSION_DAYS = 7;
/** How long a membership answer is trusted. Removal takes effect within this. */
export const RECHECK_SECONDS = 10 * 60;
const OAUTH_SECONDS = 10 * 60;

export function isGated(pathname: string): boolean {
  return pathname === GATED_PREFIX || pathname.startsWith(`${GATED_PREFIX}/`);
}

/** Only a path on this site; anything else (//evil, https://…, \\) becomes the members index. */
export function safeNext(next: string | null, origin: string): string {
  const fallback = `${GATED_PREFIX}/`;
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  try {
    const u = new URL(next, origin);
    return u.origin === origin ? `${u.pathname}${u.search}` : fallback;
  } catch {
    return fallback;
  }
}

async function serveMembers(request: Request, url: URL, env: GateEnv, fetcher: Fetch): Promise<Response> {
  if (!env.MEMBERS_ORIGIN || !env.MEMBERS_ORIGIN_SECRET) {
    return page(503, "Not published yet", "<p>You are a member — thank you. The members pages are not published yet.</p>");
  }
  const target = new URL(`${url.pathname}${url.search}`, env.MEMBERS_ORIGIN);
  // A fresh request: the reader's cookies and headers stay here.
  const res = await fetcher(target.toString(), {
    method: request.method === "HEAD" ? "HEAD" : "GET",
    headers: { "x-invariant-gate": env.MEMBERS_ORIGIN_SECRET, "user-agent": "invariant-platform-gate" },
    redirect: "manual",
  });
  const out = new Response(res.body, { status: res.status, headers: privateHeaders(new Headers(res.headers)) });
  out.headers.delete("set-cookie");
  return out;
}

/**
 * Answer the request if it belongs to the gate (gated or /auth/ paths);
 * null means "not mine", and the caller serves the public site as before.
 */
export async function gate(request: Request, env: GateEnv, url: URL, fetcher: Fetch = fetch, nowMs: number = Date.now()): Promise<Response | null> {
  const p = url.pathname;
  const isAuth = p.startsWith("/auth/");
  if (JOIN_PATHS.has(p)) return join(request, env, url, appConfig(env), fetcher, nowMs);
  if (!isAuth && !isGated(p)) return null;
  if (request.method !== "GET" && request.method !== "HEAD") return page(405, "Method not allowed", "<p>Read-only.</p>");

  const cfg = appConfig(env);
  if (!cfg) return page(503, "Members area not configured", "<p>The members area is not switched on yet.</p>");
  const secret = env.SESSION_SECRET as string;
  const now = Math.floor(nowMs / 1000);
  const callback = `${url.origin}/auth/callback`;

  if (p === "/auth/login") {
    const state = crypto.randomUUID();
    const next = safeNext(url.searchParams.get("next"), url.origin);
    const sealed = await seal({ state, next, exp: now + OAUTH_SECONDS }, secret);
    return redirect(authorizeUrl(cfg.clientId, callback, state), [setCookie(OAUTH_COOKIE, sealed, OAUTH_SECONDS)]);
  }

  if (p === "/auth/callback") {
    const pending = await unseal<{ state: string; next: string; exp: number }>(readCookie(request, OAUTH_COOKIE), secret, now);
    const code = url.searchParams.get("code");
    if (!pending || !code || url.searchParams.get("state") !== pending.state) {
      return page(400, "Sign-in expired", `<p>That sign-in link is stale or was not started here. <a href="/auth/login">Sign in again</a>.</p>`, { "set-cookie": clearCookie(OAUTH_COOKIE) });
    }
    try {
      const user = await signedInUser(cfg, code, callback, fetcher);
      const member = await isOrgMember(cfg, user.login, fetcher, nowMs);
      const session: Session = { login: user.login, id: user.id, member, checked: now, exp: now + SESSION_DAYS * 86_400 };
      return redirect(pending.next, [clearCookie(OAUTH_COOKIE), setCookie(SESSION_COOKIE, await seal(session, secret), SESSION_DAYS * 86_400)]);
    } catch {
      return unavailable();
    }
  }

  if (p === "/auth/logout") return redirect("/", [clearCookie(SESSION_COOKIE)]);
  if (isAuth) return page(404, "Not found", "<p>No such page.</p>");

  // A gated path.
  let session = await unseal<Session>(readCookie(request, SESSION_COOKIE), secret, now);
  if (!session) return redirect(`/auth/login?next=${encodeURIComponent(`${p}${url.search}`)}`);

  const cookies: string[] = [];
  if (now - session.checked >= RECHECK_SECONDS) {
    try {
      session = { ...session, member: await isOrgMember(cfg, session.login, fetcher, nowMs), checked: now };
      cookies.push(setCookie(SESSION_COOKIE, await seal(session, secret), session.exp - now));
    } catch {
      return unavailable();
    }
  }

  let res: Response;
  if (!session.member) {
    res = page(403, "Members only", `<p>You are signed in as <strong>${escapeHtml(session.login)}</strong>, which is not a member of the ${escapeHtml(cfg.org)} organization.</p><p><a href="/join/">How to join</a> · <a href="/auth/logout">Sign out</a></p>`);
  } else {
    try {
      res = await serveMembers(request, url, env, fetcher);
    } catch {
      return unavailable();
    }
  }
  for (const c of cookies) res.headers.append("set-cookie", c);
  return res;
}
