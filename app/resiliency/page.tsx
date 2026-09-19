import type { Metadata } from "next";
import { Band, CardGrid, Intro, MembersStrip, RowList, Scorecard, SectionHead, sectionNumber } from "../components/ui";
import { attended, intro, members, principles, roll, scorecard } from "@/content/resiliency";

export const metadata: Metadata = { title: "Resiliency", description: intro.rule, alternates: { canonical: "/resiliency/" } };

export default function Page() {
  return (
    <>
      <Intro number={sectionNumber("/resiliency/")} {...intro} />
      <Band>
        <SectionHead title="The scorecard" sub="Counts, not adjectives. Each is a number the platform keeps, and the members pages show where every one came from." />
        <Scorecard cells={scorecard} />
      </Band>
      <Band><CardGrid cards={principles} /></Band>
      <Band>
        <SectionHead title={roll.title} sub={roll.sub} />
        <RowList name="The steps, in order" rows={roll.rows} />
      </Band>
      <Band>
        <SectionHead title={attended.title} sub={attended.sub} />
        <RowList name="Attended steps, and where each one went" rows={attended.rows} />
      </Band>
      <MembersStrip {...members} />
    </>
  );
}
