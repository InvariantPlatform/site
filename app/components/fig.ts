// The house figure kit, ported from the members site's figures.py so both
// sites draw with one visual language: lit cards with corner brackets, glowing
// traces with a travelling pulse, measured zones, and status marks that are
// readable without colour (a failed path is dashed AND crossed, never only red).
// Figures are built as strings at build time and inlined; no client script.

const SANS = 0.56;
const MONO = 0.61;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function wrap(text: string, widthPx: number, size: number, mono = false): string[] {
  const per = Math.max(1, Math.floor(widthPx / (size * (mono ? MONO : SANS))));
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && line.length + 1 + word.length > per) {
      out.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) out.push(line);
  return out;
}

// Role colours: a box's colour says what it IS, across every figure.
export const KINDS = {
  neutral: "#60a5fa", // a client, a tool, a step
  net: "#22d3ee", // the edge, the network
  auth: "#a78bfa", // identity, sign-in, credentials
  core: "#f59e0b", // the platform's own
  ok: "#34d399", // the path that works
  bad: "#fb7185", // the path that fails
  dim: "#94a3b8", // context
} as const;
export type Kind = keyof typeof KINDS;

const STYLE = (id: string) => `
#${id} text { font-family: "Geist", "Inter", "Segoe UI", system-ui, sans-serif; font-size: 13px; fill: #e6e8eb; }
#${id} .t-strong { font-family: "Geist Mono", ui-monospace, monospace; font-size: 14.5px; font-weight: 600; fill: #f8fafc; }
#${id} .t-sub { font-size: 12.5px; fill: #a3acb8; }
#${id} .t-edge { font-family: "Geist Mono", ui-monospace, monospace; font-size: 11.5px; fill: #c7cdd6; }
#${id} .t-num { font-family: "Geist Mono", ui-monospace, monospace; font-size: 12px; fill: #fbbf24; }
#${id} .t-mono { font-family: "Geist Mono", ui-monospace, monospace; font-size: 12.5px; fill: #dbe2ea; }
#${id} .t-tag { font-family: "Geist Mono", ui-monospace, monospace; font-size: 10.5px; letter-spacing: .18em; fill: #9aa4b2; }
#${id} .pulse { fill: none; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 14 1200; stroke-dashoffset: 14;
  animation: ${id}-pulse 2.8s cubic-bezier(.5, 0, .5, 1) infinite; filter: drop-shadow(0 0 4px #fff); }
@keyframes ${id}-pulse { 0% { stroke-dashoffset: 14; stroke-opacity: 0; } 10% { stroke-opacity: 1; }
  85% { stroke-opacity: 1; } 100% { stroke-dashoffset: -700; stroke-opacity: 0; } }
@media (prefers-reduced-motion: reduce) { #${id} .pulse { animation: none; display: none; } }`;

export class Svg {
  parts: string[] = [];
  under: string[] = [];
  constructor(public id: string, public w: number, public h: number, public title: string, public desc: string) {}

  u(name: string) {
    return `url(#${this.id}-${name})`;
  }

  text(x: number, y: number, s: string, cls = "t", anchor = "middle", size?: number) {
    const sz = size ? ` font-size="${size}"` : "";
    this.parts.push(`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" class="${cls}" text-anchor="${anchor}"${sz}>${esc(s)}</text>`);
  }

  lines(x: number, y: number, ls: string[], cls = "t", anchor = "middle", lh = 17) {
    ls.forEach((s, i) => this.text(x, y + i * lh, s, cls, anchor));
    return y + ls.length * lh;
  }

  card(x: number, y: number, w: number, h: number, kind: Kind = "neutral", dashed = false, tag = "") {
    const a = KINDS[kind];
    const dash = dashed ? ' stroke-dasharray="5 4"' : "";
    this.parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#0c1015"/>`);
    this.parts.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${this.u("tint-" + kind)}" stroke="${a}" stroke-opacity="${dashed ? 0.75 : 0.28}" stroke-width="1"${dash}/>`,
    );
    this.parts.push(`<rect x="${x}" y="${y + 8}" width="2.5" height="${h - 16}" fill="${a}" filter="${this.u("glow")}"/>`);
    const b = 9;
    for (const [cx, cy, dx, dy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
      this.parts.push(`<path d="M ${cx + dx * b} ${cy} L ${cx} ${cy} L ${cx} ${cy + dy * b}" fill="none" stroke="${a}" stroke-width="1.6"/>`);
    }
    if (tag) this.parts.push(`<text x="${x + 12}" y="${y - 6}" class="t-tag" text-anchor="start" fill="${a}">${esc(tag)}</text>`);
  }

