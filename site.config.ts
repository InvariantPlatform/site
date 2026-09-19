// The one place the site's claims live. ADR-173: a number on the page that
// the platform does not keep is a false claim; change these here, nowhere else.
export const site = {
  name: "Invariant Platform",
  url: "https://invariant-platform.io",
  description:
    "A small, security-first Kubernetes platform that re-asserts its own posture every night, from outside itself, and whose only repair is a rebuild from a declaration.",
  author: { name: "Brad Penney", url: "https://www.bradpenney.io" },
  stats: { decisions: 200, invariants: 15, rebuilds: 7, restoreDrills: 2, failureDomains: 2 },
  // The register's categories, with the count of decisions in each. Generated
  // from the register's index; a category's count moves when a decision lands.
  register: [
    { name: "Topology and capacity", n: 20 },
    { name: "Provisioning, roll and rebuild", n: 24 },
    { name: "Networking and DNS", n: 21 },
    { name: "Security and admission", n: 22 },
    { name: "Secrets and identity", n: 8 },
    { name: "Supply chain and releases", n: 15 },
    { name: "GitOps and config delivery", n: 9 },
    { name: "Storage, backup and disaster recovery", n: 14 },
    { name: "Observability and alerting", n: 26 },
    { name: "Workloads and migrations", n: 10 },
    { name: "Engineering practice", n: 26 },
    { name: "Site and funnel", n: 5 },
  ],
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
