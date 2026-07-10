import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "คลินิกกายภาพ | ยินผัน ฟุตบอล อคาเดมี",
  description:
    "บริการคลินิกกายภาพบำบัดและฟื้นฟูอาการบาดเจ็บสำหรับนักกีฬา ดูแลโดยนักกายภาพบำบัดมืออาชีพประจำสถาบัน",
};

export const dynamic = "force-dynamic";

export default async function ClinicPage() {
  const services = await prisma.clinicService.findMany({ orderBy: { price: "asc" } });

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-pitch-900 via-pitch-800 to-pitch-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="inline-block rounded-full bg-gold-500/15 px-4 py-1 text-sm font-medium text-gold-300">
            คลินิกกายภาพ
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-heading text-3xl font-bold leading-tight sm:text-4xl">
            ดูแลฟื้นฟูโดยนักกายภาพบำบัดมืออาชีพ
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/80">
            อดีตนักกายภาพบำบัดประจำทีมฟุตบอลหลายทีม ดูแลตั้งแต่การประเมินร่างกายก่อนฝึกซ้อม
            ไปจนถึงการฟื้นฟูอาการบาดเจ็บจากการเล่นกีฬา
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            ยังไม่มีบริการคลินิกเปิดให้บริการในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-gold-400 hover:shadow-md"
              >
                <h2 className="font-heading text-lg font-bold text-pitch-900">{service.name}</h2>
                {service.description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{service.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <span className="text-xs text-neutral-500">ใช้เวลาประมาณ {service.durationMin} นาที</span>
                  <span className="text-lg font-bold text-gold-600">
                    {Number(service.price).toLocaleString()} บาท
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-pitch-50 p-8 text-center sm:p-10">
          <h2 className="font-heading text-xl font-bold text-pitch-900">ต้องการนัดหมายคลินิก?</h2>
          <p className="max-w-xl text-sm text-neutral-600">
            สมัครสมาชิกเพื่อจองคิวคลินิกกายภาพผ่านระบบออนไลน์ หรือติดต่อทีมงานโดยตรง
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="flex min-h-[44px] items-center justify-center rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-pitch-950 shadow-sm transition hover:bg-gold-400"
            >
              สมัครสมาชิก
            </Link>
            <Link
              href="/contact"
              className="flex min-h-[44px] items-center justify-center rounded-full border border-pitch-300 px-6 py-3 text-sm font-semibold text-pitch-800 transition hover:bg-white"
            >
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
