import type { MetadataRoute } from "next";
import { site } from "@/site.config";

// The public pages only. Members pages are behind the gate and never indexed
// (ADR-185); /join/confirmed/ is a post-confirmation page, noindex. Submit
// https://invariant-platform.io/sitemap.xml in Search Console.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date();
  const paths = ["/", ...site.nav.map((n) => n.href), "/join/", "/privacy/"];
  return paths.map((p) => ({
    url: new URL(p, site.url).toString(),
    lastModified: built,
    changeFrequency: p === "/" ? "daily" : "weekly",
    priority: p === "/" ? 1 : p === "/privacy/" ? 0.3 : 0.8,
  }));
}
