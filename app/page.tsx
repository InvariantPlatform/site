import type { Metadata } from "next";
import Link from "next/link";
import Terminal from "./components/Terminal";
import { Band, Card, JoinCta, SectionHead, Wrap } from "./components/ui";
import { hero, offer, postureRun, sections, threeRepos } from "@/content/home";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <section className="pt-12 md:pt-20 pb-12">
        <Wrap>
          <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-8 md:gap-16 items-start">
            <div className="flex flex-col gap-6">
              <h1 className="text-[32px] md:text-[44px] font-bold leading-[1.1] tracking-[-0.02em]">
                <span className="shimmer">{hero.title}</span>
              </h1>
              <p className="text-[19px] leading-snug text-gray-400 max-w-[34em]">{hero.lede}</p>
              <p className="text-base leading-relaxed text-gray-400 max-w-[34em]">{hero.body}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/security-posture/" className="btn btn-amber">Read the security posture →</Link>
                <Link href="/architecture/" className="btn">How it is built →</Link>
              </div>
            </div>
            <Terminal {...postureRun} />
          </div>
        </Wrap>
      </section>

      <Band>
        <SectionHead title="What holds, and how you can tell" sub="Each section opens with what is public. The full story — the model, the failed rebuilds, every decision and what it cost — is for members." />
        <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-4">
          {sections.map((s) => <Card key={s.title} {...s} />)}
          <div className="rounded-lg border border-dashed border-hair-2 p-5 flex flex-col justify-center gap-2.5">
            <span className="text-[15px] text-gray-300">{threeRepos.title}</span>
            <span className="text-sm leading-relaxed text-gray-400">{threeRepos.body}</span>
          </div>
        </div>
      </Band>

      <section className="py-12">
        <Wrap>
          <div className="rounded-lg border border-hair p-5 md:p-8 grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.01em]">{offer.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-gray-400">{offer.body}</p>
            </div>
            <JoinCta />
          </div>
        </Wrap>
      </section>
    </>
  );
}
