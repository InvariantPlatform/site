"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/site.config";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="border-b border-hair">
      <div className="max-w-7xl mx-auto px-4 min-h-24 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 text-foreground" aria-label="Invariant Platform home">
          <svg width="26" height="34" viewBox="0 0 52 68" aria-hidden="true" className="block">
            <path d="M10 6 L40 34 L10 62" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
          <span className="text-[26px] font-semibold tracking-[-0.03em] leading-none">invariant</span>
          <span className="font-mono text-[13px] tracking-[0.12em] text-gray-400">platform</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Sections">
          {site.nav.map((n) => (
            <Link key={n.href} href={n.href} className={`pill ${pathname.startsWith(n.href) ? "pill-current" : ""}`}>
              {n.label}
            </Link>
          ))}
          <Link href="/join/" className="pill border-amber-dark text-amber-light hover:text-amber-light md:ml-2">
            Join
          </Link>
        </nav>
      </div>
    </header>
  );
}
