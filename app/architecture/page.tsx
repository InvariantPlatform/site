import type { Metadata } from "next";
import ContextView from "../components/ContextView";
import { Band, CardGrid, Intro, MembersStrip } from "../components/ui";
import { contextView, intro, members, principles } from "@/content/architecture";

export const metadata: Metadata = { title: "Architecture", description: intro.rule, alternates: { canonical: "/architecture/" } };

export default function Page() {
  return (
    <>
      <Intro {...intro} />
      <Band>
        <div className="flex items-baseline justify-between border-b border-hair pb-2">
          <span className="text-[15px] font-semibold">{contextView.name}</span>
          <span className="font-mono text-[13px] text-gray-500">{contextView.meta}</span>
        </div>
        <div className="overflow-x-auto pt-4"><ContextView /></div>
        <p className="mt-2.5 font-mono text-[13px] leading-snug text-gray-500">{contextView.caption}</p>
      </Band>
      <Band><CardGrid cards={principles} /></Band>
      <MembersStrip {...members} />
    </>
  );
}
