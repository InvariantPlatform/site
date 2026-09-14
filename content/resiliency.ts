import { site } from "@/site.config";

export const intro = {
  title: "Resiliency",
  paragraphs: ["There is no repair path. A node that is wrong is not fixed; it is destroyed and built again from the declaration, and the result is compared with the previous build so that the only difference is the thing that was meant to change. The same tool that does this on a Tuesday afternoon is the tool that would rebuild the whole estate after a fire."],
  rule: "Rebuilt, never repaired. If a rebuild has not been rehearsed, the recovery it promises does not exist.",
};

export const scorecard = [
  { n: site.stats.rebuilds, label: "full rebuilds from a declaration, each compared to the last" },
  { n: site.stats.restoreDrills, label: "restore drills passed: the state store, and a database volume with its files" },
  { n: site.stats.failureDomains, label: "failure domains, declared and labelled — and the gate checks the label, not the intent" },
  { n: 1, label: "hypervisor whose loss means a rebuild, by decision, written down as such" },
];

export const principles = [
  { title: "Two tools, one path", body: "Day to day, a node change is a roll: destroy one node, rebuild it from the declaration, wait for quorum and storage to be healthy, then the next. The catastrophe tool is the same code with the loop removed. Both refuse to run unless they are a signed, released build." },
  { title: "The gate, not the operator, says when", body: "Between every node, the gate asserts what the cluster's own status will not: the state store has quorum, every volume has its replicas, the placement rule that keeps two copies of a thing apart still holds. It has failed, loudly, and each failure is a numbered decision." },
  { title: "What it cannot survive, in writing", body: "One of the two hypervisors carries the quorum. Losing it means the cluster is gone and is rebuilt from the declaration and the last backup — a decision, not an accident, taken because the alternative spent capacity on a case that was rehearsed instead." },
];

export const members = {
  title: "For members: seven rebuilds, three failures, what each one taught",
  body: "The samples in order, with the timings. The rebuild that concentrated the whole platform on one node. The placement gate that passed while the property it protects was broken. The detached volume that a series of node replacements quietly eroded to nothing, and the check that now runs before a node is destroyed.",
};
