import bcrypt from "bcryptjs";
import sharp from "sharp";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

// public/images/uploads/ is gitignored (runtime-generated, not committed source —
// same as every other admin-uploaded image in this app), so placeholder cover
// images must be generated here at seed-time rather than checked into git, or
// a fresh clone/deploy would seed rows pointing at files that don't exist.
async function ensureSeedCoverImage(
  filename: string,
  gradient: { from: string; to: string; accent: string },
  { subfolder = "articles", width = 1200, height = 630 }: { subfolder?: string; width?: number; height?: number } = {}
): Promise<string> {
  const dir = path.join(process.cwd(), "public", "images", "uploads", subfolder);
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  if (!existsSync(filePath)) {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${gradient.from}" />
            <stop offset="100%" stop-color="${gradient.to}" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#g)" />
        <circle cx="${width * 0.85}" cy="${height * 0.22}" r="${height * 0.35}" fill="${gradient.accent}" opacity="0.12" />
        <circle cx="${width * 0.1}" cy="${height * 0.9}" r="${height * 0.25}" fill="${gradient.accent}" opacity="0.10" />
        <rect x="0" y="0" width="14" height="${height}" fill="${gradient.accent}" />
      </svg>
    `;
    await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(filePath);
  }
  return `/images/uploads/${subfolder}/${filename}`;
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

  // Placeholder content for the /clinic "กิจกรรมคลินิกกายภาพและการบำบัดภาคสนาม"
  // section — no real photos yet, admin replaces text/images via
  // /admin/clinic-activities later. imageUrl left null so the public page
  // renders its built-in placeholder tile instead of a broken image.
  const clinicActivities: {
    category: "ASSESSMENT" | "TREATMENT" | "FIELD";
    title: string;
    caption: string;
  }[] = [
    {
      category: "FIELD",
      title: "ตรวจร่างกายก่อนลงสนาม",
      caption: "ประเมินความพร้อมของร่างกายนักกีฬาก่อนเริ่มฝึกซ้อมหรือแข่งขันทุกครั้ง เพื่อลดความเสี่ยงการบาดเจ็บ",
    },
    {
      category: "FIELD",
      title: "ปฐมพยาบาลข้างสนามทันที",
      caption: "ทีมนักกายภาพบำบัดพร้อมดูแลอาการบาดเจ็บเฉียบพลันข้างสนามได้ทันที ไม่ต้องรอเข้าคลินิก",
    },
    {
      category: "FIELD",
      title: "ยืดเหยียดและวอร์มอัพ",
      caption: "แนะนำท่ายืดเหยียดและวอร์มอัพที่ถูกต้องก่อน-หลังฝึกซ้อม เพื่อเตรียมกล้ามเนื้อให้พร้อมใช้งาน",
    },
    {
      category: "FIELD",
      title: "ติดตามอาการระหว่างฝึกซ้อม",
      caption: "สังเกตและติดตามอาการนักกีฬาระหว่างการฝึกซ้อมอย่างใกล้ชิด เพื่อป้องกันการบาดเจ็บซ้ำ",
    },
    {
      category: "ASSESSMENT",
      title: "ประเมินความยืดหยุ่นของกล้ามเนื้อ",
      caption: "ตรวจวัดระยะการเคลื่อนไหวของข้อต่อและความยืดหยุ่นของกล้ามเนื้อ เพื่อวางแผนการฝึกที่เหมาะสม",
    },
    {
      category: "ASSESSMENT",
      title: "วิเคราะห์ท่าทางการเคลื่อนไหว",
      caption: "วิเคราะห์ท่าวิ่งและท่าทางการเล่นฟุตบอล เพื่อหาจุดที่อาจนำไปสู่การบาดเจ็บในระยะยาว",
    },
    {
      category: "ASSESSMENT",
      title: "ประเมินความแข็งแรงของกล้ามเนื้อ",
      caption: "ทดสอบความแข็งแรงของกล้ามเนื้อมัดหลักที่ใช้ในการเล่นฟุตบอล เพื่อออกแบบโปรแกรมเสริมสร้างที่ตรงจุด",
    },
    {
      category: "ASSESSMENT",
      title: "ประเมินความพร้อมกลับสู่สนาม",
      caption: "ตรวจประเมินความพร้อมของนักกีฬาที่เพิ่งฟื้นตัวจากอาการบาดเจ็บ ก่อนอนุญาตให้กลับมาฝึกซ้อมเต็มรูปแบบ",
    },
    {
      category: "TREATMENT",
      title: "นวดผ่อนคลายกล้ามเนื้อ",
      caption: "นวดคลายกล้ามเนื้อที่ตึงเครียดจากการฝึกซ้อมหนัก ช่วยให้ฟื้นตัวได้เร็วขึ้น",
    },
    {
      category: "TREATMENT",
      title: "กายภาพบำบัดด้วยเครื่องมือ",
      caption: "ใช้เครื่องมือกายภาพบำบัดทางการแพทย์ช่วยลดอาการปวดและอักเสบของกล้ามเนื้อและข้อต่อ",
    },
    {
      category: "TREATMENT",
      title: "ฟื้นฟูอาการบาดเจ็บข้อเท้า",
      caption: "โปรแกรมฟื้นฟูเฉพาะทางสำหรับอาการบาดเจ็บข้อเท้า ซึ่งพบบ่อยที่สุดในนักฟุตบอล",
    },
    {
      category: "TREATMENT",
      title: "โปรแกรมฟื้นฟูหลังผ่าตัด",
      caption: "ดูแลและออกแบบโปรแกรมฟื้นฟูร่างกายทีละขั้นตอนสำหรับนักกีฬาที่ผ่านการผ่าตัด จนกลับมาเล่นได้เต็มร้อย",
    },
  ];

  const nextSortOrderByCategory: Record<string, number> = {};
  for (const a of clinicActivities) {
    const sortOrder = nextSortOrderByCategory[a.category] ?? 0;
    nextSortOrderByCategory[a.category] = sortOrder + 1;

    const existing = await prisma.clinicActivity.findFirst({
      where: { category: a.category, title: a.title },
    });
    if (!existing) {
      await prisma.clinicActivity.create({
        data: { category: a.category, title: a.title, caption: a.caption, sortOrder },
      });
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

  const articleSeeds = [
    {
      slug: "pre-match-nutrition",
      title: "5 อาหารที่นักฟุตบอลเยาวชนควรกินก่อนแข่ง",
      excerpt: "เลือกอาหารให้ถูกก่อนลงสนาม ช่วยให้ลูกมีพลังงานเต็มที่ตลอดเกม",
      cover: "seed-pre-match-nutrition.jpg",
      gradient: { from: "#0d5f3a", to: "#093c27", accent: "#d4a017" },
      content: `## กินอย่างไรให้พร้อมก่อนลงสนาม

การเตรียมร่างกายด้วยอาหารที่เหมาะสมก่อนแข่งขันมีผลต่อพลังงานและสมาธิของนักเรียนตลอดเกม ต่อไปนี้คือ 5 กลุ่มอาหารที่แนะนำ

1. **คาร์โบไฮเดรตเชิงซ้อน** เช่น ข้าวกล้อง ขนมปังโฮลวีต ให้พลังงานที่ค่อยๆ ปลดปล่อยตลอดการแข่งขัน
2. **โปรตีนย่อยง่าย** เช่น ไข่ต้ม อกไก่ย่าง ช่วยซ่อมแซมกล้ามเนื้อ
3. **ผลไม้สด** เช่น กล้วย ส้ม ให้วิตามินและน้ำตาลธรรมชาติ
4. **น้ำเปล่า** ดื่มให้เพียงพอตั้งแต่ 2-3 ชั่วโมงก่อนแข่ง หลีกเลี่ยงน้ำอัดลม
5. **หลีกเลี่ยงอาหารมันและย่อยยาก** อย่างของทอดหรืออาหารรสจัด เพราะอาจทำให้อึดอัดขณะเล่น

ควรกินมื้อหลักก่อนแข่ง 2-3 ชั่วโมง และเว้นช่วงว่างให้ร่างกายย่อยอาหารก่อนลงสนาม`,
    },
    {
      slug: "choosing-football-boots",
      title: "วิธีเลือกรองเท้าฟุตบอลให้เหมาะกับเด็ก",
      excerpt: "รองเท้าที่ใช่ช่วยลดการบาดเจ็บและเพิ่มความมั่นใจให้นักเตะตัวน้อย",
      cover: "seed-choosing-football-boots.jpg",
      gradient: { from: "#14532d", to: "#052e16", accent: "#e8ac2e" },
      content: `## เลือกรองเท้าให้เหมาะกับพื้นสนามและวัย

รองเท้าฟุตบอลที่เหมาะสมช่วยลดความเสี่ยงบาดเจ็บและทำให้เล่นได้เต็มประสิทธิภาพ

- **สนามหญ้าจริง** ใช้ปุ่มยาง (FG) ยึดเกาะดี
- **สนามหญ้าเทียม** ใช้ปุ่มเล็กแบบ (AG/TF) ป้องกันข้อเท้าพลิก
- **ขนาดพอดี** เหลือช่องว่างปลายเท้าประมาณ 0.5-1 ซม. ไม่คับหรือหลวมเกินไป
- **เนื้อวัสดุ** สำหรับเด็กเล็กแนะนำวัสดุสังเคราะห์ที่ยืดหยุ่นและระบายอากาศได้ดี

ควรพาลูกไปลองรองเท้าด้วยตัวเองทุกครั้ง เพราะขนาดเท้าของเด็กเปลี่ยนแปลงเร็ว และควรเปลี่ยนรองเท้าใหม่เมื่อเริ่มคับหรือปุ่มสึก`,
    },
    {
      slug: "injury-prevention-basics",
      title: "ป้องกันการบาดเจ็บที่พบบ่อยในนักฟุตบอลเยาวชน",
      excerpt: "อาการบาดเจ็บส่วนใหญ่ป้องกันได้ ด้วยการวอร์มอัพและเทคนิคที่ถูกต้อง",
      cover: "seed-injury-prevention-basics.jpg",
      gradient: { from: "#166534", to: "#0d3320", accent: "#f0c040" },
      content: `## รู้ทันการบาดเจ็บ ป้องกันได้ก่อนเกิด

การบาดเจ็บที่พบบ่อยในนักฟุตบอลเยาวชน ได้แก่ ข้อเท้าพลิก กล้ามเนื้อต้นขาอักเสบ และหัวเข่าบาดเจ็บ ซึ่งส่วนใหญ่ป้องกันได้

### สาเหตุหลัก
- วอร์มอัพไม่เพียงพอก่อนฝึกซ้อมหรือแข่งขัน
- กล้ามเนื้อตึงหรืออ่อนแรงจากการฝึกหนักเกินไป
- เทคนิคการรับ-ส่งบอลหรือการล้มที่ไม่ถูกต้อง

### วิธีป้องกัน
1. วอร์มอัพและยืดกล้ามเนื้อทุกครั้งก่อนเล่น อย่างน้อย 10-15 นาที
2. ฝึกความแข็งแรงของกล้ามเนื้อรอบข้อเท้าและเข่าอย่างสม่ำเสมอ
3. พักผ่อนให้เพียงพอ ไม่ฝึกหนักติดต่อกันหลายวัน
4. หากมีอาการเจ็บผิดปกติ ควรปรึกษาทีมกายภาพบำบัดทันที ไม่ควรฝืนเล่นต่อ

ทีมนักกายภาพบำบัดของสถาบันพร้อมให้คำแนะนำและตรวจประเมินอาการเบื้องต้นให้นักเรียนทุกคน`,
    },
    {
      slug: "football-builds-confidence",
      title: "สร้างวินัยและความมั่นใจให้ลูกผ่านฟุตบอล",
      excerpt: "ฟุตบอลไม่ได้สอนแค่ทักษะการเล่น แต่ยังปลูกฝังวินัยและความมั่นใจในตัวเอง",
      cover: "seed-football-builds-confidence.jpg",
      gradient: { from: "#0f5132", to: "#062818", accent: "#d4a017" },
      content: `## มากกว่าทักษะลูกหนัง คือบทเรียนชีวิต

การฝึกฟุตบอลอย่างต่อเนื่องช่วยปลูกฝังคุณสมบัติสำคัญให้เด็กนอกเหนือจากทักษะการเล่น

- **วินัย** การฝึกซ้อมตรงเวลาและสม่ำเสมอสร้างความรับผิดชอบ
- **การทำงานเป็นทีม** เรียนรู้การสื่อสารและพึ่งพากันในสนาม
- **ความมั่นใจ** ความสำเร็จเล็กๆ จากการฝึกซ้อมสะสมเป็นความเชื่อมั่นในตัวเอง
- **การจัดการความผิดหวัง** เรียนรู้ที่จะลุกขึ้นใหม่หลังพ่ายแพ้

ผู้ปกครองมีบทบาทสำคัญในการให้กำลังใจ ไม่กดดันผลแพ้ชนะมากเกินไป และชื่นชมความพยายามของลูกในทุกๆ ก้าว`,
    },
    {
      slug: "tryout-preparation-guide",
      title: "เตรียมตัวอย่างไรก่อนวันทดสอบเข้าทีม",
      excerpt: "เคล็ดลับเตรียมตัวทั้งร่างกายและจิตใจก่อนวันทดสอบฝีเท้าที่สำคัญ",
      cover: "seed-tryout-preparation-guide.jpg",
      gradient: { from: "#0d5f3a", to: "#04140d", accent: "#e8ac2e" },
      content: `## พร้อมทั้งกายและใจก่อนวันสำคัญ

วันทดสอบฝีเท้าเป็นโอกาสสำคัญที่ต้องเตรียมตัวล่วงหน้า ทั้งด้านร่างกายและจิตใจ

### เตรียมร่างกาย
- นอนหลับให้เพียงพออย่างน้อย 7-8 ชั่วโมงก่อนวันทดสอบ
- ฝึกซ้อมเบาๆ ในสัปดาห์สุดท้าย หลีกเลี่ยงการฝึกหนักจนเกินไป
- เตรียมอุปกรณ์ให้พร้อม ทั้งรองเท้า สนับแข้ง และเสื้อผ้าที่ระบายอากาศได้ดี

### เตรียมใจ
- ตั้งเป้าหมายที่ทำได้จริง เช่น เล่นเต็มที่ตามความสามารถ ไม่กดดันตัวเองมากเกินไป
- ฝึกหายใจลึกๆ เพื่อคลายความตื่นเต้นก่อนลงสนาม
- จำไว้ว่าโค้ชมองหาพัฒนาการและทัศนคติ ไม่ใช่แค่ความเก่งเพียงอย่างเดียว

มาถึงก่อนเวลาอย่างน้อย 30 นาที เพื่อวอร์มอัพร่างกายให้พร้อมก่อนเริ่มทดสอบ`,
    },
  ];

  for (let i = 0; i < articleSeeds.length; i++) {
    const seed = articleSeeds[i];
    const coverImage = await ensureSeedCoverImage(seed.cover, seed.gradient);
    const publishedAt = new Date(now.getTime() - (articleSeeds.length - i) * 3 * 24 * 60 * 60 * 1000);

    await prisma.article.upsert({
      where: { slug: seed.slug },
      update: {},
      create: {
        slug: seed.slug,
        title: seed.title,
        excerpt: seed.excerpt,
        content: seed.content,
        coverImage,
        authorId: admin.id,
        published: true,
        publishedAt,
      },
    });
  }

  // Hero tile URLs have no schema @default() (they're nullable so an admin
  // can clear them), so a bare upsert leaves them NULL — hasHeroMedia() in
  // src/app/page.tsx then reports false and the whole video+tile section
  // falls back to the old 3-chip layout instead of showing placeholder
  // tiles. Seed real working images: 2 generated gradient placeholders
  // (no matching real photo exists yet) + 2 reused real committed photos
  // where the subject genuinely matches the tile's label.
  const heroTile1Url = await ensureSeedCoverImage(
    "hero-tile-1-training.jpg",
    { from: "#0d3d2a", to: "#145c3f", accent: "#e8ac2e" },
    { subfolder: "home", width: 800, height: 600 }
  );
  const heroTile2Url = await ensureSeedCoverImage(
    "hero-tile-2-match.jpg",
    { from: "#123a52", to: "#1c5a80", accent: "#e8ac2e" },
    { subfolder: "home", width: 800, height: 600 }
  );
  const heroTile3Url = "/images/clinic-training.jpg";
  const heroTile4Url = "/images/panuwat-founder.jpg";

  const existingHomeContent = await prisma.homePageContent.findUnique({ where: { id: "homepage" } });
  if (!existingHomeContent) {
    await prisma.homePageContent.create({
      data: { id: "homepage", heroTile1Url, heroTile2Url, heroTile3Url, heroTile4Url },
    });
  } else {
    // Only backfill tiles the admin hasn't touched (still NULL) — never
    // overwrite a real uploaded photo or an intentional removal.
    await prisma.homePageContent.update({
      where: { id: "homepage" },
      data: {
        ...(existingHomeContent.heroTile1Url ? {} : { heroTile1Url }),
        ...(existingHomeContent.heroTile2Url ? {} : { heroTile2Url }),
        ...(existingHomeContent.heroTile3Url ? {} : { heroTile3Url }),
        ...(existingHomeContent.heroTile4Url ? {} : { heroTile4Url }),
      },
    });
  }

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
