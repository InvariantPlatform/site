import type { Row, Step } from "@/app/components/ui";

export const intro = {
  title: "Observability",
  paragraphs: ["The metrics store, the log store, the dashboards and the alert rules run on the hypervisors, beside the cluster, as ordinary host services. It is the less elegant place to put them and the only place that can report the cluster is gone. Everything in this tier is provisioned from a repository and restarted when its configuration changes — because a file written is not a file applied, and this platform learned that at every layer."],
  rule: "A monitor inside the thing it monitors cannot report that the thing is gone.",
};

export const shape = { title: "The shape", sub: "Signals leave the cluster; nothing about seeing them depends on the cluster being up." };

export const flow: Step[] = [
  { title: "Agents on every node", body: "Scrape metrics, ship logs. Configuration is code; a hand edit is reverted." },
  { title: "Host tier, beside the cluster", body: "Metrics and logs stores on the hypervisor, not in the thing they watch.", gate: true },
  { title: "Dashboards from git", body: "Click-ops is disabled, not discouraged. A panel that is not in the repository does not exist." },
  { title: "Rules that read the stores", body: "Decided, not built. Today every alert is a probe of a front door or a unit; a rule that reads the metrics store and decides is the next component in the model.", planned: true },
  { title: "A page to a phone", body: "Every probe ends in a notification, and the path has fired for real. What is not yet watched is the notifier's own silence.", gate: true },
];

export const principles = [
  { title: "Rebuildable, like everything else", body: "The tier is provisioned by the same tool that builds the nodes. Only its data is backed up; the stack itself is a declaration and comes back from one." },
  { title: "A probe that has never fired is a hypothesis", body: "Every probe on the hosts was written after a real incident, and the path from probe to phone has been exercised for real: the night the edge lock landed, the front door went away, a page arrived within minutes, and a second page said it was back. The ones that were wrong — a job that reported success on an empty run — are in the register with their numbers." },
  { title: "The gaps are named", body: "Below, in order. A gap under a green panel is a lie; a gap in a numbered list is a decision that has not been taken yet, and the register says which." },
];

// The gaps, in public, each with why it is a gap and what closes it. When one
// closes it leaves this list and becomes a line in the nightly check.
export const gaps = {
  title: "The named gaps",
  sub: "written down as gaps, not hidden under a green panel · each one closes into a line of the nightly check",
  rows: [
    { k: "Every alert is a probe of a door, not a reading of the stores", v: "A front door answered 200 for the entire life of a backup job that had never once succeeded, and through forty-two hours of another one deadlocked. A dead backup changes no HTTP response; neither does a volume at ninety-six percent. The metrics that would say so are collected; nothing yet reads them and decides." },
    { k: "The check pages on a finding, not on its own silence", v: "If the nightly check never runs, nothing pages. A watcher for the watcher exists on each host; it does not yet close the loop end to end. Until it does, a quiet morning is a claim the strip above cannot fully make." },
    { k: "A peer that cannot reach a node says so quietly", v: "When a node is rebuilt its host key changes, and a peer hypervisor's probes of that node fall back to \"not checked\" — printed, uncounted, unpublished. Honest, and silent. Found this week; the roll will distribute the new key to every peer." },
  ] satisfies Row[],
};

export const members = {
  title: "For members: the dashboards, the alert rules, and the alerting gap",
  body: "The two dashboards, built around the questions that were unanswerable the night they were needed — and, in a later iteration, the live ones at observe.bradpenney.io, where organization membership is the login. Every alert rule with the incident that produced it, including the one that reported success every day until the day it had something to say. And the audit stream that turned out to be a memory leak, found with a heap profile.",
};
