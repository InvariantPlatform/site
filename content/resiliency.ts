import type { Row } from "@/app/components/ui";
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

// A roll, as the tool performs it: one node at a time, every step a gate the
// tool asserts before the next. About seventy minutes for five nodes on the
// last one. No coordinates: the steps are the same on any fleet.
export const roll = {
  title: "A roll, node by node",
  sub: "five nodes · about seventy minutes · the operator watches, and is not asked for anything",
  rows: [
    { k: "Refuse if a volume would be orphaned", v: "Before anything is destroyed: if this node holds the last healthy replica of any volume, the roll stops and says so. Destroying it would be data loss dressed as maintenance." },
    { k: "Destroy the node", v: "The virtual machine is deleted and its definition removed. There is no snapshot to fall back to; the declaration is the fallback." },
    { k: "Remove it from the state store and the cluster", v: "The member is pruned from the state store's quorum, the node is forgotten, and every volume still attached to it is detached — so the workload that mounted it can move in seconds, not after a timeout." },
    { k: "Rebuild it from the declaration", v: "A fresh image is fetched by checksum, a one-time join token is minted, and the node is created from the same rendered configuration as the last time — compared byte for byte, so the only difference is the thing that was meant to change." },
    { k: "Readmit its storage", v: "The rebuilt node returns with a new disk identity. Storage keeps the old one on record; the tool evicts, removes and re-adds the disk under the new identity with the same reservation. This was five hand-run scripts one roll ago." },
    { k: "Wait for quorum, then for every volume", v: "System pods running, every state-store member serving, every volume healthy with its replicas in place. Only then the next node. A cluster that has not absorbed one removal is not given a second." },
    { k: "Verify the version, and go again", v: "The node reports the pinned version or the roll halts. When the last node passes, the nightly check runs against the result." },
  ] satisfies Row[],
};

// What the last two rolls asked a human to do. Each answer became code in the
// next release; the roll after that is the proof, or the next entry here.
export const attended = {
  title: "What needed a human, and what happened to it",
  sub: "the last roll: four things · each is now a step · the next roll is the proof",
  rows: [
    { k: "The state-store probe used the operator's identity", v: "It asked with a read-only identity that is forbidden that path, and reported the store unhealthy on every node while it was fine. The tool now carries its own identity for every probe." },
    { k: "Storage refused every rebuilt node's disk", v: "Five nodes, five identical hand-run repairs. The re-admission above is the repair, in code, as a step." },
    { k: "A dead node's volumes stayed attached", v: "The workload that mounted one waited out a controller timeout — minutes of an application answering 500. Detaching is now a step between forgetting the node and rebuilding it." },
    { k: "A database started before its search index", v: "Not the roll's fault, and not left alone: the workload declares the dependency now. A platform that rebuilds nodes routinely surfaces every startup-order assumption its tenants have." },
  ] satisfies Row[],
};

export const members = {
  title: "For members: seven rebuilds, three failures, what each one taught",
  body: "The samples in order, with the timings. The rebuild that concentrated the whole platform on one node. The placement gate that passed while the property it protects was broken. The detached volume that a series of node replacements quietly eroded to nothing, and the check that now runs before a node is destroyed.",
};
