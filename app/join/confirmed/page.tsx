import type { Metadata } from "next";
import { GitHubIcon, Intro, Wrap } from "../../components/ui";
import { confirmed } from "@/content/join";

export const metadata: Metadata = {
  title: "Email confirmed",
  description: confirmed.paragraphs[0],
  alternates: { canonical: "/join/confirmed/" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <Intro title={confirmed.title} paragraphs={confirmed.paragraphs} />
      <section className="py-8 pb-16">
        <Wrap>
          <ol className="flex flex-col gap-4 max-w-[34em]">
            {confirmed.steps.map((s) => (
              <li key={s.n} className="flex items-center gap-4">
                <span className="font-mono text-sm text-amber w-5 shrink-0">{s.n}</span>
                <a href={s.href} className="btn">{s.n === "1" && <GitHubIcon />} {s.label}</a>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted leading-relaxed max-w-[40em]">{confirmed.note}</p>
        </Wrap>
      </section>
    </>
  );
}
