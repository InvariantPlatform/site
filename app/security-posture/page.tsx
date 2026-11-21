import type { Metadata } from "next";
import { PostureAnswers, PostureVantage } from "../components/figures";
import { Band, CardGrid, Intro, MembersStrip } from "../components/ui";
import { ClaimGroups } from "../components/instrument";
import { failOnly, groups, intro, members, why } from "@/content/security-posture";

export const metadata: Metadata = { title: "Security posture", description: intro.paragraphs[0], alternates: { canonical: "/security-posture/" } };

export default function Page() {
  return (
    <>
      <Intro {...intro} />
      <Band>
        <PostureVantage />
        <PostureAnswers />
      </Band>
      <Band>
        <ClaimGroups groups={groups} />
        <div className="mt-12 border-l-2 border-amber-dark pl-5 py-1 max-w-[46em]">
          <span className="block text-[15px] font-semibold">{failOnly.title}</span>
          <span className="block mt-1.5 text-sm leading-relaxed text-muted">{failOnly.body}</span>
        </div>
      </Band>
      <Band><CardGrid cards={why} /></Band>
      <MembersStrip {...members} />
    </>
  );
}
