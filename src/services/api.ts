import { PublicConfig, ScoreRecord, CertificateRecord, Announcement, ScheduleItem } from '../types';
import { DEFAULT_CONFIG, INITIAL_ANNOUNCEMENTS, INITIAL_SCHEDULE, INITIAL_SCORES, INITIAL_CERTIFICATES } from '../data/defaultConfig';
import persistedInitial from '../data/persistedData.json';

/**
 * Normalizes Thai names by trimming, collapsing spaces, and stripping prefixes
 */
export function normalizeThaiName(input: string): { cleanFullName: string; firstName: string; lastName: string } {
  if (!input) return { cleanFullName: '', firstName: '', lastName: '' };
  
  let cleaned = input.trim().replace(/\s+/g, ' ');
  
  const prefixes = [
    'เด็กหญิง', 'เด็กชาย', 'นางสาว', 'ด.ช.', 'ด.ญ.', 'ดช.', 'ดญ.', 'ด.ช', 'ด.ญ', 'นาย', 'นาง',
  ];
  
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }
  
  const parts = cleaned.split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  
  return {
    cleanFullName: cleaned,
    firstName,
    lastName,
  };
}

// 1. นำ URL ของ Google Apps Script Web App (หรือ Cloud Run) มาใส่ที่นี่
const API_URL = 'https://script.google.com/macros/s/AKfycbwp49zX8VL4NIHV2muvKax_0CYT2tiBpRWXuSw7KKnhWMhwn-SsM2RgvEO8DQwZVoP4/exec'; 

export class ApiService {
  
  /**
   * เพิ่มฟังก์ชัน onSync กลับเข้ามาเพื่อแก้ปัญหาหน้าเว็บขาว (Uncaught TypeError: onSync is not a function)
   * และตั้งค่าให้ดึงข้อมูลจาก Server อัตโนมัติทุกๆ 30 วินาที
   */
  public static onSync(callback?: () => void): () => void {
    // กำหนดให้ดึงข้อมูลใหม่ทุกๆ 30 วินาที
    const interval = setInterval(async () => {
      try {
        await this.fetchServerData();
        if (callback) callback();
      } catch (error) {
        console.error("Auto-sync failed:", error);
      }
    }, 30000);

    // ส่งคืนฟังก์ชันสำหรับ Cleanup เมื่อ Component ถูกลบ
    return () => clearInterval(interval);
  }
  
