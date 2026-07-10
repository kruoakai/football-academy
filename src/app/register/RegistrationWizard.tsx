"use client";

import { useState } from "react";
import { useFieldArray, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, LEAD_SOURCE_OPTIONS, type RegistrationInput } from "./schema";
import { registerAction } from "./actions";

export type CourseOption = {
  id: string;
  name: string;
  ageGroup: string;
  level: string | null;
  price: number;
  batches: {
    id: string;
    name: string;
    sessionTime: string;
    schedules: { day: string; time: string; venue: string; coachName: string }[];
  }[];
};

const STEP_LABELS = ["เลือกคอร์ส", "ข้อมูลผู้ปกครอง", "ข้อมูลนักเรียน", "ยืนยันข้อมูล"];

const STEP_FIELDS: Record<number, Path<RegistrationInput>[]> = {
  0: ["courseId", "batchId"],
  1: ["guardian.name", "guardian.phone", "guardian.email", "guardian.password", "guardian.leadSource"],
  2: ["students"],
  3: [],
};

const inputClass =
  "mt-1 block min-h-[44px] w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-pitch-500 focus:outline-none focus:ring-1 focus:ring-pitch-500";
const labelClass = "block text-sm font-medium text-neutral-700";
const errorClass = "mt-1 text-sm text-red-600";

