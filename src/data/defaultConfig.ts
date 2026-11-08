import { PublicConfig, Announcement, ScheduleItem, ScoreRecord, CertificateRecord, AwardCriteriaItem, ProjectObjective } from '../types';

export const SPREADSHEET_ID = '10uaEo5pVJ3hDGeLixOnPsDT60WQtqVmSPXPS4FJnuN8';

export const INITIAL_OBJECTIVES: ProjectObjective[] = [
  {
    id: 'obj-1',
    title: '1. ส่งเสริมความเป็นเลิศทางภาษาและวรรณคดีไทย',
    description: 'เพื่อให้นักเรียนได้ฝึกฝนทบทวนความรู้ด้านหลักภาษา การใช้คำ วรรณกรรม และฉันทลักษณ์ไทยอย่างถูกต้อง ลึกซึ้ง และภาคภูมิใจในเอกลักษณ์ของชาติ',
  },
  {
    id: 'obj-2',
    title: '2. ประเมินวัดระดับสมรรถนะการเรียนรู้ด้วยระบบดิจิทัล',
    description: 'เปิดโอกาสให้นักเรียนประเมินความรู้ผ่านแบบทดสอบออนไลน์มาตรฐานที่เชื่อมโยงกับระบบฐานข้อมูลกลาง และรับผลคะแนนอย่างเป็นระบบ',
  },
  {
    id: 'obj-3',
    title: '3. พัฒนาศักยภาพนักเรียนทั้ง ม.ต้น และ ม.ปลาย',
    description: 'ระดับมัธยมศึกษาตอนต้น (ม.1–3) เน้นหลักภาษาและการอ่านวรรณคดีพื้นฐาน และระดับมัธยมศึกษาตอนปลาย (ม.4–6) เน้นวรรณคดีวิจักษ์และการใช้ภาษาเชิงวิชาการ',
  },
];

export const INITIAL_CRITERIA_ITEMS: AwardCriteriaItem[] = [
  {
    id: 'crit-gold',
    name: 'ระดับเหรียญทอง',
    minScore: 16,
    maxScore: 20,
    percentLabel: 'คิดเป็น 80% ขึ้นไป',
    description: 'ได้รับเกียรติบัตรอิเล็กทรอนิกส์ ระดับเหรียญทอง พร้อมระบุผลคะแนนอย่างเป็นทางการ',
    colorTheme: 'gold',
  },
  {
    id: 'crit-silver',
    name: 'ระดับเหรียญเงิน',
    minScore: 14,
    maxScore: 15,
    percentLabel: 'คิดเป็น 70% – 79%',
    description: 'ได้รับเกียรติบัตรอิเล็กทรอนิกส์ ระดับเหรียญเงิน พร้อมระบุผลคะแนนอย่างเป็นทางการ',
    colorTheme: 'silver',
  },
  {
    id: 'crit-bronze',
    name: 'ระดับเหรียญทองแดง',
    minScore: 12,
    maxScore: 13,
    percentLabel: 'คิดเป็น 60% – 69%',
    description: 'ได้รับเกียรติบัตรอิเล็กทรอนิกส์ ระดับเหรียญทองแดง พร้อมระบุผลคะแนนอย่างเป็นทางการ',
    colorTheme: 'bronze',
  },
  {
    id: 'crit-commend',
    name: 'ระดับชมเชย',
    minScore: 0,
    maxScore: 11,
    percentLabel: 'คะแนนต่ำกว่า 60%',
    description: 'เข้าร่วมการทดสอบความรู้ความสามารถทางภาษาไทย (ไม่ผ่านเกณฑ์รับเกียรติบัตร)',
    colorTheme: 'stone',
  },
];

