"use client";

import Link from "next/link";
import { useState } from "react";
import type { SiteSettings } from "@/lib/site-settings";

// Structural nav config — which items exist is a code decision (new pages
// need code anyway); only the *label* text is admin-editable via SiteSettings.
const navConfig = [
  { key: "navHomeLabel", href: "/" },
  { key: "navAboutLabel", href: "/about" },
  { key: "navCoursesLabel", href: "/courses" },
  { key: "navClinicLabel", href: "/clinic" },
  { key: "navGalleryLabel", href: "/gallery" },
  { key: "navBlogLabel", href: "/blog" },
  { key: "navContactLabel", href: "/contact" },
] as const;

export default function Header({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);

  const navItems = navConfig.map((item) => ({ ...item, label: settings[item.key] }));

  return (
    <header className="sticky top-0 z-50 bg-pitch-900/95 backdrop-blur supports-[backdrop-filter]:bg-pitch-900/90 text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap font-heading text-base font-semibold tracking-wide sm:text-lg xl:text-xl"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-pitch-950 text-sm font-bold">
            YP
          </span>
          <span>
            {settings.headerBrandPrefix}
            <span className="text-gold-400">{settings.headerBrandHighlight}</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden min-w-0 xl:flex xl:items-center xl:gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="shrink-0 whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-gold-300"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-2 shrink-0 whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-gold-300"
          >
            {settings.headerLoginLabel}
          </Link>
          <Link
            href="/register"
            className="ml-1 shrink-0 whitespace-nowrap rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-pitch-950 shadow-sm transition hover:bg-gold-400"
          >
            {settings.headerCtaLabel}
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="เปิดเมนู"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-white xl:hidden"
        >
          <span className="sr-only">เปิดเมนู</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav panel */}
      {open && (
        <nav className="border-t border-white/10 bg-pitch-900 px-4 pb-4 pt-2 xl:hidden">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block min-h-[44px] rounded-md px-3 py-3 text-base font-medium text-white/90 transition hover:bg-white/10"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block min-h-[44px] rounded-md px-3 py-3 text-base font-medium text-white/90 transition hover:bg-white/10"
              >
                {settings.headerLoginLabel}
              </Link>
            </li>
          </ul>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="mt-2 block min-h-[44px] rounded-full bg-gold-500 px-4 py-3 text-center text-base font-semibold text-pitch-950 shadow-sm"
          >
            {settings.headerCtaLabel}
          </Link>
        </nav>
      )}
    </header>
  );
}
