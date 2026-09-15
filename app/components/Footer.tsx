import { site, statsLine } from "@/site.config";

export default function Footer() {
  return (
    <footer className="border-t border-hair mt-12">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-between items-center gap-4 font-mono text-xs text-dim">
        <span>
          Built and run by <a href={site.author.url} className="text-muted hover:text-foreground">{site.author.name}</a>. Every decision on this site has a number in a register.
        </span>
        <span>{statsLine}</span>
      </div>
    </footer>
  );
}
