"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/site.config";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="border-b border-hair">
      <div className="max-w-7xl mx-auto px-6 min-h-[72px] py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 text-foreground" aria-label="Invariant Platform home">
          <svg width="20" height="26" viewBox="0 0 52 68" aria-hidden="true" className="block">
            <path d="M10 6 L40 34 L10 62" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
          <span className="font-mono text-xl font-medium tracking-[-0.01em]">invariant</span>
          <span className="label text-dim tracking-[0.18em]">platform</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-7 gap-y-2" aria-label="Sections">
          {site.nav.map((n, i) => (
            <Link key={n.href} href={n.href} className={`navlink ${pathname.startsWith(n.href) ? "navlink-current" : ""}`}>
              <span className="text-dim">{String(i + 1).padStart(2, "0")}</span>&nbsp;{n.label}
            </Link>
          ))}
          <Link href="/join/" className="label text-amber border border-amber-dark px-3.5 py-[7px] md:ml-2 hover:border-amber">
            Join
          </Link>
        </nav>
      </div>
    </header>
  );
}
