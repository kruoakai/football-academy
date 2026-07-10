import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { signOutAction } from "@/lib/auth-actions";
import BottomNav from "@/components/BottomNav";
import { HomeIcon, CalendarIcon, PlusCircleIcon } from "@/components/icons";

const navItems = [
  { href: "/dashboard", label: "หน้าแรก", icon: <HomeIcon /> },
  { href: "/dashboard/bookings", label: "การจอง", icon: <CalendarIcon /> },
  { href: "/dashboard/book", label: "จองใหม่", icon: <PlusCircleIcon /> },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  if (session.user.role !== "GUARDIAN") {
    redirect("/coach/attendance");
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="font-heading text-lg font-semibold text-pitch-900">
            บัญชีของฉัน
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-pitch-50 hover:text-pitch-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={signOutAction}>
            <button
              type="submit"
              className="min-h-[44px] rounded-full border border-neutral-300 px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pb-10">{children}</main>

      <BottomNav items={navItems} />
    </div>
  );
}
