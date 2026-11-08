import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Sparkles, School, ChevronLeft, ChevronRight } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { PublicConfig, TabType } from '../types';

interface HeroProps {
  config: PublicConfig;
  onSelectTab: (tab: TabType) => void;
  isExpired: boolean;
  onStatusChange: (isExpired: boolean) => void;
}

export const Hero: React.FC<HeroProps> = ({ config, onSelectTab, isExpired, onStatusChange }) => {
  // Extract images for banner
  const images: string[] = (config.HERO_BANNER_IMAGES && config.HERO_BANNER_IMAGES.length > 0)
    ? config.HERO_BANNER_IMAGES
    : (config.HERO_BANNER_URL ? [config.HERO_BANNER_URL] : ['/src/assets/images/hero_thai_wsk_1794124482494.jpg']);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 10 seconds if multiple images exist
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

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
            <span>{config.SCHOOL_NAME || 'กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"'}</span>
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
              {config.PROJECT_NAME || 'โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย'}
            </span>
            <span className="bg-gradient-to-r from-white via-[#F5E8C7] to-[#D6AF55] bg-clip-text text-transparent">
              {config.PROJECT_SUBTITLE || 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย'}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
            {config.PROJECT_SLOGAN || 'ภาษาไทยล้ำค่า สืบสานภูมิปัญญา เชิดชูคุณค่าศิลป์แห่งสุนทร'}
          </p>
        </div>

        {/* Hero Visual Artwork Banner (with 10-second slideshow support) */}
        <div className="max-w-4xl mx-auto mb-10 rounded-2xl overflow-hidden border border-[#D6AF55]/30 shadow-2xl relative group bg-[#3B1D63]">
          <div className="aspect-16/9 w-full overflow-hidden relative">
            {images.map((imgSrc, idx) => (
              <img
                key={idx}
                src={imgSrc}
                alt={`ภาพแบนเนอร์โครงการที่ ${idx + 1}`}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                }`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ))}

            {/* Next / Prev Controls (Visible if multiple images) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20 cursor-pointer"
                  aria-label="ภาพก่อนหน้า"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20 cursor-pointer"
                  aria-label="ภาพถัดไป"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                  {images.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setCurrentSlide(dotIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        dotIdx === currentSlide ? 'w-6 bg-[#D6AF55]' : 'w-2 bg-white/50 hover:bg-white'
                      }`}
                      aria-label={`ไปที่ภาพที่ ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1549]/90 via-transparent to-transparent flex items-end p-6 z-10 pointer-events-none">
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
