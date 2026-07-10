"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { isForeignKeyError } from "@/lib/prisma-errors";

const serviceSchema = z.object({
  name: z.string().min(2, { error: "กรุณากรอกชื่อบริการ" }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { error: "ราคาต้องไม่ติดลบ" }),
  durationMin: z.coerce.number().int().min(5, { error: "ระยะเวลาต้องอย่างน้อย 5 นาที" }),
});

export type ClinicServiceFormState = { error?: string } | undefined;

export async function createClinicServiceAction(
  _prevState: ClinicServiceFormState,
  formData: FormData
): Promise<ClinicServiceFormState> {
  await requireRole(["ADMIN"]);
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const service = await prisma.clinicService.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      durationMin: parsed.data.durationMin,
    },
  });

  revalidatePath("/admin/clinic-services");
  redirect(`/admin/clinic-services/${service.id}`);
}

export async function updateClinicServiceAction(
  serviceId: string,
  _prevState: ClinicServiceFormState,
  formData: FormData
): Promise<ClinicServiceFormState> {
  await requireRole(["ADMIN"]);
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await prisma.clinicService.update({
    where: { id: serviceId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      durationMin: parsed.data.durationMin,
    },
  });

  revalidatePath("/admin/clinic-services");
  revalidatePath(`/admin/clinic-services/${serviceId}`);
  redirect("/admin/clinic-services");
}

export async function deleteClinicServiceAction(serviceId: string) {
  await requireRole(["ADMIN"]);
  try {
    await prisma.clinicService.delete({ where: { id: serviceId } });
  } catch (error) {
    if (isForeignKeyError(error)) {
      redirect("/admin/clinic-services?error=ลบไม่ได้ เพราะมีการจองหรือประวัติผูกกับบริการนี้อยู่");
    }
    throw error;
  }
  revalidatePath("/admin/clinic-services");
  redirect("/admin/clinic-services");
}
