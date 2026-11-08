import React from 'react';
import { Award, ShieldCheck, FileCheck2 } from 'lucide-react';
import { PublicConfig } from '../types';

interface CriteriaSectionProps {
  config: PublicConfig;
}

export const CriteriaSection: React.FC<CriteriaSectionProps> = ({ config }) => {
  const criteriaItems = config.CRITERIA_ITEMS || [];

  const getCardStyle = (theme: string) => {
    switch (theme) {
      case 'gold':
        return {
          border: 'border-amber-300/80',
          bg: 'bg-gradient-to-b from-amber-50/60 to-white',
          iconWrap: 'bg-amber-100 border-amber-300 text-amber-700',
          icon: <Award className="w-7 h-7 text-amber-600" />,
          title: 'text-amber-900',
          score: 'text-amber-800',
          sub: 'text-amber-700/80',
        };
      case 'silver':
        return {
          border: 'border-slate-300/80',
          bg: 'bg-gradient-to-b from-slate-50/70 to-white',
          iconWrap: 'bg-slate-100 border-slate-300 text-slate-700',
          icon: <Award className="w-7 h-7 text-slate-600" />,
          title: 'text-slate-800',
          score: 'text-slate-800',
          sub: 'text-slate-600',
        };
      case 'bronze':
        return {
          border: 'border-amber-600/30',
          bg: 'bg-gradient-to-b from-orange-50/50 to-white',
          iconWrap: 'bg-orange-100 border-orange-300 text-orange-800',
          icon: <Award className="w-7 h-7 text-orange-700" />,
          title: 'text-orange-950',
          score: 'text-orange-900',
          sub: 'text-orange-800/80',
        };
      default:
        return {
          border: 'border-stone-200',
          bg: 'bg-gradient-to-b from-stone-50/60 to-white',
          iconWrap: 'bg-stone-100 border-stone-300 text-stone-600',
          icon: <FileCheck2 className="w-7 h-7 text-stone-500" />,
          title: 'text-stone-800',
          score: 'text-stone-700',
          sub: 'text-stone-500',
        };
    }
  };

  return (
    <section className="py-16 bg-white border-t border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#7043A6] font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D6AF55]" />
            <span>{config.CRITERIA_SECTION_SUBTITLE || 'เกณฑ์การประเมินและรางวัล'}</span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#30283A] mb-3">
            {config.CRITERIA_SECTION_TITLE || 'เกณฑ์การได้รับเกียรติบัตรรางวัล'}
          </h2>
          <p className="text-sm text-stone-600">
            คำนวณจากคะแนนเต็ม {config.FULL_SCORE || 20} คะแนน และเกณฑ์ร้อยละตามที่คณะกรรมการกำหนด
          </p>
        </div>

        {/* Award Levels Grid (Dynamically rendered and editable by admin) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {criteriaItems.map((item) => {
            const style = getCardStyle(item.colorTheme);
            return (
              <div
                key={item.id}
                className={`rounded-2xl border ${style.border} ${style.bg} p-6 text-center shadow-xs hover:shadow-md transition-all`}
              >
                <div className={`w-14 h-14 mx-auto rounded-full border flex items-center justify-center mb-4 shadow-inner ${style.iconWrap}`}>
                  {style.icon}
                </div>
                <h3 className={`font-heading font-bold text-lg mb-1 ${style.title}`}>
                  {item.name}
                </h3>
                <div className={`text-2xl font-bold font-heading mb-1 ${style.score}`}>
                  {item.minScore} – {item.maxScore} คะแนน
                </div>
                <div className={`text-xs font-medium mb-3 ${style.sub}`}>
                  {item.percentLabel}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
