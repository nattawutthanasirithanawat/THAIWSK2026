# แนวทางการเผยแพร่เว็บไซต์ (Deployment Guide)

โครงการ **THAI WSK 2026** รองรับการเผยแพร่เว็บไซต์ 2 รูปแบบ:

---

## รูปแบบที่ 1 (แนะนำ): MODE A — Google Apps Script Web App
*วิธีนี้ง่าย รวดเร็ว และไม่ต้องตั้งค่าเซิร์ฟเวอร์ภายนอกเพิ่มเติม*

1. นำไฟล์ทั้งหมดในโฟลเดอร์ `apps-script/` ไปวางในโปรเจกต์ Google Apps Script:
   - `Code.gs`
   - `Setup.gs`
   - `Index.html`
   - `Styles.html`
   - `Client.html`
   - `appsscript.json` (ตั้งค่าใน Project Settings > Show "appsscript.json" manifest file in editor)
2. รันฟังก์ชัน `setupSystem()` จาก `Setup.gs` ครั้งแรก
3. คลิกปุ่ม **Deploy (ทำให้ใช้งานได้)** > **New deployment (การทำให้ใช้งานได้ใหม่)**
4. เลือกประเภท: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. คัดลอก Web App URL เพื่อเผยแพร่ให้นักเรียนใช้งานได้ทันที

---

## รูปแบบที่ 2: MODE B — GitHub Pages + Cloudflare Worker Proxy
*ใช้เมื่อต้องการให้เว็บไซต์เปิดบนโดเมนของโรงเรียน เช่น `thai-wsk-2026.github.io` หรือโดเมนโรงเรียนโดยตรง*

### ขั้นตอนการตั้งค่า:
1. **GitHub Pages (Frontend):**
   - สร้าง repository บน GitHub ชื่อ `thai-wsk-2026`
   - นำไฟล์ Frontend และ Build Artifacts ขึ้น branch `main` หรือ `gh-pages`
   - เปิดฟีเจอร์ GitHub Pages ใน Settings > Pages

2. **Cloudflare Worker API Bridge (Proxy):**
   - สมัครบัญชี Cloudflare (ใช้งานฟรี)
   - ไปที่เมนู Workers & Pages > Create application > Create Worker
   - นำโค้ดจาก `proxy/worker.js` ไปวางใน Worker Editor
   - กำหนดค่า Environment Variable `APPS_SCRIPT_URL` ให้ชี้ไปยัง Google Apps Script Web App URL ที่ได้จากข้อ 1
   - นำ Worker URL ที่ได้ไปกำหนดในค่า `VITE_API_ENDPOINT` หรือตั้งค่าในแอปพลิเคชัน
   - ระบบจะจัดการ CORS และรักษาความปลอดภัยของคำขอระหว่าง GitHub Pages กับ Google Apps Script ได้อย่างสมบูรณ์
