import { formatThaiDate } from "@/lib/thai";
import type { getActivePromotions } from "@/lib/promotions";

type Promotion = Awaited<ReturnType<typeof getActivePromotions>>[number];

function discountLabel(p: Promotion) {
  return p.discountUnit === "PERCENT" ? `${Number(p.value)}%` : `${Number(p.value).toLocaleString()} บาท`;
}

export default function PromotionsBanner({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) return null;

  const discountPromos = promotions.filter((p) => p.type === "DISCOUNT");
  const giftPromos = promotions.filter((p) => p.type === "GIFT");

  return (
    <div className="mb-8 rounded-2xl border border-gold-200 bg-gold-50 p-5 sm:p-6">
      <h2 className="font-heading text-lg font-semibold text-pitch-900">โปรโมชั่นพิเศษตอนนี้</h2>
      <p className="mt-1 text-sm text-neutral-600">
        กรอกโค้ดด้านล่างในขั้นตอนชำระเงินเพื่อรับสิทธิ์
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {discountPromos.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-pitch-800">โค้ดส่วนลด</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {discountPromos.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-xl border border-pitch-200 bg-white px-4 py-2"
                >
                  <span className="rounded-md bg-pitch-50 px-2 py-1 font-mono text-sm font-bold text-pitch-800">
                    {p.code}
                  </span>
                  <span className="text-sm text-neutral-700">
                    ลด {discountLabel(p)} · ใช้ได้ถึง {formatThaiDate(p.validTo)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {giftPromos.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-pitch-800">โปรโมชั่นของแถม</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {giftPromos.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-xl border border-pitch-200 bg-white px-4 py-2"
                >
                  <span className="rounded-md bg-pitch-50 px-2 py-1 font-mono text-sm font-bold text-pitch-800">
                    {p.code}
                  </span>
                  <span className="text-sm text-neutral-700">
                    รับ{p.giftItem}ฟรี · สมัครก่อน {formatThaiDate(p.validTo)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
