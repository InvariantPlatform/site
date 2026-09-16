import { esc, terminalHtml, type TermLine } from "@/lib/terminal-html";

export type { TermLine };

/**
 * posture-check output as a ruled panel. Lines are data, never a screenshot.
 * The <pre> carries data-status="terminal", the title line
 * data-status="terminal-title" and the caption data-status="terminal-caption":
 * when the published document (ADR-194) includes `lines`, the Worker replaces
 * all three with the real run, so the hero and the status strip can never
 * disagree. All three are dangerouslySetInnerHTML — see lib/terminal-html.ts
 * for why one plain text node would undo the other two.
 */
export default function Terminal({ title, command, lines, summary, caption }: { title: string; command: string; lines: TermLine[]; summary: string; caption: string }) {
  return (
    <div>
      <div className="border-t border-b border-hair-2">
        <div className="flex flex-wrap justify-between gap-2 py-2.5 border-b border-hair font-mono text-xs text-dim">
          <span><span className="text-amber">$</span> {command}</span>
          <span data-status="terminal-title" dangerouslySetInnerHTML={{ __html: esc(title) }} />
        </div>
        <pre
          className="m-0 py-4 font-mono text-[11px] md:text-[13px] leading-[1.7] text-[#c9ced4] overflow-x-auto"
          data-status="terminal"
          dangerouslySetInnerHTML={{ __html: terminalHtml(lines, summary) }}
        />
      </div>
      <p className="mt-2.5 font-mono text-xs leading-relaxed text-dim" data-status="terminal-caption" dangerouslySetInnerHTML={{ __html: esc(caption) }} />
    </div>
  );
}
