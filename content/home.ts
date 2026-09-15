import type { CardData } from "@/app/components/ui";
import type { TermLine } from "@/app/components/Terminal";

export const hero = {
  titleBefore: "A control you cannot",
  titleAccent: "verify",
  titleAfter: "is not a control.",
  lede: "Invariant Platform is a small, security-first Kubernetes platform that re-asserts its own posture every night, from outside itself, and whose only repair is a rebuild from a declaration. Every property it claims is one it checks.",
  body: "It runs on two hypervisors in a house in Nova Scotia. That is not the point. The point is that a property asserted in a document is not a property until something outside the system checks it, on a schedule, and pages when it stops being true.",
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
  summary: "14 of 15 invariants hold — 1 finding, paged",
  caption: "A run with a finding, kept on purpose. A check that only ever says ok is not a check.",
};

export const sections: CardData[] = [
  { title: "Architecture", href: "/architecture/", body: "Every component is described before it exists. The model leads; a component in the configuration that the model does not describe fails the build.", meta: "Public: the context view. Members: all five views, the model, and the decision register." },
  { title: "Security posture", href: "/security-posture/", body: "Fifteen invariants, re-asserted nightly from outside the cluster. Failure pages. Silence is the known gap, and it is written down as one.", meta: "Public: the fifteen, and what each asserts. Members: how each is enforced, and the incident that created it." },
  { title: "Resiliency", href: "/resiliency/", body: "There is no repair path. Anything broken is destroyed and rebuilt from a declaration, and every rebuild is measured against the last one.", meta: "Public: the principle and the scorecard. Members: seven rebuilds, three failures, what each one taught." },
  { title: "Observability", href: "/observability/", body: "Metrics, logs and alert rules live beside the cluster, not in it. A monitor inside the thing it monitors cannot report that the thing is gone.", meta: "Public: the rule and the shape. Members: the dashboards, the alert rules, and the alerting gap." },
  { title: "Supply chain", href: "/supply-chain/", body: "Nothing reaches the cluster except a signed artifact from one named workflow. Pushing to git deploys nothing; that is the point.", meta: "Public: the flow, and the three repositories. Members: the verification chain end to end, and the tenant boundary." },
];

export const threeRepos = {
  title: "Three repositories, three owners.",
  body: "The platform builds the cluster. The platform's configuration is what reconciles onto it. The workloads belong to whoever wrote them, in their own repository, behind a tenant boundary the platform enforces. That separation is the pattern this whole site argues for.",
};

export const offer = {
  title: "The whole story is free. It just isn't anonymous.",
  body: "Join the GitHub organization and leave an email address. That unlocks every members-only route on this site. No cost, no seat count, no card, and you can leave whenever you like.",
};
