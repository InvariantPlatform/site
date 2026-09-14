import { site, statsLine } from "@/site.config";

export default function Footer() {
  return (
    <footer className="border-t border-hair mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap justify-between items-center gap-4 text-[13px] text-gray-500">
        <span>
          Built and run by <a href={site.author.url} className="text-amber hover:text-amber-light">{site.author.name}</a>. Every decision on this site has a number in a register.
        </span>
        <span className="font-mono">{statsLine}</span>
      </div>
    </footer>
  );
}
