import { PublicConfig, ScoreRecord, CertificateRecord, Announcement, ScheduleItem } from '../types';
import { DEFAULT_CONFIG, INITIAL_ANNOUNCEMENTS, INITIAL_SCHEDULE, INITIAL_SCORES, INITIAL_CERTIFICATES } from '../data/defaultConfig';
import persistedInitial from '../data/persistedData.json';
import { normalizeThaiName } from './utils'; // ย้ายฟังก์ชัน normalizeThaiName ไปไว้ไฟล์อื่นเพื่อความสะอาด

// 1. นำ URL ของ Google Apps Script Web App (หรือ Cloud Run) มาใส่ที่นี่
const API_URL = 'https://script.google.com/macros/s/AKfycbwp49zX8VL4NIHV2muvKax_0CYT2tiBpRWXuSw7KKnhWMhwn-SsM2RgvEO8DQwZVoP4/exec'; 

export class ApiService {
  
  /**
   * ดึงข้อมูลล่าสุดจาก Server (Google Sheets / Database)
   */
  public static async fetchServerData(): Promise<{
    config: PublicConfig;
    announcements: Announcement[];
    schedule: ScheduleItem[];
  }> {
    try {
      // ดึงจาก API โดยตรง พร้อมป้องกันการจำ Cache
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
      console.error('[Sync] Failed to fetch latest data from server:', err);
    }

    // Fallback: ถ้าเน็ตหลุดหรือ API พัง ให้ใช้ข้อมูล Default ในโค้ด
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
        method: 'POST', // ต้องไปเขียน doPost() ใน Google Apps Script ให้รองรับด้วย
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, announcements, schedule }),
      });

      if (res.ok) {
        return {
          success: true,
          message: 'บันทึกข้อมูลและอัปเดตไปยังระบบเรียบร้อยแล้ว (ผู้ใช้อื่นจะเห็นเมื่อโหลดหน้าเว็บใหม่)',
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

  // ส่วนค้นหาคะแนนและเกียรติบัตร (searchScore, searchCertificate) ยังคงใช้โค้ดเดิมของคุณได้เลย
  // ... (โค้ดเดิม) ...
}
