import type { Metadata } from "next";
import { CardGrid, GitHubIcon, Intro, Wrap } from "../components/ui";
import { site } from "@/site.config";
import { after, consent, intro, notOpen, steps, terms } from "@/content/join";

export const metadata: Metadata = { title: "Join", description: intro.paragraphs[0] };

export default function Page() {
  return (
    <>
      <Intro {...intro} />
      <section className="py-8">
        <Wrap>
          <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-2 gap-8 md:gap-16 items-start">
            <CardGrid cards={terms} cols={2} />
            {/* Prototype: a form-shaped explanation. No input is live; nothing is submitted. */}
            <div className="rounded-lg border border-hair p-6 flex flex-col gap-4">
              {!site.joinOpen && (
                <p className="border-l-2 border-amber-dark bg-amber-dark/5 rounded-r-md px-4 py-3 text-sm text-gray-400">{notOpen}</p>
              )}
              <span className="text-[13px] text-gray-400">{steps}</span>
              <span className="text-[13px] text-gray-400">Your email</span>
              <div className="rounded-md border border-hair-2 bg-deep px-3 py-2.5 font-mono text-sm text-gray-500">you@example.com</div>
              <label className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed">
                <i className="mt-[3px] w-4 h-4 shrink-0 rounded-[3px] border border-hair-2" />
                <span>{consent}</span>
              </label>
              <span className="btn btn-soon"><GitHubIcon /> Continue with GitHub — opens with the members launch</span>
              <span className="text-[13px] text-gray-400">{after}</span>
            </div>
          </div>
        </Wrap>
      </section>
    </>
  );
}
