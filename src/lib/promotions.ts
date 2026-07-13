import "server-only";
import { prisma } from "@/lib/prisma";

export async function getActivePromotions() {
  const now = new Date();
  const promotions = await prisma.promotion.findMany({
    where: { active: true, validFrom: { lte: now }, validTo: { gte: now } },
    orderBy: { validTo: "asc" },
  });

  // maxUses/giftStock exhaustion can't be expressed as a single Prisma where
  // clause (comparing two columns), so filter it in JS after the DB query.
  return promotions.filter((p) => {
    if (p.maxUses !== null && p.usedCount >= p.maxUses) return false;
    if (p.type === "GIFT" && (p.giftStock === null || p.giftStock <= 0)) return false;
    return true;
  });
}
