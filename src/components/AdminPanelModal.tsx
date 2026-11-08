import React, { useState } from 'react';
import {
  X, Lock, ShieldCheck, Save, Plus, Trash2, Edit3, CheckCircle,
  FileText, Calendar, Megaphone, Award, BookOpen, Sliders, LogOut, Info
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
    'general' | 'about' | 'criteria' | 'exams' | 'search' | 'schedule' | 'announcements'
  >('general');

  // Form states cloned for editing
  const [formConfig, setFormConfig] = useState<PublicConfig>(config);
  const [formAnnouncements, setFormAnnouncements] = useState<Announcement[]>(announcements);
  const [formSchedule, setFormSchedule] = useState<ScheduleItem[]>(schedule);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync state whenever opened
  React.useEffect(() => {
    if (isOpen) {
      setFormConfig(config);
      setFormAnnouncements(announcements);
      setFormSchedule(schedule);
      setLoginError('');
      setSaveSuccess(false);
    }
  }, [isOpen, config, announcements, schedule]);

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
    await ApiService.saveConfig(formConfig);
    await ApiService.saveAnnouncements(formAnnouncements);
    await ApiService.saveSchedule(formSchedule);

    onSaveAll(formConfig, formAnnouncements, formSchedule);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
                THAI WSK 2026 · กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"
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

        {/* Not Logged In Screen */}
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
                { id: 'about', label: '2. เกี่ยวกับโครงการ', icon: <BookOpen className="w-3.5 h-3.5" /> },
                { id: 'criteria', label: '3. เกณฑ์รางวัล', icon: <Award className="w-3.5 h-3.5" /> },
                { id: 'exams', label: '4. แบบทดสอบ', icon: <FileText className="w-3.5 h-3.5" /> },
                { id: 'search', label: '5. คะแนน & เกียรติบัตร', icon: <Info className="w-3.5 h-3.5" /> },
                { id: 'schedule', label: '6. กำหนดการ', icon: <Calendar className="w-3.5 h-3.5" /> },
                { id: 'announcements', label: '7. ประกาศข่าว', icon: <Megaphone className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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

              {/* TAB 2: About Section & Objectives */}
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
                      {formConfig.ABOUT_OBJECTIVES.map((obj, index) => (
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

              {/* TAB 3: Award Criteria */}
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

              {/* TAB 4: Exams & Instructions */}
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

              {/* TAB 5: Score Search & Certificates */}
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

              {/* TAB 6: Schedule Management */}
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

              {/* TAB 7: Announcements Management */}
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

            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold animate-fade-in">
                    <CheckCircle className="w-4 h-4" />
                    <span>บันทึกการเปลี่ยนแปลงทั้งหมดลงในระบบเรียบร้อยแล้ว</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
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
                  className="px-5 py-2.5 rounded-xl bg-[#4B267D] hover:bg-[#7043A6] text-white text-xs font-heading font-semibold flex items-center gap-2 shadow-md shadow-[#4B267D]/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไขทั้งหมด</span>
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
