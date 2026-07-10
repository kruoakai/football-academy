import Link from "next/link";
import { requireRole } from "@/lib/dal";
import { signOutAction } from "@/lib/auth-actions";
import BottomNav from "@/components/BottomNav";
import { ClipboardCheckIcon } from "@/components/icons";

const navItems = [{ href: "/coach/attendance", label: "เช็คชื่อ", icon: <ClipboardCheckIcon /> }];

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["COACH", "ADMIN"]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Desktop sidebar — this is staff back-office tooling, not the public parent dashboard */}
      <aside className="hidden w-56 shrink-0 flex-col bg-pitch-950 text-white sm:flex">
        <div className="flex h-16 items-center px-5 font-heading text-lg font-semibold">หลังบ้านโค้ช</div>
        <p className="px-5 text-xs text-white/50">{session.user.name}</p>
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[44px] items-center gap-2 rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <form action={signOutAction}>
            <button
              type="submit"
              className="min-h-[44px] w-full rounded-full border border-white/20 px-4 text-sm text-white/80 hover:bg-white/10"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:hidden">
          <span className="font-heading text-lg font-semibold text-pitch-900">หลังบ้านโค้ช</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="min-h-[44px] rounded-full border border-neutral-300 px-4 text-sm text-neutral-600"
            >
              ออก
            </button>
          </form>
        </header>
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-8 sm:pb-10">{children}</main>
      </div>

      <BottomNav items={navItems} />
    </div>
  );
}
