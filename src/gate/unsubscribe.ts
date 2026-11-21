// The list and the org move together (ADR-210). Joining trades an email
// address for an org invitation; leaving the list takes the invitation back.
//
// Buttondown POSTs two events here:
//   `subscriber.confirmed`    the reader clicked the confirmation link, on
//                             whatever device; the App sends the invitation.
//                             Without this, the invitation waited for the
//                             reader to come back to /join/status in the
//                             browser they signed up in, and on a phone the
//                             link opens somewhere else (bug-238).
//   `subscriber.unsubscribed` the membership ends.
// The webhook is only a POKE:
//   1. the signature must verify (HMAC-SHA256 of the raw body, the webhook's
//      signing key) or nothing is read;
//   2. the payload supplies one thing, the subscriber's id. Everything else is
//      read back from Buttondown with our own key, so a replayed event can at
//      most ask us to re-check someone, and the check reads their real state;
//   3. delivery is at-least-once and unordered, so the CURRENT state
//      decides, never the event: a confirmed subscriber is invited (once; a
//      member or a pending invitation is left alone) and never removed; an
//      unconfirmed one is removed and never invited;
//   4. the GitHub account is the one the join flow stored (`github_id`), and
//      removeFromOrg never touches an owner.
// Any doubt is a 503: Buttondown retries 5 times, about 5 minutes apart, and
// emails the operator if the webhook keeps failing. Nobody is removed on a
// guess, and nobody stays because of a dropped event without that email.

import { getSubscriber, isConfirmed } from "./buttondown.ts";
import { inviteById, removeFromOrg, type AppConfig, type Fetch } from "./github.ts";
import type { GateEnv } from "./common.ts";

export const WEBHOOK_PATH = "/join/buttondown-webhook";
const MAX_BODY = 64 * 1024;

const empty = (status: number) => new Response(null, { status, headers: { "cache-control": "no-store" } });

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-f]{64}$/i.test(hex)) return null;
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/** Constant-time: crypto.subtle.verify, never a string compare. */
export async function verifySignature(raw: ArrayBuffer, header: string | null, secret: string): Promise<boolean> {
  const sig = hexToBytes((header ?? "").trim().replace(/^sha256=/i, ""));
  if (!sig) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, sig, raw);
}

export async function buttondownWebhook(request: Request, env: GateEnv, cfg: AppConfig | null, fetcher: Fetch, nowMs: number): Promise<Response> {
  if (request.method !== "POST") return empty(405);
  const secret = env.BUTTONDOWN_WEBHOOK_SECRET;
  if (!secret || !cfg || !env.BUTTONDOWN_API_KEY) return empty(503);

  const raw = await request.arrayBuffer();
  if (raw.byteLength > MAX_BODY) return empty(413);
  if (!(await verifySignature(raw, request.headers.get("x-buttondown-signature"), secret))) return empty(401);

  let event: { event_type?: unknown; data?: { subscriber?: unknown } };
  try {
    event = JSON.parse(new TextDecoder().decode(raw));
  } catch {
    return empty(400);
  }
  const kind = event.event_type;
  if (kind !== "subscriber.unsubscribed" && kind !== "subscriber.confirmed") return empty(204);
  const id = event.data?.subscriber;
  if (typeof id !== "string" || !/^[\w-]{1,64}$/.test(id)) return empty(400);

  try {
    const sub = await getSubscriber(env.BUTTONDOWN_API_KEY, id, fetcher);
    if (!sub) return empty(204);
    const githubId = String(sub.metadata.github_id ?? "");
    // Not someone the join flow signed up: no GitHub account to act on.
    if (!/^\d{1,20}$/.test(githubId)) return empty(204);
    // The event says which way to look; the current state decides whether to act.
    if (kind === "subscriber.confirmed") {
      if (!isConfirmed(sub)) return empty(204);
      // The outcome only: no login, no address, in the Worker's logs.
      console.log(`confirmed: ${await inviteById(cfg, Number(githubId), fetcher, nowMs)}`);
      return empty(204);
    }
    if (isConfirmed(sub)) return empty(204);
    console.log(`unsubscribe: ${await removeFromOrg(cfg, Number(githubId), fetcher, nowMs)}`);
    return empty(204);
  } catch {
    return empty(503);
  }
}
