"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "หน้าแรก", href: "/" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "คอร์สเรียน", href: null },
  { label: "คลินิกกายภาพ", href: null },
  { label: "แกลเลอรี่", href: null },
  { label: "บทความ", href: null },
  { label: "ติดต่อเรา", href: null },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-pitch-900/95 backdrop-blur supports-[backdrop-filter]:bg-pitch-900/90 text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-semibold tracking-wide sm:text-xl"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-pitch-950 text-sm font-bold">
            YP
          </span>
          <span>
            ยินผัน <span className="text-gold-400">ฟุตบอล อคาเดมี</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex lg:items-center lg:gap-1">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-gold-300"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="cursor-default rounded-md px-3 py-2 text-sm font-medium text-white/40"
                title="เร็วๆ นี้"
              >
                {item.label}
              </span>
            )
          )}
          <Link
            href="/about"
            className="ml-3 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-pitch-950 shadow-sm transition hover:bg-gold-400"
          >
            สมัครเรียน
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="เปิดเมนู"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-md text-white lg:hidden"
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
        <nav className="border-t border-white/10 bg-pitch-900 px-4 pb-4 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block min-h-[44px] rounded-md px-3 py-3 text-base font-medium text-white/90 transition hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="flex min-h-[44px] items-center gap-2 rounded-md px-3 py-3 text-base font-medium text-white/40">
                    {item.label}
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">เร็วๆ นี้</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="mt-2 block min-h-[44px] rounded-full bg-gold-500 px-4 py-3 text-center text-base font-semibold text-pitch-950 shadow-sm"
          >
            สมัครเรียน
          </Link>
        </nav>
      )}
    </header>
  );
}
