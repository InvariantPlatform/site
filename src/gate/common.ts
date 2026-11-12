// What the gate (index.ts) and the join flow (join.ts) share: configuration,
// the session shape, cookie names, and the private, uncached, noindex pages
// every gated, sign-in or join response is made of.

import type { AppConfig } from "./github.ts";

export interface GateEnv {
  GITHUB_ORG?: string;
  GITHUB_APP_ID?: string;
  GITHUB_APP_INSTALLATION_ID?: string;
  GITHUB_APP_CLIENT_ID?: string;
  GITHUB_APP_CLIENT_SECRET?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
  SESSION_SECRET?: string;
  MEMBERS_ORIGIN?: string;
  MEMBERS_ORIGIN_SECRET?: string;
  /** Unset = joining is closed (503). The newsletter provider holds the list. */
  BUTTONDOWN_API_KEY?: string;
}

export const GATED_PREFIX = "/members";
export const SESSION_COOKIE = "__Host-ip_session";
export const OAUTH_COOKIE = "__Host-ip_oauth";
export const JOIN_COOKIE = "__Host-ip_join";

export interface Session {
  login: string;
  id: number;
  member: boolean;
  /** Unix seconds of the last membership answer; 0 forces a recheck. */
  checked: number;
  exp: number;
}

export function appConfig(env: GateEnv): AppConfig | null {
  const { GITHUB_ORG: org, GITHUB_APP_ID: appId, GITHUB_APP_INSTALLATION_ID: installationId, GITHUB_APP_CLIENT_ID: clientId, GITHUB_APP_CLIENT_SECRET: clientSecret, GITHUB_APP_PRIVATE_KEY: privateKey } = env;
  if (!org || !appId || !installationId || !clientId || !clientSecret || !privateKey || !env.SESSION_SECRET) return null;
  return { org, appId, installationId, clientId, clientSecret, privateKey };
}

export function privateHeaders(h: Headers): Headers {
  h.set("cache-control", "private, no-store");
  h.set("x-robots-tag", "noindex, nofollow");
  h.set("vary", "cookie");
  return h;
}

const STYLE = "body{margin:0;background:#0b0d10;color:#d7dae0;font:15px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;display:grid;place-items:center;min-height:100vh;padding:16px;box-sizing:border-box}main{max-width:36rem;width:100%}h1{font-size:1.1rem;color:#f5b041;margin:0 0 1rem}a{color:#f5b041}label{display:block;margin:1rem 0 .35rem;color:#9aa0aa;font-size:13px}input[type=email]{width:100%;box-sizing:border-box;background:#06080a;color:#d7dae0;border:1px solid #2a2f36;padding:.6rem .7rem;font:inherit}.consent{display:flex;gap:.6rem;align-items:flex-start;color:#d7dae0;font-size:14px}.consent input{margin-top:.3rem}button{margin-top:1.25rem;background:#f5b041;color:#0b0d10;border:0;padding:.65rem 1rem;font:inherit;font-weight:600;cursor:pointer}.small{color:#9aa0aa;font-size:13px}";

/** `title` and `body` are trusted markup; escape anything from a reader first. */
export function page(status: number, title: string, body: string, extra?: HeadersInit): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} · Invariant Platform</title><style>${STYLE}</style></head><body><main><h1>${title}</h1>${body}</main></body></html>`;
  const h = privateHeaders(new Headers(extra));
  h.set("content-type", "text/html; charset=utf-8");
  return new Response(html, { status, headers: h });
}

/** 302 for a GET; pass 303 after a POST so the browser follows with a GET. */
export function redirect(location: string, cookies: string[] = [], status = 302): Response {
  const h = privateHeaders(new Headers({ location }));
  for (const c of cookies) h.append("set-cookie", c);
  return new Response(null, { status, headers: h });
}

export const unavailable = () => page(503, "Members area unavailable", "<p>Membership could not be confirmed just now, so nothing is shown. Try again in a minute.</p>");

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
