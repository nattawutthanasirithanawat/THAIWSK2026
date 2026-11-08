# คู่มือการนำระบบ THAI WSK 2026 ขึ้น GitHub และ Deploy สด

โปรเจกต์นี้จัดเตรียมไฟล์สำหรับนำขึ้น GitHub และเปิดออนไลน์ผ่าน GitHub Pages ไว้อย่างสมบูรณ์แบบ 2 วิธี:

---

## วิธีที่ 1 (แนะนำที่สุด): Deploy อัตโนมัติด้วย GitHub Actions
*ระบบมีไฟล์ `.github/workflows/deploy.yml` จัดเตรียมไว้แล้ว เพียงแค่นำโค้ดขึ้น GitHub ระบบจะ Build และ Deploy เว็บไซต์ให้ทันที!*

### ขั้นตอน:
1. **สร้าง Repository บน GitHub:**
   - เข้า [github.com](https://github.com) > คลิก **New repository**
   - ตั้งชื่อ Repository: `thai-wsk-2026`
   - เลือกเป็น **Public**
   - กด **Create repository**

2. **Push โค้ดทั้งหมดขึ้น GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for THAI WSK 2026"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/thai-wsk-2026.git
   git push -u origin main
   ```

3. **เปิดการใช้งาน GitHub Pages ใน Repository:**
   - ไปที่แท็บ **Settings** ของ Repository บน GitHub
   - เมนูด้านซ้ายเลือก **Pages**
   - ในหัวข้อ **Build and deployment > Source** ให้เปลี่ยนเป็น:
     👉 **GitHub Actions**
   - รอ 1–2 นาที GitHub Actions จะรันตามไฟล์ `.github/workflows/deploy.yml`
   - เมื่อรันสำเร็จ จะปรากฏ URL เว็บไซต์จริง เช่น:  
     `https://<YOUR-USERNAME>.github.io/thai-wsk-2026/`

---

## วิธีที่ 2: ใช้โฟลเดอร์ Static `github-pages/` (ไม่ต้องใช้ Node.js)
*หากต้องการอัปโหลดไฟล์ HTML/CSS/JS สำเร็จรูปโดยไม่ต้องรันคำสั่ง Build:*

1. นำไฟล์ในโฟลเดอร์ `github-pages/` ประกอบด้วย:
   - `index.html`
   - โฟลเดอร์ `css/` (ไฟล์ `style.css`)
   - โฟลเดอร์ `js/` (ไฟล์ `app.js`)
2. วางไว้ที่ราก (Root) ของ Repository หรือ branch `gh-pages`
3. ใน GitHub Settings > Pages > Source เลือก **Deploy from a branch** แล้วเลือก branch `main` (หรือ `gh-pages`) > `/ (root)`
4. กด **Save** เว็บไซต์จะเปิดใช้งานได้ทันที

---

## การเชื่อมต่อ Google Sheets ฐานข้อมูลจริง
1. นำไฟล์จากโฟลเดอร์ `apps-script/` ไปติดตั้งใน Google Sheets ID:  
   `10uaEo5pVJ3hDGeLixOnPsDT60WQtqVmSPXPS4FJnuN8`
2. รันฟังก์ชัน `setupSystem()` จาก `apps-script/Setup.gs`
3. กด Deploy เป็น Web App
4. นำ Web App URL มาใส่ในระบบหรือ Proxy
