"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type AdminNavItem = { href: string; label: string; icon: ReactNode };

export default function AdminSidebar({ items, userName }: { items: AdminNavItem[]; userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-pitch-950 text-white sm:flex">
      <div className="flex h-16 items-center px-5 font-heading text-lg font-semibold">หลังบ้านแอดมิน</div>
      <p className="px-5 text-xs text-white/50">{userName}</p>
      <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm ${
                active ? "bg-white/10 font-semibold text-white" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
