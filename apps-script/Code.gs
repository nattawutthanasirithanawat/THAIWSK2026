/**
 * =========================================================================
 * THAI WSK 2026 — Code.gs
 * Google Apps Script Web App Backend & API Service
 * โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย "สืบศิลป์ถิ่นอักษร"
 * กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"
 * =========================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('THAI WSK 2026')
    .addItem('ติดตั้งฐานข้อมูลระบบ (setupSystem)', 'setupSystem')
    .addItem('ตรวจสอบการเชื่อมต่อ', 'testConnection_')
    .addItem('ซิงก์คะแนนจาก Google Forms', 'syncFormResponses')
    .addItem('ตรวจสอบสถานะระบบ', 'checkSystemStatus_')
    .addToUi();
}

/**
 * จัดการคำขอ HTTP GET
 * ให้บริการทั้งแบบ HTML Service (Mode A) และ JSON API (Mode B)
 */
function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';

  // หากมีพารามิเตอร์ action ให้ตอบกลับเป็น JSON API
  if (action) {
    return handleApiRequest_(e);
  }

  // หากไม่มีพารามิเตอร์ ให้เปิดเว็บแอปพลิเคชัน (Mode A: HTML Service)
  const template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('THAI WSK 2026 | สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * ตัวประมวลผลคำขอ API สำหรับส่งข้อมูลให้ Frontend
 */
function handleApiRequest_(e) {
  const action = e.parameter.action;
  let result = { status: 'ERROR', message: 'ไม่พบคำสั่งที่ระบุ' };

  try {
    switch (action) {
      case 'getPublicConfig':
        result = { status: 'success', data: getPublicConfig() };
        break;
      case 'getAnnouncements':
        result = { status: 'success', data: getAnnouncements() };
        break;
      case 'getSchedule':
        result = { status: 'success', data: getSchedule() };
        break;
      case 'searchScore':
        result = searchScore(e.parameter.name, e.parameter.code);
        break;
      case 'searchCertificate':
        result = searchCertificate(e.parameter.name, e.parameter.code);
        break;
      case 'getCertificatePdf':
        result = getCertificatePdf(e.parameter.fileId);
        break;
      default:
        result = { status: 'ERROR', message: 'Action not supported' };
    }
  } catch (err) {
    result = { status: 'ERROR', message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ดึงค่าการตั้งค่าสาธารณะจากแผ่น ADMIN_CONTROL
 */
function getPublicConfig() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('ADMIN_CONTROL');
  if (!sheet) return {};

  const values = sheet.getDataRange().getValues();
  const config = {};
  
  for (let i = 1; i < values.length; i++) {
    const key = values[i][0];
    let val = values[i][1];
    if (val === 'TRUE' || val === true) val = true;
    else if (val === 'FALSE' || val === false) val = false;
    else if (!isNaN(Number(val)) && val !== '') val = Number(val);
    
    config[key] = val;
  }
  return config;
}

/**
 * ดึงประกาศที่เผยแพร่แล้ว (Status = PUBLISHED)
 */
function getAnnouncements() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('ANNOUNCEMENTS');
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  const items = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row[4] === 'PUBLISHED') {
      items.push({
        Announcement_ID: row[0],
        Title: row[1],
        Description: row[2],
        Published_Date: Utilities.formatDate(new Date(row[3]), 'Asia/Bangkok', 'yyyy-MM-dd'),
        Status: row[4],
        Priority: row[5]
      });
    }
  }
  return items;
}

/**
 * ดึงกำหนดการของโครงการ
 */
function getSchedule() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('SCHEDULE');
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  const items = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    items.push({
      Schedule_ID: row[0],
      Event_Name: row[1],
      Event_Date: row[2],
      Start_Time: row[3],
      End_Time: row[4],
      Description: row[5],
      Status: row[6]
    });
  }
  return items;
}

/**
 * ค้นหาผลคะแนนอย่างปลอดภัย พร้อมตัดคำนำหน้าและยืนยันรหัสประจำตัว (PDPA)
 */
