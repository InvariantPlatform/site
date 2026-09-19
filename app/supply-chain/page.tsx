import type { Metadata } from "next";
import { Band, CardGrid, Flow, Intro, MembersStrip, RowList, SectionHead, sectionNumber } from "../components/ui";
import { flow, intro, members, pins, release, repoCards, repos, shape } from "@/content/supply-chain";

export const metadata: Metadata = { title: "Supply chain", description: intro.rule, alternates: { canonical: "/supply-chain/" } };

export default function Page() {
  return (
    <>
      <Intro number={sectionNumber("/supply-chain/")} {...intro} />
      <Band><SectionHead {...shape} /><Flow steps={flow} /></Band>
      <Band><SectionHead {...repos} /><CardGrid cards={repoCards} /></Band>
      <Band>
        <SectionHead title={release.title} sub={release.sub} />
        <RowList name="The chain" rows={release.rows} />
      </Band>
      <Band><SectionHead title={pins.title} sub={pins.sub} /><CardGrid cards={pins.cards} /></Band>
      <MembersStrip {...members} />
    </>
  );
}
