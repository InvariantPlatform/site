export const intro = {
  title: "Join the organization",
  paragraphs: [
    "Membership is free, and it includes the source: read access to the platform's code in the InvariantPlatform organization on GitHub. That is the provisioner that builds, rolls and rebuilds the cluster, and every check it runs each night.",
    "With it come the members pages here: a field note from a real incident every Thursday, the decision register, released a few decisions each week, and the architecture views.",
  ],
};

export const terms = [
  { title: "What you give", body: "A GitHub account to invite, and an email address. Nothing else is asked for and nothing is inferred." },
  { title: "What the email is for", body: "Occasional notes about the platform: a rebuild, a finding, a decision worth reading. Every message has an unsubscribe that works the first time." },
  { title: "What you get", body: "Membership in the organization. It opens the platform's source on GitHub, to read, clone and fork, and contributions arrive as pull requests from your fork. It also opens the members pages here, and the live dashboards when they open. No cost, no seat count, no card. Leave the organization and all of it closes again; that is the only mechanism." },
  { title: "Why an organization, not a login", body: "Membership is a fact GitHub keeps, not a database this site runs. Nothing here stores a password, and the check that gates a route fails closed." },
];

export const notOpen = "This is a preview of the site. Joining is not open yet: the invitation, the email list, the source and the members pages arrive together. Nothing on this page collects anything.";
export const steps = "Three steps: sign in with GitHub, confirm your email, accept the invitation. The invitation is sent by the platform, not by a person, the moment you confirm.";
export const consent = "Send me the occasional email about Invariant Platform. I can unsubscribe at any time.";
export const after = "The confirmation email comes from Buttondown, the list's provider. Once you click it, accept the organization invitation on GitHub, and the source and the members pages open.";

// Who runs it. The one place on this site that points at the author's own
// site by name in body text; the footer carries it everywhere else.
export const author = {
  label: "Who runs this",
  body: "Invariant Platform is built and run by Brad Penney, a Kubernetes platform lead who writes for engineers who need something working, not just studied. The platform is the thing behind the writing: everything at bradpenney.io that says \"in production\" was tried here first.",
  cta: "Read the writing at bradpenney.io →",
};
