import Image from "next/image";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { codeToQrDataUrl } from "@/lib/qrcode";

export default async function RegisterSuccessPage() {
  const session = await verifySession();
  const guardian = await prisma.guardian.findUnique({
    where: { userId: session.user.id },
    include: { students: { orderBy: { createdAt: "desc" } } },
  });

  const students = guardian?.students ?? [];
  const qrCodes = await Promise.all(students.map((s) => codeToQrDataUrl(s.code)));
  const lineOaId = process.env.NEXT_PUBLIC_LINE_OA_ID;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-pitch-100 text-3xl text-pitch-700">
          ✓
        </span>
        <h1 className="mt-4 font-heading text-2xl font-bold text-pitch-900 sm:text-3xl">
          สมัครเรียนสำเร็จ!
        </h1>
        <p className="mt-2 text-neutral-600">เก็บ QR โค้ดของนักเรียนไว้สำหรับเช็คชื่อเข้าเรียน</p>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {students.map((s, i) => (
          <div
            key={s.id}
            className="flex flex-col items-center gap-4 rounded-2xl border border-pitch-100 bg-white p-6 shadow-sm sm:flex-row sm:justify-between"
          >
            <div>
              <p className="font-heading text-lg font-semibold text-pitch-900">{s.name}</p>
              <p className="text-sm text-neutral-600">รหัสนักเรียน: {s.code}</p>
            </div>
            <Image
              src={qrCodes[i]}
              alt={`QR โค้ดสำหรับเช็คชื่อของ ${s.name}`}
              width={140}
              height={140}
              unoptimized
            />
          </div>
        ))}
      </div>

      {lineOaId && (
        <div className="mt-8 rounded-2xl bg-pitch-50 p-6 text-center">
          <p className="font-heading font-semibold text-pitch-900">เพิ่มเพื่อน LINE เพื่อรับการแจ้งเตือน</p>
          <a
            href={`https://line.me/R/ti/p/${lineOaId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#06C755] px-6 py-3 text-base font-semibold text-white"
          >
            เพิ่มเพื่อน LINE OA
          </a>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/dashboard"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-8 py-3 text-base font-semibold text-pitch-950 hover:bg-gold-400"
        >
          ไปที่หน้าของฉัน
        </Link>
      </div>
    </div>
  );
}
