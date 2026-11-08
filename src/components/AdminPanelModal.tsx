import React, { useState } from 'react';
import {
  X, Lock, ShieldCheck, Save, Plus, Trash2, CheckCircle,
  FileText, Calendar, Megaphone, Award, BookOpen, Sliders, LogOut, Info, Image, School, RefreshCw,
  Database, ExternalLink
} from 'lucide-react';
import { PublicConfig, Announcement, ScheduleItem, ProjectObjective, AwardCriteriaItem } from '../types';
import { ApiService } from '../services/api';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PublicConfig;
  announcements: Announcement[];
  schedule: ScheduleItem[];
  onSaveAll: (updatedConfig: PublicConfig, updatedAnnouncements: Announcement[], updatedSchedule: ScheduleItem[]) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  config,
  announcements,
  schedule,
  onSaveAll,
}) => {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'general' | 'images' | 'about' | 'criteria' | 'exams' | 'search' | 'schedule' | 'announcements' | 'footer' | 'sheets'
  >('general');

  // Form states cloned for editing
  const [formConfig, setFormConfig] = useState<PublicConfig>(config);
  const [formAnnouncements, setFormAnnouncements] = useState<Announcement[]>(announcements);
  const [formSchedule, setFormSchedule] = useState<ScheduleItem[]>(schedule);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Google Sheets Live Inspector State
  const [sheetData, setSheetData] = useState<{
    status: 'ONLINE' | 'OFFLINE';
    lastUpdated: string;
    lastUpdatedBy: string;
    items: Array<{ key: string; value: string; description: string; category: string; updatedAt: string }>;
    spreadsheetUrl: string;
    totalKeys: number;
  } | null>(null);
  const [isLoadingSheetData, setIsLoadingSheetData] = useState<boolean>(false);

  // Only clone state on initial open, NEVER wipe or overwrite while admin is typing/editing!
  const wasOpenRef = React.useRef<boolean>(false);
  React.useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setFormConfig(config);
      setFormAnnouncements(announcements);
      setFormSchedule(schedule);
      setLoginError('');
      setSaveSuccess(false);
      setSaveMessage('');
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === 'THAIWSK44230' && passwordInput.trim() === 'wskthai44230') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('ชื่อบัญชีหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบข้อมูล');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Saves to server-side JSON and localStorage so ALL devices see the exact same data immediately
      const result = await ApiService.saveAllSystemData(formConfig, formAnnouncements, formSchedule);
      onSaveAll(formConfig, formAnnouncements, formSchedule);
      setSaveSuccess(true);
      setSaveMessage(result.message || 'บันทึกและอัปเดตข้อมูลตรงกันทุกอุปกรณ์เรียบร้อยแล้ว');
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveSuccess(true);
      setSaveMessage('บันทึกข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const fresh = await ApiService.fetchServerData();
      setFormConfig(fresh.config);
      setFormAnnouncements(fresh.announcements);
      setFormSchedule(fresh.schedule);
      onSaveAll(fresh.config, fresh.announcements, fresh.schedule);
      setSaveSuccess(true);
      setSaveMessage('ดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์และ Google Sheets เรียบร้อยแล้ว (ตรงกันทุกอุปกรณ์)');
      setTimeout(() => setSaveSuccess(false), 4000);
      handleLoadSheetData();
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadSheetData = async () => {
    setIsLoadingSheetData(true);
    try {
      const raw = await ApiService.fetchGoogleSheetsRawData();
      setSheetData(raw);
    } catch (e) {
      console.error('Error fetching raw Google Sheet data:', e);
    } finally {
      setIsLoadingSheetData(false);
    }
  };

  // --- Image Slide Handlers ---
  const handleAddHeroImage = (url: string = '') => {
    const list = formConfig.HERO_BANNER_IMAGES || [];
    setFormConfig({
      ...formConfig,
      HERO_BANNER_IMAGES: [...list, url || ''],
    });
  };

  const handleRemoveHeroImage = (index: number) => {
    const list = formConfig.HERO_BANNER_IMAGES || [];
    setFormConfig({
      ...formConfig,
      HERO_BANNER_IMAGES: list.filter((_, i) => i !== index),
    });
  };

  const handleUpdateHeroImage = (index: number, val: string) => {
    const list = [...(formConfig.HERO_BANNER_IMAGES || [])];
    list[index] = val;
    setFormConfig({ ...formConfig, HERO_BANNER_IMAGES: list });
  };

  const handleAddAboutImage = (url: string = '') => {
    const list = formConfig.ABOUT_IMAGES || [];
    setFormConfig({
      ...formConfig,
      ABOUT_IMAGES: [...list, url || ''],
    });
  };

  const handleRemoveAboutImage = (index: number) => {
    const list = formConfig.ABOUT_IMAGES || [];
    setFormConfig({
      ...formConfig,
      ABOUT_IMAGES: list.filter((_, i) => i !== index),
    });
  };

  const handleUpdateAboutImage = (index: number, val: string) => {
    const list = [...(formConfig.ABOUT_IMAGES || [])];
    list[index] = val;
    setFormConfig({ ...formConfig, ABOUT_IMAGES: list });
  };

  // --- Objective Handlers ---
  const handleAddObjective = () => {
    const newObj: ProjectObjective = {
      id: `obj-${Date.now()}`,
      title: `${formConfig.ABOUT_OBJECTIVES.length + 1}. หัวข้อวัตถุประสงค์ใหม่`,
      description: 'ระบุรายละเอียดวัตถุประสงค์ของโครงการที่ต้องการเน้นย้ำ',
    };
    setFormConfig({
      ...formConfig,
      ABOUT_OBJECTIVES: [...formConfig.ABOUT_OBJECTIVES, newObj],
    });
  };

  const handleRemoveObjective = (id: string) => {
    setFormConfig({
      ...formConfig,
      ABOUT_OBJECTIVES: formConfig.ABOUT_OBJECTIVES.filter(o => o.id !== id),
    });
  };

  const handleUpdateObjective = (id: string, field: 'title' | 'description', value: string) => {
    setFormConfig({
      ...formConfig,
      ABOUT_OBJECTIVES: formConfig.ABOUT_OBJECTIVES.map(o =>
        o.id === id ? { ...o, [field]: value } : o
      ),
    });
  };

  // --- Criteria Item Handlers ---
  const handleAddCriteriaItem = () => {
    const newItem: AwardCriteriaItem = {
      id: `crit-${Date.now()}`,
      name: 'ระดับรางวัลใหม่',
      minScore: 0,
      maxScore: 20,
      percentLabel: 'คิดเป็นร้อยละ',
      description: 'คำอธิบายเกณฑ์และเงื่อนไขการได้รับรางวัล',
      colorTheme: 'stone',
    };
    setFormConfig({
      ...formConfig,
      CRITERIA_ITEMS: [...formConfig.CRITERIA_ITEMS, newItem],
    });
  };

  const handleRemoveCriteriaItem = (id: string) => {
    setFormConfig({
      ...formConfig,
      CRITERIA_ITEMS: formConfig.CRITERIA_ITEMS.filter(c => c.id !== id),
    });
  };

  const handleUpdateCriteriaItem = (id: string, field: keyof AwardCriteriaItem, value: any) => {
    setFormConfig({
      ...formConfig,
      CRITERIA_ITEMS: formConfig.CRITERIA_ITEMS.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    });
  };

  // --- Exam Instructions Handlers ---
  const handleAddInstruction = () => {
    setFormConfig({
      ...formConfig,
      EXAM_INSTRUCTIONS: [...formConfig.EXAM_INSTRUCTIONS, 'ระบุคำชี้แจงหรือข้อกำหนดเพิ่มเติมในการทำแบบทดสอบ'],
    });
  };

  const handleRemoveInstruction = (index: number) => {
    setFormConfig({
      ...formConfig,
      EXAM_INSTRUCTIONS: formConfig.EXAM_INSTRUCTIONS.filter((_, i) => i !== index),
    });
  };

  const handleUpdateInstruction = (index: number, text: string) => {
    const updated = [...formConfig.EXAM_INSTRUCTIONS];
    updated[index] = text;
    setFormConfig({ ...formConfig, EXAM_INSTRUCTIONS: updated });
  };

  // --- Schedule Handlers ---
  const handleAddSchedule = () => {
    const newItem: ScheduleItem = {
      Schedule_ID: `SCH-${String(formSchedule.length + 1).padStart(3, '0')}`,
      Event_Name: 'กิจกรรมกำหนดการใหม่',
      Event_Date: 'ระบุวันและระยะเวลา',
      Start_Time: '08:30 น.',
      End_Time: '16:30 น.',
      Description: 'รายละเอียดกิจกรรมหรือกำหนดการ',
      Status: 'UPCOMING',
    };
    setFormSchedule([...formSchedule, newItem]);
  };

  const handleRemoveSchedule = (id: string) => {
    setFormSchedule(formSchedule.filter(s => s.Schedule_ID !== id));
  };

  const handleUpdateSchedule = (id: string, field: keyof ScheduleItem, val: any) => {
    setFormSchedule(formSchedule.map(s => s.Schedule_ID === id ? { ...s, [field]: val } : s));
  };

  // --- Announcement Handlers ---
  const handleAddAnnouncement = () => {
    const newItem: Announcement = {
      Announcement_ID: `ANN-${String(formAnnouncements.length + 1).padStart(3, '0')}`,
      Title: 'หัวข้อประกาศใหม่',
      Description: 'รายละเอียดเนื้อหาข่าวประชาสัมพันธ์สำหรับผู้เข้าชมและนักเรียน',
      Published_Date: new Date().toISOString().split('T')[0],
      Status: 'PUBLISHED',
      Priority: 'NORMAL',
    };
    setFormAnnouncements([...formAnnouncements, newItem]);
  };

  const handleRemoveAnnouncement = (id: string) => {
    setFormAnnouncements(formAnnouncements.filter(a => a.Announcement_ID !== id));
  };

  const handleUpdateAnnouncement = (id: string, field: keyof Announcement, val: any) => {
    setFormAnnouncements(formAnnouncements.map(a => a.Announcement_ID === id ? { ...a, [field]: val } : a));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-stone-300 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-[#4B267D] text-white flex items-center justify-between border-b border-[#D6AF55]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D6AF55] flex items-center justify-center text-[#4B267D] font-bold text-sm shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-base sm:text-lg">
                ระบบจัดการสำหรับผู้ดูแลระบบ (Admin Control Center)
              </h2>
              <div className="text-xs text-[#F5E8C7]">
                THAI WSK 2026 · ข้อมูลอัปเดตแบบเรียลไทม์เชื่อมโยงทุกอุปกรณ์
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-[#F5E8C7] hover:text-white transition-colors cursor-pointer"
                title="ออกจากระบบแอดมิน"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Logged In Screen (NO credentials shown) */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 overflow-y-auto flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
            <div className="w-16 h-16 rounded-full bg-[#FAF8FD] border-2 border-[#D6AF55] flex items-center justify-center text-[#4B267D] mb-6 shadow-sm">
              <Lock className="w-8 h-8 text-[#4B267D]" />
            </div>

            <h3 className="font-heading font-bold text-xl text-[#30283A] mb-2 text-center">
              เข้าสู่ระบบสำหรับแอดมิน
            </h3>
            <p className="text-xs text-stone-500 mb-6 text-center">
              กรุณากรอกชื่อบัญชีและรหัสผ่านของผู้ดูแลระบบเพื่อเข้าสู่การจัดการ
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  ชื่อบัญชีผู้ดูแล (Username)
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="กรอกชื่อบัญชี"
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#7043A6] focus:border-transparent text-[#30283A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  รหัสผ่าน (Password)
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#7043A6] focus:border-transparent text-[#30283A]"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#4B267D] hover:bg-[#7043A6] text-white font-heading font-semibold text-sm transition-all shadow-md shadow-[#4B267D]/20 cursor-pointer mt-2"
              >
                เข้าสู่ระบบแอดมิน
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Admin Dashboard */
          <>
            {/* Admin Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50 px-4 overflow-x-auto gap-1 shrink-0">
              {[
                { id: 'general', label: '1. ข้อมูลทั่วไป', icon: <Sliders className="w-3.5 h-3.5" /> },
                { id: 'images', label: '2. ภาพสไลด์ (10 วิ)', icon: <Image className="w-3.5 h-3.5" /> },
                { id: 'about', label: '3. เกี่ยวกับโครงการ', icon: <BookOpen className="w-3.5 h-3.5" /> },
                { id: 'criteria', label: '4. เกณฑ์รางวัล', icon: <Award className="w-3.5 h-3.5" /> },
                { id: 'exams', label: '5. แบบทดสอบ', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'search', label: '6. คะแนน & เกียรติบัตร', icon: <Info className="w-3.5 h-3.5" /> },
                { id: 'schedule', label: '7. กำหนดการ', icon: <Calendar className="w-3.5 h-3.5" /> },
                { id: 'announcements', label: '8. ประกาศข่าว', icon: <Megaphone className="w-3.5 h-3.5" /> },
                { id: 'footer', label: '9. ข้อมูลกลุ่มสาระ & ผู้พัฒนา', icon: <School className="w-3.5 h-3.5" /> },
                { id: 'sheets', label: '10. ฐานข้อมูล Google Sheets (เรียกดูข้อมูล)', icon: <Database className="w-3.5 h-3.5 text-emerald-600" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === 'sheets') {
                      handleLoadSheetData();
                    }
                  }}
                  className={`flex items-center gap-1.5 py-3 px-3.5 font-heading text-xs font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-[#7043A6] text-[#4B267D] font-bold bg-white'
                      : 'border-transparent text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Admin Form Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-sm text-stone-700">
              
              {/* TAB 1: General Info */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="font-heading font-semibold text-base text-[#4B267D] mb-1">
                    ข้อมูลทั่วไปและคำโปรยโครงการ
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อย่อโครงการ</label>
                      <input
                        type="text"
                        value={formConfig.PROJECT_NAME}
                        onChange={(e) => setFormConfig({ ...formConfig, PROJECT_NAME: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อกิจกรรม</label>
                      <input
                        type="text"
                        value={formConfig.PROJECT_SUBTITLE}
                        onChange={(e) => setFormConfig({ ...formConfig, PROJECT_SUBTITLE: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">คำโปรยประจำโครงการ (Slogan)</label>
                    <input
                      type="text"
                      value={formConfig.PROJECT_SLOGAN}
                      onChange={(e) => setFormConfig({ ...formConfig, PROJECT_SLOGAN: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">คำอธิบายโครงการ</label>
                    <textarea
                      rows={3}
                      value={formConfig.PROJECT_DESCRIPTION}
                      onChange={(e) => setFormConfig({ ...formConfig, PROJECT_DESCRIPTION: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">ข้อความวิ่ง/ประชาสัมพันธ์หลัก</label>
                    <input
                      type="text"
                      value={formConfig.ANNOUNCEMENT_TEXT}
                      onChange={(e) => setFormConfig({ ...formConfig, ANNOUNCEMENT_TEXT: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Images & 10-Second Slideshows */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  <div>
                    <div className="font-heading font-semibold text-base text-[#4B267D]">
                      จัดการรูปภาพหัวเว็บ และส่วนเกี่ยวกับโครงการ (ระบบสไลด์ 10 วินาที)
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      สามารถเพิ่มหลายรูปเพื่อให้ระบบเปลี่ยนภาพอัตโนมัติทุก ๆ 10 วินาที หรือจะใส่เพียงรูปเดียวเพื่อแสดงภาพนิ่งก็ได้
                    </p>
                  </div>

                  {/* 1. Hero Banner Images */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8FD] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-heading font-semibold text-xs text-[#4B267D] uppercase tracking-wide">
                        1. รูปภาพแบนเนอร์ส่วนหัวเว็บ (Hero Banner)
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddHeroImage('')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4B267D] text-white text-xs font-medium hover:bg-[#7043A6] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เพิ่มรูปภาพหัวเว็บ</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(formConfig.HERO_BANNER_IMAGES || []).map((imgUrl, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200">
                          <span className="text-xs font-bold text-stone-400 w-6 text-center">{idx + 1}.</span>
                          <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => handleUpdateHeroImage(idx, e.target.value)}
                            placeholder="URL รูปภาพ เช่น /src/assets/images/... หรือ https://..."
                            className="flex-1 px-3 py-1.5 border rounded text-xs font-mono"
                          />
                          {imgUrl && (
                            <img
                              src={imgUrl}
                              alt="preview"
                              className="w-10 h-7 object-cover rounded border"
                              onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveHeroImage(idx)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="ลบรูปนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-500">
                      <span>ภาพแนะนำระบบ:</span>
                      <button
                        type="button"
                        onClick={() => handleAddHeroImage('/src/assets/images/hero_thai_wsk_1794124482494.jpg')}
                        className="px-2.5 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                      >
                        + แบนเนอร์อักษรไทยสีทอง
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddHeroImage('/src/assets/images/thai_literature_art_1794124482930.jpg')}
                        className="px-2.5 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                      >
                        + สมุดข่อยและวรรณคดี
                      </button>
                    </div>
                  </div>

                  {/* 2. About Section Images */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8FD] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-heading font-semibold text-xs text-[#7043A6] uppercase tracking-wide">
                        2. รูปภาพในส่วน "เกี่ยวกับโครงการวิชาการ"
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddAboutImage('')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7043A6] text-white text-xs font-medium hover:bg-[#4B267D] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เพิ่มรูปภาพส่วนโครงการ</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(formConfig.ABOUT_IMAGES || []).map((imgUrl, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200">
                          <span className="text-xs font-bold text-stone-400 w-6 text-center">{idx + 1}.</span>
                          <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => handleUpdateAboutImage(idx, e.target.value)}
                            placeholder="URL รูปภาพ เช่น /src/assets/images/... หรือ https://..."
                            className="flex-1 px-3 py-1.5 border rounded text-xs font-mono"
                          />
                          {imgUrl && (
                            <img
                              src={imgUrl}
                              alt="preview"
                              className="w-10 h-7 object-cover rounded border"
                              onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveAboutImage(idx)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="ลบรูปนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-500">
                      <span>ภาพแนะนำระบบ:</span>
                      <button
                        type="button"
                        onClick={() => handleAddAboutImage('/src/assets/images/thai_literature_art_1794124482930.jpg')}
                        className="px-2.5 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                      >
                        + วรรณคดีไทยและสมุดข่อย
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddAboutImage('/src/assets/images/certificate_preview_1794124484424.jpg')}
                        className="px-2.5 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                      >
                        + กรอบเกียรติบัตรทองคำ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: About Section & Objectives */}
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <div className="font-heading font-semibold text-base text-[#4B267D] mb-1">
                    จัดการส่วน "เกี่ยวกับโครงการวิชาการ" และวัตถุประสงค์
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">หัวข้อหลักของส่วน</label>
                      <input
                        type="text"
                        value={formConfig.ABOUT_SECTION_TITLE}
                        onChange={(e) => setFormConfig({ ...formConfig, ABOUT_SECTION_TITLE: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">หัวข้อย่อยด้านบน</label>
                      <input
                        type="text"
                        value={formConfig.ABOUT_SECTION_SUBTITLE}
                        onChange={(e) => setFormConfig({ ...formConfig, ABOUT_SECTION_SUBTITLE: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-heading font-semibold text-xs text-stone-800">
                        รายการวัตถุประสงค์และกลุ่มเป้าหมาย (สามารถเพิ่ม ลบ หรือแก้ไขข้อความได้)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddObjective}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4B267D] text-white text-xs font-medium hover:bg-[#7043A6] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เพิ่มวัตถุประสงค์</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formConfig.ABOUT_OBJECTIVES.map((obj) => (
                        <div key={obj.id} className="p-4 rounded-xl border border-stone-200 bg-[#FAF8FD] space-y-2 relative">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={obj.title}
                              onChange={(e) => handleUpdateObjective(obj.id, 'title', e.target.value)}
                              placeholder="หัวข้อวัตถุประสงค์"
                              className="font-semibold text-xs text-[#30283A] bg-white px-3 py-1.5 rounded-lg border border-stone-300 flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveObjective(obj.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="ลบรายการนี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={obj.description}
                            onChange={(e) => handleUpdateObjective(obj.id, 'description', e.target.value)}
                            placeholder="รายละเอียดคำอธิบายวัตถุประสงค์"
                            className="w-full bg-white px-3 py-2 rounded-lg border border-stone-300 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Award Criteria */}
              {activeTab === 'criteria' && (
                <div className="space-y-4">
                  <div className="font-heading font-semibold text-base text-[#4B267D] mb-1">
                    จัดการส่วน "เกณฑ์การได้รับเกียรติบัตรรางวัล"
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">หัวข้อส่วนเกณฑ์รางวัล</label>
                      <input
                        type="text"
                        value={formConfig.CRITERIA_SECTION_TITLE}
                        onChange={(e) => setFormConfig({ ...formConfig, CRITERIA_SECTION_TITLE: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">คะแนนเต็ม</label>
                      <input
                        type="number"
                        value={formConfig.FULL_SCORE}
                        onChange={(e) => setFormConfig({ ...formConfig, FULL_SCORE: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">เกณฑ์ผ่าน (%)</label>
                      <input
                        type="number"
                        value={formConfig.PASS_PERCENT}
                        onChange={(e) => setFormConfig({ ...formConfig, PASS_PERCENT: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-heading font-semibold text-xs text-stone-800">
                        รายการเกณฑ์เหรียญรางวัล (สามารถแก้ไขคะแนน ชื่อระดับรางวัล คำอธิบาย หรือลบ/เพิ่มได้)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddCriteriaItem}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4B267D] text-white text-xs font-medium hover:bg-[#7043A6] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เพิ่มระดับรางวัล</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formConfig.CRITERIA_ITEMS.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl border border-stone-200 bg-[#FAF8FD] space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateCriteriaItem(item.id, 'name', e.target.value)}
                              className="font-bold text-xs text-[#30283A] bg-white px-3 py-1.5 rounded-lg border border-stone-300 w-44"
                            />
                            <div className="flex items-center gap-2 text-xs">
                              <span>ช่วงคะแนน:</span>
                              <input
                                type="number"
                                value={item.minScore}
                                onChange={(e) => handleUpdateCriteriaItem(item.id, 'minScore', Number(e.target.value))}
                                className="w-16 bg-white px-2 py-1 rounded border text-center"
                              />
                              <span>ถึง</span>
                              <input
                                type="number"
                                value={item.maxScore}
                                onChange={(e) => handleUpdateCriteriaItem(item.id, 'maxScore', Number(e.target.value))}
                                className="w-16 bg-white px-2 py-1 rounded border text-center"
                              />
                            </div>
                            <input
                              type="text"
                              value={item.percentLabel}
                              onChange={(e) => handleUpdateCriteriaItem(item.id, 'percentLabel', e.target.value)}
                              placeholder="เช่น คิดเป็น 80% ขึ้นไป"
                              className="text-xs bg-white px-2.5 py-1 rounded border w-36"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCriteriaItem(item.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="ลบเกณฑ์นี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateCriteriaItem(item.id, 'description', e.target.value)}
                            placeholder="คำอธิบายสิทธิ์หรือประเภทเกียรติบัตร"
                            className="w-full bg-white px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Exams & Instructions */}
              {activeTab === 'exams' && (
                <div className="space-y-5">
                  <div className="font-heading font-semibold text-base text-[#4B267D] mb-1">
                    จัดการ "ระบบทำแบบทดสอบออนไลน์" และคำชี้แจง
                  </div>

                  {/* General Exam Switches */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8FD] border border-stone-200">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">สถานะระบบทำแบบทดสอบ</label>
                      <select
                        value={formConfig.REGISTRATION_OPEN ? 'open' : 'closed'}
                        onChange={(e) => setFormConfig({ ...formConfig, REGISTRATION_OPEN: e.target.value === 'open' })}
                        className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-medium"
                      >
                        <option value="open">เปิดระบบทำแบบทดสอบ (OPEN)</option>
                        <option value="closed">ปิดระบบทำแบบทดสอบ (CLOSED)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">วันและเวลาปิดรับคำตอบ (Asia/Bangkok)</label>
                      <input
                        type="text"
                        value={formConfig.REGISTRATION_DEADLINE}
                        onChange={(e) => setFormConfig({ ...formConfig, REGISTRATION_DEADLINE: e.target.value })}
                        placeholder="2026-12-31T23:59:59+07:00"
                        className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Junior Exam Settings */}
                  <div className="p-4 rounded-xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-heading font-semibold text-sm text-[#4B267D]">
                        ระดับมัธยมศึกษาตอนต้น (ม.1–3)
                      </div>
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formConfig.FORM_JUNIOR_ENABLED !== false}
                          onChange={(e) => setFormConfig({ ...formConfig, FORM_JUNIOR_ENABLED: e.target.checked })}
                          className="rounded text-[#4B267D]"
                        />
                        <span>เปิดแสดงการ์ดระดับ ม.ต้น ในระบบ</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">ชื่อหัวข้อแบบทดสอบ</label>
                      <input
                        type="text"
                        value={formConfig.FORM_JUNIOR_TITLE}
                        onChange={(e) => setFormConfig({ ...formConfig, FORM_JUNIOR_TITLE: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">คำอธิบายข้อสอบ</label>
                      <textarea
                        rows={2}
                        value={formConfig.FORM_JUNIOR_DESC}
                        onChange={(e) => setFormConfig({ ...formConfig, FORM_JUNIOR_DESC: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">ลิงก์ Google Forms ม.ต้น</label>
                      <input
                        type="url"
                        value={formConfig.FORM_JUNIOR_URL}
                        onChange={(e) => setFormConfig({ ...formConfig, FORM_JUNIOR_URL: e.target.value })}
                        placeholder="https://docs.google.com/forms/d/e/.../viewform"
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Senior Exam Settings */}
                  <div className="p-4 rounded-xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-heading font-semibold text-sm text-[#7043A6]">
                        ระดับมัธยมศึกษาตอนปลาย (ม.4–6)
                      </div>
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formConfig.FORM_SENIOR_ENABLED !== false}
                          onChange={(e) => setFormConfig({ ...formConfig, FORM_SENIOR_ENABLED: e.target.checked })}
                          className="rounded text-[#7043A6]"
                        />
                        <span>เปิดแสดงการ์ดระดับ ม.ปลาย ในระบบ</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">ชื่อหัวข้อแบบทดสอบ</label>
                      <input
                        type="text"
                        value={formConfig.FORM_SENIOR_TITLE}
                        onChange={(e) => setFormConfig({ ...formConfig, FORM_SENIOR_TITLE: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">คำอธิบายข้อสอบ</label>
                      <textarea
                        rows={2}
                        value={formConfig.FORM_SENIOR_DESC}
                        onChange={(e) => setFormConfig({ ...formConfig, FORM_SENIOR_DESC: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">ลิงก์ Google Forms ม.ปลาย</label>
                      <input
                        type="url"
                        value={formConfig.FORM_SENIOR_URL}
                        onChange={(e) => setFormConfig({ ...formConfig, FORM_SENIOR_URL: e.target.value })}
                        placeholder="https://docs.google.com/forms/d/e/.../viewform"
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Exam Instructions List */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-heading font-semibold text-xs text-stone-800">
                        แก้ไขคำชี้แจงในการทำแบบทดสอบ (เพิ่ม ลบ หรือแก้ไขข้อความได้)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddInstruction}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4B267D] text-white text-xs font-medium hover:bg-[#7043A6] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>เพิ่มคำชี้แจง</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formConfig.EXAM_INSTRUCTIONS.map((inst, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-stone-400 w-6 text-center">{idx + 1}.</span>
                          <input
                            type="text"
                            value={inst}
                            onChange={(e) => handleUpdateInstruction(idx, e.target.value)}
                            className="flex-1 bg-white px-3 py-2 rounded-lg border border-stone-300 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveInstruction(idx)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: Score Search & Certificates */}
              {activeTab === 'search' && (
                <div className="space-y-4">
                  <div className="font-heading font-semibold text-base text-[#4B267D] mb-1">
                    จัดการระบบตรวจสอบคะแนน และระบบเกียรติบัตร
                  </div>

                  {/* Score Search Controls */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8FD] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold text-xs text-stone-800">
                        การค้นหาผลคะแนนสอบ
                      </span>
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formConfig.SCORE_SEARCH_ENABLED}
                          onChange={(e) => setFormConfig({ ...formConfig, SCORE_SEARCH_ENABLED: e.target.checked })}
                          className="rounded text-[#4B267D]"
                        />
                        <span>เปิดระบบค้นหาคะแนน</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        คำชี้แจงและคำแนะนำในการค้นหาคะแนน (จะแสดงใต้ช่องกรอกชื่อ)
                      </label>
                      <textarea
                        rows={2}
                        value={formConfig.SCORE_SEARCH_INSTRUCTION}
                        onChange={(e) => setFormConfig({ ...formConfig, SCORE_SEARCH_INSTRUCTION: e.target.value })}
                        className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Certificate Search Controls */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8FD] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold text-xs text-stone-800">
                        การดาวน์โหลดเกียรติบัตรอิเล็กทรอนิกส์
                      </span>
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formConfig.CERTIFICATE_DOWNLOAD_ENABLED}
                          onChange={(e) => setFormConfig({ ...formConfig, CERTIFICATE_DOWNLOAD_ENABLED: e.target.checked })}
                          className="rounded text-[#4B267D]"
                        />
                        <span>เปิดระบบดาวน์โหลดเกียรติบัตร</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">ข้อความประกาศบนหน้าเกียรติบัตร</label>
                      <input
                        type="text"
                        value={formConfig.CERTIFICATE_ANNOUNCEMENT}
                        onChange={(e) => setFormConfig({ ...formConfig, CERTIFICATE_ANNOUNCEMENT: e.target.value })}
                        className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">
                        คำชี้แจงและคำแนะนำในการค้นหาเกียรติบัตร (จะแสดงใต้ช่องกรอกชื่อ)
                      </label>
                      <textarea
                        rows={2}
                        value={formConfig.CERTIFICATE_SEARCH_INSTRUCTION}
                        onChange={(e) => setFormConfig({ ...formConfig, CERTIFICATE_SEARCH_INSTRUCTION: e.target.value })}
                        className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={formConfig.CERTIFICATE_PREVIEW_ENABLED}
                        onChange={(e) => setFormConfig({ ...formConfig, CERTIFICATE_PREVIEW_ENABLED: e.target.checked })}
                        className="rounded text-[#4B267D]"
                      />
                      <span>เปิดแสดงภาพตัวอย่างเกียรติบัตร (Certificate Preview)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 7: Schedule Management */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-heading font-semibold text-base text-[#4B267D]">
                        จัดการกำหนดการสำคัญของโครงการ (Timeline)
                      </div>
                      <div className="text-xs text-stone-500">
                        สามารถแก้ไขวัน เวลา รายละเอียดหัวข้อ คำอธิบาย และเพิ่ม/ลบกำหนดการได้
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSchedule}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#4B267D] text-white text-xs font-medium hover:bg-[#7043A6] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มกำหนดการ</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formSchedule.map((item) => (
                      <div key={item.Schedule_ID} className="p-4 rounded-xl border border-stone-200 bg-[#FAF8FD] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <input
                            type="text"
                            value={item.Event_Name}
                            onChange={(e) => handleUpdateSchedule(item.Schedule_ID, 'Event_Name', e.target.value)}
                            placeholder="ชื่องาน/กิจกรรม"
                            className="font-bold text-xs text-[#30283A] bg-white px-3 py-1.5 rounded-lg border border-stone-300 flex-1 min-w-[200px]"
                          />
                          <select
                            value={item.Status}
                            onChange={(e) => handleUpdateSchedule(item.Schedule_ID, 'Status', e.target.value)}
                            className="text-xs bg-white px-3 py-1.5 rounded-lg border border-stone-300"
                          >
                            <option value="UPCOMING">เร็วๆ นี้ (UPCOMING)</option>
                            <option value="IN_PROGRESS">กำลังดำเนินการ (IN_PROGRESS)</option>
                            <option value="COMPLETED">เสร็จสิ้น (COMPLETED)</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveSchedule(item.Schedule_ID)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="ลบกำหนดการนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] text-stone-500 mb-1">วันที่จัดกิจกรรม</label>
                            <input
                              type="text"
                              value={item.Event_Date}
                              onChange={(e) => handleUpdateSchedule(item.Schedule_ID, 'Event_Date', e.target.value)}
                              placeholder="เช่น 1 พ.ย. - 31 ธ.ค. 2569"
                              className="w-full bg-white px-3 py-1.5 rounded-lg border text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-stone-500 mb-1">เวลาเริ่ม</label>
                            <input
                              type="text"
                              value={item.Start_Time}
                              onChange={(e) => handleUpdateSchedule(item.Schedule_ID, 'Start_Time', e.target.value)}
                              placeholder="08:30 น."
                              className="w-full bg-white px-3 py-1.5 rounded-lg border text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-stone-500 mb-1">เวลาสิ้นสุด</label>
                            <input
                              type="text"
                              value={item.End_Time}
                              onChange={(e) => handleUpdateSchedule(item.Schedule_ID, 'End_Time', e.target.value)}
                              placeholder="23:59 น."
                              className="w-full bg-white px-3 py-1.5 rounded-lg border text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-stone-500 mb-1">คำอธิบายรายละเอียด</label>
                          <textarea
                            rows={2}
                            value={item.Description}
                            onChange={(e) => handleUpdateSchedule(item.Schedule_ID, 'Description', e.target.value)}
                            placeholder="รายละเอียดกิจกรรม"
                            className="w-full bg-white px-3 py-1.5 rounded-lg border text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: Announcements Management */}
              {activeTab === 'announcements' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-heading font-semibold text-base text-[#4B267D]">
                        จัดการประกาศจากคณะกรรมการดำเนินงาน
                      </div>
                      <div className="text-xs text-stone-500">
                        สามารถแก้ไขประกาศ เพิ่มประกาศใหม่ หรือลบประกาศได้
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAnnouncement}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#4B267D] text-white text-xs font-medium hover:bg-[#7043A6] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มประกาศใหม่</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formAnnouncements.map((ann) => (
                      <div key={ann.Announcement_ID} className="p-4 rounded-xl border border-stone-200 bg-[#FAF8FD] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <input
                            type="text"
                            value={ann.Title}
                            onChange={(e) => handleUpdateAnnouncement(ann.Announcement_ID, 'Title', e.target.value)}
                            placeholder="หัวข้อข่าวประกาศ"
                            className="font-bold text-xs text-[#30283A] bg-white px-3 py-1.5 rounded-lg border border-stone-300 flex-1 min-w-[200px]"
                          />
                          <select
                            value={ann.Priority}
                            onChange={(e) => handleUpdateAnnouncement(ann.Announcement_ID, 'Priority', e.target.value)}
                            className="text-xs bg-white px-3 py-1.5 rounded-lg border"
                          >
                            <option value="NORMAL">ปกติ (NORMAL)</option>
                            <option value="HIGH">สำคัญ (HIGH)</option>
                            <option value="LOW">ทั่วไป (LOW)</option>
                          </select>
                          <select
                            value={ann.Status}
                            onChange={(e) => handleUpdateAnnouncement(ann.Announcement_ID, 'Status', e.target.value)}
                            className="text-xs bg-white px-3 py-1.5 rounded-lg border"
                          >
                            <option value="PUBLISHED">เผยแพร่ (PUBLISHED)</option>
                            <option value="DRAFT">ฉบับร่าง (DRAFT)</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveAnnouncement(ann.Announcement_ID)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="ลบประกาศนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] text-stone-500 mb-1">วันที่ประกาศ</label>
                            <input
                              type="date"
                              value={ann.Published_Date}
                              onChange={(e) => handleUpdateAnnouncement(ann.Announcement_ID, 'Published_Date', e.target.value)}
                              className="w-full bg-white px-3 py-1.5 rounded-lg border text-xs"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[11px] text-stone-500 mb-1">รายละเอียดเนื้อหาประกาศ</label>
                            <textarea
                              rows={2}
                              value={ann.Description}
                              onChange={(e) => handleUpdateAnnouncement(ann.Announcement_ID, 'Description', e.target.value)}
                              placeholder="เนื้อหาประกาศ"
                              className="w-full bg-white px-3 py-1.5 rounded-lg border text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: Footer & Developer Information */}
              {activeTab === 'footer' && (
                <div className="space-y-5">
                  <div>
                    <div className="font-heading font-semibold text-base text-[#4B267D]">
                      จัดการข้อมูลกลุ่มสาระและผู้พัฒนาระบบ (ส่วนท้ายเว็บไซต์ / Footer)
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      สามารถแก้ไขชื่อหน่วยงาน ที่อยู่ เบอร์โทรสาร ข้อมูลผู้พัฒนา และลิขสิทธิ์ระบบ
                    </p>
                  </div>

                  {/* School / Department Information */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8FD] space-y-4">
                    <div className="font-heading font-semibold text-xs text-[#4B267D] uppercase tracking-wide">
                      ข้อมูลหน่วยงาน / กลุ่มสาระการเรียนรู้
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อหน่วยงาน / โรงเรียน</label>
                        <input
                          type="text"
                          value={formConfig.SCHOOL_NAME}
                          onChange={(e) => setFormConfig({ ...formConfig, SCHOOL_NAME: e.target.value })}
                          className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">คำอธิบายย่อใน Footer</label>
                        <input
                          type="text"
                          value={formConfig.SCHOOL_DESCRIPTION}
                          onChange={(e) => setFormConfig({ ...formConfig, SCHOOL_DESCRIPTION: e.target.value })}
                          className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">ที่อยู่โรงเรียน</label>
                      <input
                        type="text"
                        value={formConfig.SCHOOL_ADDRESS}
                        onChange={(e) => setFormConfig({ ...formConfig, SCHOOL_ADDRESS: e.target.value })}
                        className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">เบอร์โทรศัพท์</label>
                        <input
                          type="text"
                          value={formConfig.SCHOOL_PHONE}
                          onChange={(e) => setFormConfig({ ...formConfig, SCHOOL_PHONE: e.target.value })}
                          className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">โทรสาร</label>
                        <input
                          type="text"
                          value={formConfig.SCHOOL_FAX}
                          onChange={(e) => setFormConfig({ ...formConfig, SCHOOL_FAX: e.target.value })}
                          className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">อีเมลโรงเรียน</label>
                        <input
                          type="email"
                          value={formConfig.SCHOOL_EMAIL}
                          onChange={(e) => setFormConfig({ ...formConfig, SCHOOL_EMAIL: e.target.value })}
                          className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">เว็บไซต์ทางการ</label>
                        <input
                          type="url"
                          value={formConfig.SCHOOL_WEBSITE}
                          onChange={(e) => setFormConfig({ ...formConfig, SCHOOL_WEBSITE: e.target.value })}
                          className="w-full bg-white px-3 py-2 border rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">ลิงก์ Facebook โรงเรียน</label>
                        <input
                          type="url"
                          value={formConfig.SCHOOL_FACEBOOK}
                          onChange={(e) => setFormConfig({ ...formConfig, SCHOOL_FACEBOOK: e.target.value })}
                          className="w-full bg-white px-3 py-2 border rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Developer Information */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8FD] space-y-4">
                    <div className="font-heading font-semibold text-xs text-[#7043A6] uppercase tracking-wide">
                      ข้อมูลผู้พัฒนาระบบ
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">ชื่อผู้พัฒนาระบบ</label>
                        <input
                          type="text"
                          value={formConfig.DEVELOPER_NAME}
                          onChange={(e) => setFormConfig({ ...formConfig, DEVELOPER_NAME: e.target.value })}
                          className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">ลิงก์ Facebook / ช่องทางติดต่อผู้พัฒนา</label>
                        <input
                          type="url"
                          value={formConfig.DEVELOPER_FACEBOOK}
                          onChange={(e) => setFormConfig({ ...formConfig, DEVELOPER_FACEBOOK: e.target.value })}
                          className="w-full bg-white px-3 py-2 border rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">รายละเอียดตำแหน่ง / สถาบันการศึกษา</label>
                      <textarea
                        rows={2}
                        value={formConfig.DEVELOPER_DETAILS}
                        onChange={(e) => setFormConfig({ ...formConfig, DEVELOPER_DETAILS: e.target.value })}
                        className="w-full bg-white px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Copyright Bar */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                    <label className="block text-xs font-semibold text-stone-700">
                      ข้อความลิขสิทธิ์ด้านล่างสุด (Copyright Bar)
                    </label>
                    <input
                      type="text"
                      value={formConfig.FOOTER_COPYRIGHT}
                      onChange={(e) => setFormConfig({ ...formConfig, FOOTER_COPYRIGHT: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {/* TAB 10: Google Sheets Inspector (เรียกดูข้อมูลว่าแก้ไขอะไรไป & ซิงค์สด) */}
              {activeTab === 'sheets' && (
                <div className="space-y-6">
                  <div>
                    <div className="font-heading font-semibold text-base text-[#4B267D] mb-1">
                      ฐานข้อมูลกลาง Google Sheets & บันทึกการแก้ไข (Live Sheets Inspector)
                    </div>
                    <p className="text-xs text-stone-500">
                      ระบบดึงข้อมูลสดจากแผ่นงาน <span className="font-semibold text-stone-700">ADMIN_CONTROL</span> ใน Google Sheets แบบเรียลไทม์ เพื่อตรวจสอบค่าที่ถูกบันทึกล่าสุด
                    </p>
                  </div>

                  {/* Status Banner */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>สถานะ: เชื่อมต่อ Google Sheets ฐานข้อมูลกลางสำเร็จ</span>
                      </div>
                      <div className="text-xs text-stone-600">
                        Spreadsheet ID: <code className="bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200 text-stone-700 font-mono text-[11px]">10uaEo5pVJ3hDGeLixOnPsDT60WQtqVmSPXPS4FJnuN8</code>
                      </div>
                      <div className="text-xs text-stone-500">
                        อัปเดตล่าสุดใน Google Sheets: <span className="font-semibold text-stone-700">{sheetData?.lastUpdated || formConfig.LAST_UPDATED_AT || 'เมื่อสักครู่'}</span> | ผู้บันทึก: <span className="font-semibold text-stone-700">{sheetData?.lastUpdatedBy || formConfig.LAST_UPDATED_BY || 'THAIWSK44230'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleLoadSheetData}
                        disabled={isLoadingSheetData}
                        className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheetData ? 'animate-spin' : ''}`} />
                        <span>{isLoadingSheetData ? 'กำลังดึงข้อมูลสด...' : 'รีเฟรชข้อมูลจาก Sheets'}</span>
                      </button>
                      <a
                        href="https://docs.google.com/spreadsheets/d/10uaEo5pVJ3hDGeLixOnPsDT60WQtqVmSPXPS4FJnuN8/edit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>เปิด Google Sheets จริง</span>
                      </a>
                    </div>
                  </div>

                  {/* Summary of what was saved */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                      <div className="text-[11px] text-stone-500">ภาพสไลด์หัวเว็บ</div>
                      <div className="font-bold text-base text-[#4B267D]">{formConfig.HERO_BANNER_IMAGES?.length || 0} ภาพ</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                      <div className="text-[11px] text-stone-500">ภาพสไลด์เกี่ยวกับ</div>
                      <div className="font-bold text-base text-[#4B267D]">{formConfig.ABOUT_IMAGES?.length || 0} ภาพ</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                      <div className="text-[11px] text-stone-500">เกณฑ์รางวัล</div>
                      <div className="font-bold text-base text-[#4B267D]">{formConfig.CRITERIA_ITEMS?.length || 0} ระดับ</div>
                    </div>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                      <div className="text-[11px] text-stone-500">ประกาศ & กำหนดการ</div>
                      <div className="font-bold text-base text-[#4B267D]">{(formAnnouncements?.length || 0) + (formSchedule?.length || 0)} รายการ</div>
                    </div>
                  </div>

                  {/* Data Inspection Table ("ฟิลแบบเรียกดูข้อมูลว่าแก้ไขอะไรไป") */}
                  <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-xs">
                    <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                      <span className="font-heading font-semibold text-xs text-[#30283A]">
                        รายการฟิลด์ทั้งหมดที่ถูกส่งและบันทึกลงใน Google Sheets (ADMIN_CONTROL)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {sheetData?.items?.length ? `พบ ${sheetData.items.length} รายการในชีตจริง` : 'ดึงข้อมูลสดพร้อมใช้งาน'}
                      </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-stone-100 text-xs">
                      {(sheetData?.items && sheetData.items.length > 0) ? (
                        sheetData.items.map((it, idx) => (
                          <div key={idx} className="p-3 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5 sm:max-w-xs shrink-0">
                              <code className="font-mono font-semibold text-[#4B267D] text-xs">{it.key}</code>
                              {it.description && (
                                <p className="text-[11px] text-stone-500">{it.description}</p>
                              )}
                            </div>
                            <div className="flex-1 px-2 font-mono text-[11px] text-stone-700 bg-stone-50 p-1.5 rounded border border-stone-200 break-all max-h-20 overflow-y-auto">
                              {it.value}
                            </div>
                            <div className="shrink-0 text-right sm:w-28 text-[10px] text-stone-400">
                              {it.updatedAt || 'ล่าสุด'}
                            </div>
                          </div>
                        ))
                      ) : (
                        /* Current form values */
                        [
                          { key: 'PROJECT_NAME', val: formConfig.PROJECT_NAME, desc: 'ชื่อย่อโครงการ' },
                          { key: 'PROJECT_SUBTITLE', val: formConfig.PROJECT_SUBTITLE, desc: 'ชื่อกิจกรรม' },
                          { key: 'HERO_BANNER_IMAGES', val: JSON.stringify(formConfig.HERO_BANNER_IMAGES), desc: 'ภาพสไลด์ 10 วินาที หัวเว็บ' },
                          { key: 'ABOUT_IMAGES', val: JSON.stringify(formConfig.ABOUT_IMAGES), desc: 'ภาพสไลด์ 10 วินาที เกี่ยวกับโครงการ' },
                          { key: 'ABOUT_OBJECTIVES', val: JSON.stringify(formConfig.ABOUT_OBJECTIVES), desc: 'วัตถุประสงค์โครงการ' },
                          { key: 'CRITERIA_ITEMS', val: JSON.stringify(formConfig.CRITERIA_ITEMS), desc: 'เกณฑ์รางวัลที่จัดกึ่งกลาง' },
                          { key: 'FULL_SCORE', val: String(formConfig.FULL_SCORE), desc: 'คะแนนเต็ม' },
                          { key: 'PASS_PERCENT', val: `${formConfig.PASS_PERCENT}%`, desc: 'เกณฑ์ผ่าน' },
                          { key: 'SCHOOL_NAME', val: formConfig.SCHOOL_NAME, desc: 'ชื่อกลุ่มสาระ/โรงเรียน' },
                          { key: 'DEVELOPER_NAME', val: formConfig.DEVELOPER_NAME, desc: 'ผู้พัฒนาระบบ' },
                          { key: 'LAST_UPDATED_AT', val: formConfig.LAST_UPDATED_AT || 'อัปเดตเรียลไทม์', desc: 'เวลาบันทึก' },
                        ].map((item, idx) => (
                          <div key={idx} className="p-3 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5 sm:max-w-xs shrink-0">
                              <code className="font-mono font-semibold text-[#4B267D] text-xs">{item.key}</code>
                              <p className="text-[11px] text-stone-500">{item.desc}</p>
                            </div>
                            <div className="flex-1 px-2 font-mono text-[11px] text-stone-700 bg-stone-50 p-1.5 rounded border border-stone-200 break-all max-h-16 overflow-y-auto">
                              {item.val}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {saveSuccess ? (
                  <span className="text-xs text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium animate-fade-in shadow-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{saveMessage || 'บันทึกและอัปเดตข้อมูลตรงกันทุกอุปกรณ์เรียบร้อยแล้ว'}</span>
                  </span>
                ) : (
                  <span className="text-xs text-stone-600 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span>ระบบเชื่อมต่อเซิร์ฟเวอร์กลาง: อัปเดตข้อมูลตรงกันทุกอุปกรณ์แบบเรียลไทม์</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleForceSync}
                  disabled={isSyncing || isSaving}
                  className="px-3.5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                  title="กดเพื่อดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์กลางทันที"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#4B267D]' : ''}`} />
                  <span>{isSyncing ? 'กำลังซิงค์...' : 'ดึงข้อมูลล่าสุด'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium cursor-pointer"
                >
                  ปิด
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#4B267D] hover:bg-[#7043A6] text-white text-xs font-heading font-semibold flex items-center gap-2 shadow-md shadow-[#4B267D]/20 transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังบันทึกและอัปเดตทุกอุปกรณ์...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>บันทึกข้อมูล (อัปเดตทุกอุปกรณ์)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
