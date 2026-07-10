import { requireRole } from "@/lib/dal";
import { signOutAction } from "@/lib/auth-actions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import {
  GridIcon,
  BookIcon,
  CalendarIcon,
  UsersIcon,
  HeartPulseIcon,
  CurrencyIcon,
  TagIcon,
  ChartBarIcon,
  ShieldIcon,
  NewspaperIcon,
  MegaphoneIcon,
} from "@/components/icons";

const navItems = [
  { href: "/admin", label: "ภาพรวม", icon: <GridIcon /> },
  { href: "/admin/courses", label: "คอร์ส", icon: <BookIcon /> },
  { href: "/admin/batches", label: "รุ่น/ตารางฝึก", icon: <CalendarIcon /> },
  { href: "/admin/coaches", label: "โค้ช", icon: <UsersIcon /> },
  { href: "/admin/students", label: "นักเรียน", icon: <UsersIcon /> },
  { href: "/admin/clinic-services", label: "บริการคลินิก", icon: <HeartPulseIcon /> },
  { href: "/admin/finance", label: "การเงิน", icon: <CurrencyIcon /> },
  { href: "/admin/promotions", label: "โปรโมชั่น", icon: <TagIcon /> },
  { href: "/admin/articles", label: "บทความ", icon: <NewspaperIcon /> },
  { href: "/admin/campaigns", label: "แคมเปญ", icon: <MegaphoneIcon /> },
  { href: "/admin/reports", label: "รายงาน", icon: <ChartBarIcon /> },
  { href: "/admin/staff", label: "ทีมงาน", icon: <ShieldIcon /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["ADMIN"]);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar items={navItems} userName={session.user.name ?? ""} />

      <div className="flex flex-1 flex-col">
        <AdminMobileNav items={navItems} />
        <div className="hidden justify-end border-b border-neutral-200 bg-white px-6 py-3 sm:flex">
          <form action={signOutAction}>
            <button
              type="submit"
              className="min-h-[40px] rounded-full border border-neutral-300 px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