export const INITIAL_EXAM_INSTRUCTIONS: string[] = [
  'นักเรียนสามารถทำแบบทดสอบได้ครั้งเดียว โปรดตรวจสอบข้อมูลคำนำหน้า ชื่อ-นามสกุล และระดับชั้นให้ถูกต้องก่อนกดส่งคำตอบ',
  'เมื่อส่งคำตอบเรียบร้อยแล้ว ระบบจะประมวลผลและนำคะแนนเข้าสู่ระบบฐานข้อมูลกลางของโรงเรียน',
  'นักเรียนสามารถใช้ชื่อหรือชื่อ-นามสกุล ในการตรวจสอบคะแนนและดาวน์โหลดเกียรติบัตรได้ทันที',
  'แบบทดสอบจะเปิดในหน้า Google Forms ผ่านแท็บใหม่ โปรดตรวจสอบสัญญาณอินเทอร์เน็ตให้พร้อม',
];

export const DEFAULT_CONFIG: PublicConfig = {
  // Category A - ข้อมูลโครงการ
  PROJECT_NAME: 'THAI WSK 2026',
  PROJECT_SUBTITLE: 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
  PROJECT_DESCRIPTION: 'โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย เพื่อส่งเสริมศักยภาพความเป็นเลิศทางภาษาและวรรณคดีไทยแก่นักเรียนระดับมัธยมศึกษา',
  PROJECT_SLOGAN: 'ภาษาไทยล้ำค่า สืบสานภูมิปัญญา เชิดชูคุณค่าศิลป์แห่งสุนทร',
  LOGO_URL: '',
  HERO_BANNER_URL: '',
  HERO_BANNER_IMAGES: [
    '/src/assets/images/hero_thai_wsk_1794124482494.jpg',
    '/src/assets/images/thai_literature_art_1794124482930.jpg'
  ],
  ANNOUNCEMENT_TEXT: 'ขอเชิญนักเรียนชั้น ม.1 - ม.6 ร่วมกิจกรรมวัดความรู้ความสามารถภาษาไทย ประจำปีการศึกษา 2569 พร้อมรับเกียรติบัตรอิเล็กทรอนิกส์',

  // About Section
  ABOUT_SECTION_TITLE: 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย',
  ABOUT_SECTION_SUBTITLE: 'เกี่ยวกับโครงการวิชาการ',
  ABOUT_IMAGES: [
    '/src/assets/images/thai_literature_art_1794124482930.jpg',
    '/src/assets/images/certificate_preview_1794124484424.jpg'
  ],
  ABOUT_OBJECTIVES: INITIAL_OBJECTIVES,

  // Criteria Section
  CRITERIA_SECTION_TITLE: 'เกณฑ์การได้รับเกียรติบัตรรางวัล',
  CRITERIA_SECTION_SUBTITLE: 'เกณฑ์การประเมินและรางวัล',
  CRITERIA_ITEMS: INITIAL_CRITERIA_ITEMS,
  
  // Forms & Registration
  FORM_JUNIOR_TITLE: 'ข้อสอบวัดความรู้ความสามารถด้านภาษาไทย ระดับชั้นมัธยมศึกษาตอนต้น (ม.1–3)',
  FORM_JUNIOR_DESC: 'ครอบคลุมเนื้อหาหลักภาษาไทย การสะกดคำ การใช้คำตามความหมาย สำนวนสุภาษิต และวรรณคดีระดับมัธยมศึกษาตอนต้น',
  FORM_JUNIOR_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_JUNIOR/viewform',
  FORM_JUNIOR_ENABLED: true,

  FORM_SENIOR_TITLE: 'ข้อสอบวัดความรู้ความสามารถด้านภาษาไทย ระดับชั้นมัธยมศึกษาตอนปลาย (ม.4–6)',
  FORM_SENIOR_DESC: 'ครอบคลุมเนื้อหาหลักการใช้ภาษาเชิงวิชาการ วรรณคดีวิจักษ์ ฉันทลักษณ์ไทย และทักษะการคิดวิเคราะห์ระดับมัธยมศึกษาตอนปลาย',
  FORM_SENIOR_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_SENIOR/viewform',
  FORM_SENIOR_ENABLED: true,

  EXAM_INSTRUCTIONS: INITIAL_EXAM_INSTRUCTIONS,

  REGISTRATION_OPEN: true,
  REGISTRATION_DEADLINE: '2026-12-31T23:59:59+07:00', // Asia/Bangkok Time
  
  // Scoring
  SCORE_SEARCH_ENABLED: true,
  SCORE_SEARCH_INSTRUCTION: 'กรุณากรอกชื่อจริง หรือชื่อ-นามสกุล ของท่านเพื่อค้นหาผลคะแนนสอบ (ระบบรองรับการค้นหาทั้งแบบมีและไม่มีคำนำหน้า)',
  FULL_SCORE: 20,
  PASS_PERCENT: 60,
  GOLD_MIN_PERCENT: 80,
  SILVER_MIN_PERCENT: 70,
  BRONZE_MIN_PERCENT: 60,
  
  // Certificate
  CERTIFICATE_DOWNLOAD_ENABLED: true,
  CERTIFICATE_ANNOUNCEMENT: 'เกียรติบัตรพร้อมให้ดาวน์โหลดแล้วสำหรับผู้ที่ผ่านเกณฑ์การประเมิน 60% ขึ้นไป',
  CERTIFICATE_PREVIEW_ENABLED: true,
  CERTIFICATE_SEARCH_INSTRUCTION: 'กรุณากรอกชื่อ หรือชื่อ-นามสกุล เพื่อค้นหาและดาวน์โหลดเกียรติบัตรอิเล็กทรอนิกส์ PDF ของท่าน',
  
  // School Info
  SCHOOL_NAME: 'กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
  SCHOOL_DESCRIPTION: 'โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย (THAI WSK 2026) มุ่งเน้นการยกระดับผลสัมฤทธิ์ทางการเรียนและการอนุรักษ์มรดกทางวัฒนธรรมภาษาไทย',
  SCHOOL_ADDRESS: '442/30 ต.ตลาดกระทุ่มแบน อ.กระทุ่มแบน จ.สมุทรสาคร 74110',
  SCHOOL_PHONE: '034-471902',
  SCHOOL_FAX: '034-471901',
  SCHOOL_EMAIL: 'wisetschool@gmail.com',
  SCHOOL_WEBSITE: 'https://www.wsk.ac.th/wp/',
  SCHOOL_FACEBOOK: 'https://www.facebook.com/wisetsamutkhun',
  
  // Developer Info
  DEVELOPER_NAME: 'นายณัฐวุฒิ ธนาศิริธนวัชร์',
  DEVELOPER_DETAILS: 'นักศึกษาฝึกประสบการณ์วิชาชีพครู ชั้นปีที่ 2 สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร',
  DEVELOPER_FACEBOOK: 'https://www.facebook.com/nattawut.bk',

  // Footer Copyright
  FOOTER_COPYRIGHT: '© 2026 กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ". สงวนลิขสิทธิ์.',
};

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    Announcement_ID: 'ANN-001',
    Title: 'เปิดระบบทดสอบความรู้ภาษาไทย "สืบศิลป์ถิ่นอักษร" ประจำปี 2569',
    Description: 'ขอเชิญนักเรียนระดับชั้นมัธยมศึกษาตอนต้นและมัธยมศึกษาตอนปลาย เข้าทำแบบทดสอบวัดความรู้ความสามารถทางภาษาไทยออนไลน์ได้ตั้งแต่วันนี้เป็นต้นไป',
    Published_Date: '2026-11-01',
    Status: 'PUBLISHED',
    Priority: 'HIGH',
  },
  {
    Announcement_ID: 'ANN-002',
    Title: 'ข้อกำหนดและเกณฑ์การรับเกียรติบัตร',
    Description: 'ผู้ที่ทำแบบทดสอบได้คะแนนตั้งแต่ 60% (12 คะแนนขึ้นไป) จะได้รับเกียรติบัตรอิเล็กทรอนิกส์ แบ่งเป็นระดับเหรียญทอง เหรียญเงิน และเหรียญทองแดง',
    Published_Date: '2026-11-03',
    Status: 'PUBLISHED',
    Priority: 'NORMAL',
  },
  {
    Announcement_ID: 'ANN-003',
    Title: 'การตรวจสอบผลคะแนนและการดาวน์โหลดเกียรติบัตร',
    Description: 'นักเรียนสามารถใช้ชื่อ-นามสกุล ในการตรวจสอบคะแนนและดาวน์โหลดไฟล์เกียรติบัตร PDF ได้อย่างสะดวกรวดเร็ว',
    Published_Date: '2026-11-05',
    Status: 'PUBLISHED',
    Priority: 'NORMAL',
  },
];

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    Schedule_ID: 'SCH-001',
    Event_Name: 'เปิดระบบรับสมัครและทำแบบทดสอบออนไลน์',
    Event_Date: '1 พ.ย. 2569 - 31 ธ.ค. 2569',
    Start_Time: '08:30 น.',
    End_Time: '23:59 น.',
    Description: 'นักเรียนระดับชั้น ม.ต้น และ ม.ปลาย เข้าทำแบบทดสอบผ่านระบบออนไลน์',
    Status: 'IN_PROGRESS',
  },
  {
    Schedule_ID: 'SCH-002',
    Event_Name: 'ปิดรับคำตอบแบบทดสอบ',
    Event_Date: '31 ธ.ค. 2569',
    Start_Time: '23:59 น.',
    End_Time: '23:59 น.',
    Description: 'สิ้นสุดการส่งคำตอบของระบบแบบทดสอบประจำปีการศึกษา 2569',
    Status: 'UPCOMING',
  },
  {
    Schedule_ID: 'SCH-003',
    Event_Name: 'ประมวลผลคะแนนและเปิดระบบตรวจสอบคะแนน',
    Event_Date: '1 ม.ค. 2570 เป็นต้นไป',
    Start_Time: '09:00 น.',
    End_Time: 'ตลอด 24 ชั่วโมง',
    Description: 'ตรวจสอบผลคะแนนผ่านระบบ THAI WSK 2026 ด้วยชื่อ-นามสกุล',
    Status: 'UPCOMING',
  },
  {
    Schedule_ID: 'SCH-004',
    Event_Name: 'เปิดระบบดาวน์โหลดเกียรติบัตรอิเล็กทรอนิกส์',
    Event_Date: '5 ม.ค. 2570 เป็นต้นไป',
    Start_Time: '09:00 น.',
    End_Time: 'ตลอด 24 ชั่วโมง',
    Description: 'ดาวน์โหลดไฟล์เกียรติบัตร PDF จากระบบจัดเก็บ Google Drive',
    Status: 'UPCOMING',
  },
];

