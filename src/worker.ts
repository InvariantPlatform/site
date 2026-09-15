// The Worker in front of the static export (ADR-194). On every request:
//   1. a non-canonical hostname (invariant-platform.dev, www.) is sent to the
//      canonical one with a 301; *.workers.dev previews are left alone;
//   2. the asset is served;
//   3. if it is HTML, the status strip's `data-status` placeholders are
//      filled from Cloudflare KV — the document the nightly posture-check
//      published from the host tier. No document: the strip says so. A
//      document older than STALE_AFTER_HOURS: the strip says that, in amber.
// When the members routes arrive (ADR-185) the organization check goes in
// here too — the same script, in front of the same assets.

interface Env {
  ASSETS: Fetcher;
  CANONICAL_HOST: string;
  // Bound in wrangler.jsonc once the namespace exists. Optional so a build
  // without the binding still serves; the strip then reads "no run recorded".
  STATUS?: KVNamespace;
}

/** The contract with `substrate publish-status` (ADR-194). Key: `posture`. */
interface Posture {
  ran_at: string; // RFC 3339
  invariants: number;
  held: number;
  findings: string[];
  provisioner: string;
  host: string;
}

const STATUS_KEY = "posture";
const STALE_AFTER_HOURS = 26;
const KV_CACHE_SECONDS = 60;

type State = "ok" | "finding" | "stale" | "none";

function parsePosture(raw: string | null): Posture | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<Posture>;
    if (typeof p.ran_at !== "string" || typeof p.invariants !== "number" || typeof p.held !== "number") return null;
    return {
      ran_at: p.ran_at,
      invariants: p.invariants,
      held: p.held,
      findings: Array.isArray(p.findings) ? p.findings.filter((f): f is string => typeof f === "string") : [],
      provisioner: typeof p.provisioner === "string" ? p.provisioner : "",
      host: typeof p.host === "string" ? p.host : "",
    };
  } catch {
    return null;
  }
}

function ageHours(ranAt: string, now: Date): number {
  const t = Date.parse(ranAt);
  return Number.isNaN(t) ? Infinity : (now.getTime() - t) / 3_600_000;
}

/** "2026-09-14 03:12 ADT" in the platform's own timezone; the reader can judge staleness by eye. */
function formatRanAt(ranAt: string): string {
  const t = Date.parse(ranAt);
  if (Number.isNaN(t)) return ranAt;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Halifax",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short",
  }).formatToParts(new Date(t));
  const get = (type: string) => parts.find((x) => x.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")} ${get("timeZoneName")}`;
}

/** Everything the strip shows, decided once per request; the rewriter only copies it in. */
function describe(p: Posture | null, now: Date): { state: State; ranAt: string; findings: string; provisioner: string; held?: number; invariants?: number } {
  if (!p) return { state: "none", ranAt: "no run recorded", findings: "", provisioner: "–" };
  const age = ageHours(p.ran_at, now);
  const n = p.findings.length;
  const findingsText = n === 0 ? "no findings" : n === 1 ? "1 finding, paged" : `${n} findings, paged`;
  if (age > STALE_AFTER_HOURS) {
    const days = Math.floor(age / 24);
    const since = days >= 1 ? `${days} day${days === 1 ? "" : "s"}` : `${Math.floor(age)} h`;
    return { state: "stale", ranAt: formatRanAt(p.ran_at), findings: `stale — no run for ${since}`, provisioner: p.provisioner || "–", held: p.held, invariants: p.invariants };
  }
  return { state: n === 0 ? "ok" : "finding", ranAt: formatRanAt(p.ran_at), findings: findingsText, provisioner: p.provisioner || "–", held: p.held, invariants: p.invariants };
}

async function readPosture(env: Env): Promise<Posture | null> {
  if (!env.STATUS) return null;
  try {
    return parsePosture(await env.STATUS.get(STATUS_KEY, { cacheTtl: KV_CACHE_SECONDS }));
  } catch {
    return null; // a KV outage is not a reason to break the page; the strip reads "no run recorded"
  }
}

function fillStatus(html: Response, d: ReturnType<typeof describe>): Response {
  const text = (value: string) => ({ element(el: Element) { el.setInnerContent(value); } });
  const show = { element(el: Element) { el.removeAttribute("hidden"); } };
  let rw = new HTMLRewriter()
    .on('[data-status="root"]', { element(el) { el.setAttribute("data-state", d.state); } })
    .on('[data-status="ran_at"]', text(d.ranAt))
    .on('[data-status="provisioner"]', text(d.provisioner));
  if (d.state !== "none") {
    rw = rw
      .on('[data-status="held-line"]', show)
      .on('[data-status="held"]', text(String(d.held)))
      .on('[data-status="invariants"]', text(String(d.invariants)))
      .on('[data-status="findings"]', { element(el) { el.removeAttribute("hidden"); el.setInnerContent(d.findings); } });
  }
  return rw.transform(html);
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const canonical = env.CANONICAL_HOST;
    if (canonical && url.hostname !== canonical && !url.hostname.endsWith(".workers.dev")) {
      url.hostname = canonical;
      url.protocol = "https:";
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }
    const asset = await env.ASSETS.fetch(request);
    if (!(asset.headers.get("content-type") ?? "").includes("text/html")) return asset;
    return fillStatus(asset, describe(await readPosture(env), new Date()));
  },
};

export default worker;
