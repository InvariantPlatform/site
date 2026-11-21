export const intro = {
  title: "Architecture",
  paragraphs: ["The whole estate is one model of every node, relationship and control, and the build checks the configuration against it. A component the model does not describe fails the build. A component in the model that is not built yet is fine: that is a decision taken and not yet implemented, which is what a model is for."],
  rule: "Architecture may lead reality. Reality may never lead architecture.",
};

export const contextView = {
  name: "Context view",
  meta: "simplified from the model · members see every view",
  caption: "Two paths in, and only two. A change arrives as a signed artifact or not at all; a visitor arrives through the edge or not at all.",
};

export const principles = [
  { title: "One model, five views", body: "Context, fleet, platform, supply chain and observability, each rendered from the same file, so a view cannot drift from the model it is a view of." },
  { title: "Controls live on the nodes they govern", body: "Each control names its mechanism, its scope, what verifies it, and the known gap. A control with no verifier is written as a gap, not as a control." },
  { title: "Written to be published", body: "The model is checked mechanically for addresses and internal names before it is rendered. A published architecture that maps a private network is a gift to the wrong reader." },
];

export const members = {
  title: "For members: the other four views, and the register",
  body: "The fleet view with its failure domains. The platform view. The supply-chain view that draws the deploy gate where it actually is. And the decision register: numbered decisions by category, each one a property that was asserted and, more often than not, did not hold the first time.",
};
