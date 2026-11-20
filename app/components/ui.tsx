import Link from "next/link";
import { HUES, Module, SectionIcon } from "./instrument";
import { site } from "@/site.config";

export const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

export const Wrap = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`max-w-7xl mx-auto px-6 w-full min-w-0 ${className}`}>{children}</div>
);

export const Band = ({ children }: { children: React.ReactNode }) => (
  <section className="py-8"><Wrap>{children}</Wrap></section>
);

/** Page opener: mono H1, lede paragraphs, optional one-line rule. */
export function Intro({ title, paragraphs, rule }: { title: string; paragraphs: string[]; rule?: string }) {
  return (
    <section className="pt-14 md:pt-20 pb-4">
      <Wrap>
        <h1 className="font-mono text-[30px] md:text-[38px] font-medium leading-[1.15] tracking-[-0.02em]">{title}</h1>
        {paragraphs.map((p) => (
          <p key={p.slice(0, 32)} className="mt-5 text-[17px] leading-relaxed text-muted max-w-[46em]">{p}</p>
        ))}
        {rule && <p className="mt-5 font-mono text-[15px] leading-relaxed text-foreground max-w-[46em]">{rule}</p>}
      </Wrap>
    </section>
  );
}

export function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hair pb-3.5 mb-5">
      <h2 className="label text-muted font-medium">{title}</h2>
      <span className="font-mono text-xs text-dim">{sub}</span>
    </div>
  );
}

export type CardData = { title: string; body: string; meta?: string; href?: string };

/** A ruled block. Square. The instrument's unit of layout — never a card. */
export function Card({ title, body, meta, href }: CardData) {
  const cls = `ruled ${href ? "ruled-link" : ""}`;
  const inner = (
    <>
      <span className="block text-[17px] font-semibold mb-2">{title}</span>
      <span className="block text-sm leading-relaxed text-muted">{body}</span>
      {meta && <span className="block font-mono text-xs text-dim pt-3">{meta}</span>}
    </>
  );
  return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

export function CardGrid({ cards, cols = 3 }: { cards: CardData[]; cols?: 2 | 3 }) {
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)] gap-4 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {cards.map((c) => <Card key={c.title} {...c} />)}
    </div>
  );
}

/** The "for members" block that closes every section page. */
export function MembersStrip({ title, body }: { title: string; body: string }) {
  return (
    <Band>
      <div className="border border-hair-2 p-6 md:p-9 grid grid-cols-[minmax(0,1fr)] md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
        <div>
          <span className="label text-dim block mb-3">Members</span>
          <h2 className="font-mono text-[22px] font-medium tracking-[-0.01em]">{title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted max-w-[46em]">{body}</p>
        </div>
        <JoinCta />
      </div>
    </Band>
  );
}

export function JoinCta() {
  return (
    <div className="flex flex-col items-start gap-2.5">
      <Link href="/join/" className="btn btn-solid"><GitHubIcon /> Join with GitHub</Link>
      <span className="font-mono text-xs text-dim">
        {site.joinOpen ? "Free. The source, the field notes and the register." : "Free, when it opens. The source, the field notes and the register."}
      </span>
    </div>
  );
}

/** One row of a list of properties: what is asserted, and what that means. */
export type Row = { k: string; v: string; failed?: boolean };
export function RowList({ name, rows }: { name: string; rows: Row[] }) {
  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between border-b border-hair-2 pb-2">
        <span className="label text-muted font-medium">{name}</span>
        <span className="font-mono text-xs text-dim">{rows.length}</span>
      </div>
      {rows.map((r) => (
        <div key={r.k} className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[2fr_3fr] gap-1.5 md:gap-6 py-3.5 border-b border-hair">
          <span className="text-[15px]">
            {r.failed && <span className="font-mono text-[11px] text-background bg-amber px-1 mr-2 align-middle font-medium">FAIL</span>}
            {r.k}
          </span>
          <span className="text-sm leading-relaxed text-muted">{r.v}</span>
        </div>
      ))}
    </div>
  );
}

/** Left-to-right flow of steps; gated steps carry the amber rule. Stacks on narrow screens. */
export type Step = { title: string; body: string; gate?: boolean; planned?: boolean };
export function Flow({ steps }: { steps: Step[] }) {
  const hue = [5, 2, 0, 4, 1, 3];
  return (
    <ol className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-5 gap-9 lg:gap-0 pt-6">
      {steps.map((s, i) => (
        <li key={s.title} className={`relative ${i > 0 ? "lg:ml-9" : ""}`}>
          {i > 0 && (
            <span aria-hidden="true" className="absolute font-mono text-amber left-1/2 -top-[30px] -translate-x-1/2 lg:left-[-30px] lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 [text-shadow:0_0_10px_#f59e0b]">
              <span className="lg:hidden">↓</span><span className="hidden lg:inline">→</span>
            </span>
          )}
          <Module color={HUES[hue[i % hue.length]]} tag={`stage ${i + 1}${s.planned ? " · not built" : ""}${s.gate ? " · gate" : ""}`} className={`p-4 h-full ${s.planned ? "border-dashed" : ""}`}>
            <span className="block text-[15px] font-semibold">{s.title}</span>
            <span className="block mt-1.5 text-xs leading-snug text-muted">{s.body}</span>
          </Module>
        </li>
      ))}
    </ol>
  );
}

export function Scorecard({ cells }: { cells: { n: number | string; label: string }[] }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cells.map((c) => (
        <div key={c.label} className="border border-hair px-5 py-4">
          <div className="font-mono text-3xl font-medium leading-none">{c.n}</div>
          <div className="mt-2 text-[13px] leading-snug text-muted">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

/** The home page's section index: a numbered, ruled table — not cards. */
export function SectionIndex({ sections }: { sections: CardData[] }) {
  const cols = "grid grid-cols-[minmax(0,1fr)] md:grid-cols-[56px_200px_minmax(0,1fr)_280px] gap-2 md:gap-6 items-start px-3 py-5 border-t border-hair";
  return (
    <div className="border-b border-hair">
      {sections.map((s) => {
        const [pub, mem] = (s.meta ?? "").split(" Members: ");
        return (
          <Link key={s.title} href={s.href ?? "#"} className={`${cols} text-foreground hover:bg-deep transition-colors`}>
            <span className="flex md:flex-col items-center md:items-start gap-3"><SectionIcon href={s.href ?? ""} /></span>
            <span className="text-lg font-semibold tracking-[-0.01em]">{s.title}</span>
            <span className="text-sm leading-relaxed text-muted">{s.body}</span>
            <span className="font-mono text-xs leading-relaxed text-dim">
              <span className="text-muted">public</span>&nbsp;&nbsp;{pub?.replace(/^Public: /, "").replace(/\.$/, "")}<br />
              <span className="text-muted">members</span> {mem?.replace(/\.$/, "")}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** The decision register's shape: numbered categories with a count each. Two ruled columns; no titles — those are for members. */
export function Register({ categories }: { categories: readonly { name: string; n: number }[] }) {
  const total = categories.reduce((a, c) => a + c.n, 0);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 md:gap-x-12 border-t border-hair">
      {categories.map((c) => (
        <div key={c.name} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-baseline py-3 border-b border-hair">
          <span className="text-[15px]">{c.name}</span>
          <span className="font-mono text-sm text-muted tabular-nums">{c.n}</span>
        </div>
      ))}
      <div className="md:col-span-2 flex justify-between items-baseline py-3 font-mono text-xs text-dim">
        <span>a decision is a numbered property; a superseded one stays, marked</span>
        <span className="text-muted tabular-nums">{total}</span>
      </div>
    </div>
  );
}
