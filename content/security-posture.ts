import type { Claim } from "@/app/components/instrument";

export const intro = {
  title: "Security posture",
  paragraphs: ["The properties the platform claims. Every night a process outside the cluster, with an identity that can only read, re-asserts each one and pages when one no longer holds. How each is enforced, and the incident that put it on the list, is for members."],
};

export const groups: { name: string; hue: number; claims: Claim[] }[] = [
  { name: "Inside the cluster", hue: 0, claims: [
    { k: "Pod security is enforced in every namespace", v: "Including the namespaces the distribution creates itself." },
    { k: "Every namespace starts from deny", v: "Traffic is allowed by listing, never by omission." },
    { k: "Admission policies enforce", v: "A policy in audit mode is a report, so audit mode does not count." },
    { k: "Cluster-admin is a known, short list", v: "Every subject on it is expected. A new one pages." },
    { k: "No standing elevated access", v: "Elevation is a recorded grant that expires on its own." },
    { k: "Configuration is reconciling", v: "Applied from one source and pruned back to it." },
    { k: "The artifact is signed by one named workflow", v: "Removing verification would break nothing, which is why it is checked." },
    { k: "Secrets come from a manager, never from git", v: "Every external secret is syncing." },
    { k: "Every volume has a replica on every hypervisor", v: "A volume that drifts onto one host is a finding." },
  ]},
  { name: "On the hosts", hue: 1, claims: [
    { k: "SELinux enforcing on this hypervisor", v: "No permissive domains and no custom modules." },
    { k: "SELinux enforcing on every peer", v: "Asked over the wire. A peer that cannot be asked is reported, and not counted." },
    { k: "No failed units on the watch list", v: "The units the platform depends on, named in the tool rather than discovered at run time." },
    { k: "Every peer's update service is idle and gated", v: "Patching on one host waits for the others." },
  ]},
  { name: "At the edge", hue: 2, claims: [
    { k: "The public site answers through the edge", v: "Resolved by a public resolver, so the check sees what a visitor sees." },
    { k: "A direct hit on the origin is refused", v: "If this line fails, someone bypassed the edge." },
    { k: "Restricted ports refuse unlisted sources", v: "Probed from a source that must be denied, then one that must be allowed." },
  ]},
  { name: "The backups a rebuild restores from", hue: 4, claims: [
    { k: "The cluster's state was snapshotted recently", v: "A rebuild restores from this, so the check asks for a recent snapshot, not a working mechanism." },
    { k: "Every declared application backup succeeded recently", v: "The last success counts, not the last attempt. A declared backup that disappears is a finding." },
  ]},
];

// Lines that exist only to fail. They are never in the count; when one fires
// it is a finding, and the count on the strip says so.
export const failOnly = {
  title: "And one line that exists only to fail",
  body: "If the host's service manager reports itself degraded, the run fails and names the unit, watch list or not. This line has no passing form and is never counted.",
};

export const why = [
  { title: "Why it runs from outside", body: "A check inside the cluster cannot report that the cluster is gone. This one runs on the hypervisors with a read-only identity and pages on failure. It cannot yet page on its own silence, and that gap is written down." },
  { title: "Why the output is the interface", body: "The check reports what is wrong, never just that it ran. A run that could not see something fails loudly instead of passing quietly." },
  { title: "Why \"not checked\" is not \"held\"", body: "A peer that could not be reached once counted as held, so the count rose when the check saw less. Now anything not asserted counts as nothing. The number on the strip is what was asserted that morning." },
];

export const members = {
  title: "For members: how each line is enforced, and what it cost to learn",
  body: "The nightly output, verbatim, every night. The mechanism behind each invariant. The incident that put it on the list: the placement gate that passed while both nameservers sat on one node, the backup that mirrored an empty directory for months, the config that was unparseable for fourteen hours while every status said fine.",
};
