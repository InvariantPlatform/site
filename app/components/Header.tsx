"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/site.config";

/**
 * Two headers in one: a single ruled row on desktop, and on a phone a bar
 * (mark, JOIN, MENU) that folds the numbered sections out underneath as a
 * ruled list. The fold remembers which page it was opened on, so navigating
 * anywhere closes it without an effect.
 */
export default function Header() {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  const current = (href: string) => pathname.startsWith(href);

  return (
    <header className="border-b border-hair">
      <div className="max-w-7xl mx-auto px-6 min-h-[64px] md:min-h-[72px] py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 text-foreground" aria-label="Invariant Platform home">
          <svg width="20" height="26" viewBox="0 0 52 68" aria-hidden="true" className="block">
            <path d="M10 6 L40 34 L10 62" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
          <span className="font-mono text-xl font-medium tracking-[-0.01em]">invariant</span>
          <span className="label text-dim tracking-[0.18em] hidden sm:inline">platform</span>
        </Link>

        <nav className="hidden md:flex flex-wrap items-center gap-x-7 gap-y-2" aria-label="Sections">
          {site.nav.map((n, i) => (
            <Link key={n.href} href={n.href} className={`navlink ${current(n.href) ? "navlink-current" : ""}`}>
              <span className="text-dim">{String(i + 1).padStart(2, "0")}</span>&nbsp;{n.label}
            </Link>
          ))}
          <Link href="/join/" className="label text-amber border border-amber-dark px-3.5 py-[7px] ml-2 hover:border-amber">
            Join
          </Link>
        </nav>

        <div className="flex md:hidden items-center gap-3">
          <Link href="/join/" className="label text-amber border border-amber-dark px-3 py-[6px] hover:border-amber">
            Join
          </Link>
          <button
            type="button"
            className="label text-muted border border-hair-2 px-3 py-[6px] hover:text-foreground"
            aria-expanded={open}
            aria-controls="fold"
            onClick={() => setOpenOn(open ? null : pathname)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <nav id="fold" hidden={!open} className="md:hidden border-t border-hair" aria-label="Sections">
        {site.nav.map((n, i) => (
          <Link
            key={n.href}
            href={n.href}
            className={`navlink flex items-baseline gap-4 px-6 py-3.5 border-b border-hair last:border-b-0 ${current(n.href) ? "navlink-current" : ""}`}
            onClick={() => setOpenOn(null)}
          >
            <span className="text-dim">{String(i + 1).padStart(2, "0")}</span>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
