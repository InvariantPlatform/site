/**
 * The hero terminal's body as an HTML string — one builder for both sides.
 *
 * The static export renders the sample run through it, and src/worker.ts
 * renders the published run (ADR-194 `lines`) through the same function on
 * the way out, so the live terminal and the placeholder can never differ in
 * shape. It is a string, not JSX, for the reason the status strip is: React
 * skips dangerouslySetInnerHTML content during hydration, so an edge rewrite
 * survives (bug-163). And EVERY element the Worker rewrites must be set this
 * way, not just the big one: React 19 treats one mismatched text node as a
 * hydration failure and re-renders the whole root from the client, which put
 * the static sample back over the published run in every element at once.
 */
export type TermLine = { status: "ok" | "FAIL"; text: string };

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function terminalHtml(lines: TermLine[], summary: string): string {
  const body = lines
    .map((l) =>
      l.status === "ok"
        ? `  <span class="text-amber">ok  </span> ${esc(l.text)}\n`
        : `  <span class="text-background bg-amber px-[3px] font-medium">FAIL</span> ${esc(l.text)}\n`,
    )
    .join("");
  return `${body}<span class="text-muted">${esc(summary)}</span>`;
}

/** The summary line under a published run, in the strip's own words. */
export function runSummary(held: number, invariants: number, findings: number): string {
  const tail = findings === 0 ? "no findings" : findings === 1 ? "1 finding, paged" : `${findings} findings, paged`;
  return `${held} of ${invariants} invariants hold — ${tail}`;
}
