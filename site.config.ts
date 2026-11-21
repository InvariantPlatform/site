import register from "./content/register-shape.json";
// The one place the site's claims live. ADR-173: a number on the page that
// the platform does not keep is a false claim; change these here, nowhere else.
export const site = {
  name: "Invariant Platform",
  url: "https://invariant-platform.io",
  description:
    "A security-first Kubernetes platform that re-asserts its own security posture every night, from outside itself, and whose only repair is a rebuild from a declaration.",
  author: { name: "Brad Penney", url: "https://www.bradpenney.io" },
  stats: { decisions: register.reduce((a, c) => a + c.n, 0), rebuilds: 7, restoreDrills: 2, failureDomains: 2 },
  // The register's categories and the count in each, generated from the
  // private index by scripts/register-shape.mjs (rerun when a decision lands).
  // stats.decisions above is their sum, so the two cannot disagree.
  register,
  // The join flow is built and live behind this flag. It stays false until the
  // soft opening (a full sign-up and unsubscribe test first); every Join CTA
  // reads it, and the join page says "not open yet" while it is false.
  joinOpen: true,
  nav: [
    { href: "/architecture/", label: "Architecture" },
    { href: "/security-posture/", label: "Security posture" },
    { href: "/resiliency/", label: "Resiliency" },
    { href: "/observability/", label: "Observability" },
    { href: "/supply-chain/", label: "Supply chain" },
  ],
} as const;

// The invariant count is not here: it comes from the last run, filled in by the Worker (bug-231).

