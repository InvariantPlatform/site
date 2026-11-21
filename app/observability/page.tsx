import type { Metadata } from "next";
import { AlertPath } from "../components/figures";
import { Band, CardGrid, Flow, Intro, MembersStrip, SectionHead } from "../components/ui";
import { flow, gaps, intro, members, principles, shape } from "@/content/observability";

export const metadata: Metadata = { title: "Observability", description: intro.rule, alternates: { canonical: "/observability/" } };

export default function Page() {
  return (
    <>
      <Intro {...intro} />
      <Band><SectionHead {...shape} /><AlertPath /><Flow steps={flow} /></Band>
      <Band><CardGrid cards={principles} /></Band>
      <Band>
        <SectionHead title={gaps.title} sub={gaps.sub} />
        <div className="pt-6"><CardGrid cards={gaps.cards} cols={2} /></div>
      </Band>
      <MembersStrip {...members} />
    </>
  );
}
