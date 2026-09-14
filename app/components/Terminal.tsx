/** posture-check output, rendered as a terminal. Lines are data, never a screenshot. */
export type TermLine = { status: "ok" | "FAIL"; text: string };

export default function Terminal({ title, command, lines, summary, caption }: { title: string; command: string; lines: TermLine[]; summary: string; caption: string }) {
  return (
    <div>
      <div className="rounded-lg border border-hair bg-deep overflow-hidden">
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-hair">
          {[0, 1, 2].map((i) => <i key={i} className="block w-2.5 h-2.5 rounded-full bg-hair-2" />)}
          <span className="font-mono text-xs text-gray-500 ml-2">{title}</span>
        </div>
        <pre className="m-0 px-4 py-4 font-mono text-[12px] md:text-[13px] leading-relaxed text-gray-300 overflow-x-auto">
          <span className="text-amber">❯</span> {command}
          {"\n"}
          {lines.map((l) => (
            <span key={l.text}>
              {"  "}
              {l.status === "ok"
                ? <span className="text-amber">[ok  ]</span>
                : <span className="text-white bg-amber-dark px-0.5">[FAIL]</span>}
              {" "}{l.text}{"\n"}
            </span>
          ))}
          <span className="text-gray-400">{summary}</span>
        </pre>
      </div>
      <p className="mt-2.5 font-mono text-[13px] leading-snug text-gray-500">{caption}</p>
    </div>
  );
}
