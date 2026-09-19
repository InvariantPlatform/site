import type { Metadata } from "next";
import { Band, CardGrid, Intro, MembersStrip, RowList, sectionNumber } from "../components/ui";
import { failOnly, groups, intro, members, why } from "@/content/security-posture";

export const metadata: Metadata = { title: "Security posture", description: intro.paragraphs[0], alternates: { canonical: "/security-posture/" } };

export default function Page() {
  return (
    <>
      <Intro number={sectionNumber("/security-posture/")} {...intro} />
      <Band>
        {groups.map((g) => <RowList key={g.name} {...g} />)}
        <div className="mt-8 border-l-2 border-amber-dark pl-5 py-1 max-w-[46em]">
          <span className="block text-[15px] font-semibold">{failOnly.title}</span>
          <span className="block mt-1.5 text-sm leading-relaxed text-muted">{failOnly.body}</span>
        </div>
      </Band>
      <Band><CardGrid cards={why} /></Band>
      <MembersStrip {...members} />
    </>
  );
}
