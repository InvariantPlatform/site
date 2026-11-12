import type { MetadataRoute } from "next";

// The teasers carry the search weight; the members pages are never indexed
// (ADR-185). The gate also sends `X-Robots-Tag: noindex` on every gated and
// sign-in response. This only keeps polite crawlers from asking.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/members/", "/auth/"] },
  };
}