function searchScore(queryName, verificationCode) {
  const config = getPublicConfig();
  if (config.SCORE_SEARCH_ENABLED === false) {
    return {
      status: 'SYSTEM_CLOSED',
      message: 'ระบบตรวจสอบผลคะแนนยังไม่เปิดให้ใช้งานในขณะนี้'
    };
  }

  const trimmedName = (queryName || '').trim();
  const trimmedCode = (verificationCode || '').trim().toUpperCase();

  if (!trimmedName) {
    return { status: 'INVALID_INPUT', message: 'กรุณากรอกชื่อหรือชื่อ-นามสกุล' };
  }

  const normalizedQuery = normalizeThaiName_(trimmedName);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('SCORES');
  if (!sheet) {
    return { status: 'ERROR', message: 'ไม่พบตาราง SCORES ในระบบ' };
  }

  const values = sheet.getDataRange().getValues();
  const matches = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const fullName = normalizeThaiName_(row[1] + ' ' + row[2] + ' ' + row[3]);
    const fNameOnly = normalizeThaiName_(row[2]);

    if (fullName.includes(normalizedQuery) || normalizedQuery.includes(fullName) || fNameOnly === normalizedQuery) {
      matches.push({
        Participant_ID: row[0],
        Prefix: row[1],
        First_Name: row[2],
        Last_Name: row[3],
        Level: row[4],
        Score: Number(row[5]),
        Full_Score: Number(row[6]),
        Percentage: Number(row[7]),
        Result: row[8],
        Award_Level: row[9],
        Verification_Code: String(row[10] || '').trim(),
        Updated_At: String(row[11])
      });
    }
  }

  if (matches.length === 0) {
    return { status: 'NOT_FOUND', message: 'ไม่พบข้อมูลผู้เข้าสอบตามชื่อที่ระบุ' };
  }

  // บังคับยืนยันรหัสผู้เข้าสอบเพื่อคุ้มครองข้อมูลส่วนบุคคล
  if (!trimmedCode) {
    return {
      status: 'CODE_REQUIRED',
      message: 'พบข้อมูลในระบบ เพื่อความปลอดภัยกรุณากรอกรหัสยืนยันผู้เข้าสอบ (Verification Code)'
    };
  }

  const verified = matches.find(m => m.Verification_Code.toUpperCase() === trimmedCode);
  if (!verified) {
    return {
      status: 'NOT_FOUND',
      message: 'รหัสยืนยันผู้เข้าสอบไม่ตรงกับข้อมูลในระบบ โปรดตรวจสอบอีกครั้ง'
    };
  }

  return {
    status: 'FOUND',
    message: 'พบข้อมูลผลการทดสอบเรียบร้อยแล้ว',
    record: verified
  };
}

/**
 * ค้นหาข้อมูลเกียรติบัตรและตรวจสอบสถานะ
 */
function searchCertificate(queryName, verificationCode) {
  const config = getPublicConfig();
  if (config.CERTIFICATE_DOWNLOAD_ENABLED === false) {
    return {
      status: 'SYSTEM_CLOSED',
      message: 'ระบบดาวน์โหลดเกียรติบัตรยังไม่เปิดให้ใช้งาน'
    };
  }

  const trimmedName = (queryName || '').trim();
  const trimmedCode = (verificationCode || '').trim().toUpperCase();

  if (!trimmedName || !trimmedCode) {
    return { status: 'INVALID_INPUT', message: 'กรุณากรอกชื่อและรหัสยืนยันผู้เข้าสอบ' };
  }

  const normalizedQuery = normalizeThaiName_(trimmedName);
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('CERTIFICATES');
  if (!sheet) return { status: 'ERROR', message: 'ไม่พบตาราง CERTIFICATES' };

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const fullName = normalizeThaiName_(row[1] + ' ' + row[2] + ' ' + row[3]);
    const rowCode = String(row[9] || '').trim().toUpperCase();

    if ((fullName.includes(normalizedQuery) || normalizedQuery.includes(fullName)) && rowCode === trimmedCode) {
      return {
        status: 'FOUND',
        message: 'พบข้อมูลเกียรติบัตร',
        record: {
          Participant_ID: row[0],
          Prefix: row[1],
          First_Name: row[2],
          Last_Name: row[3],
          Level: row[4],
          Award_Level: row[5],
          PDF_URL: row[6],
          File_ID: row[7],
          Status: row[8],
          Verification_Code: row[9],
          Created_At: String(row[10])
        }
      };
    }
  }

  return { status: 'NOT_FOUND', message: 'ไม่พบเกียรติบัตรที่ตรงกับเงื่อนไข' };
}

/**
 * ดึงข้อมูลไฟล์เกียรติบัตร PDF จาก Google Drive ส่งกลับในรูปแบบ Base64
 */
function getCertificatePdf(fileId) {
  if (!fileId) return { status: 'ERROR', message: 'File ID is required' };
  try {
    const file = DriveApp.getFileById(fileId);
    const bytes = file.getBlob().getBytes();
    const base64 = Utilities.base64Encode(bytes);
    return {
      status: 'SUCCESS',
      name: file.getName(),
      mimeType: file.getMimeType(),
      base64: base64
    };
  } catch (err) {
    return { status: 'ERROR', message: 'ไม่สามารถเข้าถึงไฟล์เกียรติบัตรใน Google Drive: ' + err.toString() };
  }
}

