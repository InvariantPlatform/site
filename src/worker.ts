// The Worker in front of the static export. Today it does one thing: send
// every non-canonical hostname (invariant-platform.dev, www.) to the
// canonical one with a 301, then serve the assets. Preview deployments on
// *.workers.dev are left alone so a branch can be looked at. When the
// members routes arrive (ADR-185), the organization check goes here too —
// the same script, in front of the same assets.
//
// CANONICAL_HOST is set in wrangler.jsonc. Empty = no redirect, which is the
// safe value until the canonical zone is actually delegated: redirecting to
// a hostname that still resolves to the registrar's parking page would send
// every visitor there.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  CANONICAL_HOST: string;
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
    return env.ASSETS.fetch(request);
  },
};

export default worker;