  /**
   * ดึงข้อมูลล่าสุดจาก Server
   */
  public static async fetchServerData(): Promise<{
    config: PublicConfig;
    announcements: Announcement[];
    schedule: ScheduleItem[];
  }> {
    try {
      const res = await fetch(`${API_URL}?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store', 
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          return {
            config: { ...DEFAULT_CONFIG, ...(json.data.config || {}) },
            announcements: json.data.announcements || INITIAL_ANNOUNCEMENTS,
            schedule: json.data.schedule || INITIAL_SCHEDULE,
          };
        }
      }
    } catch (err) {
      console.warn('[Sync] Failed to fetch latest data, using offline fallback:', err);
    }

    // Fallback: กรณี API พัง หรือยังไม่ได้ใส่ API_URL ให้แสดงข้อมูลพื้นฐาน
    return {
      config: DEFAULT_CONFIG,
      announcements: INITIAL_ANNOUNCEMENTS,
      schedule: INITIAL_SCHEDULE,
    };
  }

  public static async getConfig(): Promise<PublicConfig> {
    const data = await this.fetchServerData();
    return data.config;
  }

  public static async getAnnouncements(): Promise<Announcement[]> {
    const data = await this.fetchServerData();
    return data.announcements;
  }

  public static async getSchedule(): Promise<ScheduleItem[]> {
    const data = await this.fetchServerData();
    return data.schedule;
  }

  /**
   * บันทึกข้อมูลไปยัง Server
   */
  public static async saveAllSystemData(
    config: PublicConfig,
    announcements: Announcement[],
    schedule: ScheduleItem[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify({ config, announcements, schedule }),
      });

      if (res.ok) {
        return {
          success: true,
          message: 'บันทึกข้อมูลและอัปเดตไปยังระบบเรียบร้อยแล้ว',
        };
      } else {
        const errorText = await res.text();
        return {
          success: false,
          message: `เซิร์ฟเวอร์ตอบกลับข้อผิดพลาด: ${errorText}`,
        };
      }
    } catch (err: any) {
      console.error('[Sync] Could not save to server:', err);
      return {
        success: false,
        message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อบันทึกข้อมูลได้',
      };
    }
  }

  /**
   * Search Score
   */
  public static async searchScore(queryName: string): Promise<{
    status: 'FOUND' | 'NOT_FOUND' | 'MULTIPLE_MATCHES' | 'SYSTEM_CLOSED' | 'INVALID_INPUT';
    message: string;
    record?: ScoreRecord;
    records?: ScoreRecord[];
  }> {
    const config = await this.getConfig();
    if (!config.SCORE_SEARCH_ENABLED) {
      return {
        status: 'SYSTEM_CLOSED',
        message: 'ระบบตรวจสอบผลคะแนนยังไม่เปิดให้ใช้งานในขณะนี้',
      };
    }

    const trimmedName = queryName.trim();
    if (!trimmedName) {
      return {
        status: 'INVALID_INPUT',
        message: 'กรุณากรอกชื่อหรือชื่อ-นามสกุลของผู้เข้าสอบ',
      };
    }

    const { firstName, lastName, cleanFullName } = normalizeThaiName(trimmedName);

    const matches = INITIAL_SCORES.filter(item => {
      const itemNormalized = normalizeThaiName(`${item.First_Name} ${item.Last_Name}`);
      const firstNameMatch = itemNormalized.firstName === firstName;
      const lastNameMatch = !lastName || itemNormalized.lastName.includes(lastName) || lastName.includes(itemNormalized.lastName);
      const fullNameMatch = itemNormalized.cleanFullName.includes(cleanFullName);

      return (firstNameMatch && lastNameMatch) || fullNameMatch;
    });

    if (matches.length === 0) {
      return {
        status: 'NOT_FOUND',
        message: `ไม่พบข้อมูลผลการสอบของ "${trimmedName}"`,
      };
    }

    if (matches.length === 1) {
      return {
        status: 'FOUND',
        message: 'พบข้อมูลผลการทดสอบเรียบร้อยแล้ว',
        record: matches[0],
      };
    }

    return {
      status: 'MULTIPLE_MATCHES',
      message: `พบรายชื่อที่ตรงกัน ${matches.length} รายการ`,
      records: matches,
    };
  }

  /**
   * Search Certificate
   */
  public static async searchCertificate(queryName: string): Promise<{
    status: 'FOUND' | 'NOT_FOUND' | 'MULTIPLE_MATCHES' | 'SYSTEM_CLOSED' | 'INVALID_INPUT';
    message: string;
    record?: CertificateRecord;
    records?: CertificateRecord[];
  }> {
    const config = await this.getConfig();
    if (!config.CERTIFICATE_DOWNLOAD_ENABLED) {
      return {
        status: 'SYSTEM_CLOSED',
        message: 'ระบบดาวน์โหลดเกียรติบัตรยังไม่เปิดให้ใช้งานในขณะนี้',
      };
    }

    const trimmedName = queryName.trim();
    if (!trimmedName) {
      return {
        status: 'INVALID_INPUT',
        message: 'กรุณากรอกชื่อหรือชื่อ-นามสกุลของผู้เข้าสอบ',
      };
    }

    const { firstName, lastName, cleanFullName } = normalizeThaiName(trimmedName);

    const matches = INITIAL_CERTIFICATES.filter(item => {
      const itemNormalized = normalizeThaiName(`${item.First_Name} ${item.Last_Name}`);
      const firstNameMatch = itemNormalized.firstName === firstName;
      const lastNameMatch = !lastName || itemNormalized.lastName.includes(lastName) || lastName.includes(itemNormalized.lastName);
      const fullNameMatch = itemNormalized.cleanFullName.includes(cleanFullName);

      return (firstNameMatch && lastNameMatch) || fullNameMatch;
    });

    if (matches.length === 0) {
      return {
        status: 'NOT_FOUND',
        message: `ไม่พบข้อมูลเกียรติบัตรของ "${trimmedName}"`,
      };
    }

    if (matches.length === 1) {
      return {
        status: 'FOUND',
        message: 'พบข้อมูลเกียรติบัตรเรียบร้อยแล้ว',
        record: matches[0],
      };
    }

    return {
      status: 'MULTIPLE_MATCHES',
      message: `พบข้อมูลเกียรติบัตร ${matches.length} รายการ`,
      records: matches,
    };
  }
}
