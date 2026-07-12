import { z } from "zod";

export const LEAD_SOURCE_OPTIONS = ["เพื่อนแนะนำ", "Facebook", "Google", "Instagram", "Walk-in", "อื่นๆ"] as const;

export const guardianSchema = z.object({
  name: z.string().min(2, { error: "กรุณากรอกชื่อ-นามสกุล" }),
  phone: z
    .string()
    .min(1, { error: "กรุณากรอกเบอร์โทรศัพท์" })
    .regex(/^0[0-9]{8,9}$/, { error: "เบอร์โทรศัพท์ไม่ถูกต้อง" }),
  email: z.email({ error: "กรุณากรอกอีเมลให้ถูกต้อง" }),
  password: z.string().min(8, { error: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" }),
  leadSource: z.string().min(1, { error: "กรุณาเลือกว่ารู้จักเราจากไหน" }),
  referrerName: z.string().optional(),
});

export const studentSchema = z.object({
  name: z.string().min(2, { error: "กรุณากรอกชื่อ-นามสกุลนักเรียน" }),
  dob: z.string().min(1, { error: "กรุณาเลือกวันเกิด" }),
  level: z.string().optional(),
});

export const registrationSchema = z.object({
  courseId: z.string().min(1, { error: "กรุณาเลือกคอร์ส" }),
  batchId: z.string().min(1, { error: "กรุณาเลือกรุ่น" }),
  guardian: guardianSchema,
  students: z.array(studentSchema).min(1, { error: "กรุณากรอกข้อมูลนักเรียนอย่างน้อย 1 คน" }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type GuardianInput = z.infer<typeof guardianSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