export default function RegistrationWizard({ courses }: { courses: CourseOption[] }) {
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      courseId: "",
      batchId: "",
      guardian: { name: "", phone: "", email: "", password: "", leadSource: "", referrerName: "" },
      students: [{ name: "", dob: "", level: "" }],
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "students" });

  const courseId = watch("courseId");
  const batchId = watch("batchId");
  const leadSource = watch("guardian.leadSource");
  const selectedCourse = courses.find((c) => c.id === courseId);

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: RegistrationInput) {
    setServerError(null);
    setSubmitting(true);
    const result = await registerAction(data);
    if (result?.error) {
      setServerError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-pitch-100 bg-white p-5 shadow-sm sm:p-8">
      {/* Progress */}
      <ol className="mb-8 grid grid-cols-4 gap-2">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex flex-col items-center gap-1 text-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                i <= step ? "bg-pitch-700 text-white" : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`hidden text-xs sm:block ${i === step ? "font-semibold text-pitch-800" : "text-neutral-400"}`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: course + batch */}
        <div className={step === 0 ? "flex flex-col gap-4" : "hidden"}>
          <h2 className="font-heading text-lg font-semibold text-pitch-900">เลือกคอร์สและรุ่น</h2>
          {courses.length === 0 && (
            <p className="text-sm text-neutral-500">ยังไม่มีคอร์สเปิดรับสมัครในขณะนี้</p>
          )}
          <div className="flex flex-col gap-3">
            {courses.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setValue("courseId", c.id, { shouldValidate: true });
                  setValue("batchId", c.batches[0]?.id ?? "", { shouldValidate: true });
                }}
                className={`min-h-[44px] rounded-xl border p-4 text-left transition ${
                  courseId === c.id
                    ? "border-gold-500 bg-gold-50"
                    : "border-neutral-200 hover:border-pitch-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-pitch-900">{c.name}</span>
                  <span className="text-sm font-medium text-gold-600">{c.price.toLocaleString()} บาท</span>
                </div>
                <p className="mt-1 text-sm text-neutral-600">
                  ช่วงอายุ {c.ageGroup} {c.level ? `· ระดับ${c.level}` : ""}
                </p>
              </button>
            ))}
          </div>

          {selectedCourse && selectedCourse.batches.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className={labelClass}>เลือกรุ่น</span>
              {selectedCourse.batches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setValue("batchId", b.id, { shouldValidate: true })}
                  className={`min-h-[44px] rounded-xl border p-3 text-left text-sm transition ${
                    batchId === b.id
                      ? "border-gold-500 bg-gold-50"
                      : "border-neutral-200 hover:border-pitch-300"
                  }`}
                >
                  <p className="font-medium text-pitch-900">{b.name}</p>
                  {b.schedules.map((s, i) => (
                    <p key={i} className="text-neutral-600">
                      {s.day} {s.time} น. · {s.venue} · โค้ช{s.coachName}
                    </p>
                  ))}
                </button>
              ))}
            </div>
          )}
          {(errors.courseId || errors.batchId) && (
            <p className={errorClass}>{errors.courseId?.message || errors.batchId?.message}</p>
          )}
        </div>

        {/* Step 1: guardian */}
        <div className={step === 1 ? "flex flex-col gap-4" : "hidden"}>
          <h2 className="font-heading text-lg font-semibold text-pitch-900">ข้อมูลผู้ปกครอง</h2>
          <div>
            <label className={labelClass} htmlFor="guardian.name">
              ชื่อ-นามสกุล
            </label>
            <input id="guardian.name" className={inputClass} {...register("guardian.name")} />
            {errors.guardian?.name && <p className={errorClass}>{errors.guardian.name.message}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="guardian.phone">
              เบอร์โทรศัพท์ (ใช้เข้าสู่ระบบ)
            </label>
            <input
              id="guardian.phone"
              inputMode="numeric"
              placeholder="08XXXXXXXX"
              className={inputClass}
              {...register("guardian.phone")}
            />
            {errors.guardian?.phone && <p className={errorClass}>{errors.guardian.phone.message}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="guardian.email">
              อีเมล (ไม่บังคับ)
            </label>
            <input id="guardian.email" type="email" className={inputClass} {...register("guardian.email")} />
            {errors.guardian?.email && <p className={errorClass}>{errors.guardian.email.message}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="guardian.password">
              ตั้งรหัสผ่าน
            </label>
            <input
              id="guardian.password"
              type="password"
              className={inputClass}
              {...register("guardian.password")}
            />
            {errors.guardian?.password && <p className={errorClass}>{errors.guardian.password.message}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="guardian.leadSource">
              รู้จักเราจากไหน
            </label>
            <select id="guardian.leadSource" className={inputClass} {...register("guardian.leadSource")}>
              <option value="" disabled>
                เลือกช่องทาง
              </option>
              {LEAD_SOURCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.guardian?.leadSource && <p className={errorClass}>{errors.guardian.leadSource.message}</p>}
          </div>
          {leadSource === "เพื่อนแนะนำ" && (
            <div>
              <label className={labelClass} htmlFor="guardian.referrerName">
                ชื่อผู้แนะนำ (ถ้าทราบ)
              </label>
              <input id="guardian.referrerName" className={inputClass} {...register("guardian.referrerName")} />
            </div>
          )}
        </div>

        {/* Step 2: students */}
        <div className={step === 2 ? "flex flex-col gap-5" : "hidden"}>
          <h2 className="font-heading text-lg font-semibold text-pitch-900">ข้อมูลนักเรียน</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-pitch-800">นักเรียนคนที่ {index + 1}</span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="min-h-[44px] px-2 text-sm text-red-600"
                  >
                    ลบ
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className={labelClass}>ชื่อ-นามสกุลนักเรียน</label>
                  <input className={inputClass} {...register(`students.${index}.name` as const)} />
                  {errors.students?.[index]?.name && (
                    <p className={errorClass}>{errors.students[index]?.name?.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>วันเกิด</label>
                  <input
                    type="date"
                    className={inputClass}
                    {...register(`students.${index}.dob` as const)}
                  />
                  {errors.students?.[index]?.dob && (
                    <p className={errorClass}>{errors.students[index]?.dob?.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>ระดับพื้นฐาน (ไม่บังคับ)</label>
                  <input className={inputClass} {...register(`students.${index}.level` as const)} />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ name: "", dob: "", level: "" })}
            className="min-h-[44px] rounded-full border border-pitch-300 px-4 py-2 text-sm font-medium text-pitch-700 hover:bg-pitch-50"
          >
            + เพิ่มบุตรหลานอีกคน
          </button>
        </div>

        {/* Step 3: review */}
        <div className={step === 3 ? "flex flex-col gap-4" : "hidden"}>
          <h2 className="font-heading text-lg font-semibold text-pitch-900">ตรวจสอบและยืนยัน</h2>
          <div className="rounded-xl bg-pitch-50 p-4 text-sm">
            <p className="font-medium text-pitch-900">
              {selectedCourse?.name} — {selectedCourse?.batches.find((b) => b.id === batchId)?.name}
            </p>
            <p className="mt-2 font-medium text-pitch-900">ผู้ปกครอง</p>
            <p>{watch("guardian.name")}</p>
            <p>{watch("guardian.phone")}</p>
            <p>
              รู้จักเราจาก: {watch("guardian.leadSource")}
              {watch("guardian.referrerName") ? ` (${watch("guardian.referrerName")})` : ""}
            </p>
            <p className="mt-2 font-medium text-pitch-900">นักเรียน</p>
            {watch("students").map((s, i) => (
              <p key={i}>
                {s.name} ({s.dob})
              </p>
            ))}
          </div>
          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
          )}
        </div>

        {/* Nav buttons */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="min-h-[44px] flex-1 rounded-full border border-neutral-300 px-6 py-3 text-base font-semibold text-neutral-700"
            >
              ย้อนกลับ
            </button>
          )}
          {step < STEP_LABELS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="min-h-[44px] flex-1 rounded-full bg-pitch-700 px-6 py-3 text-base font-semibold text-white hover:bg-pitch-800"
            >
              ถัดไป
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] flex-1 rounded-full bg-gold-500 px-6 py-3 text-base font-semibold text-pitch-950 hover:bg-gold-400 disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก..." : "ยืนยันและสมัคร"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
