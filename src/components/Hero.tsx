import React from 'react';
import { ArrowRight, BookOpen, Sparkles, School } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { PublicConfig, TabType } from '../types';

interface HeroProps {
  config: PublicConfig;
  onSelectTab: (tab: TabType) => void;
  isExpired: boolean;
  onStatusChange: (isExpired: boolean) => void;
}

export const Hero: React.FC<HeroProps> = ({ config, onSelectTab, isExpired, onStatusChange }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#4B267D] via-[#3B1D63] to-[#2B1549] text-white pt-10 pb-24 sm:pt-16 sm:pb-32">
      {/* Decorative Thai Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-thai-pattern pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#D6AF55]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#7043A6]/30 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Academic Affiliation Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#D6AF55]/30 text-xs sm:text-sm text-[#F5E8C7] backdrop-blur-md">
            <School className="w-4 h-4 text-[#D6AF55]" />
            <span>กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D6AF55]/20 border border-[#D6AF55]/40 text-xs text-[#F5E8C7]">
            <Sparkles className="w-3.5 h-3.5 text-[#D6AF55]" />
            <span>ประจำปีการศึกษา 2569</span>
          </div>
        </div>

        {/* Hero Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mb-4 drop-shadow-md">
            <span className="text-[#F5E8C7] block text-xl sm:text-2xl font-medium tracking-wider mb-2">
              โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย
            </span>
            <span className="bg-gradient-to-r from-white via-[#F5E8C7] to-[#D6AF55] bg-clip-text text-transparent">
              สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
            {config.PROJECT_SLOGAN || 'ภาษาไทยล้ำค่า สืบสานภูมิปัญญา เชิดชูคุณค่าศิลป์แห่งสุนทร'}
          </p>
        </div>

        {/* Hero Visual Artwork Banner */}
        <div className="max-w-4xl mx-auto mb-10 rounded-2xl overflow-hidden border border-[#D6AF55]/30 shadow-2xl relative group">
          <div className="aspect-16/9 w-full bg-[#3B1D63] overflow-hidden relative">
            <img
              src="/src/assets/images/hero_thai_wsk_1794124482494.jpg"
              alt="โครงการสืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย THAI WSK 2026"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-700"
              onError={(e) => {
                // styled fallback container if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1549]/90 via-transparent to-transparent flex items-end p-6">
              <div className="text-left">
                <div className="text-xs uppercase tracking-wider text-[#D6AF55] font-semibold mb-1">
                  กิจกรรมวิชาการระดับมัธยมศึกษา
                </div>
                <div className="font-heading text-lg sm:text-xl font-bold text-white">
                  วัดความรู้ความสามารถด้านภาษาและวรรณคดีไทย พร้อมรับเกียรติบัตรอิเล็กทรอนิกส์
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Timer Section */}
        <div className="mb-10">
          <CountdownTimer
            deadlineIso={config.REGISTRATION_DEADLINE}
            isOpen={config.REGISTRATION_OPEN}
            onStatusChange={onStatusChange}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onSelectTab('exam')}
            disabled={!config.REGISTRATION_OPEN || isExpired}
            className={`px-6 py-3 rounded-xl font-heading font-semibold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-lg cursor-pointer ${
              config.REGISTRATION_OPEN && !isExpired
                ? 'bg-gradient-to-r from-[#D6AF55] to-[#B38F3B] text-[#4B267D] hover:from-[#E2BF6A] hover:to-[#C49E48] hover:shadow-[#D6AF55]/25 hover:scale-102'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>เข้าสู่แบบทดสอบออนไลน์</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectTab('scores')}
            className="px-6 py-3 rounded-xl font-heading font-medium text-sm sm:text-base border border-[#D6AF55]/50 bg-white/10 hover:bg-white/20 text-[#F5E8C7] hover:text-white backdrop-blur-md transition-all cursor-pointer"
          >
            <span>ตรวจสอบผลคะแนน</span>
          </button>
        </div>

      </div>
    </section>
  );
};
