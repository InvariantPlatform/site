// The join flow (ADR-185): GitHub sign-in → email + consent → the provider's
// double opt-in → an invitation to the org. Two paths, both answered here:
//
//   /join/apply   GET: the form, for a signed-in reader.
//                 POST: the provider adds the address as `unactivated` and
//                 sends its confirmation email; the GitHub id goes with it as
//                 metadata, so the address is tied to THIS account.
//   /join/status  reads the subscriber back. Unconfirmed → "check your inbox".
//                 Confirmed, and the metadata names this GitHub account → the
//                 App invites the login (once; a pending invitation is not
//                 sent again).
//
// Nothing is stored here. The list and the consent record live at the
// provider; membership lives at GitHub; the reader's browser holds only a
// signed note of which address they gave (JOIN_COOKIE). A confirmation clicked
// on another device still works: sign in, give the same address, and the
// metadata check finds it.
//
// It fails closed like the gate: any answer it does not understand from
// GitHub or the provider is a 503 and no invitation.

import { consent as CONSENT_TEXT } from "../../content/join.ts";
import { createSubscriber, getSubscriber, isConfirmed, type Subscriber } from "./buttondown.ts";
import { JOIN_COOKIE, SESSION_COOKIE, escapeHtml, page, redirect, type GateEnv, type Session } from "./common.ts";
import { inviteToOrg, orgMembership, type AppConfig, type Fetch } from "./github.ts";
import { clearCookie, readCookie, seal, setCookie, unseal } from "./session.ts";

export const JOIN_PATHS = new Set(["/join/apply", "/join/status"]);
const JOIN_DAYS = 30;
const MAX_FORM_BYTES = 4096;

interface Pending {
  email: string;
  id: number;
  exp: number;
}

const closed = () => page(503, "Joining is not open yet", `<p>Joining opens with the members launch. <a href="/join/">What joining means</a>.</p>`);
const providerDown = () => page(503, "Try again in a minute", "<p>The sign-up could not be completed just now, and nothing was sent. Try again in a minute.</p>");

/** Plain shape check; the provider's confirmation email is the real test. */
export function validEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email);
}

/** GitHub's private relay addresses accept no mail, so a confirmation sent there never arrives. */
export function isNoreply(email: string): boolean {
  return /@users\.noreply\.github\.com$/i.test(email);
}

function form(session: Session, org: string, error = "", email = ""): string {
  const err = error ? `<p style="color:#f5b041">${error}</p>` : "";
  return `${err}<p>Signed in as <strong>${escapeHtml(session.login)}</strong>. Give an address you read; the invitation to <strong>${escapeHtml(org)}</strong> goes to this GitHub account once you confirm it.</p>
<form method="post" action="/join/apply">
<label for="email">Your email</label>
<input id="email" name="email" type="email" required maxlength="254" autocomplete="email" value="${escapeHtml(email)}">
<label class="consent"><input type="checkbox" name="consent" value="yes" required><span>${escapeHtml(CONSENT_TEXT)}</span></label>
<button type="submit">Send the confirmation email</button>
</form>
<p class="small">What is kept and why: <a href="/privacy/">privacy</a>. Not you? <a href="/auth/logout">Sign out</a>.</p>`;
}

async function sessionOf(request: Request, secret: string, now: number): Promise<Session | null> {
  return unseal<Session>(readCookie(request, SESSION_COOKIE), secret, now);
}

/** The subscriber belongs to this reader only if the provider's metadata says so. */
function ownedBy(sub: Subscriber, session: Session): boolean {
  return sub.metadata.github_id === String(session.id);
}

async function apply(request: Request, url: URL, cfg: AppConfig, env: GateEnv, session: Session, fetcher: Fetch, now: number): Promise<Response> {
  const secret = env.SESSION_SECRET as string;
  const apiKey = env.BUTTONDOWN_API_KEY as string;
  if (request.method === "GET" || request.method === "HEAD") {
    if (session.member) return page(200, "Already a member", `<p>You are already a member. <a href="/members/">Members area</a>.</p>`);
    return page(200, "Join the organization", form(session, cfg.org));
  }
  if (request.method !== "POST") return page(405, "Method not allowed", "<p>No.</p>");

  // The session cookie is SameSite=Lax, so a cross-site POST arrives without
  // it; the Origin check refuses the rest.
  if (request.headers.get("origin") !== url.origin) return page(403, "Refused", "<p>That form was not sent from this site.</p>");
  if (Number(request.headers.get("content-length") ?? MAX_FORM_BYTES + 1) > MAX_FORM_BYTES) return page(413, "Too large", "<p>That form is larger than this one.</p>");

  let email = "";
  let consented = false;
  try {
    const data = await request.formData();
    email = String(data.get("email") ?? "").trim();
    consented = data.get("consent") === "yes";
  } catch {
    return page(400, "Join the organization", form(session, cfg.org, "That form could not be read."));
  }
  if (!validEmail(email)) return page(400, "Join the organization", form(session, cfg.org, "That is not an email address.", email));
  if (isNoreply(email)) return page(400, "Join the organization", form(session, cfg.org, "GitHub's noreply addresses receive no mail, so the confirmation would never arrive. Use an address you read.", email));
  if (!consented) return page(400, "Join the organization", form(session, cfg.org, "Joining needs the email consent: the list is the price of the invitation.", email));

  try {
    const result = await createSubscriber(apiKey, email, {
      github_id: String(session.id),
      github_login: session.login,
      consent_text: CONSENT_TEXT,
      consent_at: new Date(now * 1000).toISOString(),
      source: `${url.host}/join/`,
    }, request.headers.get("cf-connecting-ip"), fetcher);
    if (result === "exists") {
      const sub = await getSubscriber(apiKey, email, fetcher);
      // Same words whether the address is someone else's or unreadable: the
      // page must not confirm who is on the list.
      if (!sub || !ownedBy(sub, session)) {
        return page(409, "Join the organization", form(session, cfg.org, "That address cannot be used for this GitHub account. Use another one."));
      }
    }
  } catch {
    return providerDown();
  }
  const pending = await seal<Pending>({ email, id: session.id, exp: now + JOIN_DAYS * 86_400 }, secret);
  return redirect("/join/status", [setCookie(JOIN_COOKIE, pending, JOIN_DAYS * 86_400)], 303);
}

