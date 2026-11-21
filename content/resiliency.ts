import type { Claim } from "@/app/components/instrument";
import { site } from "@/site.config";

export const intro = {
  title: "Resiliency",
  paragraphs: ["There is no repair path. A node that is wrong is destroyed and built again from the declaration, then compared with the previous build so the only difference is the one that was meant. The tool that does this on a Tuesday afternoon is the one that would rebuild the estate after a fire."],
  rule: "Rebuilt, never repaired. If a rebuild has not been rehearsed, the recovery it promises does not exist.",
};

export const scorecard = [
  { n: site.stats.rebuilds, label: "full rebuilds from a declaration, each compared to the last" },
  { n: site.stats.restoreDrills, label: "restore drills passed: the state store, and a database volume with its files" },
  { n: site.stats.failureDomains, label: "failure domains, declared and labelled; the gate checks the label, not the intent" },
  { n: 1, label: "hypervisor whose loss means a rebuild, by decision, written down as such" },
];

export const principles = [
  { title: "Two tools, one path", body: "Day to day, a node change is a roll: rebuild one node from the declaration, wait for quorum and storage, then the next. The catastrophe tool is the same code without the loop. Both refuse to run unless they are a signed, released build." },
  { title: "The gate, not the operator, says when", body: "Between nodes, the gate asserts what the cluster's own status will not: quorum, every volume's replicas, and the placement rule that keeps two copies apart. Each time it has failed, the failure became a numbered decision." },
  { title: "What it cannot survive, in writing", body: "One hypervisor carries the quorum. Losing it means a rebuild from the declaration and the last backup. That was decided, because the alternative spent capacity on a case that is rehearsed instead." },
];

// A roll, as the tool performs it: one node at a time, every step a gate the
// tool asserts before the next. No coordinates: the steps are the same on any fleet.
export const roll = {
  title: "A roll, node by node",
  sub: "one node at a time · the operator watches, and is not asked for anything",
  steps: [
    { k: "Refuse if a volume would be orphaned", v: "If this node holds the last healthy replica of any volume, the roll stops before anything is destroyed." },
    { k: "Destroy the node", v: "There is no snapshot to fall back to. The declaration is the fallback." },
    { k: "Remove it from the state store and the cluster", v: "Its volumes are detached, so the workloads that mounted them move in seconds rather than after a timeout." },
    { k: "Rebuild it from the declaration", v: "The same rendered configuration as last time, compared byte for byte." },
    { k: "Readmit its storage", v: "The rebuilt node's disk returns under a new identity, with the same reservation." },
    { k: "Wait for quorum, then for every volume", v: "A cluster that has not absorbed one removal is not given a second." },
    { k: "Verify the version, and go again", v: "A wrong version halts the roll. After the last node, the nightly check runs against the result." },
  ] satisfies Claim[],
};

// What the last roll asked a human to do. Each answer became code in the
// next release; the roll after that is the proof, or the next entry here.
export const attended = {
  title: "What needed a human, and what happened to it",
  sub: "the last roll · each is now a step · the next roll is the proof",
  fixes: [
    { title: "The state-store probe used the operator's identity", was: "A forbidden path made the store look unhealthy on every node while it was fine.", now: "The tool carries its own identity for every probe." },
    { title: "Storage refused every rebuilt node's disk", was: "The same repair, by hand, on every node.", now: "Readmission is a step in the roll." },
    { title: "A dead node's volumes stayed attached", was: "An application answered 500 for minutes while a controller timed out.", now: "Detaching is a step before the rebuild." },
    { title: "A database started before its search index", was: "The roll exposed a startup-order assumption in a tenant.", now: "The workload declares the dependency." },
  ],
};

export const members = {
  title: "For members: what the roll gate checks, and the failures behind it",
  body: "Each condition the gate checks between nodes, with its code and the incident that put it there. Arriving in December's register: the rebuild that piled the whole platform onto one node, the volume that node replacements eroded to nothing, and why a roll has no attended steps.",
};
