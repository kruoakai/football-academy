import "server-only";
import { prisma } from "@/lib/prisma";

export async function getPublishedClinicActivities() {
  return prisma.clinicActivity.findMany({
    where: { published: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
}