async function status(request: Request, cfg: AppConfig, env: GateEnv, session: Session, fetcher: Fetch, nowMs: number, now: number): Promise<Response> {
  const secret = env.SESSION_SECRET as string;
  const pending = await unseal<Pending>(readCookie(request, JOIN_COOKIE), secret, now);
  if (!pending || pending.id !== session.id) return redirect("/join/apply", [clearCookie(JOIN_COOKIE)]);
  const email = escapeHtml(pending.email);

  let sub: Subscriber | null;
  try {
    sub = await getSubscriber(env.BUTTONDOWN_API_KEY as string, pending.email, fetcher);
  } catch {
    return providerDown();
  }
  if (!sub || !ownedBy(sub, session)) return redirect("/join/apply", [clearCookie(JOIN_COOKIE)]);
  if (sub.type === "unactivated") {
    return page(200, "Check your inbox", `<p>A confirmation email went to <strong>${email}</strong>. Click the link in it, then <a href="/join/status">reload this page</a>.</p><p class="small">Nothing arrived? Check spam, or <a href="/join/apply">use a different address</a>.</p>`);
  }
  if (!isConfirmed(sub)) {
    return page(403, "Not on the list", `<p><strong>${email}</strong> is not subscribed (it was unsubscribed, or mail to it bounced), so no invitation is sent. <a href="/join/apply">Use another address</a>.</p>`);
  }

  try {
    let state = await orgMembership(cfg, session.login, fetcher, nowMs);
    if (state === "none") state = await inviteToOrg(cfg, session.login, fetcher, nowMs);
    // Ask GitHub again on the next members page instead of trusting the
    // session's old "not a member".
    const fresh = await seal<Session>({ ...session, checked: 0 }, secret);
    const cookies = [setCookie(SESSION_COOKIE, fresh, session.exp - now)];
    if (state === "active") {
      return page(200, "You are a member", `<p>Welcome. <a href="/members/">Open the members area</a>.</p>`, cookies.map((c) => ["set-cookie", c] as [string, string]));
    }
    const invitation = `https://github.com/orgs/${encodeURIComponent(cfg.org)}/invitation`;
    return page(200, "Invitation sent", `<p>Email confirmed. GitHub has an invitation to <strong>${escapeHtml(cfg.org)}</strong> waiting for <strong>${escapeHtml(session.login)}</strong>.</p><p><a href="${invitation}">Accept it on GitHub</a>, then <a href="/members/">open the members area</a>.</p>`, cookies.map((c) => ["set-cookie", c] as [string, string]));
  } catch {
    return page(503, "Invitation not sent", "<p>Your email is confirmed, but GitHub did not take the invitation just now. <a href=\"/join/status\">Try again in a minute</a>; nothing is sent twice.</p>");
  }
}

/** Answer a join path. `cfg` null means the gate itself is not configured. */
export async function join(request: Request, env: GateEnv, url: URL, cfg: AppConfig | null, fetcher: Fetch, nowMs: number): Promise<Response> {
  if (!cfg || !env.BUTTONDOWN_API_KEY) return closed();
  const now = Math.floor(nowMs / 1000);
  const session = await sessionOf(request, env.SESSION_SECRET as string, now);
  if (!session) {
    return request.method === "POST" ? redirect("/auth/login?next=/join/apply", [], 303) : redirect(`/auth/login?next=${encodeURIComponent(url.pathname)}`);
  }
  if (url.pathname === "/join/apply") return apply(request, url, cfg, env, session, fetcher, now);
  if (request.method !== "GET" && request.method !== "HEAD") return page(405, "Method not allowed", "<p>Read-only.</p>");
  return status(request, cfg, env, session, fetcher, nowMs, now);
}
