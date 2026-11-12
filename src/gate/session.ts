// Signed cookies for the members gate (ADR-185, ADR-210). A value is
// base64url(JSON) "." base64url(HMAC-SHA256), keyed by SESSION_SECRET. Nothing
// in a cookie is trusted until the signature verifies AND it has not expired;
// crypto.subtle.verify does the comparison, so it is constant-time.

const enc = new TextEncoder();
const dec = new TextDecoder();

export function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function unb64url(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

/** Sign `payload`; it must carry `exp` (unix seconds). */
export async function seal<T extends { exp: number }>(payload: T, secret: string): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(body));
  return `${body}.${b64url(sig)}`;
}

/** The payload if the signature verifies and `exp` is in the future; otherwise null. */
export async function unseal<T extends { exp: number }>(value: string | undefined, secret: string, nowSec: number): Promise<T | null> {
  if (!value) return null;
  const dot = value.indexOf(".");
  if (dot < 1 || dot !== value.lastIndexOf(".")) return null;
  const body = value.slice(0, dot);
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), unb64url(value.slice(dot + 1)), enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(unb64url(body))) as T;
    return typeof payload.exp === "number" && payload.exp > nowSec ? payload : null;
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return undefined;
}

/**
 * `__Host-` pins the cookie to this exact host over https with Path=/ and no
 * Domain, so no other subdomain can set or read it. HttpOnly keeps it from
 * page script; Lax lets the GitHub redirect back carry it.
 */
export function setCookie(name: string, value: string, maxAgeSec: number): string {
  return `${name}=${value}; Path=/; Max-Age=${maxAgeSec}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearCookie(name: string): string {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
