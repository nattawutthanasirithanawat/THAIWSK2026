/**
 * =========================================================================
 * THAI WSK 2026 — Setup.gs
 * โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย "สืบศิลป์ถิ่นอักษร"
 * กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"
 * =========================================================================
 */

const SPREADSHEET_ID = '10uaEo5pVJ3hDGeLixOnPsDT60WQtqVmSPXPS4FJnuN8';

/**
 * ฟังก์ชันหลักสำหรับสร้างโครงสร้างตารางฐานข้อมูลอัตโนมัติ
 * เมื่อรันซ้ำ จะไม่ลบข้อมูลเดิม และไม่สร้างแผ่นงานซ้ำ
 */
function setupSystem() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 1. กำหนดโครงสร้าง 7 แผ่นงานตามลำดับ
  const sheetsStructure = [
    {
      name: 'PARTICIPANTS',
      headers: [
        'Participant_ID', 'Prefix', 'First_Name', 'Last_Name',
        'Level', 'Class', 'School', 'Verification_Code', 'Registered_At'
      ],
      widths: [140, 100, 140, 160, 160, 100, 220, 140, 160]
    },
    {
      name: 'SCORES',
      headers: [
        'Participant_ID', 'Prefix', 'First_Name', 'Last_Name',
        'Level', 'Score', 'Full_Score', 'Percentage', 'Result',
        'Award_Level', 'Verification_Code', 'Updated_At'
      ],
      widths: [140, 100, 140, 160, 160, 80, 80, 100, 100, 120, 140, 160]
    },
    {
      name: 'CERTIFICATES',
      headers: [
        'Participant_ID', 'Prefix', 'First_Name', 'Last_Name',
        'Level', 'Award_Level', 'PDF_URL', 'File_ID', 'Status',
        'Verification_Code', 'Created_At'
      ],
      widths: [140, 100, 140, 160, 160, 120, 260, 200, 100, 140, 160]
    },
    {
      name: 'ANNOUNCEMENTS',
      headers: [
        'Announcement_ID', 'Title', 'Description', 'Published_Date', 'Status', 'Priority'
      ],
      widths: [140, 260, 380, 130, 110, 110]
    },
    {
      name: 'SCHEDULE',
      headers: [
        'Schedule_ID', 'Event_Name', 'Event_Date', 'Start_Time', 'End_Time', 'Description', 'Status'
      ],
      widths: [130, 240, 140, 100, 100, 320, 120]
    },
    {
      name: 'SYSTEM_LOG',
      headers: ['Timestamp', 'Action', 'Status', 'Details'],
      widths: [160, 160, 110, 320]
    },
    {
      name: 'ADMIN_CONTROL',
      headers: ['Setting_Key', 'Setting_Value', 'Description', 'Category'],
      widths: [240, 360, 340, 180]
    }
  ];

  const primaryPurple = '#4B267D';
  const headerFontColor = '#FFFFFF';

  sheetsStructure.forEach(item => {
    let sheet = ss.getSheetByName(item.name);
    if (!sheet) {
      sheet = ss.insertSheet(item.name);
    }

    // สร้างหัวตารางเฉพาะเมื่อแผ่นยังว่าง
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, item.headers.length).setValues([item.headers]);
    }

    // กำหนดสีหัวตารางและแบบอักษร
    const headerRange = sheet.getRange(1, 1, 1, item.headers.length);
    headerRange.setBackground(primaryPurple)
               .setFontColor(headerFontColor)
               .setFontWeight('bold')
               .setFontFamily('Sarabun')
               .setHorizontalAlignment('center');

    // Freeze แถวแรก
    sheet.setFrozenRows(1);

    // ปรับความกว้างคอลัมน์
    item.widths.forEach((w, colIdx) => {
      sheet.setColumnWidth(colIdx + 1, w);
    });
  });

  // ใส่ค่าเริ่มต้นใน ADMIN_CONTROL ถ้ายังไม่มีข้อมูล
  initAdminControlValues_(ss);

  // ย้าย ADMIN_CONTROL ไปไว้ท้ายสุดของ Google Sheets เสมอ
  const adminSheet = ss.getSheetByName('ADMIN_CONTROL');
  if (adminSheet) {
    ss.setActiveSheet(adminSheet);
    ss.moveActiveSheet(ss.getNumSheets());
  }

  // ลบ Sheet1 / ชีต1 หากเป็นแผ่นว่างเปล่า
  ['Sheet1', 'ชีต1'].forEach(sheetName => {
    const s = ss.getSheetByName(sheetName);
    if (s && s.getLastRow() === 0 && ss.getNumSheets() > 1) {
      try {
        ss.deleteSheet(s);
      } catch (e) {}
    }
  });

  // บันทึกผลการติดตั้งลงใน SYSTEM_LOG
  writeSystemLog_('SETUP_SYSTEM', 'SUCCESS', 'Initialized THAI WSK 2026 database sheets');
  
  if (SpreadsheetApp.getActiveSpreadsheet()) {
    SpreadsheetApp.getActiveSpreadsheet().toast('ติดตั้งฐานข้อมูลระบบสำเร็จเรียบร้อย', 'THAI WSK 2026', 5);
  }
}

