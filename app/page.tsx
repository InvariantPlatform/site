import type { Metadata } from "next";
import Link from "next/link";
import Terminal from "./components/Terminal";
import { Band, Flow, JoinCta, SectionHead, SectionIndex, Wrap } from "./components/ui";
import { HeartbeatTrace, Module, RegisterMatrix, StatsBand } from "./components/instrument";
import { flow, shape } from "@/content/supply-chain";
import { hero, offer, postureRun, register, sections, threeRepos } from "@/content/home";
import { site } from "@/site.config";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <section className="blueprint pt-14 md:pt-[88px] pb-12 md:pb-16 border-b border-hair">
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
              <HeartbeatTrace />
            </div>
            <Module tag="CH-01 · posture · nightly" className="px-5 pt-2 pb-4 mt-6 md:mt-0">
              <Terminal {...postureRun} />
            </Module>
          </div>
        </Wrap>
      </section>

      <Band>
        <SectionHead title="The numbers the platform keeps" sub="each one is counted, not estimated" />
        <StatsBand stats={[
          { n: site.stats.decisions, label: "decisions", sub: "numbered, never deleted" },
          { n: site.stats.invariants, label: "invariants", sub: "re-asserted nightly" },
          { n: site.stats.rebuilds, label: "rebuilds", sub: "from a declaration" },
          { n: site.stats.restoreDrills, label: "restore drills", sub: "passed, not assumed" },
          { n: site.stats.failureDomains, label: "failure domains", sub: "and what survives each" },
        ]} />
      </Band>

      <Band>
        <SectionHead title="What holds, and how you can tell" sub="each section: what is public / what is for members" />
        <SectionIndex sections={sections} note={threeRepos} />
      </Band>

      <Band>
        <SectionHead title={register.title} sub={register.sub} />
        <div className="flex flex-col gap-8">
          <div className="max-w-[46em]">
            <p className="text-[15px] leading-relaxed text-muted">{register.body}</p>
            <p className="mt-4 font-mono text-xs leading-relaxed text-dim">{register.aside}</p>
          </div>
          <RegisterMatrix categories={site.register} />
        </div>
      </Band>

      <Band>
        <SectionHead title={`How a change reaches the cluster`} sub={shape.sub} />
        <Flow steps={flow} />
      </Band>

      <section className="py-8 pb-16">
        <Wrap>
          <Module tag="membership · free" className="p-6 md:p-10 mt-4 grid grid-cols-[minmax(0,1fr)] md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
            <div>
              <h2 className="font-mono text-2xl font-medium tracking-[-0.01em]">{offer.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted max-w-[46em]">{offer.body}</p>
            </div>
            <JoinCta />
          </Module>
        </Wrap>
      </section>
    </>
  );
}
