# โครงสร้างฐานข้อมูล Google Sheets — THAI WSK 2026

**Spreadsheet ID:** `10uaEo5pVJ3hDGeLixOnPsDT60WQtqVmSPXPS4FJnuN8`

---

## รายชื่อแผ่นงานทั้ง 7 แผ่น

### 1. แผ่นงาน: PARTICIPANTS (ผู้เข้าร่วมโครงการ)
- `Participant_ID`: รหัสประจำตัวผู้เข้าสอบ (เช่น WSK-TH-001)
- `Prefix`: คำนำหน้าชื่อ (นาย, นางสาว, เด็กชาย, เด็กหญิง)
- `First_Name`: ชื่อจริง
- `Last_Name`: นามสกุล
- `Level`: ระดับชั้น (มัธยมศึกษาตอนต้น / มัธยมศึกษาตอนปลาย)
- `Class`: ชั้นเรียน/ห้องเรียน (เช่น ม.3/1)
- `School`: ชื่อโรงเรียน
- `Verification_Code`: รหัสยืนยันผู้เข้าสอบรายบุคคล (สำหรับตรวจสอบสิทธิ์ PDPA)
- `Registered_At`: วันที่และเวลาที่บันทึกข้อมูล

### 2. แผ่นงาน: SCORES (คะแนนการทดสอบ)
- `Participant_ID`: รหัสประจำตัวผู้เข้าสอบ
- `Prefix`: คำนำหน้าชื่อ
- `First_Name`: ชื่อจริง
- `Last_Name`: นามสกุล
- `Level`: ระดับชั้น
- `Score`: คะแนนที่สอบได้ (0 ถึง 20)
- `Full_Score`: คะแนนเต็ม (ค่าเริ่มต้น 20)
- `Percentage`: คะแนนคิดเป็นร้อยละ
- `Result`: ผ่าน / ไม่ผ่าน
- `Award_Level`: ระดับรางวัล (เหรียญทอง, เหรียญเงิน, เหรียญทองแดง, ชมเชย)
- `Verification_Code`: รหัสยืนยันเพื่อดูคะแนน
- `Updated_At`: วันที่และเวลาประมวลผล

### 3. แผ่นงาน: CERTIFICATES (เกียรติบัตร)
- `Participant_ID`: รหัสผู้เข้าสอบ
- `Prefix`: คำนำหน้า
- `First_Name`: ชื่อ
- `Last_Name`: นามสกุล
- `Level`: ระดับชั้น
- `Award_Level`: ระดับเหรียญรางวัล
- `PDF_URL`: ลิงก์ดาวน์โหลดไฟล์ PDF ใน Google Drive
- `File_ID`: Google Drive File ID ของไฟล์เกียรติบัตร
- `Status`: สถานะเอกสาร (`PENDING`, `READY`, `UNAVAILABLE`)
- `Verification_Code`: รหัสยืนยันดาวน์โหลด
- `Created_At`: วันที่สร้างเกียรติบัตร

### 4. แผ่นงาน: ANNOUNCEMENTS (ประกาศและข่าวสาร)
- `Announcement_ID`: รหัสประกาศ (เช่น ANN-001)
- `Title`: หัวข้อข่าวประกาศ
- `Description`: รายละเอียดเนื้อหา
- `Published_Date`: วันที่เผยแพร่
- `Status`: สถานะ (`PUBLISHED`, `DRAFT`) แสดงเฉพาะ `PUBLISHED`
- `Priority`: ความสำคัญ (`HIGH`, `NORMAL`, `LOW`)

### 5. แผ่นงาน: SCHEDULE (กำหนดการสำคัญ)
- `Schedule_ID`: รหัสกำหนดการ (เช่น SCH-001)
- `Event_Name`: ชื่องานหรือกิจกรรม
- `Event_Date`: วันที่จัดกิจกรรม
- `Start_Time`: เวลาเริ่มต้น
- `End_Time`: เวลาสิ้นสุด
- `Description`: คำอธิบาย
- `Status`: สถานะ (`UPCOMING`, `IN_PROGRESS`, `COMPLETED`)

### 6. แผ่นงาน: SYSTEM_LOG (ประวัติการทำงาน)
- `Timestamp`: วันที่และเวลา
- `Action`: การกระทำ (เช่น SETUP_SYSTEM, SYNC_FORM)
- `Status`: ผลลัพธ์ (`SUCCESS`, `ERROR`, `WARNING`)
- `Details`: รายละเอียดเพิ่มเติม

### 7. แผ่นงาน: ADMIN_CONTROL (แผ่นควบคุมระบบ — อยู่ท้ายสุดเสมอ)
- `Setting_Key`: ชื่อคีย์กำหนดค่า
- `Setting_Value`: ค่าที่ตั้งไว้
- `Description`: คำอธิบาย
- `Category`: หมวดหมู่ (หมวด A ถึง หมวด F)
