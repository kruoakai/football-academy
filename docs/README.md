# เอกสารประกอบ

ไฟล์ HTML ในโฟลเดอร์นี้เป็นหน้าเว็บสำเร็จรูป เปิดตรงๆ ในเบราว์เซอร์ได้เลย (ดับเบิลคลิก หรือลาก drop เข้าเบราว์เซอร์)

- **[run-guide.html](run-guide.html)** — วิธีรัน frontend/backend ของระบบ ทีละขั้นตอน (ติดตั้งครั้งแรก, รันประจำวัน, สรุปคำสั่ง, แก้ปัญหาที่พบบ่อย, บัญชีทดสอบ)
- **[verification-guide.html](verification-guide.html)** — เช็คลิสต์ตรวจสอบทุกฟีเจอร์ Phase 1–4 ติ๊กแล้วจำความคืบหน้าไว้ในเบราว์เซอร์อัตโนมัติ (localStorage) พร้อมหมวด "ข้อจำกัดที่ทราบอยู่แล้ว" กันสับสนว่าอะไรคือบั๊กจริง
- **[deploy-guide.html](deploy-guide.html)** — วิธีติดตั้งระบบขึ้น Ubuntu Server จริง 3 แบบ (Docker จัดการเอง / Docker + CI-CD อัตโนมัติ / ไม่ใช้ Docker) พร้อมไฟล์ config จริงที่อ้างอิงในคู่มือ (`Dockerfile`, `docker-compose.prod.yml`, `.github/workflows/deploy.yml`, `deploy/`)

ใช้คู่กัน: เปิด `run-guide.html` เพื่อรันระบบบนเครื่อง dev ก่อน ใช้ `verification-guide.html` ไล่เช็คฟีเจอร์ทีละข้อ แล้วใช้ `deploy-guide.html` ตอนจะเอาระบบขึ้นเซิร์ฟเวอร์จริง
