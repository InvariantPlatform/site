import type { Metadata } from "next";
import { SignedPaths } from "../components/figures";
import { Band, CardGrid, Flow, Intro, MembersStrip, SectionHead } from "../components/ui";
import { Timeline } from "../components/instrument";
import { flow, intro, members, pins, release, repoCards, repos, shape } from "@/content/supply-chain";

export const metadata: Metadata = { title: "Supply chain", description: intro.rule, alternates: { canonical: "/supply-chain/" } };

export default function Page() {
  return (
    <>
      <Intro {...intro} />
      <Band><SectionHead {...shape} /><SignedPaths /><Flow steps={flow} /></Band>
      <Band><SectionHead {...repos} /><CardGrid cards={repoCards} /></Band>
      <Band>
        <SectionHead title={release.title} sub={release.sub} />
        <Timeline steps={release.steps} />
      </Band>
      <Band><SectionHead title={pins.title} sub={pins.sub} /><CardGrid cards={pins.cards} /></Band>
      <MembersStrip {...members} />
    </>
  );
}