// Sample baseline data matching the exact Google Sheets schema (students can search by Name without verification code)
export const INITIAL_SCORES: ScoreRecord[] = [
  {
    Participant_ID: 'WSK-TH-001',
    Prefix: 'นาย',
    First_Name: 'กิตติพงษ์',
    Last_Name: 'รักอักษร',
    Level: 'มัธยมศึกษาตอนปลาย',
    Class: 'ม.5/1',
    School: 'โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
    Score: 19,
    Full_Score: 20,
    Percentage: 95,
    Result: 'ผ่าน',
    Award_Level: 'เหรียญทอง',
    Updated_At: '2026-11-05 14:20:00',
  },
  {
    Participant_ID: 'WSK-TH-002',
    Prefix: 'เด็กหญิง',
    First_Name: 'พิมพ์ชนก',
    Last_Name: 'วรรณศิลป์',
    Level: 'มัธยมศึกษาตอนต้น',
    Class: 'ม.2/3',
    School: 'โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
    Score: 17,
    Full_Score: 20,
    Percentage: 85,
    Result: 'ผ่าน',
    Award_Level: 'เหรียญทอง',
    Updated_At: '2026-11-05 15:10:00',
  },
  {
    Participant_ID: 'WSK-TH-003',
    Prefix: 'นางสาว',
    First_Name: 'ชลธิชา',
    Last_Name: 'สุวรรณศรี',
    Level: 'มัธยมศึกษาตอนปลาย',
    Class: 'ม.6/2',
    School: 'โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
    Score: 15,
    Full_Score: 20,
    Percentage: 75,
    Result: 'ผ่าน',
    Award_Level: 'เหรียญเงิน',
    Updated_At: '2026-11-06 10:05:00',
  },
  {
    Participant_ID: 'WSK-TH-004',
    Prefix: 'เด็กชาย',
    First_Name: 'ธนวัฒน์',
    Last_Name: 'วิเศษสมุท',
    Level: 'มัธยมศึกษาตอนต้น',
    Class: 'ม.1/5',
    School: 'โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
    Score: 13,
    Full_Score: 20,
    Percentage: 65,
    Result: 'ผ่าน',
    Award_Level: 'เหรียญทองแดง',
    Updated_At: '2026-11-06 11:45:00',
  },
  {
    Participant_ID: 'WSK-TH-005',
    Prefix: 'นาย',
    First_Name: 'พงศกร',
    Last_Name: 'ไทยเจริญ',
    Level: 'มัธยมศึกษาตอนปลาย',
    Class: 'ม.4/4',
    School: 'โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"',
    Score: 10,
    Full_Score: 20,
    Percentage: 50,
    Result: 'ไม่ผ่าน',
    Award_Level: 'ชมเชย',
    Updated_At: '2026-11-06 16:30:00',
  },
];

