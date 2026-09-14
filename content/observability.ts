import type { Step } from "@/app/components/ui";

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
  { title: "Alert rules from git", body: "Rules are provisioned files, tested for the failures they name, and reloaded — not merely written." },
  { title: "A page to a phone", body: "Every rule ends in a notification; the notifier is itself watched for silence.", gate: true },
];

export const principles = [
  { title: "Rebuildable, like everything else", body: "The tier is provisioned by the same tool that builds the nodes. Only its data is backed up; the stack itself is a declaration and comes back from one." },
  { title: "Rules are tested for the failure they name", body: "An alert that has never fired is a hypothesis. Each rule was written against a real incident, and the ones that were wrong — a metric label that did not exist, a job that reported success on an empty run — are in the register with their numbers." },
  { title: "The named gap", body: "The check that pages on a finding cannot yet page on its own silence. A watcher for the watcher exists on the hosts; it does not yet close the loop end to end. That is written as a gap, not hidden under a green panel." },
];

export const members = {
  title: "For members: the dashboards, the alert rules, and the alerting gap",
  body: "The two dashboards, built around the questions that were unanswerable the night they were needed — and, in a later iteration, the live ones at observe.bradpenney.io, where organization membership is the login. Every alert rule with the incident that produced it, including the one that reported success every day until the day it had something to say. And the audit stream that turned out to be a memory leak, found with a heap profile.",
};
