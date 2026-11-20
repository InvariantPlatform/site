import { site, statsLine } from "@/site.config";

export default function Footer() {
  return (
    <footer className="border-t border-hair mt-12">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-between items-center gap-4 font-mono text-xs text-dim">
        <span>
          Built and run by <a href={site.author.url} className="text-muted hover:text-foreground">{site.author.name}</a>. Every decision on this site has a number in a register.{" "}
          <a href="/privacy/" className="text-muted hover:text-foreground">Privacy</a> · <a href="/auth/login?next=/members/" className="text-muted hover:text-foreground">Member sign-in</a>
        </span>
        <span>{statsLine}</span>
      </div>
      <p className="max-w-7xl mx-auto px-6 pb-6 font-mono text-xs text-dim">
        <i lang="la">Quis custodiet ipsos custodes?</i> Who will guard the guards? Inspired by Juvenal, <cite className="not-italic">Satires</cite> VI.
      </p>
    </footer>
  );
}
