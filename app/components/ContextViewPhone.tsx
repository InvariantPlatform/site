import ArchHover from "./ArchHover";

/** The same context view, laid out top-to-bottom for a phone. Same nodes, same six relationships; regenerate with ContextView when the model changes. */
const box = (id: string, x: number, y: number, w: number, title: string, sub: string) => (
  <g data-node={id} key={id}>
    <rect className="shape" x={x} y={y} width={w} height="56" rx="8" />
    <text x={x + w / 2} y={y + 23} textAnchor="middle">{title}</text>
    <text x={x + w / 2} y={y + 41} textAnchor="middle" fontSize="11" fill="#6b7280">{sub}</text>
  </g>
);

const line = (from: string, to: string, x1: number, y1: number, x2: number, y2: number, label: string, lx: number, ly: number) => (
  <g data-from={from} data-to={to} key={`${from}-${to}`}>
    <line className="hit" x1={x1} y1={y1} x2={x2} y2={y2} />
    <line className="wire" x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#arrow-p)" />
    <text x={lx} y={ly}>{label}</text>
  </g>
);

export default function ContextViewPhone() {
  return (
    <ArchHover>
      <svg viewBox="0 0 360 640" width="100%" aria-label="Context view: how changes and visitors reach the estate" style={{ display: "block", height: "auto" }}>
        <defs>
          <marker id="arrow-p" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" /></marker>
        </defs>
        <g fontFamily="Geist, system-ui, sans-serif" fontSize="13" fill="#e8e8e8">
          <g className="estate">
            <rect x="4" y="316" width="352" height="316" rx="10" fill="none" stroke="#d97706" strokeDasharray="6 6" />
            <text x="180" y="342" textAnchor="middle" fontWeight="600">The estate</text>
            <text x="180" y="360" textAnchor="middle" fontSize="11" fill="#6b7280">two hypervisors · one five-node cluster · a host tier beside it</text>
          </g>
          {box("operator", 10, 10, 160, "Operator", "no standing write access")}
          {box("source", 10, 110, 160, "Source repository", "reviewed change")}
          {box("registry", 10, 210, 160, "Registry", "signed artifact")}
          {box("visitor", 190, 10, 160, "Visitor", "the public internet")}
          {box("edge", 190, 110, 160, "Edge", "the only path in")}
          {box("reconciler", 16, 376, 156, "Reconciler", "verifies, applies, prunes")}
          {box("ingress", 188, 376, 156, "Ingress", "answers only the edge")}
          {box("cluster", 16, 472, 156, "Cluster", "rebuilt, never repaired")}
          {box("host", 188, 472, 156, "Host tier", "metrics, logs, the check")}
          <g data-node="resolvers">
            <rect className="shape" x="16" y="560" width="328" height="56" rx="8" />
            <text x="180" y="583" textAnchor="middle">Recursive resolvers</text>
            <text x="180" y="601" textAnchor="middle" fontSize="11" fill="#6b7280">below the cluster; never in its own bootstrap path</text>
          </g>
        </g>
        <g className="wires" fontFamily="Geist Mono, ui-monospace, monospace" fontSize="11">
          {line("operator", "source", 90, 66, 90, 108, "push", 98, 91)}
          {line("source", "registry", 90, 166, 90, 208, "build + sign", 98, 191)}
          {line("registry", "reconciler", 90, 266, 94, 374, "pull + verify", 100, 300)}
          {line("reconciler", "cluster", 94, 432, 94, 470, "apply", 102, 455)}
          {line("visitor", "edge", 270, 66, 270, 108, "https", 278, 91)}
          {line("edge", "ingress", 270, 166, 266, 374, "proxied only", 278, 300)}
        </g>
      </svg>
    </ArchHover>
  );
}
