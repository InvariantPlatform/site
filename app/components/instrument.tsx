/**
 * Invariant's instrument visuals (2026-11-19). Server components, no client
 * JavaScript: modules, readouts, an LED register and the hero's signal trace.
 * Every number comes from site.config.ts (ADR-173); nothing here is a claim of
 * its own. Decorative SVG is aria-hidden; anything that carries meaning is text.
 */
import type { CSSProperties, ReactNode } from "react";

/** Role colours, in a fixed order so a colour means the same thing on every page. */
export const HUES = ["#f59e0b", "#22d3ee", "#a78bfa", "#fb7185", "#34d399", "#60a5fa",
  "#f472b6", "#facc15", "#2dd4bf", "#c084fc", "#fb923c", "#4ade80"] as const;

const accent = (c: string): CSSProperties => ({ ["--accent" as string]: c });

export function Module({ color = HUES[0], tag, className = "", children }: { color?: string; tag?: string; className?: string; children: ReactNode }) {
  return (
    <div className={`module ${className}`} style={accent(color)}>
      {tag && <span className="module-tag">{tag}</span>}
      {children}
    </div>
  );
}

/** `live` names a `data-status` slot the Worker fills from the last run; the page ships "–" there, never a number that can go stale. */
export function StatsBand({ stats }: { stats: { n: number | null; live?: string; label: string; sub: string }[] }) {
  const order = [0, 4, 1, 2, 3];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-8">
      {stats.map((s, i) => (
        <Module key={s.label} color={HUES[order[i % order.length]]} className={`px-5 py-5 ${i === stats.length - 1 && stats.length % 2 ? "col-span-2 md:col-span-1" : ""}`}>
          {s.live ? (
            <span className="readout block font-mono text-4xl md:text-[44px] font-semibold leading-none tabular-nums" data-status={s.live} dangerouslySetInnerHTML={{ __html: "–" }} />
          ) : (
            <span className="readout block font-mono text-4xl md:text-[44px] font-semibold leading-none tabular-nums">{s.n}</span>
          )}
          <span className="block mt-3 label text-foreground">{s.label}</span>
          <span className="block mt-1 text-[13px] text-muted">{s.sub}</span>
        </Module>
      ))}
    </div>
  );
}

/** The posture signal under the hero: flat, a spike per check, a pulse travelling along. Decorative. */
export function HeartbeatTrace() {
  const pts: string[] = [];
  const beat = [0, -4, 6, -24, 26, -8, 0];
  for (let x = 0; x <= 600; x += 20) {
    pts.push(`${x} 40`);
    if (x % 150 === 30) beat.forEach((dy, k) => pts.push(`${x + 6 + k * 5} ${40 + dy}`));
  }
  const d = `M ${pts.join(" L ")}`;
  const ticks = Array.from({ length: 61 }, (_, i) => `M ${i * 10} 62 L ${i * 10} ${i % 8 === 0 ? 54 : 58}`).join(" ");
  return (
    <svg viewBox="0 0 600 66" className="w-full max-w-[520px] h-auto block" aria-hidden="true">
      <defs>
        <filter id="hb-glow" filterUnits="userSpaceOnUse" x="-10" y="-10" width="620" height="90">
          <feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d={ticks} stroke="#8b939e" strokeOpacity=".35" />
      <path d={d} fill="none" stroke="#f59e0b" strokeWidth="1.8" filter="url(#hb-glow)" />
      <path d={d} fill="none" stroke="#fff7e0" strokeWidth="3" strokeLinecap="round" className="trace-pulse" />
    </svg>
  );
}

/** The register as an LED matrix: one square per decision, one colour per category. */
export function RegisterMatrix({ categories }: { categories: readonly { name: string; n: number }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {categories.map((c, i) => (
        <div key={c.name} className="grid grid-cols-[minmax(0,1fr)_36px] md:grid-cols-[260px_36px_minmax(0,1fr)] gap-x-3 gap-y-2 items-center" style={accent(HUES[i % HUES.length])}>
          <span className="text-[14px] text-foreground/90">{c.name}</span>
          <span className="font-mono text-xs text-muted tabular-nums text-right">{c.n}</span>
          <span className="col-span-2 md:col-span-1 flex flex-wrap gap-[5px]" aria-hidden="true">
            {Array.from({ length: c.n }, (_, j) => (
              <span key={j} className="led" style={{ animationDelay: `${(i * 0.05 + j * 0.012).toFixed(3)}s` }} />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

const ICONS: Record<string, ReactNode> = {
  "/architecture/": <><rect x="2" y="2" width="10" height="10" rx="1" /><rect x="16" y="2" width="10" height="10" rx="1" /><rect x="9" y="16" width="10" height="10" rx="1" /><path d="M7 12 L14 16 M21 12 L14 16" /></>,
  "/security-posture/": <><path d="M14 2 L25 6 V14 C25 20 20 25 14 27 C8 25 3 20 3 14 V6 Z" /><path d="M9 14 L13 18 L20 10" /></>,
  "/resiliency/": <><path d="M24 14 A10 10 0 1 1 20 6" /><path d="M20 1 V7 H26" /></>,
  "/observability/": <path d="M2 15 H8 L11 7 L16 23 L19 15 H26" />,
  "/supply-chain/": <><rect x="2" y="9" width="12" height="10" rx="5" /><rect x="14" y="9" width="12" height="10" rx="5" /><path d="M10 14 H18" /></>,
};
const ICON_HUE: Record<string, number> = { "/architecture/": 1, "/security-posture/": 3, "/resiliency/": 4, "/observability/": 2, "/supply-chain/": 0 };

export function SectionIcon({ href }: { href: string }) {
  if (!ICONS[href]) return null;
  return (
    <span className="icon-cell inline-flex items-center justify-center w-11 h-11" style={accent(HUES[ICON_HUE[href]])} aria-hidden="true">
      <svg viewBox="0 0 28 28" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICONS[href]}</svg>
    </span>
  );
}
export const sectionHue = (href: string) => HUES[ICON_HUE[href] ?? 0];
