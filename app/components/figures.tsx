// Figures for the public pages, drawn with the house kit (fig.ts). Every label
// here is a fact the page already states; nothing names a machine or address.

import { Svg } from "./fig";

function Figure({ s, caption }: { s: Svg; caption: string }) {
  return (
    <figure className="fig">
      <div className="fig-scroll" dangerouslySetInnerHTML={{ __html: s.svg() }} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function PostureVantage() {
  const s = new Svg("pf-vantage", 900, 440, "Where the nightly check looks from",
    "The check runs on each hypervisor, outside the cluster. It reads the cluster with a read-only identity, the other hypervisor, and the public site through a public resolver. Every run is published; any finding pages a phone.");
  s.text(150, 12, "WHAT IT READS", "t-tag");
  ([[20, "The cluster", "a read-only identity: policies, admins, the reconciler, secrets, volumes, backups", "core"],
    [160, "The other hypervisor", "SELinux, failed services, the updater", "neutral"],
    [300, "The public site", "a public resolver's answer, through the edge; a direct hit must be refused", "net"]] as const)
    .forEach(([y, t, sub, k]) => s.box(20, y, 260, 120, t, sub, k));
  s.box(350, 130, 220, 180, "The check", "a timer on each hypervisor, outside the cluster", "core", "ON EACH HYPERVISOR");
  for (const y of [80, 220, 360]) s.arrow([[280, y], [315, y], [315, 220], [350, 220]], "core");
  s.text(760, 12, "WHAT IT SAYS", "t-tag");
  s.box(640, 40, 240, 130, "This site's status strip", "every run, held or not", "ok");
  s.box(640, 270, 240, 130, "A phone", "any finding fails the run, and a failed run pages", "bad");
  s.arrow([[570, 190], [605, 190], [605, 105], [640, 105]], "ok", "publish", -6);
  s.arrow([[570, 250], [605, 250], [605, 335], [640, 335]], "bad", "page", -8, true);
  return <Figure s={s} caption="A check inside the cluster cannot report that the cluster is gone, so it runs on the hosts." />;
}

export function PostureAnswers() {
  const s = new Svg("pf-answers", 900, 330, "The three answers a check can give",
    "Holds: counted as held. Fails: a finding, and the run pages. Could not look: printed as not checked and left out of the count. An unreadable configuration is a failure.");
  s.box(20, 110, 200, 110, "A check runs", "against what it read this morning", "neutral");
  ([[20, "It holds", "counted as held", "ok"],
    [125, "It fails", "a finding; the run fails and pages", "bad"],
    [230, "It could not look", "printed as not checked; left out of the count", "dim"]] as const)
    .forEach(([y, t, sub, k]) => {
      s.box(330, y, 300, 85, t, sub, k);
      s.arrow([[220, 165], [275, 165], [275, y + 42], [330, y + 42]], k);
    });
  s.mark(655, 62, true);
  s.mark(655, 167, false);
  s.box(685, 20, 195, 295, "Unreadable config", "is a failure, never 'not checked'. Seeing less must never raise the count.", "bad");
  return <Figure s={s} caption="The number on the strip is what was asserted that morning." />;
}

export function FailureDomains() {
  const s = new Svg("pf-domains", 900, 360, "What each hypervisor takes with it",
    "Hypervisor-1 carries three of five nodes and three of five state-store members. Losing hypervisor-2 leaves a majority; losing hypervisor-1 means a rebuild from the declaration and the last backup.");
  s.zone(10, 20, 470, 150, "core", "HYPERVISOR-1 · THE INVARIANT");
  s.zone(500, 20, 390, 150, "neutral", "HYPERVISOR-2");
  for (let i = 0; i < 3; i++) s.box(30 + i * 148, 60, 132, 90, `node ${i + 1}`, "state-store member", "core");
  for (let i = 0; i < 2; i++) s.box(520 + i * 182, 60, 166, 90, `node ${i + 4}`, "state-store member", "neutral");
  s.box(10, 210, 430, 130, "Lose hypervisor-2", "3 of 5 members remain. Quorum holds, and the cluster keeps running on three nodes.", "ok");
  s.box(460, 210, 430, 130, "Lose hypervisor-1", "2 of 5 remain: no quorum. Rebuilt from the declaration and the last backup. Decided, written down, rehearsed.", "bad");
  s.mark(418, 230, true);
  s.mark(868, 230, false);
  return <Figure s={s} caption="With two machines, one must hold the majority. Which one is a decision, written down." />;
}

export function RollOrder() {
  const s = new Svg("pf-roll", 900, 250, "A roll: five nodes, one at a time, a gate between each",
    "Each node is drained, destroyed and rebuilt from the declaration; the next is not touched until the gate passes.");
  s.zone(10, 30, 520, 200, "core", "HYPERVISOR-1");
  s.zone(550, 30, 340, 200, "neutral", "HYPERVISOR-2");
  const xs = [30, 200, 370, 570, 740];
  xs.forEach((x, i) => {
    s.box(x, 80, 130, 100, `node ${i + 1}`, "drained, destroyed, rebuilt", i < 3 ? "core" : "neutral");
    s.text(x + 65, 205, `${i + 1} of 5`, "t-num");
  });
  for (let i = 0; i < xs.length - 1; i++) s.arrow([[xs[i] + 130, 130], [xs[i + 1], 130]], "ok", "gate", -10);
  return <Figure s={s} caption="If the gate fails after a node, the roll stops there. The operator watches; the gate decides." />;
}

export function AlertPath() {
  const s = new Svg("pf-alert", 900, 380, "How a failure becomes a notification",
    "Collection runs inside the cluster; the stores, the alert rules and the notifier run on the hypervisor, so an alert still leaves when the cluster is gone.");
  s.zone(10, 30, 400, 330, "core", "INSIDE THE CLUSTER");
  s.zone(450, 30, 300, 330, "neutral", "ON THE HYPERVISOR, OUTSIDE IT");
  s.box(30, 70, 170, 110, "Exporters", "object state, node metrics, request metrics at the proxy", "core");
  s.box(230, 70, 160, 110, "Metrics agent", "scrapes, ships out", "core");
  s.box(230, 230, 160, 100, "Log shipper", "ships logs out", "core");
  s.arrow([[200, 125], [230, 125]], "core");
  s.box(470, 70, 260, 90, "Metrics store", "", "neutral");
  s.box(470, 240, 260, 90, "Log store", "", "neutral");
  s.arrow([[390, 125], [470, 115]], "core", "out", -6);
  s.arrow([[390, 280], [470, 285]], "core", "out", -6);
  s.box(470, 175, 260, 50, "Alert rules", "", "auth");
  s.box(780, 140, 110, 120, "Phone", "", "bad");
  s.arrow([[730, 200], [780, 200]], "bad", "page", -8, true);
  return <Figure s={s} caption="Nothing after collection depends on the cluster being up." />;
}

export function SignedPaths() {
  const s = new Svg("pf-paths", 900, 400, "Two signed paths, each ending in an identity check",
    "The configuration and the provisioner each reach their consumer only as a signed artifact, and the consumer checks who signed it.");
  const lanes = [
    [30, "THE CONFIGURATION", "core", [["A push", "a reviewed change"], ["One workflow", "secret scan, build, sign"], ["Private registry", "the signed artifact"], ["The cluster", "applies it only if that workflow signed it"]]],
    [220, "THE PROVISIONER", "neutral", [["A release", "published, by tag"], ["Release workflow", "lint, build, sign"], ["The release", "binary, checksum, signature"], ["The installer", "checksum, then the signer's identity"]]],
  ] as const;
  for (const [y, name, k, steps] of lanes) {
    s.zone(10, y - 18, 880, 170, k, name);
    steps.forEach(([t, sub], i) => {
      const x = 24 + i * 218;
      const last = i === steps.length - 1;
      s.box(x, y + 18, 196, 110, t, sub, last ? "ok" : k);
      if (!last) s.arrow([[x + 196, y + 73], [x + 218, y + 73]], k);
    });
    s.mark(24 + 3 * 218 + 184, y + 30, true);
  }
  return <Figure s={s} caption="A valid signature from anyone else is refused. Identity, not validity, is the control." />;
}

export function JoinSteps() {
  const s = new Svg("pf-join", 900, 230, "Joining, in three steps",
    "Sign in with GitHub and give an email address; confirm it from the email, on any device; accept the organization invitation GitHub sends. The source and the members pages open.");
  const steps = [["Sign in with GitHub", "and give an email address", "auth"], ["Confirm the email", "the link works on any device", "neutral"], ["Accept the invitation", "GitHub emails it within a minute", "core"], ["Open", "the source and the members pages", "ok"]] as const;
  steps.forEach(([t, sub, k], i) => {
    const x = 20 + i * 220;
    s.box(x, 40, 200, 120, t, sub, k);
    if (i < 3) s.text(x + 100, 190, `step ${i + 1}`, "t-num");
    if (i < steps.length - 1) s.arrow([[x + 200, 100], [x + 220, 100]], "core");
  });
  return <Figure s={s} caption="Leave the organization, or unsubscribe, and all of it closes again." />;
}