export const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    Participant_ID: 'WSK-TH-001',
    Prefix: 'นาย',
    First_Name: 'กิตติพงษ์',
    Last_Name: 'รักอักษร',
    Level: 'มัธยมศึกษาตอนปลาย',
    Class: 'ม.5/1',
    Award_Level: 'เหรียญทอง',
    PDF_URL: 'https://drive.google.com/file/d/1SAMPLE_DRIVE_FILE_ID_001/view?usp=sharing',
    File_ID: '1SAMPLE_DRIVE_FILE_ID_001',
    Status: 'READY',
    Created_At: '2026-11-05 16:00:00',
  },
  {
    Participant_ID: 'WSK-TH-002',
    Prefix: 'เด็กหญิง',
    First_Name: 'พิมพ์ชนก',
    Last_Name: 'วรรณศิลป์',
    Level: 'มัธยมศึกษาตอนต้น',
    Class: 'ม.2/3',
    Award_Level: 'เหรียญทอง',
    PDF_URL: 'https://drive.google.com/file/d/1SAMPLE_DRIVE_FILE_ID_002/view?usp=sharing',
    File_ID: '1SAMPLE_DRIVE_FILE_ID_002',
    Status: 'READY',
    Created_At: '2026-11-05 16:15:00',
  },
  {
    Participant_ID: 'WSK-TH-003',
    Prefix: 'นางสาว',
    First_Name: 'ชลธิชา',
    Last_Name: 'สุวรรณศรี',
    Level: 'มัธยมศึกษาตอนปลาย',
    Class: 'ม.6/2',
    Award_Level: 'เหรียญเงิน',
    PDF_URL: 'https://drive.google.com/file/d/1SAMPLE_DRIVE_FILE_ID_003/view?usp=sharing',
    File_ID: '1SAMPLE_DRIVE_FILE_ID_003',
    Status: 'READY',
    Created_At: '2026-11-06 12:00:00',
  },
  {
    Participant_ID: 'WSK-TH-004',
    Prefix: 'เด็กชาย',
    First_Name: 'ธนวัฒน์',
    Last_Name: 'วิเศษสมุท',
    Level: 'มัธยมศึกษาตอนต้น',
    Class: 'ม.1/5',
    Award_Level: 'เหรียญทองแดง',
    PDF_URL: '',
    File_ID: '',
    Status: 'PENDING',
    Created_At: '2026-11-06 13:00:00',
  },
];
