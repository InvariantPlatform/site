/**
 * posture-check output as a ruled panel. Lines are data, never a screenshot.
 * The <pre> carries data-status="terminal": when the published document
 * (ADR-194) includes full `lines`, the Worker replaces this body with the
 * real run so the hero and the status strip can never disagree.
 */
export type TermLine = { status: "ok" | "FAIL"; text: string };

export default function Terminal({ title, command, lines, summary, caption }: { title: string; command: string; lines: TermLine[]; summary: string; caption: string }) {
  return (
    <div>
      <div className="border-t border-b border-hair-2">
        <div className="flex flex-wrap justify-between gap-2 py-2.5 border-b border-hair font-mono text-xs text-dim">
          <span><span className="text-amber">$</span> {command}</span>
          <span>{title}</span>
        </div>
        <pre className="m-0 py-4 font-mono text-[12px] md:text-[13px] leading-[1.7] text-[#c9ced4] overflow-x-auto" data-status="terminal">
          {lines.map((l) => (
            <span key={l.text}>
              {"  "}
              {l.status === "ok"
                ? <span className="text-amber">ok  </span>
                : <span className="text-background bg-amber px-[3px] font-medium">FAIL</span>}
              {" "}{l.text}{"\n"}
            </span>
          ))}
          <span className="text-muted">{summary}</span>
        </pre>
      </div>
      <p className="mt-2.5 font-mono text-xs leading-relaxed text-dim">{caption}</p>
    </div>
  );
}
