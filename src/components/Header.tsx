import React, { useState } from 'react';
import { Menu, X, BookOpen, Award, CheckCircle, FileText, ShieldCheck } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAdminModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, onOpenAdminModal }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'หน้าแรก', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'exam', label: 'เข้าทำแบบทดสอบ', icon: <FileText className="w-4 h-4" /> },
    { id: 'scores', label: 'ตรวจสอบคะแนน', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'certificate', label: 'ดาวน์โหลดเกียรติบัตร', icon: <Award className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: TabType) => {
    onSelectTab(tab);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#4B267D]/95 backdrop-blur-md border-b border-[#D6AF55]/30 text-white shadow-md transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          
          {/* Zone 1: Brand title, one line */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left focus:outline-none group shrink-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D6AF55] to-[#B38F3B] p-0.5 shadow-sm flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full bg-[#4B267D] flex items-center justify-center font-heading font-bold text-[#D6AF55] text-sm">
                ก-ฮ
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-lg sm:text-xl text-white tracking-wide whitespace-nowrap group-hover:text-[#D6AF55] transition-colors">
                THAI WSK 2026
              </span>
              <span className="text-xs text-[#F5E8C7]/80 whitespace-nowrap hidden sm:inline">
                สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 py-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-[#D6AF55] border-b-2 border-[#D6AF55] font-semibold'
                      : 'text-white/85 hover:text-[#F5E8C7]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Hamburger Menu Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg text-white hover:bg-[#7043A6]/50 focus:outline-none focus:ring-2 focus:ring-[#D6AF55] transition-colors cursor-pointer flex items-center gap-2"
              aria-label="เปิดเมนูนำทาง"
            >
              <Menu className="w-6 h-6 text-[#F5E8C7]" />
            </button>
          </div>
        </div>
      </header>

      {/* Side Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-xs"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Side Drawer Panel (แถบ 3 ขีดมุมขวา) */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#4B267D] text-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#7043A6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D6AF55] flex items-center justify-center font-heading font-bold text-[#4B267D] text-xs">
              ก-ฮ
            </div>
            <div className="font-heading font-semibold text-white text-base">
              เมนูหลักโครงการ
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-[#7043A6] transition-colors cursor-pointer"
            aria-label="ปิดเมนู"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-1.5">
          <div className="text-xs uppercase font-medium text-[#D6AF55] tracking-wider px-3 py-1">
            ส่วนงานกิจกรรม
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#7043A6] text-[#D6AF55] font-semibold shadow-inner'
                    : 'text-white/90 hover:bg-[#7043A6]/40 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-[#D6AF55]' : 'text-white/70'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin Menu Section in Drawer (แถบ 3 ขีด) */}
          <div className="pt-4 mt-4 border-t border-[#7043A6]/70">
            <div className="text-xs uppercase font-medium text-[#D6AF55] tracking-wider px-3 py-1">
              ผู้ดูแลระบบ
            </div>
            <button
              onClick={() => {
                setDrawerOpen(false);
                onOpenAdminModal();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm text-[#F5E8C7] hover:bg-[#7043A6]/40 hover:text-white transition-all text-left cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#D6AF55]/20 group-hover:bg-[#D6AF55] flex items-center justify-center transition-colors">
                <ShieldCheck className="w-4 h-4 text-[#D6AF55] group-hover:text-[#4B267D] transition-colors" />
              </div>
              <div>
                <div className="font-heading font-semibold text-white">สำหรับแอดมิน</div>
                <div className="text-[11px] text-white/60">จัดการและตั้งค่าระบบ</div>
              </div>
            </button>
          </div>
        </div>

        {/* Drawer Footer Notice */}
        <div className="p-4 bg-[#3A1D61] border-t border-[#7043A6]/50 text-xs text-white/70 text-center">
          โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"<br />
          กลุ่มสาระการเรียนรู้ภาษาไทย
        </div>
      </aside>
    </>
  );
};
