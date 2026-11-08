import React from 'react';
import { Bookmark, Target } from 'lucide-react';
import { PublicConfig } from '../types';

interface AboutSectionProps {
  config: PublicConfig;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ config }) => {
  const objectives = config.ABOUT_OBJECTIVES || [];

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
          
          {/* Left Visual: Authentic Thai Literature Artwork */}
          <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-stone-200/90 shadow-md relative group">
            <div className="aspect-4/3 w-full bg-stone-100 overflow-hidden">
              <img
                src="/src/assets/images/thai_literature_art_1794124482930.jpg"
                alt="วรรณคดีไทยและสมุดข่อยโบราณ โครงการสืบศิลป์ถิ่นอักษร"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
            </div>
            <div className="p-4 bg-white border-t border-stone-100">
              <div className="text-xs text-stone-500 italic">
                ภาพประกอบ: วรรณคดีไทยและสมุดข่อย ศิลปะแห่งลายอักษรไทยอันทรงคุณค่า
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
