import type { Metadata } from "next";
import { Band, CardGrid, Flow, Intro, MembersStrip, SectionHead, sectionNumber } from "../components/ui";
import { flow, intro, members, principles, shape } from "@/content/observability";

export const metadata: Metadata = { title: "Observability", description: intro.rule, alternates: { canonical: "/observability/" } };

export default function Page() {
  return (
    <>
      <Intro number={sectionNumber("/observability/")} {...intro} />
      <Band><SectionHead {...shape} /><Flow steps={flow} /></Band>
      <Band><CardGrid cards={principles} /></Band>
      <MembersStrip {...members} />
    </>
  );
}
