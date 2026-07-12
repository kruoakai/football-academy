"use client";

import { useState } from "react";
import Image from "next/image";

const CATEGORY_TABS = [
  { value: "ASSESSMENT", label: "ตรวจประเมิน" },
  { value: "TREATMENT", label: "รักษาในคลินิก" },
  { value: "FIELD", label: "ดูแลข้างสนาม" },
] as const;

type Activity = {
  id: string;
  category: string;
  title: string;
  caption: string;
  imageUrl: string | null;
};

export default function ClinicActivitiesGrid({ activities }: { activities: Activity[] }) {
  const [activeTab, setActiveTab] = useState<(typeof CATEGORY_TABS)[number]["value"]>("ASSESSMENT");
  const filtered = activities.filter((a) => a.category === activeTab);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              activeTab === tab.value
                ? "bg-pitch-700 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          ยังไม่มีกิจกรรมในหมวดนี้
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-gold-400 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full">
                {activity.imageUrl ? (
                  <Image src={activity.imageUrl} alt={activity.title} fill unoptimized className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pitch-700 to-pitch-950">
                    <span className="font-heading text-2xl font-bold text-gold-400">YP</span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="font-heading text-lg font-semibold text-pitch-900">{activity.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-600">{activity.caption}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
