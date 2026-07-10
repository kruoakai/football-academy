# Football Academy System — ยินผัน ฟุตบอล อคาเดมี

## ภาพรวมธุรกิจ

เจ้าของ/ผู้ก่อตั้ง: ภานุวัฒน์ ยินผัน อดีตนักฟุตบอลทีมชาติไทย ติดทีมดาราเอเชีย (Asian All-Star) หลายสมัย
ผู้ร่วมก่อตั้ง (ภรรยา/แฟน): อดีตนักกายภาพบำบัดประจำทีมฟุตบอลหลายทีม ดูแลคลินิกกายภาพ/ฟื้นฟูของสถาบัน

จุดขายหลัก (USP): สถาบันฟุตบอลที่ดำเนินงานโดยคู่ครองที่เชี่ยวชาญคนละด้าน — "สอนโดยอดีตนักเตะทีมชาติ" ผสาน "ฟื้นฟูโดยนักกายภาพมืออาชีพ" ในที่เดียว จุดนี้ต้องสะท้อนใน UI/UX และ copy ทั่วทั้งระบบ (เช่น หน้า About ต้องมีทั้งสองคน ไม่ใช่แค่เจ้าของคนเดียว)

## โมดูลของระบบ (6 ส่วน — ดูรายละเอียดแต่ละอันก่อนเริ่มงานส่วนนั้น)

1. เว็บไซต์แนะนำสถาบัน (public site: home, about, courses, clinic, gallery, blog, contact)
2. ระบบสมาชิก/นักเรียน (registration แบบ multi-step + QR/LINE, batch/cohort, parent portal, student dashboard)
3. ระบบจอง/นัดหมาย (booking คอร์ส+คลินิก, ปฏิทิน, แจ้งเตือน LINE, payment, ยกเลิก/เลื่อนนัด)
4. ระบบหลังบ้าน (จัดการคอร์ส/โค้ช/ตาราง/นักเรียน/การเงิน/medical records, CMS, roles)
5. การตลาด (SEO, referral, ระบบโปรโมชั่น/ของแถม/คูปอง ตั้งค่าได้จากหลังบ้าน, LINE/email automation, testimonials)
6. ระบบรายงาน (รายงานผู้สมัคร/ตารางนัดหมาย/รายรุ่น, เช็คชื่อ QR, export Excel/CSV/PDF)

## Tech Stack — ใช้ตามนี้เท่านั้น ห้ามเปลี่ยนโดยไม่ถาม

- Frontend: Next.js (React) + Tailwind CSS
- Backend: Next.js API Routes (แยกเป็น NestJS เฉพาะถ้าระบบใหญ่จริงและมีการหารือก่อน)
- Database: PostgreSQL
- Auth: NextAuth.js / Clerk (role-based access)
- Payment: Omise หรือ 2C2P (ต้องรองรับ PromptPay)
- แจ้งเตือน: LINE Messaging API
- Hosting: Vercel (frontend) + Railway/Render (DB+backend)

## Data Model (concept — ปรับ field เพิ่มได้ตามงานจริง แต่โครงหลักให้ยึดตามนี้)

```
users (id, name, role, email, phone, password_hash, lead_source)
students (id, user_id, dob, level, guardian_id, injury_history, batch_id)
guardians (id, user_id)
coaches (id, user_id, bio, specialty)
courses (id, name, age_group, level, description, price)
batches (id, course_id, name, start_date, end_date, session_time)
course_schedules (id, course_id, batch_id, coach_id, day, time, venue)
enrollments (id, student_id, course_id, batch_id, status, start_date)
bookings (id, type[academy|clinic], student_id, schedule_id, status)
activities (id, name, type[practice|match|camp|assessment|clinic_group], batch_id, date, location)
attendance (id, student_id, activity_id, status[present|absent|late], checked_by, checked_at, method[qr|manual])
clinic_services (id, name, description, price, duration)
injury_records (id, student_id, service_id, diagnosis, treatment_notes, date)
payments (id, user_id, amount, method, status, related_booking_id)
articles (id, title, content, cover_image, published_at)
testimonials (id, student_id, quote, photo, approved)
promotions (id, code, type[discount|gift], value, gift_item, gift_stock, target_group, valid_from, valid_to, max_uses)
```

## กติกาการออกแบบ/เขียนโค้ด — บังคับใช้ทุกหน้า

- ทุกหน้าต้อง responsive แบบ mobile-first: breakpoint mobile < 640px, tablet 640–1024px, desktop > 1024px
- Mobile ใช้ bottom navigation สำหรับ dashboard นักเรียน/ผู้ปกครอง, Desktop ใช้ sidebar สำหรับหลังบ้านแอดมิน
- ใช้ Tailwind responsive utilities (`sm: md: lg:`) ทุกหน้า ห้ามเขียน media query เอง
- รูปภาพใช้ `next/image` พร้อม responsive sizes เสมอ
- ฟอร์มจอง/ลงทะเบียนต้องใช้งานง่ายบนมือถือ (touch target ≥ 44px)
- ข้อมูลการรักษา/บาดเจ็บ (`injury_records`) ต้องจำกัดสิทธิ์การเข้าถึงเข้มงวดตาม PDPA — ห้าม expose ผ่าน public API หรือ role ที่ไม่เกี่ยวข้อง
- แบรนด์: ยินผัน ฟุตบอล อคาเดมี, tagline "สอนโดยทีมชาติ ฟื้นฟูโดยมืออาชีพ", โทนสีเขียวสนาม (pitch green) + ทอง (gold accent), ฟอนต์ Kanit (หัวข้อ) + Sarabun (เนื้อหา)

## Roadmap — ทำทีละ Phase เท่านั้น ห้ามข้ามไปทำ Phase ถัดไปเองโดยไม่ถาม

1. **Phase 1:** Marketing site (ทุกหน้า public) + ฟอร์มสมัครออนไลน์/QR/LINE + ระบบรุ่น (batch)
2. **Phase 2:** ระบบจอง + ชำระเงิน + ระบบเช็คชื่อ/attendance + แจ้งเตือน LINE
3. **Phase 3:** หลังบ้าน/admin dashboard + รายงาน (ผู้สมัคร/ตารางนัดหมาย/รายรุ่น, export Excel/PDF) + ระบบโปรโมชั่น/ของแถม/คูปอง
4. **Phase 4:** Marketing automation ขั้นสูง (referral เต็มรูปแบบ, email/LINE automation, SEO เต็มรูปแบบ, CMS บทความ)

## หมายเหตุที่ยังต้องตัดสินใจก่อน launch จริง

- ข้อมูลการรักษาอาการบาดเจ็บ ควรปรึกษาเรื่องกฎหมาย PDPA/ข้อมูลสุขภาพก่อน launch จริง
