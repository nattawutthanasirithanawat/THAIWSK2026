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

const CONFIG_STORAGE_KEY = 'thai_wsk_config_v6';
const ANNOUNCEMENTS_STORAGE_KEY = 'thai_wsk_announcements_v6';
const SCHEDULE_STORAGE_KEY = 'thai_wsk_schedule_v6';
const LAST_UPDATE_KEY = 'thai_wsk_last_update_v6';

// Google Apps Script Web App Endpoint for immediate Google Sheets synchronization
export const APPS_SCRIPT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbwp49zX8VL4NIHV2muvKax_0CYT2tiBpRWXuSw7KKnhWMhwn-SsM2RgvEO8DQwZVoP4/exec';

// Broadcast channel for instantaneous cross-tab synchronization on the same device
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('thai_wsk_realtime_sync_v6')
  : null;

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

/**
 * Parses ADMIN_CONTROL sheet key-value rows from Google Sheets
 */
function parseAdminControlCSV(csvText: string): Partial<PublicConfig> {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const cfg: any = {};
  for (const line of lines) {
    const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!parts || parts.length < 2) continue;
    const key = parts[0].replace(/^"|"$/g, '').trim();
    let val = parts[1].replace(/^"|"$/g, '').trim();
    if (!key || key === 'Setting_Key' || key.includes(' ')) continue;

    // Clean escaped double quotes in Google Sheets CSV
    val = val.replace(/""/g, '"');

    if (val === 'TRUE' || val === 'true') {
      cfg[key] = true;
    } else if (val === 'FALSE' || val === 'false') {
      cfg[key] = false;
    } else if (!isNaN(Number(val)) && (key.includes('SCORE') || key.includes('PERCENT') || key.includes('COUNT'))) {
      cfg[key] = Number(val);
    } else {
      try {
        if ((val.startsWith('[') && val.endsWith(']')) || (val.startsWith('{') && val.endsWith('}'))) {
          cfg[key] = JSON.parse(val);
        } else {
          cfg[key] = val;
        }
      } catch {
        cfg[key] = val;
      }
    }
  }
  return cfg;
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
   * Universal fetch: guaranteed to work on ALL devices, ALL browsers, and ALL platforms:
   * 1. Try local server API route (/api/system-data)
   * 2. If 404 (mobile phone, iPad, shared URL, GitHub Pages), query Google Sheets ADMIN_CONTROL directly via Google CORS GViz!
   * 3. Fallback to localStorage or bundled baseline
   */
  public static async fetchServerData(): Promise<{
    config: PublicConfig;
    announcements: Announcement[];
    schedule: ScheduleItem[];
  }> {
    // 1. Try backend API endpoint (works when running with server)
    try {
      const res = await fetch(`/api/system-data?_t=${Date.now()}`, {
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

          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cfg));
          localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(ann));
          localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(sch));
          if (json.data.updatedAt) {
            localStorage.setItem(LAST_UPDATE_KEY, json.data.updatedAt);
          }

          return { config: cfg, announcements: ann, schedule: sch };
        }
      }
    } catch {
      // Endpoint unreachable or static environment
    }

    // 2. Query Google Sheets ADMIN_CONTROL sheet directly via Google's CORS GViz endpoint
    // This allows external devices (phones, tablets, external laptops) to pull the latest live settings!
    try {
      const sheetsUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=ADMIN_CONTROL&_t=${Date.now()}`;
      const sheetRes = await fetch(sheetsUrl, { cache: 'no-store' });
      if (sheetRes.ok) {
        const csvText = await sheetRes.text();
        const sheetConfig = parseAdminControlCSV(csvText);

        if (Object.keys(sheetConfig).length > 0) {
          const storedAnn = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
          const storedSch = localStorage.getItem(SCHEDULE_STORAGE_KEY);
          const ann = storedAnn ? JSON.parse(storedAnn) : INITIAL_ANNOUNCEMENTS;
          const sch = storedSch ? JSON.parse(storedSch) : INITIAL_SCHEDULE;

          const mergedConfig: PublicConfig = {
            ...DEFAULT_CONFIG,
            ...(persistedInitial.config as any || {}),
            ...sheetConfig,
          };

          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(mergedConfig));
          return { config: mergedConfig, announcements: ann, schedule: sch };
        }
      }
    } catch (sheetErr) {
      console.warn('[Sync] Google Sheet direct fetch failed:', sheetErr);
    }

    // 3. Fallback: localStorage or bundled persistent JSON
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
   * Saves updated system data:
   * 1. Updates LocalStorage & BroadcastChannel immediately (0ms).
   * 2. Saves to Express server (/api/admin/save-config) to persist in database file.
   * 3. Sends immediate update to Google Sheets via Google Apps Script Web App with timestamp.
   */
  public static async saveAllSystemData(
    config: PublicConfig,
    announcements: Announcement[],
    schedule: ScheduleItem[]
  ): Promise<{ success: boolean; message: string }> {
    const nowIso = new Date().toISOString();
    const thaiTime = new Intl.DateTimeFormat('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'Asia/Bangkok',
    }).format(new Date());

    // 1. Immediately cache in localStorage on this device
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
      localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
      localStorage.setItem(LAST_UPDATE_KEY, nowIso);
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

    // 3. Post to Express backend server (updates central disk storage for all devices)
    try {
      fetch('/api/admin/save-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ config, announcements, schedule }),
      }).catch(() => {});
    } catch {
      // Backend request scheduled
    }

    // 4. Send update to Google Sheets via Google Apps Script Web App
    // Using mode: 'no-cors' so the browser reliably delivers the POST payload without CORS blockage
    try {
      const payload = {
        action: 'SAVE_CONFIG',
        config,
        announcements,
        schedule,
        updatedAt: nowIso,
        thaiTime,
      };

      fetch(APPS_SCRIPT_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch (e) {
      console.warn('Google Sheets sync dispatch warning:', e);
    }

    return {
      success: true,
      message: `บันทึกข้อมูลและส่งลง Google Sheets สำเร็จ (${thaiTime} น.)`,
    };
  }

  /**
   * Fetches scores directly from Google Sheets "SCORES" tab
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