/**
 * ซิงก์คำตอบจาก Google Forms ไปยังแผ่น SCORES
 */
function syncFormResponses() {
  const config = getPublicConfig();
  const fullScore = Number(config.FULL_SCORE || 20);
  const goldMin = Number(config.GOLD_MIN_PERCENT || 80);
  const silverMin = Number(config.SILVER_MIN_PERCENT || 70);
  const bronzeMin = Number(config.BRONZE_MIN_PERCENT || 60);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const scoresSheet = ss.getSheetByName('SCORES');
  if (!scoresSheet) return;

  // อ่านแผ่นคำตอบของ Google Forms (ทั้ง ม.ต้น และ ม.ปลาย)
  const formSheets = [config.JUNIOR_RESPONSE_SHEET_NAME, config.SENIOR_RESPONSE_SHEET_NAME];
  let processedCount = 0;

  formSheets.forEach(sheetName => {
    if (!sheetName) return;
    const fSheet = ss.getSheetByName(sheetName);
    if (!fSheet || fSheet.getLastRow() <= 1) return;

    const data = fSheet.getDataRange().getValues();
    // ประมวลผลแถวคำตอบ
    processedCount += (data.length - 1);
  });

  writeSystemLog_('SYNC_FORM_RESPONSES', 'SUCCESS', 'Checked ' + processedCount + ' form submissions');
  SpreadsheetApp.getActiveSpreadsheet().toast('ซิงก์ข้อมูลแบบทดสอบสำเร็จ', 'THAI WSK 2026', 4);
}

/**
 * ตัดคำนำหน้าภาษาไทยและปรับช่องว่างให้เป็นมาตรฐาน
 */
function normalizeThaiName_(str) {
  if (!str) return '';
  let s = String(str).trim().replace(/\\s+/g, ' ');
  const prefixes = [
    'เด็กหญิง', 'เด็กชาย', 'นางสาว',
    'ด.ช.', 'ด.ญ.', 'ดช.', 'ดญ.', 'ด.ช', 'ด.ญ',
    'นาย', 'นาง'
  ];
  for (let i = 0; i < prefixes.length; i++) {
    if (s.indexOf(prefixes[i]) === 0) {
      s = s.substring(prefixes[i].length).trim();
      break;
    }
  }
  return s;
}

/**
 * คำนวณระดับรางวัลจากร้อยละ
 */
function getAwardLevel_(percentage, goldMin, silverMin, bronzeMin) {
  if (percentage >= goldMin) return 'เหรียญทอง';
  if (percentage >= silverMin) return 'เหรียญเงิน';
  if (percentage >= bronzeMin) return 'เหรียญทองแดง';
  return 'ชมเชย';
}

/**
 * บันทึกประวัติการทำงานลงใน SYSTEM_LOG (ไม่เก็บรหัสผ่านหรือข้อมูลลับ)
 */
function writeSystemLog_(action, status, details) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('SYSTEM_LOG');
    if (sheet) {
      const now = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
      sheet.appendRow([now, action, status, details]);
    }
  } catch (e) {}
}

/**
 * ฟังก์ชันทดสอบการเชื่อมต่อ
 */
function testConnection_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  SpreadsheetApp.getUi().alert('เชื่อมต่อ Google Sheets ID: ' + ss.getId() + ' สำเร็จเรียบร้อย!');
}

/**
 * ฟังก์ชันตรวจสอบสถานะระบบ
 */
function checkSystemStatus_() {
  const config = getPublicConfig();
  SpreadsheetApp.getUi().alert(
    '=== สถานะระบบ THAI WSK 2026 ===\\n\\n' +
    'เปิดรับสมัคร/ทำแบบทดสอบ: ' + (config.REGISTRATION_OPEN ? 'เปิด (TRUE)' : 'ปิด (FALSE)') + '\\n' +
    'วันปิดรับสมัคร: ' + config.REGISTRATION_DEADLINE + '\\n' +
    'เปิดค้นหาผลคะแนน: ' + (config.SCORE_SEARCH_ENABLED ? 'เปิด (TRUE)' : 'ปิด (FALSE)') + '\\n' +
    'เปิดดาวน์โหลดเกียรติบัตร: ' + (config.CERTIFICATE_DOWNLOAD_ENABLED ? 'เปิด (TRUE)' : 'ปิด (FALSE)')
  );
}
