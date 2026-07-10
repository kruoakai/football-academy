"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

export type AdminNavItem = { href: string; label: string; icon: ReactNode };

export default function AdminMobileNav({ items }: { items: AdminNavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sm:hidden">
      <div className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4">
        <span className="font-heading text-lg font-semibold text-pitch-900">หลังบ้านแอดมิน</span>
        <button
          type="button"
          aria-label="เปิดเมนู"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-md text-pitch-900"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-b border-neutral-200 bg-white px-3 pb-3">
          <ul className="flex flex-col">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                      active ? "bg-pitch-50 text-pitch-800" : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
