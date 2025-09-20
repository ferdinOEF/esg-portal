// components/NavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = { name: string; href: string; startsWith?: string };

const ITEMS: Item[] = [
  { name: "Companies",  href: "/companies", startsWith: "/companies" },
  { name: "Repository", href: "/schemes",   startsWith: "/schemes" }, // unified catalog
  { name: "GodMode",    href: "/godmode",   startsWith: "/godmode" },
];

function isActive(pathname: string, item: Item) {
  if (item.startsWith) return pathname === item.href || pathname.startsWith(item.startsWith);
  return pathname === item.href;
}

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[color:var(--border-1)] bg-[color:var(--bg-0)]/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-wide hover:opacity-90">
            <span className="inline-block h-2 w-2 rounded-full bg-white/70" />
            ESG Portal
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {ITEMS.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={[
                    "px-3 py-2 rounded-lg text-sm transition-colors",
                    "border border-transparent",
                    active
                      ? "bg-[color:var(--glass)] border-[color:var(--border-1)] text-[color:var(--text-1)] shadow-[inset_0_0_32px_-22px_rgba(255,255,255,0.35)]"
                      : "text-[color:var(--text-2)] hover:text-[color:var(--text-1)] hover:bg-[color:var(--glass)] hover:border-[color:var(--border-1)]",
                  ].join(" ")}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <button
            aria-label="Open menu"
            className="md:hidden px-2 py-2 rounded-lg border border-[color:var(--border-1)] bg-[color:var(--glass)]"
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[color:var(--border-1)] bg-[color:var(--bg-0)]/85 backdrop-blur">
          <nav className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
            {ITEMS.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-[color:var(--glass)] border border-[color:var(--border-1)] text-[color:var(--text-1)]"
                      : "text-[color:var(--text-2)] hover:text-[color:var(--text-1)] hover:bg-[color:var(--glass)]",
                  ].join(" ")}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
