import { site } from "@/site.config";

/**
 * The status strip (ADR-194). The static export ships the placeholders;
 * src/worker.ts fills every `data-status` element from Cloudflare KV on the
 * way out, server-side. The defaults below are what a reader sees when no run
 * has been published — never a number that looks real.
 *
 * The inner markup is a string set with dangerouslySetInnerHTML on purpose:
 * React does not inspect such content during hydration, so the Worker's
 * rewrite survives. As ordinary JSX it did not — hydration saw text that
 * differed from what it rendered and put the placeholders back.
 *
 * On a phone the strip is two lines: run time, then held/findings; the
 * provisioner and counts are desktop-only. The Worker's selectors are the
 * same at every width — one element per field, hidden by class, not removed.
 *
 * `data-state` on the inner root is set by the Worker to
 * ok | finding | stale | none; the CSS keys off that attribute.
 */
const inner = `
<div data-status="root" data-state="none" class="max-w-7xl mx-auto px-6 min-h-9 py-2 md:py-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 md:gap-x-7 font-mono text-[11px] md:text-xs text-muted">
  <span class="flex items-center gap-2"><span class="status-dot inline-block w-[7px] h-[7px] bg-dim" aria-hidden="true"></span>posture-check</span>
  <span><span class="hidden md:inline">last run </span><span class="text-foreground" data-status="ran_at">no run recorded</span></span>
  <span class="basis-full flex gap-x-4 md:contents">
    <span data-status="held-line" hidden><span class="text-foreground" data-status="held">–</span> of <span class="text-foreground" data-status="invariants">–</span> invariants hold</span>
    <span class="status-findings" data-status="findings" hidden></span>
  </span>
  <span class="ml-auto hidden md:inline">provisioner <span class="text-foreground" data-status="provisioner">–</span> · decisions <span class="text-foreground">${site.stats.decisions}</span> · rebuilds <span class="text-foreground">${site.stats.rebuilds}</span></span>
</div>`;

export default function StatusStrip() {
  return <div className="status-strip border-b border-hair bg-deep" dangerouslySetInnerHTML={{ __html: inner }} />;
}
