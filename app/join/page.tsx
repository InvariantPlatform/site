import type { Metadata } from "next";
import { CardGrid, GitHubIcon, Intro, Wrap } from "../components/ui";
import { site } from "@/site.config";
import { after, author, consent, intro, notOpen, steps, terms } from "@/content/join";

export const metadata: Metadata = { title: "Join", description: intro.paragraphs[0], alternates: { canonical: "/join/" } };

export default function Page() {
  return (
    <>
      <Intro number="06" {...intro} />
      <section className="py-8">
        <Wrap>
          <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-8 md:gap-16 items-start">
            <CardGrid cards={terms} cols={2} />
            {/* Prototype: a form-shaped explanation. No input is live; nothing is submitted. */}
            <div className="border border-hair-2 p-6 flex flex-col gap-4">
              {!site.joinOpen && (
                <p className="border-l-2 border-amber-dark bg-amber-dark/5 px-4 py-3 text-sm text-muted">{notOpen}</p>
              )}
              <span className="font-mono text-xs text-muted">{steps}</span>
              <span className="font-mono text-xs text-muted">Your email</span>
              <div className="border border-hair-2 bg-deep px-3 py-2.5 font-mono text-sm text-dim">you@example.com</div>
              <label className="flex items-start gap-2.5 text-sm text-muted leading-relaxed">
                <i className="mt-[3px] w-4 h-4 shrink-0 border border-hair-2" />
                <span>{consent}</span>
              </label>
              <span className="btn btn-soon"><GitHubIcon /> Continue with GitHub — opens with the members launch</span>
              <span className="font-mono text-xs text-muted">{after}</span>
            </div>
          </div>
        </Wrap>
      </section>
      <section className="py-8 pb-16">
        <Wrap>
          <div className="border-t border-hair pt-6 grid grid-cols-[minmax(0,1fr)] md:grid-cols-[200px_minmax(0,1fr)_auto] gap-4 md:gap-10 items-start">
            <span className="label text-dim">{author.label}</span>
            <p className="text-[15px] leading-relaxed text-muted max-w-[46em]">{author.body}</p>
            <a href={site.author.url} className="btn whitespace-nowrap">{author.cta}</a>
          </div>
        </Wrap>
      </section>
    </>
  );
}
