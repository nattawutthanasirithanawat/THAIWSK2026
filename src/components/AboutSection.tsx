import React, { useState, useEffect } from 'react';
import { Bookmark, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { PublicConfig } from '../types';

interface AboutSectionProps {
  config: PublicConfig;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ config }) => {
  const objectives = config.ABOUT_OBJECTIVES || [];

  // Extract images for About Section slideshow
  const images: string[] = (config.ABOUT_IMAGES && config.ABOUT_IMAGES.length > 0)
    ? config.ABOUT_IMAGES
    : ['/src/assets/images/thai_literature_art_1794124482930.jpg'];

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
    <section className="py-16 sm:py-20 bg-[#FAF8FD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#7043A6] font-semibold mb-2">
            <Bookmark className="w-3.5 h-3.5 text-[#D6AF55]" />
            <span>{config.ABOUT_SECTION_SUBTITLE || 'เกี่ยวกับโครงการวิชาการ'}</span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#30283A] mb-4">
            {config.ABOUT_SECTION_TITLE || 'สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย'}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {config.PROJECT_DESCRIPTION}
          </p>
        </div>

        {/* 2-Column Academic Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Left Visual: Authentic Thai Literature Artwork with 10-second Slideshow */}
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-stone-200/90 shadow-md relative group bg-stone-100">
            <div className="aspect-4/3 w-full overflow-hidden relative">
              {images.map((imgSrc, idx) => (
                <img
                  key={idx}
                  src={imgSrc}
                  alt={`ภาพประกอบโครงการที่ ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                  }`}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ))}

              {/* Prev / Next Buttons if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20 cursor-pointer"
                    aria-label="ภาพก่อนหน้า"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-20 cursor-pointer"
                    aria-label="ภาพถัดไป"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                    {images.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        onClick={() => setCurrentSlide(dotIdx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          dotIdx === currentSlide ? 'w-5 bg-[#D6AF55]' : 'w-1.5 bg-white/60 hover:bg-white'
                        }`}
                        aria-label={`ไปที่ภาพที่ ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-white border-t border-stone-100">
              <div className="text-xs text-stone-500 italic">
                ภาพประกอบ: กิจกรรมและการส่งเสริมความเป็นเลิศทางภาษาและวรรณคดีไทย
              </div>
            </div>
          </div>

          {/* Right Content: Dynamic Objectives List (Admin Editable) */}
          <div className="lg:col-span-7 space-y-4">
            {objectives.map((obj, index) => (
              <div
                key={obj.id || index}
                className="flex items-start gap-4 p-5 rounded-xl bg-white border border-stone-200/70 shadow-xs hover:border-[#7043A6]/30 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FAF8FD] border border-[#7043A6]/20 flex items-center justify-center text-[#4B267D] shrink-0 mt-0.5">
                  <Target className="w-5 h-5 text-[#4B267D]" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-base text-[#30283A] mb-1">
                    {obj.title}
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                    {obj.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
