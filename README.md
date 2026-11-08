# THAI WSK 2026 | สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย
> โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย  
> กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"  
> สถาปัตยกรรม: Google AI Studio × GitHub × Google Sheets × Google Apps Script

---

## จุดเด่นของระบบ
- **ฐานข้อมูลกลาง Google Sheets:** เชื่อมต่อกับ Spreadsheet ID `10uaEo5pVJ3hDGeLixOnPsDT60WQtqVmSPXPS4FJnuN8`
- **ระบบติดตั้งอัตโนมัติ (Automated Schema Setup):** ฟังก์ชัน `setupSystem()` สร้าง 7 แผ่นงานพร้อมฟอร์แมตสีม่วง-ทอง และ Freeze หัวตาราง
- **ควบคุมระบบทั้งหมดจากแผ่นงาน (Zero-Admin UI):** ควบคุมการเปิด/ปิดสอบ ลิงก์แบบทดสอบ เกณฑ์คะแนน จากแผ่น `ADMIN_CONTROL` (อยู่แผ่นสุดท้ายเสมอ)
- **ระบบค้นหาคะแนนและเกียรติบัตรคุ้มครองข้อมูลส่วนบุคคล (PDPA):** ตัดคำนำหน้าชื่ออัตโนมัติ (นาย, นาง, นางสาว, ด.ช., ด.ญ.) และยืนยันตัวตนด้วย Verification Code
- **รองรับสถาปัตยกรรม 2 รูปแบบ:**
  - **Mode A (แนะนำ):** Google Apps Script Web App (HTML Service)
  - **Mode B:** GitHub Pages + Cloudflare Worker Proxy (CORS Bridge)

---

## โครงสร้างโปรเจกต์
```text
thai-wsk-2026/
├── README.md
├── index.html
├── metadata.json
├── package.json
│
├── apps-script/
│   ├── Code.gs             # Backend API และการจัดการข้อมูล
│   ├── Setup.gs            # ฟังก์ชัน setupSystem() สร้างตาราง 7 แผ่น
│   ├── Index.html          # หน้าเว็บ HTML Service
│   ├── Styles.html         # CSS สไตล์ม่วง-ทอง
│   ├── Client.html         # สคริปต์เรียก google.script.run
│   └── appsscript.json     # การตั้งค่า TimeZone และ Web App
│
├── proxy/
│   ├── worker.js           # Cloudflare Worker CORS Proxy
│   └── wrangler.example.toml
│
├── docs/
│   ├── SETUP.md            # คู่มือการติดตั้ง
│   ├── GOOGLE_SHEETS.md    # โครงสร้างตารางและคอลัมน์
│   ├── APPS_SCRIPT.md      # เอกสารฟังก์ชัน Backend
│   └── DEPLOYMENT.md       # คู่มือ Deploy Mode A & Mode B
│
└── src/                    # ระบบเว็บแอปพลิเคชัน React + Vite + Tailwind CSS
```

---

## ข้อมูลติดต่อหน่วยงาน
- **กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"**
- ที่อยู่: 442/30 ต.ตลาดกระทุ่มแบน อ.กระทุ่มแบน จ.สมุทรสาคร 74110
- โทรศัพท์: 034-471902 · โทรสาร: 034-471901
- อีเมล: wisetschool@gmail.com
- เว็บไซต์: https://www.wsk.ac.th/wp/
- Facebook: https://www.facebook.com/wisetsamutkhun

## ผู้พัฒนาระบบ
- **นายณัฐวุฒิ ธนาศิริธนวัชร์**
- นักศึกษาฝึกประสบการณ์วิชาชีพครู ชั้นปีที่ 2 สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร
- Facebook: Nattawut BK
