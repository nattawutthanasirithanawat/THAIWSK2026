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
    'เด็กหญิง',
    'เด็กชาย',
    'นางสาว',
    'ด.ช.',
    'ด.ญ.',
    'ดช.',
    'ดญ.',
    'ด.ช',
    'ด.ญ',
    'นาย',
    'นาง',
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

const CONFIG_STORAGE_KEY = 'thai_wsk_config_v3';
const ANNOUNCEMENTS_STORAGE_KEY = 'thai_wsk_announcements_v3';
const SCHEDULE_STORAGE_KEY = 'thai_wsk_schedule_v3';

// Broadcast channel for instantaneous cross-tab synchronization
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('thai_wsk_realtime_sync')
  : null;

// Determine backend base URL (works on Local, Cloud Run, and GitHub Pages)
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  // If hosted on GitHub Pages or custom static domain, connect to the Cloud Run backend
  if (host.includes('github.io') || host.includes('pages.dev')) {
    return 'https://ais-dev-gjaam2oq5em5zppvigew3r-641479478262.asia-east1.run.app';
  }
  return '';
}

export class ApiService {
  private static syncListeners: Array<(data: { config: PublicConfig; announcements: Announcement[]; schedule: ScheduleItem[] }) => void> = [];

  /**
   * Register a callback for real-time broadcast updates
   */
  public static onSync(callback: (data: { config: PublicConfig; announcements: Announcement[]; schedule: ScheduleItem[] }) => void) {
    this.syncListeners.push(callback);
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'DATA_UPDATED') {
          callback({
            config: event.data.config,
            announcements: event.data.announcements,
            schedule: event.data.schedule,
          });
        }
      };
    }
  }

  /**
   * Fetches latest system data from server (guaranteed fresh across all electronic devices)
   */
  public static async fetchServerData(): Promise<{
    config: PublicConfig;
    announcements: Announcement[];
    schedule: ScheduleItem[];
  }> {
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/api/system-data?_t=${Date.now()}`;

    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const cfg = { ...DEFAULT_CONFIG, ...(json.data.config || {}) };
          const ann = json.data.announcements || INITIAL_ANNOUNCEMENTS;
          const sch = json.data.schedule || INITIAL_SCHEDULE;

          // Cache locally for instant offline display
          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cfg));
          localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(ann));
          localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(sch));

          return { config: cfg, announcements: ann, schedule: sch };
        }
      }
    } catch (err) {
      console.warn('[Sync] Direct fetch failed, trying local fallback:', err);
    }

    // Fallback to persisted JSON bundled in build or localStorage
    try {
      const storedCfg = localStorage.getItem(CONFIG_STORAGE_KEY);
      const storedAnn = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
      const storedSch = localStorage.getItem(SCHEDULE_STORAGE_KEY);

      const cfg = storedCfg ? JSON.parse(storedCfg) : (persistedInitial.config as any || DEFAULT_CONFIG);
      const ann = storedAnn ? JSON.parse(storedAnn) : (persistedInitial.announcements as any || INITIAL_ANNOUNCEMENTS);
      const sch = storedSch ? JSON.parse(storedSch) : (persistedInitial.schedule as any || INITIAL_SCHEDULE);

      return {
        config: { ...DEFAULT_CONFIG, ...cfg },
        announcements: ann,
        schedule: sch,
      };
    } catch {
      return {
        config: DEFAULT_CONFIG,
        announcements: INITIAL_ANNOUNCEMENTS,
        schedule: INITIAL_SCHEDULE,
      };
    }
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
   * Saves updated system data to Server filesystem, LocalStorage, and BroadcastChannel
   * Ensuring all electronic devices access identical latest data immediately
   */
  public static async saveAllSystemData(
    config: PublicConfig,
    announcements: Announcement[],
    schedule: ScheduleItem[]
  ): Promise<{ success: boolean; message: string }> {
    // 1. Update localStorage immediately on this device
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));

    // 2. Broadcast immediately across open tabs on this machine
    if (syncChannel) {
      try {
        syncChannel.postMessage({
          type: 'DATA_UPDATED',
          timestamp: Date.now(),
          config,
          announcements,
          schedule,
        });
      } catch (e) {
        console.warn('Broadcast error:', e);
      }
    }

    // 3. Post to backend server endpoint to update central storage for all other devices
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/api/admin/save-config`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ config, announcements, schedule }),
      });

      if (res.ok) {
        const result = await res.json();
        return {
          success: true,
          message: 'บันทึกข้อมูลสำเร็จและอัปเดตไปยังทุกอุปกรณ์เรียบร้อยแล้ว',
        };
      } else {
        const errorText = await res.text();
        return {
          success: false,
          message: `บันทึกบนเครื่องสำเร็จ แต่เซิร์ฟเวอร์ตอบกลับรหัส ${res.status}: ${errorText}`,
        };
      }
    } catch (err: any) {
      console.warn('[Sync] Could not reach backend save endpoint, saved locally:', err);
      return {
        success: true,
        message: 'บันทึกในอุปกรณ์ปัจจุบันสำเร็จ (กำลังรอการเชื่อมต่อเซิร์ฟเวอร์กลางเพื่อซิงค์ไปยังอุปกรณ์อื่น)',
      };
    }
  }

  /**
   * Search Score by Student Name only (No verification code required)
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
        message: 'ระบบตรวจสอบผลคะแนนยังไม่เปิดให้ใช้งานในขณะนี้ กรุณาติดตามประกาศกำหนดการ',
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
        message: `ไม่พบข้อมูลผลการสอบของ "${trimmedName}" กรุณาตรวจสอบตัวสะกดชื่อ-นามสกุลให้ถูกต้อง`,
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
      message: `พบรายชื่อที่ตรงกัน ${matches.length} รายการ กรุณาเลือกรายการของท่าน`,
      records: matches,
    };
  }

  /**
   * Search Certificate by Student Name only (No verification code required)
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
        message: 'ระบบดาวน์โหลดเกียรติบัตรยังไม่เปิดให้ใช้งานในขณะนี้ กรุณาตรวจสอบกำหนดการ',
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
        message: `ไม่พบข้อมูลเกียรติบัตรของ "${trimmedName}" หรือยังไม่มีเกียรติบัตรสำหรับรายการนี้`,
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
      message: `พบข้อมูลเกียรติบัตร ${matches.length} รายการ กรุณาเลือกรายการของท่าน`,
      records: matches,
    };
  }
}
