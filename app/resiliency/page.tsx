import type { Metadata } from "next";
import { Band, CardGrid, Intro, MembersStrip, Scorecard, SectionHead } from "../components/ui";
import { intro, members, principles, scorecard } from "@/content/resiliency";

export const metadata: Metadata = { title: "Resiliency", description: intro.rule };

export default function Page() {
  return (
    <>
      <Intro {...intro} />
      <Band>
        <SectionHead title="The scorecard" sub="Counts, not adjectives. Each is a number the platform keeps, and the members pages show where every one came from." />
        <Scorecard cells={scorecard} />
      </Band>
      <Band><CardGrid cards={principles} /></Band>
      <MembersStrip {...members} />
    </>
  );
}
