import type { Metadata } from "next";
import { Band, CardGrid, Flow, Intro, MembersStrip, SectionHead, sectionNumber } from "../components/ui";
import { flow, intro, members, repoCards, repos, shape } from "@/content/supply-chain";

export const metadata: Metadata = { title: "Supply chain", description: intro.rule, alternates: { canonical: "/supply-chain/" } };

export default function Page() {
  return (
    <>
      <Intro number={sectionNumber("/supply-chain/")} {...intro} />
      <Band><SectionHead {...shape} /><Flow steps={flow} /></Band>
      <Band><SectionHead {...repos} /><CardGrid cards={repoCards} /></Band>
      <MembersStrip {...members} />
    </>
  );
}
