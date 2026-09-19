/** The same context view, laid out top-to-bottom for a phone. Same nodes, same six relationships; regenerate with ContextView when the model changes. */
export default function ContextViewPhone() {
  const box = (x: number, y: number, w: number, title: string, sub: string) => (
    <>
      <rect x={x} y={y} width={w} height="56" rx="8" fill="none" stroke="#374151" />
      <text x={x + w / 2} y={y + 23} textAnchor="middle">{title}</text>
      <text x={x + w / 2} y={y + 41} textAnchor="middle" fontSize="11" fill="#6b7280">{sub}</text>
    </>
  );
  return (
    <svg viewBox="0 0 360 640" width="100%" aria-label="Context view: how changes and visitors reach the estate" style={{ display: "block", height: "auto" }}>
      <defs>
        <marker id="arrow-p" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" /></marker>
      </defs>
      <g fontFamily="Geist, system-ui, sans-serif" fontSize="13" fill="#e8e8e8">
        {box(10, 10, 160, "Operator", "no standing write access")}
        {box(10, 110, 160, "Source repository", "reviewed change")}
        {box(10, 210, 160, "Registry", "signed artifact")}
        {box(190, 10, 160, "Visitor", "the public internet")}
        {box(190, 110, 160, "Edge", "the only path in")}

        <rect x="4" y="316" width="352" height="316" rx="10" fill="none" stroke="#d97706" strokeDasharray="6 6" />
        <text x="180" y="342" textAnchor="middle" fontWeight="600">The estate</text>
        <text x="180" y="360" textAnchor="middle" fontSize="11" fill="#6b7280">two hypervisors · one five-node cluster · a host tier beside it</text>

        {box(16, 376, 156, "Reconciler", "verifies, applies, prunes")}
        {box(188, 376, 156, "Ingress", "answers only the edge")}
        {box(16, 472, 156, "Cluster", "rebuilt, never repaired")}
        {box(188, 472, 156, "Host tier", "metrics, logs, the check")}
        <rect x="16" y="560" width="328" height="56" rx="8" fill="none" stroke="#374151" />
        <text x="180" y="583" textAnchor="middle">Recursive resolvers</text>
        <text x="180" y="601" textAnchor="middle" fontSize="11" fill="#6b7280">below the cluster; never in its own bootstrap path</text>
      </g>
      <g stroke="#f59e0b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow-p)">
        <line x1="90" y1="66" x2="90" y2="108" />
        <line x1="90" y1="166" x2="90" y2="208" />
        <line x1="90" y1="266" x2="94" y2="374" />
        <line x1="94" y1="432" x2="94" y2="470" />
        <line x1="270" y1="66" x2="270" y2="108" />
        <line x1="270" y1="166" x2="266" y2="374" />
      </g>
      <g fontFamily="Geist Mono, ui-monospace, monospace" fontSize="11" fill="#9ca3af">
        <text x="98" y="91">push</text>
        <text x="98" y="191">build + sign</text>
        <text x="100" y="300">pull + verify</text>
        <text x="102" y="455">apply</text>
        <text x="278" y="91">https</text>
        <text x="278" y="300">proxied only</text>
      </g>
    </svg>
  );
}