  box(x: number, y: number, w: number, h: number, title: string, sub = "", kind: Kind = "neutral", tag = "") {
    this.card(x, y, w, h, kind, kind === "bad", tag);
    const subLines = sub ? wrap(sub, w - 22, 12.5) : [];
    const titleLines = wrap(title, w - 22, 14.5, true);
    const block = titleLines.length * 18 + subLines.length * 16;
    let top = y + (h - block) / 2 + 14;
    titleLines.forEach((t) => {
      this.text(x + w / 2, top, t, "t-strong");
      top += 18;
    });
    this.lines(x + w / 2, top + 2, subLines, "t-sub", "middle", 16);
  }

  zone(x: number, y: number, w: number, h: number, kind: Kind = "dim", label = "") {
    const a = KINDS[kind];
    this.under.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0b0f14" fill-opacity=".7" stroke="${a}" stroke-opacity=".22"/>`);
    let ticks = "";
    for (let i = 0; i <= w; i += 8) ticks += `M ${x + i} ${y} L ${x + i} ${y + (i % 40 === 0 ? 6 : 3)} `;
    this.under.push(`<path d="${ticks}" stroke="${a}" stroke-opacity=".45" stroke-width="1"/>`);
    if (label) this.text(x + 14, y + 22, label, "t-tag", "start");
  }

  arrow(pts: [number, number][], kind: Kind = "core", label = "", dy = -8, flow?: boolean) {
    const a = KINDS[kind];
    const d = "M " + pts.map(([x, y]) => `${x} ${y}`).join(" L ");
    const dashed = kind === "bad" || kind === "dim";
    this.parts.push(`<path d="${d}" fill="none" stroke="${a}" stroke-opacity="${dashed ? 0.18 : 0.5}" stroke-width="${dashed ? 3 : 5}" filter="${this.u("glow")}"/>`);
    this.parts.push(`<path d="${d}" fill="none" stroke="${a}" stroke-width="1.6"${dashed ? ' stroke-dasharray="4 5"' : ""} marker-end="url(#${this.id}-head-${kind})"/>`);
    if (flow ?? !dashed) this.parts.push(`<path d="${d}" class="pulse" stroke="${a}"/>`);
    if (label) {
      const m = Math.floor(pts.length / 2);
      const [x1, y1] = pts.length > 2 ? pts[m - 1] : pts[0];
      const [x2, y2] = pts.length > 2 ? pts[m] : pts[pts.length - 1];
      this.text((x1 + x2) / 2, (y1 + y2) / 2 + dy, label, "t-edge");
    }
  }

  mark(x: number, y: number, ok: boolean) {
    const a = KINDS[ok ? "ok" : "bad"];
    this.parts.push(`<rect x="${x - 10}" y="${y - 10}" width="20" height="20" rx="2" fill="#0b0d10" stroke="${a}" stroke-width="1.4" filter="${this.u("glow")}"/>`);
    const g = ok
      ? `M ${x - 5} ${y} L ${x - 1.5} ${y + 3.8} L ${x + 5.2} ${y - 4}`
      : `M ${x - 4} ${y - 4} L ${x + 4} ${y + 4} M ${x + 4} ${y - 4} L ${x - 4} ${y + 4}`;
    this.parts.push(`<path d="${g}" fill="none" stroke="${a}" stroke-width="2.2" stroke-linecap="square"/>`);
  }

  private defs() {
    const i = this.id;
    const out = [
      `<filter id="${i}-glow" filterUnits="userSpaceOnUse" x="-20" y="-20" width="${this.w + 40}" height="${this.h + 40}"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
      `<pattern id="${i}-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0 L0 0 0 24" fill="none" stroke="#8b939e" stroke-opacity=".07"/></pattern>`,
    ];
    for (const [k, a] of Object.entries(KINDS)) {
      out.push(
        `<linearGradient id="${i}-tint-${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${a}" stop-opacity=".10"/><stop offset=".6" stop-color="${a}" stop-opacity=".02"/></linearGradient>` +
          `<marker id="${i}-head-${k}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9 z" fill="${a}"/></marker>`,
      );
    }
    return out.join("");
  }

  svg() {
    return (
      `<svg id="${this.id}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-labelledby="${this.id}-title ${this.id}-desc" class="diagram">` +
      `<title id="${this.id}-title">${esc(this.title)}</title><desc id="${this.id}-desc">${esc(this.desc)}</desc>` +
      `<defs><style>${STYLE(this.id)}</style>${this.defs()}</defs>` +
      `<rect width="${this.w}" height="${this.h}" fill="${this.u("grid")}"/>${this.under.join("")}${this.parts.join("")}</svg>`
    );
  }
}
