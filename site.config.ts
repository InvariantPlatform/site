// The one place the site's claims live. ADR-173: a number on the page that
// the platform does not keep is a false claim; change these here, nowhere else.
export const site = {
  name: "Invariant Platform",
  url: "https://invariant-platform.io",
  description:
    "A small, security-first Kubernetes platform that re-asserts its own posture every night, from outside itself, and whose only repair is a rebuild from a declaration.",
  author: { name: "Brad Penney", url: "https://www.bradpenney.io" },
  stats: { decisions: 193, invariants: 15, rebuilds: 7, restoreDrills: 2, failureDomains: 2 },
  // Prototype: the members mechanism (organization join + email) is not built.
  // Flip when it is; every Join CTA reads this.
  joinOpen: false,
  nav: [
    { href: "/architecture/", label: "Architecture" },
    { href: "/security-posture/", label: "Security posture" },
    { href: "/resiliency/", label: "Resiliency" },
    { href: "/observability/", label: "Observability" },
    { href: "/supply-chain/", label: "Supply chain" },
  ],
} as const;

export const statsLine = `${site.stats.decisions} decisions · ${site.stats.invariants} invariants · ${site.stats.rebuilds} rebuilds`;
