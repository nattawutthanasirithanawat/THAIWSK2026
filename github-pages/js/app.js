/**
 * THAI WSK 2026 — Static GitHub Pages App Script
 */

const CONFIG = {
  PROJECT_NAME: 'THAI WSK 2026',
  PROJECT_SUBTITLE: 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
  REGISTRATION_DEADLINE: '2026-12-31T23:59:59+07:00',
  FULL_SCORE: 20,
  FORM_JUNIOR_URL: 'https://docs.google.com/forms/d/e/.../viewform',
  FORM_SENIOR_URL: 'https://docs.google.com/forms/d/e/.../viewform',
};

// Sample verified data
const SCORES_DATA = [
  {
    Participant_ID: 'WSK-TH-001',
    Prefix: 'นาย',
    First_Name: 'กิตติพงษ์',
    Last_Name: 'รักอักษร',
    Level: 'มัธยมศึกษาตอนปลาย',
    Class: 'ม.5/1',
    Score: 19,
    Full_Score: 20,
    Percentage: 95,
    Result: 'ผ่าน',
    Award_Level: 'เหรียญทอง'
  },
  {
    Participant_ID: 'WSK-TH-002',
    Prefix: 'เด็กหญิง',
    First_Name: 'พิมพ์ชนก',
    Last_Name: 'วรรณศิลป์',
    Level: 'มัธยมศึกษาตอนต้น',
    Class: 'ม.2/3',
    Score: 17,
    Full_Score: 20,
    Percentage: 85,
    Result: 'ผ่าน',
    Award_Level: 'เหรียญทอง'
  },
  {
    Participant_ID: 'WSK-TH-003',
    Prefix: 'นางสาว',
    First_Name: 'ชลธิชา',
    Last_Name: 'สุวรรณศรี',
    Level: 'มัธยมศึกษาตอนปลาย',
    Class: 'ม.6/2',
    Score: 15,
    Full_Score: 20,
    Percentage: 75,
    Result: 'ผ่าน',
    Award_Level: 'เหรียญเงิน'
  },
  {
    Participant_ID: 'WSK-TH-004',
    Prefix: 'เด็กชาย',
    First_Name: 'ธนวัฒน์',
    Last_Name: 'วิเศษสมุท',
    Level: 'มัธยมศึกษาตอนต้น',
    Class: 'ม.1/5',
    Score: 13,
    Full_Score: 20,
    Percentage: 65,
    Result: 'ผ่าน',
    Award_Level: 'เหรียญทองแดง'
  }
];

function normalizeThaiName(str) {
  if (!str) return '';
  let s = String(str).trim().replace(/\s+/g, ' ');
  const prefixes = [
    'เด็กหญิง', 'เด็กชาย', 'นางสาว',
    'ด.ช.', 'ด.ญ.', 'ดช.', 'ดญ.',
    'นาย', 'นาง'
  ];
  for (const prefix of prefixes) {
    if (s.startsWith(prefix)) {
      s = s.substring(prefix.length).trim();
      break;
    }
  }
  return s;
}

// Countdown timer
function initCountdown() {
  const target = new Date(CONFIG.REGISTRATION_DEADLINE).getTime();
  function update() {
    const now = new Date().getTime();
    const diff = target - now;
    if (diff <= 0) {
      document.getElementById('countdown-wrapper').innerHTML = '<div style="color:#F5E8C7; font-weight:600;">ปิดระบบรับสมัครแล้ว</div>';
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-mins');
    const sEl = document.getElementById('cd-secs');

    if (dEl) dEl.innerText = String(d).padStart(2, '0');
    if (hEl) hEl.innerText = String(h).padStart(2, '0');
    if (mEl) mEl.innerText = String(m).padStart(2, '0');
    if (sEl) sEl.innerText = String(s).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
}

// Search Score by name only
function searchScore() {
  const input = document.getElementById('score-input').value;
  const resultBox = document.getElementById('score-result');
  if (!input.trim()) {
    resultBox.innerHTML = '<div style="color:red; margin-top:10px;">กรุณากรอกชื่อหรือชื่อ-นามสกุล</div>';
    return;
  }
  const query = normalizeThaiName(input);
  const match = SCORES_DATA.find(item => {
    const fullName = normalizeThaiName(item.First_Name + ' ' + item.Last_Name);
    return fullName.includes(query) || query.includes(fullName);
  });

  if (match) {
    resultBox.innerHTML = `
      <div class="result-card">
        <h3 style="color:#4B267D; font-size:20px; margin-bottom:6px;">${match.Prefix} ${match.First_Name} ${match.Last_Name}</h3>
        <p style="font-size:13px; color:#666; margin-bottom:12px;">ระดับชั้น: ${match.Level} (ห้อง ${match.Class}) · รหัสผู้สอบ: ${match.Participant_ID}</p>
        <div style="display:flex; justify-content:space-between; background:#FAF8FD; padding:12px; border-radius:10px; text-align:center;">
          <div><div style="font-size:11px; color:#666;">คะแนนที่ได้</div><strong style="font-size:22px; color:#4B267D;">${match.Score}/${match.Full_Score}</strong></div>
          <div><div style="font-size:11px; color:#666;">คิดเป็นร้อยละ</div><strong style="font-size:22px; color:#7043A6;">${match.Percentage}%</strong></div>
          <div><div style="font-size:11px; color:#666;">ระดับรางวัล</div><strong style="font-size:20px; color:#D6AF55;">${match.Award_Level}</strong></div>
        </div>
      </div>
    `;
  } else {
    resultBox.innerHTML = '<div style="background:#FFF3CD; color:#856404; padding:14px; border-radius:8px; margin-top:15px; text-align:center;">ไม่พบข้อมูลผลการสอบของชื่อที่ระบุ กรุณาตรวจสอบตัวสะกดอีกครั้ง</div>';
  }
}

// Search Certificate by name only
function searchCertificate() {
  const input = document.getElementById('cert-input').value;
  const resultBox = document.getElementById('cert-result');
  if (!input.trim()) {
    resultBox.innerHTML = '<div style="color:red; margin-top:10px;">กรุณากรอกชื่อหรือชื่อ-นามสกุล</div>';
    return;
  }
  const query = normalizeThaiName(input);
  const match = SCORES_DATA.find(item => {
    const fullName = normalizeThaiName(item.First_Name + ' ' + item.Last_Name);
    return fullName.includes(query) || query.includes(fullName);
  });

  if (match && match.Percentage >= 60) {
    resultBox.innerHTML = `
      <div class="result-card">
        <h3 style="color:#4B267D; font-size:20px; margin-bottom:6px;">${match.Prefix} ${match.First_Name} ${match.Last_Name}</h3>
        <p style="font-size:13px; color:#666; margin-bottom:12px;">ระดับรางวัล: <strong>${match.Award_Level}</strong> (${match.Level})</p>
        <button onclick="window.print()" class="btn-cta" style="margin-top:10px;">พิมพ์ / ดาวน์โหลดเกียรติบัตร PDF</button>
      </div>
    `;
  } else {
    resultBox.innerHTML = '<div style="background:#FFF3CD; color:#856404; padding:14px; border-radius:8px; margin-top:15px; text-align:center;">ยังไม่มีเกียรติบัตรสำหรับชื่อที่ระบุ หรือไม่ผ่านเกณฑ์ 60%</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
});
