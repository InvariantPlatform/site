import type { Metadata } from "next";
import Link from "next/link";
import Terminal from "./components/Terminal";
import { Band, JoinCta, SectionHead, SectionIndex, Wrap } from "./components/ui";
import { hero, offer, postureRun, sections, threeRepos } from "@/content/home";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <section className="pt-14 md:pt-[88px] pb-12 md:pb-16">
        <Wrap>
          <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[7fr_6fr] gap-10 md:gap-[72px] items-start">
            <div className="flex flex-col gap-7">
              <span className="label text-dim">00&nbsp;&nbsp;Thesis</span>
              <h1 className="font-mono text-[30px] md:text-[38px] font-medium leading-[1.15] tracking-[-0.02em]">
                {hero.titleBefore} <span className="text-amber">{hero.titleAccent}</span> {hero.titleAfter}
              </h1>
              <p className="text-lg leading-relaxed text-muted max-w-[32em]">{hero.lede}</p>
              <p className="text-[15px] leading-relaxed text-muted max-w-[32em]">{hero.body}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/security-posture/" className="btn btn-solid">Read the security posture →</Link>
                <Link href="/architecture/" className="btn">How it is built →</Link>
              </div>
            </div>
            <Terminal {...postureRun} />
          </div>
        </Wrap>
      </section>

      <Band>
        <SectionHead title="What holds, and how you can tell" sub="each section: what is public / what is for members" />
        <SectionIndex sections={sections} note={threeRepos} />
      </Band>

      <section className="py-8 pb-16">
        <Wrap>
          <div className="border border-hair-2 p-6 md:p-10 grid grid-cols-[minmax(0,1fr)] md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
            <div>
              <span className="label text-dim block mb-3">Membership</span>
              <h2 className="font-mono text-2xl font-medium tracking-[-0.01em]">{offer.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted max-w-[46em]">{offer.body}</p>
            </div>
            <JoinCta />
          </div>
        </Wrap>
      </section>
    </>
  );
}
