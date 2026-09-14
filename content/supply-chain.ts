import type { Step } from "@/app/components/ui";

export const intro = {
  title: "Supply chain",
  paragraphs: ["Nothing reaches the cluster except a signed artifact from one named workflow, and nothing reaches the hosts except a signed release, installed by version. A push to git deploys nothing; the artifact is the deploy gate. Every version of every upstream — the node image, the reconciler, the storage layer, the signing tool — is pinned in a committed file with its checksum, and a bot proposes the bump."],
  rule: "If a component can be changed by a path that is not signed, that path is the platform's real supply chain.",
};

export const shape = { title: "The flow", sub: "One direction. Each step can only consume what the previous one signed." };

export const flow: Step[] = [
  { title: "A reviewed change", body: "Signed commit, pinned versions, lint and tests as a gate. Pushing deploys nothing." },
  { title: "One named workflow builds it", body: "The artifact is built once, signed without a key under the workflow's own identity, with a bill of materials and provenance attached." },
  { title: "A private registry holds it", body: "Immutable tags. Nothing is ever called latest." },
  { title: "The cluster pulls and verifies", body: "The reconciler checks the signature against the one identity it is pinned to, then applies and prunes. Remove the verification and nothing breaks — which is why the nightly check asserts it is still there.", gate: true },
  { title: "The provisioner is held to the same rule", body: "The tool that builds the nodes is itself a signed release, installed by version and verified on the host. A working-tree build can show what it would do; it cannot act.", gate: true },
];

export const repos = { title: "Three repositories, three owners", sub: "The boundary between them is enforced by the cluster, not by a folder name." };

export const repoCards = [
  { title: "The platform", body: "Builds the nodes, the gate, the host tier. Public. Releases are signed patch versions; a host installs a version, never a branch." },
  { title: "The platform's configuration", body: "What reconciles onto the cluster: policy, networking, storage, the tenant boundaries. Private, delivered as the signed artifact above, verified by the identity of the workflow that built it." },
  { title: "The workloads", body: "Belong to whoever wrote them, in their own repository, reconciled under a scoped identity that cannot touch a namespace it was not given. The platform never owns an app; an app never owns its namespace." },
];

export const members = {
  title: "For members: the verification chain end to end, and the tenant boundary",
  body: "Every pin and every checksum, and the bump bot that refuses an upstream release that would downgrade a component. The identity leak found in two renderers at once. The morning the provisioner's own release discipline was written — and the rebuild an unreleased build ran while the guard was twenty minutes from existing.",
};
