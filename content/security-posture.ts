import type { Row } from "@/app/components/ui";

export const intro = {
  title: "Security posture",
  paragraphs: ["Fifteen properties the platform claims. Each one is re-asserted every night by a process that runs outside the cluster, as an identity that can only read, and pages when the property no longer holds. What follows is the list and what each line means. How each is enforced, and the incident that put it on the list, is for members."],
};

export const groups: { name: string; rows: Row[] }[] = [
  { name: "Inside the cluster", rows: [
    { k: "Pod security is enforced in every namespace", v: "No namespace runs without a standard applied, including the ones the distribution creates itself." },
    { k: "Every namespace starts from deny", v: "Traffic is allowed by listing, never by omission." },
    { k: "Admission policies enforce, not warn", v: "A policy in audit mode is a report, not a control." },
    { k: "Cluster-admin is a known, short list", v: "Five subjects, each expected. A sixth pages." },
    { k: "No standing elevated access", v: "The operator holds no write access at rest; elevation is a recorded, self-expiring grant." },
    { k: "Configuration is reconciling", v: "Every part of the platform is applied from one source and pruned back to it." },
    { k: "The artifact is signed by one named workflow", v: "Verification can be removed without anything breaking. That is why it is checked." },
    { k: "Secrets come from a manager, never from git", v: "Eight external secrets, all syncing." },
  ]},
  { name: "On the hosts beneath it", rows: [
    { k: "SELinux enforcing on both hypervisors", v: "No permissive domains. Checked on this host and on its peer." },
    { k: "No failed units on the watch list", v: "Eight units that must be healthy for the platform to be trustworthy." },
    { k: "The peer's update service is idle and gated", v: "Nightly patching defers rather than collides." },
    { k: "systemd is not degraded", v: "A failed unit that is not on the watch list is still a failed unit. This is the line that failed last night.", failed: true },
  ]},
  { name: "At the edge", rows: [
    { k: "The public site answers through the edge", v: "Resolved by a public resolver, not the host's — a lesson from the week split-horizon made this line lie." },
    { k: "A direct hit on the origin is refused", v: "The one finding in the whole list that would mean someone bypassed the edge." },
    { k: "Restricted ports refuse non-listed sources", v: "Probed from a source that must be denied, then from one that must be allowed." },
  ]},
];

export const why = [
  { title: "Why it runs from outside", body: "A control that runs inside what it is checking cannot report that the thing is gone. The check runs on the hypervisors as a timer, with a read-only identity, and pages on failure. What it cannot yet do is page on its own silence — that gap is named, not hidden." },
  { title: "Why the output is the interface", body: "The check reports what is wrong, never that it ran. A clean exit with no findings is distinguishable from a broken run, and a run that could not see something fails loudly instead of passing quietly." },
];

export const members = {
  title: "For members: how each line is enforced, and what it cost to learn",
  body: "The nightly output, verbatim, every night. The mechanism behind each invariant. The incident that put it on the list — the placement gate that passed while both nameservers sat on one node, the backup that mirrored an empty directory for months, the config that was unparseable for fourteen hours while every status said fine.",
};
