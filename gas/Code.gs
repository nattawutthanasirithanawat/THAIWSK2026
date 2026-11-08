/**
 * =========================================================================
 * THAI WSK 2026 — Google Apps Script (Backend & Google Sheets Synchronizer)
 * กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"
 * -------------------------------------------------------------------------
 * วิธีติดตั้งใน Google Sheets:
 * 1. เปิด Google Sheets: 10uaEo5pVJ3hDGeLixOnPsDT60WQtqVmSPXPS4FJnuN8
 * 2. เมนูด้านบนเลือก "ส่วนขยาย" (Extensions) > "Apps Script"
 * 3. นำโค้ดนี้ทั้งหมดไปวางแทนที่ไฟล์ Code.gs เดิม
 * 4. กดปุ่ม "บันทึก" (รูปแผ่นดิสก์)
 * 5. กดปุ่ม "ทำให้ใช้งานได้" (Deploy) > "การจัดการการทำให้ใช้งานได้" (Manage deployments)
 *    หรือ "การทำให้ใช้งานได้ใหม่" (New deployment)
 * 6. เลือกประเภท: "เว็บแอป" (Web app)
 *    - สิทธิ์การเข้าถึง (Who has access): "ทุกคน" (Anyone)
 * 7. กด Deploy แล้วคัดลอก Web App URL มาใช้งาน
 * =========================================================================
 */

const SPREADSHEET_ID = '10uaEo5pVJ3hDGeLixOnPsDT60WQtqVmSPXPS4FJnuN8';

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  
  if (action === 'getConfig' || action === 'getSystemData') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: getSystemConfigFromSheet(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Default: Return Web App HTML Interface
  return HtmlService.createHtmlOutput('<h3>THAI WSK 2026 Web App Backend is Running</h3><p>Status: Online & Connected to Google Sheets.</p>')
    .setTitle('THAI WSK 2026 Backend');
}

/**
 * Handle HTTP POST Requests — Receives admin updates and saves immediately to Google Sheets
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var payload = JSON.parse(raw);
    var config = payload.config || {};
    var nowStr = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss') + ' (น.)';

    var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('ADMIN_CONTROL');
    if (!sheet) {
      sheet = ss.insertSheet('ADMIN_CONTROL');
      sheet.appendRow(['Setting_Key', 'Setting_Value', 'Description', 'Category', 'Updated_At']);
    }

    // Read existing keys in column A
    var data = sheet.getDataRange().getValues();
    var keyRowMap = {};
    for (var r = 1; r < data.length; r++) {
      var k = String(data[r][0]).trim();
      if (k) {
        keyRowMap[k] = r + 1; // 1-indexed row number
      }
    }

    // Keys to save into Google Sheets
    var keysToSave = [
      'PROJECT_NAME',
      'PROJECT_SUBTITLE',
      'PROJECT_DESCRIPTION',
      'PROJECT_SLOGAN',
      'LOGO_URL',
      'HERO_BANNER_URL',
      'ANNOUNCEMENT_TEXT',
      'ABOUT_SECTION_TITLE',
      'ABOUT_SECTION_SUBTITLE',
      'CRITERIA_SECTION_TITLE',
      'CRITERIA_SECTION_SUBTITLE',
      'FORM_JUNIOR_TITLE',
      'FORM_JUNIOR_DESC',
      'FORM_JUNIOR_URL',
      'FORM_JUNIOR_ENABLED',
      'FORM_SENIOR_TITLE',
      'FORM_SENIOR_DESC',
      'FORM_SENIOR_URL',
      'FORM_SENIOR_ENABLED',
      'REGISTRATION_OPEN',
      'REGISTRATION_DEADLINE',
      'SCORE_SEARCH_ENABLED',
      'SCORE_SEARCH_INSTRUCTION',
      'FULL_SCORE',
      'PASS_PERCENT',
      'GOLD_MIN_PERCENT',
      'SILVER_MIN_PERCENT',
      'BRONZE_MIN_PERCENT',
      'CERTIFICATE_DOWNLOAD_ENABLED',
      'CERTIFICATE_ANNOUNCEMENT',
      'CERTIFICATE_PREVIEW_ENABLED',
      'CERTIFICATE_SEARCH_INSTRUCTION',
      'SCHOOL_NAME',
      'SCHOOL_DESCRIPTION',
      'SCHOOL_ADDRESS',
      'SCHOOL_PHONE',
      'SCHOOL_FAX',
      'SCHOOL_EMAIL',
      'SCHOOL_WEBSITE',
      'SCHOOL_FACEBOOK',
      'DEVELOPER_NAME',
      'DEVELOPER_DETAILS',
      'DEVELOPER_FACEBOOK',
      'FOOTER_COPYRIGHT',
      'LAST_UPDATED_AT',
      'LAST_UPDATED_BY'
    ];

    config['LAST_UPDATED_AT'] = nowStr;
    config['LAST_UPDATED_BY'] = 'THAIWSK44230 (ผู้ดูแลระบบ)';

    for (var i = 0; i < keysToSave.length; i++) {
      var key = keysToSave[i];
      if (config[key] !== undefined) {
        var val = config[key];
        if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        val = String(val);

        if (keyRowMap[key]) {
          sheet.getRange(keyRowMap[key], 2).setValue(val);
          sheet.getRange(keyRowMap[key], 5).setValue(nowStr);
        } else {
          sheet.appendRow([key, val, 'อัปเดตผ่านระบบแอดมิน THAI WSK 2026', 'การตั้งค่าระบบ', nowStr]);
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'บันทึกข้อมูลลง Google Sheets เรียบร้อยแล้ว',
      timestamp: nowStr
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper to read current settings from Google Sheets ADMIN_CONTROL
 */
function getSystemConfigFromSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('ADMIN_CONTROL');
  var config = {};
  if (!sheet) return config;

  var data = sheet.getDataRange().getValues();
  for (var r = 1; r < data.length; r++) {
    var key = String(data[r][0]).trim();
    var val = data[r][1];
    if (key && !key.includes(' ')) {
      config[key] = val;
    }
  }
  return config;
}