/**
 * กำหนดค่าเริ่มต้นในแผ่น ADMIN_CONTROL ตามหมวด A-F
 */
function initAdminControlValues_(ss) {
  const sheet = ss.getSheetByName('ADMIN_CONTROL');
  if (!sheet) return;

  if (sheet.getLastRow() > 1) {
    return; // มีค่าอยู่แล้ว ห้ามเขียนทับ
  }

  const defaultSettings = [
    // หมวด A — ข้อมูลโครงการ
    ['PROJECT_NAME', 'THAI WSK 2026', 'ชื่อย่อโครงการ', 'หมวด A — ข้อมูลโครงการ'],
    ['PROJECT_SUBTITLE', 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย', 'ชื่อกิจกรรมภาษาไทย', 'หมวด A — ข้อมูลโครงการ'],
    ['PROJECT_DESCRIPTION', 'โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย เพื่อส่งเสริมศักยภาพความเป็นเลิศทางภาษาและวรรณคดีไทยแก่นักเรียนระดับมัธยมศึกษา', 'คำอธิบายโครงการ', 'หมวด A — ข้อมูลโครงการ'],
    ['PROJECT_SLOGAN', 'ภาษาไทยล้ำค่า สืบสานภูมิปัญญา เชิดชูคุณค่าศิลป์แห่งสุนทร', 'คำโปรยโครงการ', 'หมวด A — ข้อมูลโครงการ'],
    ['LOGO_URL', '', 'URL โลโก้โครงการ', 'หมวด A — ข้อมูลโครงการ'],
    ['HERO_BANNER_URL', '', 'URL ภาพแบนเนอร์หลัก', 'หมวด A — ข้อมูลโครงการ'],
    ['ANNOUNCEMENT_TEXT', 'ขอเชิญนักเรียนชั้น ม.1 - ม.6 ร่วมกิจกรรมวัดความรู้ความสามารถภาษาไทย ประจำปีการศึกษา 2569 พร้อมรับเกียรติบัตรอิเล็กทรอนิกส์', 'ข้อความวิ่งประชาสัมพันธ์', 'หมวด A — ข้อมูลโครงการ'],
    
    // หมวด B — แบบทดสอบ
    ['FORM_JUNIOR_URL', 'https://docs.google.com/forms/d/e/.../viewform', 'ลิงก์ Google Forms ม.ต้น', 'หมวด B — แบบทดสอบ'],
    ['FORM_SENIOR_URL', 'https://docs.google.com/forms/d/e/.../viewform', 'ลิงก์ Google Forms ม.ปลาย', 'หมวด B — แบบทดสอบ'],
    ['JUNIOR_RESPONSE_SHEET_NAME', 'Form Responses 1', 'ชื่อแท็บคำตอบ Forms ม.ต้น', 'หมวด B — แบบทดสอบ'],
    ['SENIOR_RESPONSE_SHEET_NAME', 'Form Responses 2', 'ชื่อแท็บคำตอบ Forms ม.ปลาย', 'หมวด B — แบบทดสอบ'],
    ['REGISTRATION_OPEN', 'TRUE', 'เปิด/ปิดรับคำตอบแบบทดสอบ (TRUE / FALSE)', 'หมวด B — แบบทดสอบ'],
    ['REGISTRATION_DEADLINE', '2026-12-31T23:59:59+07:00', 'วันปิดรับสมัคร (Asia/Bangkok)', 'หมวด B — แบบทดสอบ'],

    // หมวด C — ระบบคะแนน
    ['SCORE_SEARCH_ENABLED', 'TRUE', 'เปิดค้นหาคะแนน (TRUE / FALSE)', 'หมวด C — ระบบคะแนน'],
    ['FULL_SCORE', '20', 'คะแนนเต็ม', 'หมวด C — ระบบคะแนน'],
    ['PASS_PERCENT', '60', 'เกณฑ์ผ่านขั้นต่ำ (%)', 'หมวด C — ระบบคะแนน'],
    ['GOLD_MIN_PERCENT', '80', 'เกณฑ์เหรียญทอง (%)', 'หมวด C — ระบบคะแนน'],
    ['SILVER_MIN_PERCENT', '70', 'เกณฑ์เหรียญเงิน (%)', 'หมวด C — ระบบคะแนน'],
    ['BRONZE_MIN_PERCENT', '60', 'เกณฑ์เหรียญทองแดง (%)', 'หมวด C — ระบบคะแนน'],

    // หมวด D — ระบบเกียรติบัตร
    ['CERTIFICATE_DOWNLOAD_ENABLED', 'TRUE', 'เปิดดาวน์โหลดเกียรติบัตร (TRUE / FALSE)', 'หมวด D — ระบบเกียรติบัตร'],
    ['CERTIFICATE_FOLDER_ID', '', 'Google Drive Folder ID ที่เก็บ PDF', 'หมวด D — ระบบเกียรติบัตร'],
    ['CERTIFICATE_ANNOUNCEMENT', 'เกียรติบัตรพร้อมให้ดาวน์โหลดแล้วสำหรับผู้ที่ผ่านเกณฑ์ 60% ขึ้นไป', 'ข้อความแจ้งระบบเกียรติบัตร', 'หมวด D — ระบบเกียรติบัตร'],
    ['CERTIFICATE_PREVIEW_ENABLED', 'TRUE', 'เปิดแสดงตัวอย่างเกียรติบัตร (TRUE / FALSE)', 'หมวด D — ระบบเกียรติบัตร'],

    // หมวด E — ข้อมูลโรงเรียน
    ['SCHOOL_NAME', 'กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"', 'ชื่อหน่วยงาน', 'หมวด E — ข้อมูลโรงเรียน'],
    ['SCHOOL_ADDRESS', '442/30 ต.ตลาดกระทุ่มแบน อ.กระทุ่มแบน จ.สมุทรสาคร 74110', 'ที่อยู่โรงเรียน', 'หมวด E — ข้อมูลโรงเรียน'],
    ['SCHOOL_PHONE', '034-471902', 'เบอร์โทรศัพท์', 'หมวด E — ข้อมูลโรงเรียน'],
    ['SCHOOL_FAX', '034-471901', 'เบอร์โทรสาร', 'หมวด E — ข้อมูลโรงเรียน'],
    ['SCHOOL_EMAIL', 'wisetschool@gmail.com', 'อีเมล', 'หมวด E — ข้อมูลโรงเรียน'],
    ['SCHOOL_WEBSITE', 'https://www.wsk.ac.th/wp/', 'เว็บไซต์ทางการ', 'หมวด E — ข้อมูลโรงเรียน'],
    ['SCHOOL_FACEBOOK', 'https://www.facebook.com/wisetsamutkhun', 'เพจ Facebook โรงเรียน', 'หมวด E — ข้อมูลโรงเรียน'],

    // หมวด F — ผู้พัฒนาระบบ
    ['DEVELOPER_NAME', 'นายณัฐวุฒิ ธนาศิริธนวัชร์', 'ชื่อผู้พัฒนาระบบ', 'หมวด F — ผู้พัฒนาระบบ'],
    ['DEVELOPER_DETAILS', 'นักศึกษาฝึกประสบการณ์วิชาชีพครู ชั้นปีที่ 2 สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร', 'รายละเอียดผู้พัฒนา', 'หมวด F — ผู้พัฒนาระบบ'],
    ['DEVELOPER_FACEBOOK', 'https://www.facebook.com/nattawut.bk', 'Facebook ติดต่อผู้พัฒนา', 'หมวด F — ผู้พัฒนาระบบ']
  ];

  sheet.getRange(2, 1, defaultSettings.length, 4).setValues(defaultSettings);
}
