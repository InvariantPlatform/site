import type { Metadata } from "next";
import { Band, CardGrid, Intro, MembersStrip, RowList } from "../components/ui";
import { groups, intro, members, why } from "@/content/security-posture";

export const metadata: Metadata = { title: "Security posture", description: intro.paragraphs[0], alternates: { canonical: "/security-posture/" } };

export default function Page() {
  return (
    <>
      <Intro {...intro} />
      <Band>{groups.map((g) => <RowList key={g.name} {...g} />)}</Band>
      <Band><CardGrid cards={why} cols={2} /></Band>
      <MembersStrip {...members} />
    </>
  );
}
