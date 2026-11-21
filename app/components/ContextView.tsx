import ArchHover from "./ArchHover";

/** The public view of the architecture model, drawn from the design canvas. Regenerate from the model when it changes. */
const box = (id: string, x: number, y: number, w: number, h: number, title: string, sub: string) => (
  <g data-node={id} key={id}>
    <rect className="shape" x={x} y={y} width={w} height={h} rx="8" />
    <text x={x + w / 2} y={y + h / 2 - 6} textAnchor="middle">{title}</text>
    <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize="12" fill="#6b7280">{sub}</text>
  </g>
);

const line = (from: string, to: string, x1: number, y1: number, x2: number, y2: number, label?: string, lx?: number, ly?: number) => (
  <g data-from={from} data-to={to} key={`${from}-${to}`}>
    <line className="hit" x1={x1} y1={y1} x2={x2} y2={y2} />
    <line className="wire" x1={x1} y1={y1} x2={x2} y2={y2} markerEnd="url(#arrow)" />
    {label && <text x={lx} y={ly} textAnchor="middle">{label}</text>}
  </g>
);

export default function ContextView() {
  return (
    <ArchHover>
      <svg viewBox="0 0 1200 380" width="100%" aria-label="Context view: how changes and visitors reach the estate" style={{ display: "block", height: "auto" }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" /></marker>
        </defs>
        <g fontFamily="Geist, system-ui, sans-serif" fontSize="14" fill="#e8e8e8">
          <g className="estate">
            <rect x="800" y="20" width="380" height="340" rx="10" fill="none" stroke="#d97706" strokeDasharray="6 6" />
            <text x="990" y="48" textAnchor="middle" fontWeight="600">The estate</text>
            <text x="990" y="68" textAnchor="middle" fontSize="12" fill="#6b7280">two hypervisors · one five-node cluster · a host tier beside it</text>
          </g>
          {box("operator", 20, 40, 160, 64, "Operator", "no standing write access")}
          {box("source", 260, 40, 160, 64, "Source repository", "reviewed change")}
          {box("registry", 500, 40, 160, 64, "Registry", "signed artifact")}
          {box("reconciler", 830, 90, 150, 56, "Reconciler", "verifies, applies, prunes")}
          {box("cluster", 1000, 90, 150, 56, "Cluster", "rebuilt, never repaired")}
          {box("ingress", 830, 190, 150, 56, "Ingress", "answers only the edge")}
          {box("host", 1000, 190, 150, 56, "Host tier", "metrics, logs, the check")}
          {box("resolvers", 830, 280, 320, 56, "Recursive resolvers", "below the cluster, so the cluster is never in its own bootstrap path")}
          {box("visitor", 20, 190, 160, 64, "Visitor", "the public internet")}
          {box("edge", 260, 190, 160, 64, "Edge", "the only path in")}
        </g>
        <g className="wires" fontFamily="Geist Mono, ui-monospace, monospace" fontSize="11">
          {line("operator", "source", 180, 72, 258, 72, "push", 219, 62)}
          {line("source", "registry", 420, 72, 498, 72, "build + sign", 459, 62)}
          {line("registry", "reconciler", 660, 72, 828, 112, "pull + verify", 740, 82)}
          {line("reconciler", "cluster", 980, 118, 998, 118)}
          {line("visitor", "edge", 180, 222, 258, 222, "https", 219, 212)}
          {line("edge", "ingress", 420, 222, 828, 218, "proxied only", 620, 208)}
        </g>
      </svg>
    </ArchHover>
  );
}
