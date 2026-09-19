/** The public view of the architecture model, drawn from the design canvas. Regenerate from the model when it changes. */
export default function ContextView() {
  return (
<svg viewBox="0 0 1200 380" width="100%" aria-label="Context view: how changes and visitors reach the estate" style={{ display: "block", height: "auto" }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b"></path></marker>
        </defs>
        
        <g fontFamily="Geist, system-ui, sans-serif" fontSize="14" fill="#e8e8e8">
          <rect x="20" y="40" width="160" height="64" rx="8" fill="none" stroke="#374151"></rect>
          <text x="100" y="66" textAnchor="middle">Operator</text>
          <text x="100" y="86" textAnchor="middle" fontSize="12" fill="#6b7280">no standing write access</text>

          <rect x="260" y="40" width="160" height="64" rx="8" fill="none" stroke="#374151"></rect>
          <text x="340" y="66" textAnchor="middle">Source repository</text>
          <text x="340" y="86" textAnchor="middle" fontSize="12" fill="#6b7280">reviewed change</text>

          <rect x="500" y="40" width="160" height="64" rx="8" fill="none" stroke="#374151"></rect>
          <text x="580" y="66" textAnchor="middle">Registry</text>
          <text x="580" y="86" textAnchor="middle" fontSize="12" fill="#6b7280">signed artifact</text>

          <rect x="800" y="20" width="380" height="340" rx="10" fill="none" stroke="#d97706" strokeDasharray="6 6"></rect>
          <text x="990" y="48" textAnchor="middle" fontWeight="600">The estate</text>
          <text x="990" y="68" textAnchor="middle" fontSize="12" fill="#6b7280">two hypervisors · one five-node cluster · a host tier beside it</text>

          <rect x="830" y="90" width="150" height="56" rx="8" fill="none" stroke="#374151"></rect>
          <text x="905" y="112" textAnchor="middle">Reconciler</text>
          <text x="905" y="130" textAnchor="middle" fontSize="12" fill="#6b7280">verifies, applies, prunes</text>

          <rect x="1000" y="90" width="150" height="56" rx="8" fill="none" stroke="#374151"></rect>
          <text x="1075" y="112" textAnchor="middle">Cluster</text>
          <text x="1075" y="130" textAnchor="middle" fontSize="12" fill="#6b7280">rebuilt, never repaired</text>

          <rect x="830" y="190" width="150" height="56" rx="8" fill="none" stroke="#374151"></rect>
          <text x="905" y="212" textAnchor="middle">Ingress</text>
          <text x="905" y="230" textAnchor="middle" fontSize="12" fill="#6b7280">answers only the edge</text>

          <rect x="1000" y="190" width="150" height="56" rx="8" fill="none" stroke="#374151"></rect>
          <text x="1075" y="212" textAnchor="middle">Host tier</text>
          <text x="1075" y="230" textAnchor="middle" fontSize="12" fill="#6b7280">metrics, logs, the check</text>

          <rect x="830" y="280" width="320" height="56" rx="8" fill="none" stroke="#374151"></rect>
          <text x="990" y="302" textAnchor="middle">Recursive resolvers</text>
          <text x="990" y="320" textAnchor="middle" fontSize="12" fill="#6b7280">below the cluster, so the cluster is never in its own bootstrap path</text>

          
          <rect x="20" y="190" width="160" height="64" rx="8" fill="none" stroke="#374151"></rect>
          <text x="100" y="216" textAnchor="middle">Visitor</text>
          <text x="100" y="236" textAnchor="middle" fontSize="12" fill="#6b7280">the public internet</text>

          <rect x="260" y="190" width="160" height="64" rx="8" fill="none" stroke="#374151"></rect>
          <text x="340" y="216" textAnchor="middle">Edge</text>
          <text x="340" y="236" textAnchor="middle" fontSize="12" fill="#6b7280">the only path in</text>
        </g>
        <g stroke="#f59e0b" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)">
          <line x1="180" y1="72" x2="258" y2="72"></line>
          <line x1="420" y1="72" x2="498" y2="72"></line>
          <line x1="660" y1="72" x2="828" y2="112"></line>
          <line x1="980" y1="118" x2="998" y2="118"></line>
          <line x1="180" y1="222" x2="258" y2="222"></line>
          <line x1="420" y1="222" x2="828" y2="218"></line>
        </g>
        <g fontFamily="Geist Mono, ui-monospace, monospace" fontSize="11" fill="#9ca3af">
          <text x="219" y="62" textAnchor="middle">push</text>
          <text x="459" y="62" textAnchor="middle">build + sign</text>
          <text x="740" y="82" textAnchor="middle">pull + verify</text>
          <text x="219" y="212" textAnchor="middle">https</text>
          <text x="620" y="208" textAnchor="middle">proxied only</text>
        </g>
      </svg>
  );
}
