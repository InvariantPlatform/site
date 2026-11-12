import type { Metadata } from "next";
import { Wrap } from "../components/ui";
import { site } from "@/site.config";
import { intro, sections, updated } from "@/content/privacy";

export const metadata: Metadata = { title: "Privacy", description: intro.paragraphs[0], alternates: { canonical: "/privacy/" } };

export default function Page() {
  return (
    <>
      <section className="pt-14 md:pt-20 pb-4">
        <Wrap>
          <h1 className="font-mono text-[30px] md:text-[38px] font-medium leading-[1.15] tracking-[-0.02em]">{intro.title}</h1>
          {intro.paragraphs.map((p) => (
            <p key={p.slice(0, 32)} className="mt-5 text-[17px] leading-relaxed text-muted max-w-[46em]">{p}</p>
          ))}
        </Wrap>
      </section>
      {sections(site.joinOpen).map((s) => (
        <section key={s.title} className="py-6">
          <Wrap>
            <h2 className="label text-muted font-medium border-b border-hair pb-3.5 mb-5">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 32)} className="mt-4 text-[15px] leading-relaxed text-muted max-w-[46em]">{p}</p>
            ))}
          </Wrap>
        </section>
      ))}
      <section className="py-6 pb-16">
        <Wrap>
          <p className="font-mono text-xs text-dim">Last updated {updated}</p>
        </Wrap>
      </section>
    </>
  );
}
