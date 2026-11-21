// Page views, counted on the server (Workers Analytics Engine). The Worker
// already serves every page, so it can count without putting anything in the
// page: no script, no cookie, no beacon, and nothing in the visitor's browser.
// The privacy page says exactly this; keep the two in step.
//
// One data point per public HTML page served with 200:
//   blob1  the path                      "/security-posture/"
//   blob2  the referring site, host only "www.linkedin.com", "" if none or this site
//   blob3  the country Cloudflare reports "CA", "" if unknown
//   index1 the path (the sampling key)
// Never written: an IP address, a user agent, a cookie, a query string, or
// anything about a member. Members pages and sign-in never reach this code
// (the gate answers them first), and they are not counted.

export interface ViewsEnv {
  VIEWS?: AnalyticsEngineDataset;
}

// Self-declared crawlers and link previewers. A view is a person reading;
// a crawler fetching is not. Search Console counts the crawlers separately.
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|monitor|curl|wget|python-requests|headless/i;

export interface View {
  path: string;
  referrer: string;
  country: string;
}

/** What would be recorded for this request, or null when it is not a view. */
export function viewOf(request: Request, url: URL, status: number, contentType: string, canonical: string): View | null {
  if (request.method !== "GET") return null;
  if (status !== 200 || !contentType.includes("text/html")) return null;
  if (BOT.test(request.headers.get("user-agent") ?? "")) return null;
  let referrer = "";
  try {
    const r = new URL(request.headers.get("referer") ?? "");
    if (r.hostname !== canonical && r.hostname !== url.hostname) referrer = r.hostname;
  } catch {
    // absent or unparseable: a direct visit
  }
  const cf = (request as Request & { cf?: { country?: string } }).cf;
  return { path: url.pathname, referrer, country: typeof cf?.country === "string" ? cf.country : "" };
}

/** Record a view. A missing binding or a failed write never affects the page. */
export function countView(env: ViewsEnv, view: View | null): void {
  if (!view || !env.VIEWS) return;
  try {
    env.VIEWS.writeDataPoint({ blobs: [view.path, view.referrer, view.country], indexes: [view.path] });
  } catch {
    // counting is never a reason to fail a page
  }
}
