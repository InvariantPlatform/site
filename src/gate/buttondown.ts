// The newsletter provider, as the join flow uses it (ADR-185). Buttondown
// holds the list, the consent record, double opt-in and unsubscribe; this
// site keeps none of them. Two calls only:
//   - create a subscriber. Buttondown sends its own confirmation email and the
//     subscriber is `unactivated` until they click it (double opt-in);
//   - read one back by email, to learn whether they have confirmed.
// Every function throws on anything it does not understand; the caller turns
// a throw into "no invitation", so the flow fails closed.

import type { Fetch } from "./github.ts";

const API = "https://api.buttondown.com/v1";

/** Stored on the subscriber. Values are strings; keys are snake_case (templating). */
export interface JoinMetadata {
  github_id: string;
  github_login: string;
  consent_text: string;
  consent_at: string;
  source: string;
}

export interface Subscriber {
  type: string;
  metadata: Record<string, unknown>;
}

/** Types that mean "confirmed and still subscribed". Anything else is not. */
const CONFIRMED = new Set(["regular", "premium"]);
export const isConfirmed = (s: Subscriber) => CONFIRMED.has(s.type);

function headers(apiKey: string): HeadersInit {
  return { authorization: `Token ${apiKey}`, accept: "application/json", "content-type": "application/json" };
}

/**
 * "created": new, confirmation email sent. "exists": the address is already on
 * the list (Buttondown answers 400 and changes nothing) — read it back to see
 * whose it is. Anything else throws.
 */
export async function createSubscriber(apiKey: string, email: string, metadata: JoinMetadata, ip: string | null, fetcher: Fetch): Promise<"created" | "exists"> {
  const body: Record<string, unknown> = { email_address: email, type: "unactivated", metadata };
  if (ip) body.ip_address = ip;
  const res = await fetcher(`${API}/subscribers`, { method: "POST", headers: headers(apiKey), body: JSON.stringify(body) });
  if (res.status === 201) return "created";
  if (res.status === 400) {
    // 400 is also "invalid email" — only an address that reads back is "exists".
    return (await getSubscriber(apiKey, email, fetcher)) ? "exists" : Promise.reject(new Error("subscriber refused"));
  }
  throw new Error(`subscriber create answered ${res.status}`);
}

/** The subscriber, or null when Buttondown has no such address. */
export async function getSubscriber(apiKey: string, email: string, fetcher: Fetch): Promise<Subscriber | null> {
  const res = await fetcher(`${API}/subscribers/${encodeURIComponent(email)}`, { headers: headers(apiKey) });
  if (res.status === 404) return null;
  if (res.status !== 200) throw new Error(`subscriber read answered ${res.status}`);
  const s = (await res.json()) as { type?: unknown; metadata?: unknown };
  if (typeof s.type !== "string") throw new Error("subscriber without a type");
  const metadata = s.metadata && typeof s.metadata === "object" ? (s.metadata as Record<string, unknown>) : {};
  return { type: s.type, metadata };
}
