import type { CardData } from "@/app/components/ui";
import type { TermLine } from "@/app/components/Terminal";

export const hero = {
  titleBefore: "A security posture that",
  titleAccent: "proves",
  titleAfter: "itself.",
  lede: "Invariant Platform is a security-first Kubernetes platform that re-asserts its own security posture every night, from outside itself, and whose only repair is a rebuild from a declaration. Every property it claims is one it checks.",
  body: "The checks ask the cluster's own API and compare the answer with the declaration, not with a list of machines, so they ask the same questions of five nodes as of a thousand. The estate it runs on today is the proving ground, not the limit.",
};

// A real run, kept with its finding on purpose. Replace with a newer run, never with a cleaner one.
export const postureRun = {
  title: "nightly · from the host tier · read-only identity",
  command: "posture-check",
  lines: [
    { status: "ok", text: "pod security: 19/19 namespaces enforced" },
    { status: "ok", text: "network policy: 19 namespaces default-deny" },
    { status: "ok", text: "admission: 2 policies, 2 enforcing Deny" },
    { status: "ok", text: "cluster-admin: 5 subjects, all expected" },
    { status: "ok", text: "jit grant: none outstanding" },
    { status: "ok", text: "flux: 5 kustomizations reconciling" },
    { status: "ok", text: "supply chain: signature verified, pinned identity" },
    { status: "ok", text: "credentials: 8 external secrets syncing" },
    { status: "ok", text: "public site: 200 through the edge" },
    { status: "ok", text: "origin lock: direct bypass refused (000)" },
    { status: "ok", text: "firewall: 3 ports refuse non-listed sources" },
    { status: "ok", text: "selinux: both hypervisors enforcing" },
    { status: "ok", text: "host units: 8 watched, none failed" },
    { status: "ok", text: "peer: update service inactive, gates armed" },
    { status: "FAIL", text: "systemd degraded; unit not on the watch list: ddns-notify" },
  ] satisfies TermLine[],
  summary: "14 of 15 invariants hold · 1 finding, paged",
  caption: "A run with a finding, kept on purpose. A check that only ever says ok is not a check.",
};

export const sections: CardData[] = [
  { title: "Architecture", href: "/architecture/", body: "Every component is described before it exists. The model leads; a component in the configuration that the model does not describe fails the build.", meta: "Public: the context view. Members: all five views, and the decision register." },
  { title: "Security posture", href: "/security-posture/", body: "Every invariant, re-asserted nightly from outside the cluster. Failure pages. Silence is the known gap, and it is written down as one.", meta: "Public: each invariant, and what it asserts. Members: how each is enforced, and the incident that created it." },
  { title: "Resiliency", href: "/resiliency/", body: "There is no repair path. Anything broken is destroyed and rebuilt from a declaration, and every rebuild is measured against the last one.", meta: "Public: the principle and the scorecard. Members: what the roll gate checks, and the failures behind it." },
  { title: "Observability", href: "/observability/", body: "Metrics, logs and alert rules live beside the cluster, not in it. A monitor inside the thing it monitors cannot report that the thing is gone.", meta: "Public: the rule and the shape. Members: every alert rule and every dashboard, as written." },
  { title: "Supply chain", href: "/supply-chain/", body: "Nothing reaches the cluster except a signed artifact from one named workflow. Pushing to git deploys nothing; only the signed artifact does.", meta: "Public: the flow, and the three repositories. Members: every pin and checksum, and the code that enforces the chain." },
];

// The register: every decision the platform has taken has a number, a category,
// and the property it asserted. Public: the shape. Members: the decisions.
export const register = {
  title: "The decision register",
  sub: "twelve categories · every entry numbered · nothing deleted",
  body: "Every choice that shaped the platform is written down before it is built, numbered, and filed under one of twelve categories. A decision that turned out wrong is not deleted; it is superseded by a later number that says why. Many record a property that was asserted and did not hold the first time it was checked; writing them down is how that stays visible.",
  aside: "Members read the decisions. The public page shows their shape, so the count on the strip is a count of something you can see.",
};

export const offer = {
  title: "Free membership: the source, the field notes and the register",
  body: "Members read the platform's code in its GitHub organization: the provisioner that builds, rolls and rebuilds the cluster, and every check it runs. With it come the field notes, the decision register and the architecture views. Join the organization and leave an email address. No cost, no seat count, no card, and you can leave whenever you like.",
};
