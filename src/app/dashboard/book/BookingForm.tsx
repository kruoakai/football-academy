"use client";

import { useActionState, useMemo, useState } from "react";
import { createBookingAction } from "./actions";

export type StudentOption = {
  id: string;
  name: string;
  schedules: { id: string; day: string; time: string; venue: string; courseName: string; coachName: string }[];
};

export type ClinicServiceOption = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMin: number;
};

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const inputClass =
  "mt-1 block min-h-[44px] w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500";
const labelClass = "block text-sm font-medium text-neutral-700";

export default function BookingForm({
  students,
  clinicServices,
  defaultStudentId,
}: {
  students: StudentOption[];
  clinicServices: ClinicServiceOption[];
  defaultStudentId?: string;
}) {
  const [state, action, pending] = useActionState(createBookingAction, undefined);
  const [studentId, setStudentId] = useState(defaultStudentId ?? students[0]?.id ?? "");
  const [type, setType] = useState<"ACADEMY" | "CLINIC">("ACADEMY");
  const [scheduleId, setScheduleId] = useState("");
  const [clinicServiceId, setClinicServiceId] = useState("");

  const selectedStudent = students.find((s) => s.id === studentId);
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  return (
    <form action={action} className="flex flex-col gap-5 rounded-2xl border border-pitch-100 bg-white p-5 shadow-sm sm:p-8">
      <div>
        <label className={labelClass} htmlFor="studentId">
          เลือกนักเรียน
        </label>
        <select
          id="studentId"
          name="studentId"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className={inputClass}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={labelClass}>ประเภทการจอง</span>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType("ACADEMY")}
            className={`min-h-[44px] rounded-xl border px-4 py-2 text-sm font-medium ${
              type === "ACADEMY" ? "border-gold-500 bg-gold-50 text-pitch-900" : "border-neutral-200 text-neutral-600"
            }`}
          >
            ฝึกซ้อมฟุตบอล
          </button>
          <button
            type="button"
            onClick={() => setType("CLINIC")}
            className={`min-h-[44px] rounded-xl border px-4 py-2 text-sm font-medium ${
              type === "CLINIC" ? "border-gold-500 bg-gold-50 text-pitch-900" : "border-neutral-200 text-neutral-600"
            }`}
          >
            คลินิกกายภาพ
          </button>
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      {type === "ACADEMY" ? (
        <div>
          <span className={labelClass}>เลือกตารางฝึกซ้อม</span>
          {!selectedStudent || selectedStudent.schedules.length === 0 ? (
            <p className="mt-1 text-sm text-neutral-500">นักเรียนคนนี้ยังไม่มีตารางฝึกซ้อม (ต้องลงทะเบียนคอร์สก่อน)</p>
          ) : (
            <div className="mt-1 flex flex-col gap-2">
              {selectedStudent.schedules.map((sch) => (
                <label
                  key={sch.id}
                  className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${
                    scheduleId === sch.id ? "border-gold-500 bg-gold-50" : "border-neutral-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="scheduleId"
                    value={sch.id}
                    checked={scheduleId === sch.id}
                    onChange={() => setScheduleId(sch.id)}
                  />
                  <span>
                    {sch.courseName} · วัน{sch.day} {sch.time} น. · {sch.venue} · โค้ช{sch.coachName}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="mt-3">
            <label className={labelClass} htmlFor="date">
              วันที่ต้องการจอง (ต้องตรงกับวันตามตาราง)
            </label>
            <input id="date" name="date" type="date" min={todayStr} required className={inputClass} />
          </div>
        </div>
      ) : (
        <div>
          <span className={labelClass}>เลือกบริการคลินิก</span>
          <div className="mt-1 flex flex-col gap-2">
            {clinicServices.map((c) => (
              <label
                key={c.id}
                className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${
                  clinicServiceId === c.id ? "border-gold-500 bg-gold-50" : "border-neutral-200"
                }`}
              >
                <input
                  type="radio"
                  name="clinicServiceId"
                  value={c.id}
                  checked={clinicServiceId === c.id}
                  onChange={() => setClinicServiceId(c.id)}
                />
                <span>
                  {c.name} · {c.durationMin} นาที · {c.price.toLocaleString()} บาท
                </span>
              </label>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="date-clinic">
                วันที่
              </label>
              <input id="date-clinic" name="date" type="date" min={todayStr} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="time">
                เวลา
              </label>
              <select id="time" name="time" required className={inputClass} defaultValue="">
                <option value="" disabled>
                  เลือกเวลา
                </option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t} น.
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="min-h-[44px] rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-pitch-950 hover:bg-gold-400 disabled:opacity-60"
      >
        {pending ? "กำลังจอง..." : "ยืนยันการจอง"}
      </button>
    </form>
  );
}
