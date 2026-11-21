import type { Step } from "@/app/components/ui";

export const intro = {
  title: "Observability",
  paragraphs: ["The metrics store, the log store, the dashboards and the alert rules run on the hypervisors, beside the cluster, as ordinary host services. It is the less elegant place to put them and the only place that can report the cluster is gone. All of it is provisioned from a repository and restarted when its configuration changes, because a file written is not a file applied."],
  rule: "A monitor inside the thing it monitors cannot report that the thing is gone.",
};

export const shape = { title: "The shape", sub: "Signals leave the cluster; nothing about seeing them depends on the cluster being up." };

export const flow: Step[] = [
  { title: "Agents on every node", body: "Scrape metrics, ship logs. Configuration is code; a hand edit is reverted." },
  { title: "Host tier, beside the cluster", body: "Metrics and logs stores on the hypervisor, not in the thing they watch.", gate: true },
  { title: "Dashboards from git", body: "Editing in the UI is disabled. A panel that is not in the repository does not exist." },
  { title: "Rules that read the stores", body: "A target down, a disk or volume filling, a CronJob that has not succeeded, logs that stopped arriving, a certificate near expiry.", gate: true },
  { title: "A page to a phone", body: "Rules and probes end in the same notification path, and it has fired for real. The notifier's own silence is not yet watched.", gate: true },
];

export const principles = [
  { title: "Rebuildable, like everything else", body: "The tier is provisioned by the same tool that builds the nodes. Only its data is backed up; the stack itself comes back from the declaration." },
  { title: "A rule written against an incident", body: "The rules ask the questions that went unanswered when they mattered: a backup job that had never once succeeded behind a front door answering 200, a volume filling with nothing reading the metric that said so." },
  { title: "The gaps are named", body: "Below. A gap under a green panel is a lie; a gap in a list is a decision not yet taken, and the register says which." },
];

// The gaps, in public. When one closes it leaves this list and becomes a line
// in the nightly check or a rule.
export const gaps = {
  title: "The named gaps",
  sub: "written down, not hidden under a green panel · each one closes into a check",
  cards: [
    { title: "The check pages on a finding, not on its own silence", body: "If the nightly check never runs, nothing pages. Each host has a watcher for the watcher, but the loop is not yet closed end to end." },
    { title: "A peer that cannot reach a node says so quietly", body: "A rebuilt node has a new host key, so a peer's probes of it fall back to \"not checked\": printed, but neither counted nor published." },
  ],
};

export const members = {
  title: "For members: the dashboards, the alert rules, and the alerting gap",
  body: "The dashboards, built around the questions that were unanswerable the night they were needed, and later the live ones, where organization membership is the login. Every alert rule with the incident that produced it, including the one that reported success every day until the day it had something to say. And the audit stream that turned out to be a memory leak, found with a heap profile.",
};
