import type { Metadata } from "next";
import ContextView from "../components/ContextView";
import ContextViewPhone from "../components/ContextViewPhone";
import { Band, CardGrid, Intro, MembersStrip, SectionHead, sectionNumber } from "../components/ui";
import { contextView, intro, members, principles } from "@/content/architecture";

export const metadata: Metadata = { title: "Architecture", description: intro.rule, alternates: { canonical: "/architecture/" } };

export default function Page() {
  return (
    <>
      <Intro number={sectionNumber("/architecture/")} {...intro} />
      <Band>
        <SectionHead title={contextView.name} sub={contextView.meta} />
        <div className="hidden md:block pt-4"><ContextView /></div>
        <div className="md:hidden pt-4"><ContextViewPhone /></div>
        <p className="mt-2.5 font-mono text-xs leading-relaxed text-dim">{contextView.caption}</p>
      </Band>
      <Band><CardGrid cards={principles} /></Band>
      <MembersStrip {...members} />
    </>
  );
}
