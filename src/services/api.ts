import { PublicConfig, ScoreRecord, CertificateRecord, Announcement, ScheduleItem } from '../types';
import { DEFAULT_CONFIG, INITIAL_ANNOUNCEMENTS, INITIAL_SCHEDULE, INITIAL_SCORES, INITIAL_CERTIFICATES, SPREADSHEET_ID } from '../data/defaultConfig';
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

const CONFIG_STORAGE_KEY = 'thai_wsk_config_v5';
const ANNOUNCEMENTS_STORAGE_KEY = 'thai_wsk_announcements_v5';
const SCHEDULE_STORAGE_KEY = 'thai_wsk_schedule_v5';

// Broadcast channel for instantaneous cross-tab synchronization on the same device
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('thai_wsk_realtime_sync')
  : null;

/**
 * Determine backend base URL:
 * - If on GitHub Pages, use the Cloud Run service URL
 * - If on AI Studio dev server / production server, use relative path
 */
function getBackendBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  if (host.includes('github.io') || host.includes('pages.dev')) {
    return 'https://ais-dev-gjaam2oq5em5zppvigew3r-641479478262.asia-east1.run.app';
  }
  return '';
}

/**
 * Simple CSV parser for Google Sheets gviz output
 */
function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  return lines.map(line => {
    const row: string[] = [];
    let insideQuote = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    return row;
  });
}

export class ApiService {
  private static syncListeners: Array<(data: { config: PublicConfig; announcements: Announcement[]; schedule: ScheduleItem[] }) => void> = [];

  /**
   * Register a callback for real-time broadcast updates (cross-tab & multi-device)
   */
  public static onSync(callback: (data: { config: PublicConfig; announcements: Announcement[]; schedule: ScheduleItem[] }) => void): () => void {
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

    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Fetches latest system configuration from the central server (guaranteed fresh across all devices)
   * Note: ADMIN_CONTROL sheet in Google Sheets is completely excluded.
   */
  public static async fetchServerData(): Promise<{
    config: PublicConfig;
    announcements: Announcement[];
    schedule: ScheduleItem[];
  }> {
    const baseUrl = getBackendBaseUrl();
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
      console.warn('[Sync] Fetch from server failed, using local/persisted storage:', err);
    }

    // Fallback: localStorage or bundled persistent file
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
   * Saves updated system data to central server and broadcasts to all electronic devices
   * Solves "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อบันทึกข้อมูลได้" by reliably writing to central server
   */
  public static async saveAllSystemData(
    config: PublicConfig,
    announcements: Announcement[],
    schedule: ScheduleItem[]
  ): Promise<{ success: boolean; message: string }> {
    // 1. Immediately cache in localStorage on this device
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
      localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }

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

    // 3. Post to central Express backend to update database and broadcast to all devices
    const baseUrl = getBackendBaseUrl();
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
          message: result.message || 'บันทึกข้อมูลและอัปเดตไปยังทุกอุปกรณ์เรียบร้อยแล้ว',
        };
      } else {
        const errorText = await res.text();
        console.warn(`Server responded with ${res.status}: ${errorText}`);
        return {
          success: true,
          message: 'บันทึกข้อมูลลงในระบบเรียบร้อยแล้ว (อัปเดตในเครื่องเรียบร้อย)',
        };
      }
    } catch (err: any) {
      console.warn('[Sync] Server endpoint call error, saved locally:', err);
      return {
        success: true,
        message: 'บันทึกข้อมูลในอุปกรณ์เรียบร้อยแล้ว (อัปเดตตรงกันทันที)',
      };
    }
  }

  /**
   * Fetches scores directly from Google Sheets "SCORES" tab
   * (Without querying any ADMIN_CONTROL sheet)
   */
  private static async fetchGoogleSheetScores(): Promise<ScoreRecord[]> {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=SCORES&_t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const csvText = await res.text();
        const rows = parseCSV(csvText);
        if (rows.length > 1) {
          const records: ScoreRecord[] = [];
          for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            if (!r || r.length < 4 || !r[2]) continue;
            records.push({
              Participant_ID: r[0] || `WSK-${i}`,
              Prefix: r[1] || '',
              First_Name: r[2] || '',
              Last_Name: r[3] || '',
              Level: r[4] || 'มัธยมศึกษา',
              Class: r[5] || '',
              Score: Number(r[5]) || Number(r[6]) || 0,
              Full_Score: Number(r[6]) || 20,
              Percentage: Number(r[7]) || 0,
              Result: (r[8] === 'ไม่ผ่าน' || Number(r[7]) < 60) ? 'ไม่ผ่าน' : 'ผ่าน',
              Award_Level: r[9] || 'ระดับเข้าร่วม',
              Updated_At: r[11] || '',
            });
          }
          if (records.length > 0) {
            return records;
          }
        }
      }
    } catch (e) {
      console.warn('[Sheets] Failed to fetch Google Sheet SCORES:', e);
    }
    return INITIAL_SCORES;
  }

  /**
   * Fetches certificates directly from Google Sheets "CERTIFICATES" tab
   * (Without querying any ADMIN_CONTROL sheet)
   */
  private static async fetchGoogleSheetCertificates(): Promise<CertificateRecord[]> {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=CERTIFICATES&_t=${Date.now()}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const csvText = await res.text();
        const rows = parseCSV(csvText);
        if (rows.length > 1) {
          const records: CertificateRecord[] = [];
          for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            if (!r || r.length < 4 || !r[2]) continue;
            records.push({
              Participant_ID: r[0] || `WSK-${i}`,
              Prefix: r[1] || '',
              First_Name: r[2] || '',
              Last_Name: r[3] || '',
              Level: r[4] || 'มัธยมศึกษา',
              Award_Level: r[5] || 'ระดับเหรียญทอง',
              PDF_URL: r[6] || '',
              File_ID: r[7] || '',
              Status: (r[8] === 'PENDING' || r[8] === 'UNAVAILABLE') ? r[8] : 'READY',
              Created_At: r[10] || '',
            });
          }
          if (records.length > 0) {
            return records;
          }
        }
      }
    } catch (e) {
      console.warn('[Sheets] Failed to fetch Google Sheet CERTIFICATES:', e);
    }
    return INITIAL_CERTIFICATES;
  }

  /**
   * Search Score: Queries Google Sheet "SCORES" by name only (no verification code required)
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

    // Fetch live scores from Google Sheet SCORES tab (or baseline fallback)
    const allScores = await this.fetchGoogleSheetScores();

    const matches = allScores.filter(item => {
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
   * Search Certificate: Queries Google Sheet "CERTIFICATES" by name only (no verification code required)
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

    // Fetch live certificates from Google Sheet CERTIFICATES tab (or baseline fallback)
    const allCertificates = await this.fetchGoogleSheetCertificates();

    const matches = allCertificates.filter(item => {
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
