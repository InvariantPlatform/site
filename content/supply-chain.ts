import type { Step } from "@/app/components/ui";
import type { Claim } from "@/app/components/instrument";

export const intro = {
  title: "Supply chain",
  paragraphs: ["Nothing reaches the cluster except a signed artifact from one named workflow, and nothing reaches the hosts except a signed release, installed by version. A push to git deploys nothing; the artifact is the deploy gate. Every upstream component (the node image, the reconciler's operator, the storage layer, the signing tool) is pinned in a committed file, by checksum wherever upstream publishes a file, and a bot watches each one."],
  rule: "If a component can be changed by a path that is not signed, that path is the platform's real supply chain.",
};

export const shape = { title: "The flow", sub: "One direction. Each step can only consume what the previous one signed." };

export const flow: Step[] = [
  { title: "A reviewed change", body: "Signed commit, pinned versions, lint and tests as a gate. Pushing deploys nothing." },
  { title: "One named workflow builds it", body: "Built once and signed without a key, under the workflow's own identity, with a bill of materials and provenance attached." },
  { title: "A private registry holds it", body: "Immutable tags. Nothing is ever called latest." },
  { title: "The cluster pulls and verifies", body: "The reconciler checks the signature against the one identity it is pinned to, then applies and prunes. Removing that check would break nothing, so the nightly run asserts it.", gate: true },
  { title: "The provisioner is held to the same rule", body: "The tool that builds the nodes is itself a signed release, installed by version and verified on the host. A working-tree build can show what it would do; it cannot act.", gate: true },
];

export const repos = { title: "Three repositories, two owners", sub: "The platform team owns the first two. Every application is a tenant in the third. The boundary is enforced by the cluster, not by a folder name." };

export const repoCards = [
  { title: "The platform: builds the cluster", meta: "owner: the platform team · members can read it", body: "The provisioner: it renders the nodes from a declaration, runs the gate between them, and stands up the host tier. Releases are signed patch versions; a host installs a version, never a branch." },
  { title: "The platform's configuration: runs on the cluster", meta: "owner: the platform team · private", body: "What the reconciler applies: policy, networking, storage, and the tenant boundaries that fence the third repository in. Delivered only as the signed artifact above, verified by the identity of the workflow that built it." },
  { title: "The workloads: live inside the boundary", meta: "owner: whoever wrote the application", body: "Every application is a tenant here, reconciled under a scoped identity that cannot touch a namespace it was not given. The platform never owns an app; an app never owns its namespace, and cannot reach another's." },
];

// The provisioner's own chain: the tool that builds the nodes is held to the
// rule it enforces. Every line is something the installer or the binary checks.
export const release = {
  title: "How the provisioner reaches a host",
  sub: "the tool that builds the nodes, held to the rule it enforces",
  steps: [
    { k: "A version is a tag, and a tag is a version", v: "The binary is stamped with its tag. A build from anywhere else can preview what it would do, and refuses to act." },
    { k: "Only a published release builds", v: "A push builds nothing. Publishing a release runs the workflow, which lints every script it ships before it signs anything." },
    { k: "Signed by the workflow's own identity", v: "There is no key to leak. The certificate names the repository, the workflow file and the tag." },
    { k: "The installer verifies the identity", v: "Checksum first, then a certificate naming this repository's release workflow at this exact tag. Any other valid signature is refused." },
    { k: "The binary carries everything it deploys", v: "Every script, unit and template a deploy puts on a host is embedded at build time. A file the release does not contain cannot reach a host." },
    { k: "Every release is installed, in order", v: "No version is skipped, so \"what was running when\" always has a tag for an answer." },
  ] satisfies Claim[],
};

export const pins = {
  title: "Pinned, and watched",
  sub: "a bot proposes every bump · a person merges it · nothing merges itself",
  cards: [
    { title: "Version and checksum move together", body: "Where upstream publishes a file, its version and sha256 sit in one committed file, and the bot updates both in one change. A component assembled here has no file to hash, so its image tag is the version of record. The reconciler follows a 2.x range, kept current by its pinned operator." },
    { title: "A Kubernetes downgrade is refused", body: "The node-image bot compares versions before proposing one. An image carrying an older Kubernetes than the one running is refused, with the reason." },
    { title: "The bots are pinned too", body: "Their workflows pin every action by commit. A mechanical bump arrives as a pull request; one that needs reading arrives as an issue." },
  ],
};

export const members = {
  title: "For members: the verification chain end to end, and the tenant boundary",
  body: "Every pin and every checksum, and the bump bot that refuses an upstream release that would downgrade a component. The identity leak found in two renderers at once. The morning the provisioner's own release discipline was written, and the rebuild an unreleased build ran while the guard was twenty minutes from existing.",
};
