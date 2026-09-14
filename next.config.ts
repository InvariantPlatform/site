import type { NextConfig } from "next";

// Static export today: Cloudflare Pages serves `out/` with nothing running.
// When the members routes arrive (ADR-185) this line goes and the same app
// gains middleware for the organization check; nothing else changes.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
