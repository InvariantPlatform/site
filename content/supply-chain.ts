import type { Row, Step } from "@/app/components/ui";

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

export const repos = { title: "Three repositories, two owners", sub: "The platform team owns the first two. Every application is a tenant in the third. The boundary is enforced by the cluster, not by a folder name." };

export const repoCards = [
  { title: "01 · The platform — builds the cluster", meta: "owner: the platform team · public", body: "The provisioner: it renders the nodes from a declaration, runs the gate between them, and stands up the host tier. Releases are signed patch versions; a host installs a version, never a branch." },
  { title: "02 · The platform's configuration — runs on the cluster", meta: "owner: the platform team · private", body: "What the reconciler applies: policy, networking, storage, and the tenant boundaries that fence the third repository in. Delivered only as the signed artifact above, verified by the identity of the workflow that built it." },
  { title: "03 · The workloads — live inside the boundary", meta: "owner: whoever wrote the application", body: "Every application is a tenant here, reconciled under a scoped identity that cannot touch a namespace it was not given. The platform never owns an app; an app never owns its namespace, and cannot reach another's." },
];

// The provisioner's own chain — the tool that builds the nodes is held to the
// rule it enforces. Every line here is something the installer or the binary
// checks; none is a policy.
export const release = {
  title: "How the provisioner reaches a host",
  sub: "the tool that builds the nodes, held to the rule it enforces",
  rows: [
    { k: "A version is a tag, and a tag is a version", v: "The binary is stamped with the tag it was built from. A build from anywhere else can preview what it would do; it refuses to act." },
    { k: "Only a published release builds", v: "A tag alone builds nothing; a push builds nothing. The workflow runs when a release is published, and it lints every script it ships before it signs anything." },
    { k: "Signed by the workflow's own identity, without a key", v: "There is no signing key to leak. The certificate names the repository, the workflow file and the tag; a bill of materials and provenance ride with the binary." },
    { k: "The installer verifies the identity, not the signature", v: "Checksum first. Then that the certificate names this repository's release workflow at this exact tag — not merely that some valid signature exists. Then, and only then, it is installed by version." },
    { k: "The binary carries everything it deploys", v: "Every script, unit and template a deploy puts on a host is embedded in the release at build time. A file the signed artifact does not contain cannot reach a host. Decided this week, after a script fix was found to have a path around the release." },
    { k: "Every release is installed, in order", v: "No version is skipped on a host. The install history has no holes, so the answer to \"what was running when\" is always a tag." },
  ] satisfies Row[],
};

export const pins = {
  title: "Pinned, all of it",
  sub: "a bump is a pull request the bot opens; a human merges it",
  cards: [
    { title: "Version and checksum move together", body: "Every upstream — node image, orchestrator, storage, the signing tool, each vendored manifest — is a version and a sha256 in one committed file. The bot re-downloads from the recorded URL and updates both in the same change, so provenance cannot drift from the bytes." },
    { title: "A downgrade is refused", body: "The bump bot compares versions before it proposes one. An upstream that retags, or a mirror that serves an older file, produces a refusal, not a pull request." },
    { title: "The bot is watched too", body: "Its own workflow is pinned by commit, and it posts where a human reads. A bump that lands is one a person compared against the upstream release notes — this week's was a security patch, merged the same evening." },
  ],
};

export const members = {
  title: "For members: the verification chain end to end, and the tenant boundary",
  body: "Every pin and every checksum, and the bump bot that refuses an upstream release that would downgrade a component. The identity leak found in two renderers at once. The morning the provisioner's own release discipline was written — and the rebuild an unreleased build ran while the guard was twenty minutes from existing.",
};
