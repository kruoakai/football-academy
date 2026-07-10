import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("Seeding dev data (test credentials — do not use in production)...");

  const admin = await prisma.user.upsert({
    where: { email: "admin@yinphan.dev" },
    update: {},
    create: {
      name: "ผู้ดูแลระบบ",
      email: "admin@yinphan.dev",
      passwordHash: await hash("Admin123!"),
      role: "ADMIN",
    },
  });

  const coachUser = await prisma.user.upsert({
    where: { email: "coach@yinphan.dev" },
    update: {},
    create: {
      name: "ภานุวัฒน์ ยินผัน",
      email: "coach@yinphan.dev",
      passwordHash: await hash("Coach123!"),
      role: "COACH",
    },
  });

  const coach = await prisma.coach.upsert({
    where: { userId: coachUser.id },
    update: {},
    create: {
      userId: coachUser.id,
      bio: "อดีตนักฟุตบอลทีมชาติไทย ติดทีมดาราเอเชีย (Asian All-Star) หลายสมัย",
      specialty: "เทคนิคการเล่นและการอ่านเกม",
    },
  });

  const coursesData = [
    { name: "เยาวชนเริ่มต้น", ageGroup: "6-9 ปี", level: "เริ่มต้น", price: 2500, day: "เสาร์", time: "09:00-10:30" },
    { name: "เยาวชนพัฒนา", ageGroup: "10-13 ปี", level: "ปานกลาง", price: 3000, day: "เสาร์", time: "11:00-12:30" },
    { name: "เยาวชนสู่ทีมชาติ", ageGroup: "14-18 ปี", level: "ขั้นสูง", price: 3500, day: "อาทิตย์", time: "09:00-11:00" },
  ];

  const now = new Date();
  const inThreeMonths = new Date(now);
  inThreeMonths.setMonth(inThreeMonths.getMonth() + 3);

  const batches = [];
  for (const c of coursesData) {
    let course = await prisma.course.findFirst({ where: { name: c.name } });
    if (!course) {
      course = await prisma.course.create({
        data: {
          name: c.name,
          ageGroup: c.ageGroup,
          level: c.level,
          description: `หลักสูตรฟุตบอลสำหรับช่วงวัย ${c.ageGroup}`,
          price: c.price,
        },
      });
    }

    let batch = await prisma.batch.findFirst({ where: { courseId: course.id } });
    if (!batch) {
      batch = await prisma.batch.create({
        data: {
          courseId: course.id,
          name: "รุ่น 1/2569",
          startDate: now,
          endDate: inThreeMonths,
          sessionTime: c.time,
        },
      });

      await prisma.courseSchedule.create({
        data: {
          courseId: course.id,
          batchId: batch.id,
          coachId: coach.id,
          day: c.day,
          time: c.time,
          venue: "สนามฝึกซ้อม ยินผัน ฟุตบอล อคาเดมี",
        },
      });
    }

    batches.push({ course, batch });
  }

  const clinicServices = [
    { name: "ประเมินร่างกายเบื้องต้น", description: "ตรวจประเมินสภาพร่างกายและความพร้อมก่อนฝึกซ้อม", price: 500, durationMin: 30 },
    { name: "นวดและยืดกล้ามเนื้อ", description: "ผ่อนคลายกล้ามเนื้อหลังการฝึกซ้อมหรือแข่งขัน", price: 600, durationMin: 45 },
    { name: "ฟื้นฟูอาการบาดเจ็บ", description: "กายภาพบำบัดสำหรับผู้ที่มีอาการบาดเจ็บจากการเล่นกีฬา", price: 800, durationMin: 60 },
  ];

  for (const s of clinicServices) {
    const existing = await prisma.clinicService.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.clinicService.create({ data: s });
    }
  }

  // Test guardian + student, already enrolled in the first batch, for quick manual testing
  const firstBatch = batches[0];
  const guardianUser = await prisma.user.upsert({
    where: { email: "parent@example.com" },
    update: {},
    create: {
      name: "ผู้ปกครองทดสอบ",
      email: "parent@example.com",
      phone: "0800000000",
      passwordHash: await hash("Parent123!"),
      role: "GUARDIAN",
    },
  });

  const guardian = await prisma.guardian.upsert({
    where: { userId: guardianUser.id },
    update: {},
    create: { userId: guardianUser.id },
  });

  const existingStudent = await prisma.student.findFirst({ where: { code: "YP-TEST01" } });
  const student =
    existingStudent ??
    (await prisma.student.create({
      data: {
        guardianId: guardian.id,
        code: "YP-TEST01",
        name: "เด็กชายทดสอบ ระบบ",
        dob: new Date("2016-05-01"),
        level: "เริ่มต้น",
        batchId: firstBatch.batch.id,
      },
    }));

  const existingEnrollment = await prisma.enrollment.findFirst({ where: { studentId: student.id } });
  if (!existingEnrollment) {
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: firstBatch.course.id,
        batchId: firstBatch.batch.id,
        status: "ACTIVE",
      },
    });
  }

  const existingActivity = await prisma.activity.findFirst({
    where: { batchId: firstBatch.batch.id, type: "PRACTICE" },
  });
  if (!existingActivity) {
    await prisma.activity.create({
      data: {
        name: "ฝึกซ้อมประจำสัปดาห์",
        type: "PRACTICE",
        batchId: firstBatch.batch.id,
        date: now,
        location: "สนามฝึกซ้อม ยินผัน ฟุตบอล อคาเดมี",
      },
    });
  }

  const inOneMonth = new Date(now);
  inOneMonth.setMonth(inOneMonth.getMonth() + 1);

  const existingPromo = await prisma.promotion.findUnique({ where: { code: "TEST10" } });
  if (!existingPromo) {
    await prisma.promotion.create({
      data: {
        code: "TEST10",
        type: "DISCOUNT",
        value: 10,
        discountUnit: "PERCENT",
        targetGroup: "ทดสอบระบบ",
        validFrom: now,
        validTo: inOneMonth,
        maxUses: 5,
      },
    });
  }

  await prisma.homePageContent.upsert({
    where: { id: "homepage" },
    update: {},
    create: { id: "homepage" },
  });

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: {},
    create: { id: "site" },
  });

  console.log("Seed complete.");
  console.log("Test accounts (dev only):");
  console.log("  admin:    admin@yinphan.dev / Admin123!");
  console.log("  coach:    coach@yinphan.dev / Coach123!");
  console.log("  guardian: parent@example.com / Parent123! (student code: YP-TEST01)");
  console.log("  promo code: TEST10 (10% off, max 5 uses)");
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
