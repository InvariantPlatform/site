import type { Metadata } from "next";
import { FailureDomains, RollOrder } from "../components/figures";
import { Band, CardGrid, Intro, MembersStrip, Scorecard, SectionHead } from "../components/ui";
import { FixCards, Timeline } from "../components/instrument";
import { attended, intro, members, principles, roll, scorecard } from "@/content/resiliency";

export const metadata: Metadata = { title: "Resiliency", description: intro.rule, alternates: { canonical: "/resiliency/" } };

export default function Page() {
  return (
    <>
      <Intro {...intro} />
      <Band>
        <SectionHead title="The scorecard" sub="Counts, not adjectives. Each is a number the platform keeps, and the members pages show where every one came from." />
        <Scorecard cells={scorecard} />
        <FailureDomains />
      </Band>
      <Band><CardGrid cards={principles} /></Band>
      <Band>
        <SectionHead title={roll.title} sub={roll.sub} />
        <RollOrder />
        <Timeline steps={roll.steps} />
      </Band>
      <Band>
        <SectionHead title={attended.title} sub={attended.sub} />
        <FixCards fixes={attended.fixes} />
      </Band>
      <MembersStrip {...members} />
    </>
  );
}
