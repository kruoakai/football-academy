import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { formatThaiDateTime } from "@/lib/thai";
import { promptpayQrDataUrl } from "@/lib/promptpay";
import { getSiteSettings } from "@/lib/site-settings";
import { submitPaymentSlipAction } from "./actions";
import PayForm from "./PayForm";

const statusMessage: Record<string, string> = {
  CONFIRMED: "ชำระเงินและยืนยันการจองเรียบร้อยแล้ว",
  CANCELLED: "การจองนี้ถูกยกเลิกแล้ว",
  COMPLETED: "การจองนี้เสร็จสิ้นแล้ว",
};

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ promo?: string }>;
}) {
  const { bookingId } = await params;
  const { promo } = await searchParams;
  const session = await verifySession();

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, student: { guardian: { userId: session.user.id } } },
    include: {
      student: true,
      schedule: { include: { course: true } },
      clinicService: true,
      payment: true,
    },
  });
  if (!booking) notFound();

  const settings = await getSiteSettings();
  const baseAmount =
    booking.type === "ACADEMY" ? Number(booking.schedule?.course.price ?? 0) : Number(booking.clinicService?.price ?? 0);
  const label = booking.type === "ACADEMY" ? booking.schedule?.course.name : booking.clinicService?.name;

  // Read-only preview of the promo discount for display — submitPaymentSlipAction
  // re-validates and redeems it atomically when the slip is actually submitted,
  // so a code that expires/runs out between preview and submit is caught there.
  let finalAmount = baseAmount;
  let promoError: string | null = null;
  let promoApplied = false;
  const promoCodeRaw = promo?.trim().toUpperCase();
  if (promoCodeRaw) {
    const promotion = await prisma.promotion.findUnique({ where: { code: promoCodeRaw } });
    const now = new Date();
    if (!promotion || !promotion.active) promoError = "ไม่พบรหัสโปรโมชั่นนี้";
    else if (now < promotion.validFrom || now > promotion.validTo) promoError = "รหัสโปรโมชั่นหมดอายุหรือยังไม่เริ่มใช้งาน";
    else if (promotion.maxUses !== null && promotion.usedCount >= promotion.maxUses) promoError = "รหัสโปรโมชั่นนี้ถูกใช้ครบจำนวนแล้ว";
    else if (promotion.type === "GIFT" && (promotion.giftStock === null || promotion.giftStock <= 0)) promoError = "ของแถมหมดแล้ว";
    else {
      if (promotion.type === "DISCOUNT") {
        const discount =
          promotion.discountUnit === "PERCENT"
            ? (baseAmount * Number(promotion.value ?? 0)) / 100
            : Number(promotion.value ?? 0);
        finalAmount = Math.max(0, baseAmount - discount);
      }
      promoApplied = true;
    }
  }

  const qr = settings.promptpayId ? await promptpayQrDataUrl(settings.promptpayId, finalAmount) : null;
  const hasBankDetails = !!(settings.bankName && settings.bankAccountNumber);
  const paymentConfigured = !!qr || hasBankDetails;

  const payment = booking.payment;
  const awaitingVerification = payment?.status === "AWAITING_VERIFICATION";
  const canSubmitSlip = booking.status === "PENDING_PAYMENT" && !awaitingVerification;

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-pitch-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-heading text-xl font-bold text-pitch-900">ชำระเงินค่าจอง</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {label} — {booking.student.name}
        </p>
        <p className="text-sm text-neutral-600">{formatThaiDateTime(booking.date)}</p>

        <div className="mt-6 rounded-xl bg-pitch-50 p-6 text-center">
          {promoApplied && (
            <p className="text-sm text-neutral-400 line-through">{baseAmount.toLocaleString()} บาท</p>
          )}
          <p className="font-heading text-2xl font-bold text-pitch-900">{finalAmount.toLocaleString()} บาท</p>
          {promoApplied && <p className="mt-1 text-xs font-medium text-pitch-700">ใช้โค้ด {promoCodeRaw} แล้ว</p>}
        </div>

        {booking.status !== "PENDING_PAYMENT" ? (
          <p className="mt-6 rounded-lg bg-pitch-50 px-3 py-2 text-center text-sm font-medium text-pitch-800">
            {statusMessage[booking.status] ?? booking.status}
          </p>
        ) : awaitingVerification ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-gold-200 bg-gold-50 p-6 text-center">
            <p className="font-medium text-gold-800">รอตรวจสอบสลิปการโอนเงิน</p>
            <p className="text-sm text-neutral-600">ทีมงานจะตรวจสอบและยืนยันการจองให้ภายในไม่นาน</p>
            {payment?.slipUrl && (
              <div className="relative aspect-[3/4] w-32 overflow-hidden rounded-lg border border-neutral-200">
                <Image src={payment.slipUrl} alt="สลิปที่ส่งแล้ว" fill unoptimized className="object-cover" />
              </div>
            )}
          </div>
        ) : (
          <>
            {payment?.status === "FAILED" && (
              <div className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                สลิปก่อนหน้านี้ไม่ผ่านการตรวจสอบ
                {payment.rejectedReason ? `: ${payment.rejectedReason}` : ""} กรุณาอัปโหลดสลิปใหม่
              </div>
            )}

            <form method="get" className="mt-6 flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="promo" className="block text-sm font-medium text-neutral-700">
                  รหัสโปรโมชั่น (ถ้ามี)
                </label>
                <input
                  id="promo"
                  name="promo"
                  defaultValue={promoCodeRaw ?? ""}
                  placeholder="เช่น SUMMER2569"
                  className="mt-1 block min-h-[44px] w-full rounded-lg border border-neutral-300 px-3 py-2 text-base uppercase focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500"
                />
              </div>
              <button
                type="submit"
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-pitch-300 px-4 text-sm font-semibold text-pitch-700 hover:bg-pitch-50"
              >
                ใช้โค้ด
              </button>
            </form>
            {promoError && <p className="mt-1 text-sm text-red-600">{promoError}</p>}

            {!paymentConfigured ? (
              <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
                ยังไม่ได้ตั้งค่าช่องทางรับชำระเงิน กรุณา{" "}
                <Link href="/contact" className="font-medium text-pitch-700 hover:underline">
                  ติดต่อเจ้าหน้าที่
                </Link>{" "}
                เพื่อชำระเงิน
              </div>
            ) : (
              <>
                {qr && (
                  <div className="mt-6 flex flex-col items-center gap-2 rounded-xl bg-pitch-50 p-6">
                    <p className="text-sm font-medium text-pitch-800">สแกนจ่ายผ่านพร้อมเพย์</p>
                    <Image src={qr} alt="QR พร้อมเพย์" width={200} height={200} unoptimized />
                  </div>
                )}
                {hasBankDetails && (
                  <div className="mt-4 rounded-xl border border-neutral-200 p-4 text-sm">
                    <p className="font-medium text-pitch-900">โอนผ่านบัญชีธนาคาร</p>
                    <p className="mt-2 text-neutral-600">
                      {settings.bankName} เลขที่บัญชี{" "}
                      <span className="font-semibold text-pitch-900">{settings.bankAccountNumber}</span>
                    </p>
                    {settings.bankAccountName && (
                      <p className="text-neutral-600">ชื่อบัญชี {settings.bankAccountName}</p>
                    )}
                  </div>
                )}

                {canSubmitSlip && (
                  <PayForm
                    action={submitPaymentSlipAction.bind(null, booking.id)}
                    promoCode={promoApplied ? (promoCodeRaw ?? "") : ""}
                  />
                )}
              </>
            )}
          </>
        )}

        <Link
          href="/dashboard/bookings"
          className="mt-4 block text-center text-sm font-medium text-pitch-700 hover:text-pitch-900"
        >
          กลับไปหน้ารายการจอง
        </Link>
      </div>
    </div>
  );
}
