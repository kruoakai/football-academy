import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hashTokenForStorage } from "@/lib/password-reset";
import ResetPasswordForm from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const resetToken = token
    ? await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashTokenForStorage(token) } })
    : null;
  const isValid = !!resetToken && !resetToken.usedAt && resetToken.expiresAt > new Date();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-pitch-100 bg-white p-6 shadow-sm sm:p-8">
        {isValid && token ? (
          <>
            <h1 className="font-heading text-2xl font-bold text-pitch-900">ตั้งรหัสผ่านใหม่</h1>
            <p className="mt-1 text-sm text-neutral-600">กรอกรหัสผ่านใหม่ที่ต้องการใช้เข้าสู่ระบบ</p>
            <ResetPasswordForm token={token} />
          </>
        ) : (
          <>
            <h1 className="font-heading text-2xl font-bold text-pitch-900">ลิงก์ไม่ถูกต้องหรือหมดอายุ</h1>
            <p className="mt-2 text-sm text-neutral-600">
              ลิงก์ตั้งรหัสผ่านใหม่นี้หมดอายุแล้ว หรือถูกใช้ไปแล้ว กรุณาขอลิงก์ใหม่อีกครั้ง
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-pitch-950 shadow-sm transition hover:bg-gold-400"
            >
              ขอลิงก์ใหม่
            </Link>
          </>
        )}

        <p className="mt-6 text-center text-sm text-neutral-600">
          <Link href="/login" className="font-medium text-pitch-700 hover:text-pitch-900">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
