import Link from "next/link";
import { site } from "@/site.config";

export const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

export const Wrap = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`max-w-7xl mx-auto px-4 w-full min-w-0 ${className}`}>{children}</div>
);

export const Band = ({ children }: { children: React.ReactNode }) => (
  <section className="py-8"><Wrap>{children}</Wrap></section>
);

/** Page opener: H1, lede paragraphs, optional one-line rule in a heavier weight. */
export function Intro({ title, paragraphs, rule }: { title: string; paragraphs: string[]; rule?: string }) {
  return (
    <section className="pt-12 md:pt-16 pb-4">
      <Wrap>
        <h1 className="text-[32px] md:text-[40px] font-bold leading-[1.1] tracking-[-0.02em]">{title}</h1>
        {paragraphs.map((p) => (
          <p key={p.slice(0, 32)} className="mt-4 text-[17px] leading-relaxed text-gray-400 max-w-[46em]">{p}</p>
        ))}
        {rule && <p className="mt-4 text-[17px] leading-relaxed text-gray-300 font-medium max-w-[46em]">{rule}</p>}
      </Wrap>
    </section>
  );
}

export function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 mb-4 text-sm text-gray-400 max-w-[48em]">{sub}</p>
    </>
  );
}

export type CardData = { title: string; body: string; meta?: string; href?: string };

export function Card({ title, body, meta, href, plain }: CardData & { plain?: boolean }) {
  const cls = `card ${plain ? "card-plain" : ""} ${href ? "card-link" : ""}`;
  const inner = (
    <>
      <span className="block text-[17px] font-semibold mb-2">{title}</span>
      <span className="block text-sm leading-relaxed text-gray-400">{body}</span>
      {meta && <span className="block text-[13px] text-gray-500 pt-3">{meta}</span>}
    </>
  );
  return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

export function CardGrid({ cards, cols = 3, plain = true }: { cards: CardData[]; cols?: 2 | 3; plain?: boolean }) {
  return (
    <div className={`grid grid-cols-[minmax(0,1fr)] gap-4 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {cards.map((c) => <Card key={c.title} {...c} plain={plain} />)}
    </div>
  );
}

/** The "for members" strip that closes every section page. */
export function MembersStrip({ title, body }: { title: string; body: string }) {
  return (
    <Band>
      <div className="rounded-lg border border-hair p-5 md:p-8 grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.01em]">{title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-400">{body}</p>
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
      <span className="text-[13px] text-gray-500">
        {site.joinOpen ? "Free. An organization invitation and your email." : "Free, when it opens. An organization invitation and your email."}
      </span>
    </div>
  );
}

/** One row of a list of properties: what is asserted, and what that means. */
export type Row = { k: string; v: string; failed?: boolean };
export function RowList({ name, rows }: { name: string; rows: Row[] }) {
  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between border-b border-hair pb-2">
        <span className="text-[15px] font-semibold">{name}</span>
        <span className="font-mono text-[13px] text-gray-500">{rows.length}</span>
      </div>
      {rows.map((r) => (
        <div key={r.k} className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[2fr_3fr] gap-1.5 md:gap-6 py-3.5 border-b border-hair">
          <span className="text-[15px]">
            {r.failed && <span className="font-mono text-[11px] text-white bg-amber-dark px-1 mr-2 align-middle">FAIL</span>}
            {r.k}
          </span>
          <span className="text-sm leading-relaxed text-gray-400">{r.v}</span>
        </div>
      ))}
    </div>
  );
}

/** Left-to-right flow of steps; gated steps carry the amber border. Stacks on narrow screens. */
export type Step = { title: string; body: string; gate?: boolean };
export function Flow({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-5 gap-3 lg:gap-0">
      {steps.map((s, i) => (
        <li key={s.title} className={`relative rounded-lg border p-4 ${s.gate ? "border-amber-dark" : "border-hair-2"} ${i > 0 ? "lg:ml-7 mt-2 lg:mt-0" : ""}`}>
          {i > 0 && (
            <span aria-hidden="true" className="absolute text-amber left-1/2 -top-[18px] -translate-x-1/2 lg:left-[-22px] lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0">
              <span className="lg:hidden">↓</span><span className="hidden lg:inline">→</span>
            </span>
          )}
          <span className="block text-[15px] font-semibold">{s.title}</span>
          <span className="block mt-1 text-xs leading-snug text-gray-500">{s.body}</span>
        </li>
      ))}
    </ol>
  );
}

export function Scorecard({ cells }: { cells: { n: number | string; label: string }[] }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cells.map((c) => (
        <div key={c.label} className="rounded-lg border border-hair px-5 py-4">
          <div className="font-mono text-3xl font-medium leading-none">{c.n}</div>
          <div className="mt-2 text-[13px] leading-snug text-gray-400">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
