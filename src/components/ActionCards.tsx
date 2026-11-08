import React from 'react';
import { FileEdit, CheckCircle2, Award, ChevronRight } from 'lucide-react';
import { TabType, PublicConfig } from '../types';

interface ActionCardsProps {
  config: PublicConfig;
  onSelectTab: (tab: TabType) => void;
  isExpired: boolean;
}

export const ActionCards: React.FC<ActionCardsProps> = ({ config, onSelectTab, isExpired }) => {
  const isExamOpen = config.REGISTRATION_OPEN && !isExpired;

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Examination */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4B267D] to-[#7043A6]" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF8FD] border border-[#7043A6]/20 flex items-center justify-center text-[#4B267D] mb-4 group-hover:scale-105 transition-transform">
              <FileEdit className="w-6 h-6 text-[#4B267D]" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-heading font-semibold text-lg text-[#30283A] group-hover:text-[#4B267D] transition-colors">
                เข้าทำแบบทดสอบ
              </h3>
              <span className={`text-[11px] font-medium ${isExamOpen ? 'text-emerald-700' : 'text-stone-500'}`}>
                {isExamOpen ? 'เปิดระบบ' : 'ปิดระบบ'}
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              แบบทดสอบวัดความรู้ความสามารถทางภาษาไทย ระดับชั้น ม.ต้น (ม.1–3) และ ม.ปลาย (ม.4–6)
            </p>
          </div>
          <button
            onClick={() => onSelectTab('exam')}
            className={`w-full py-2.5 px-4 rounded-xl font-heading text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isExamOpen
                ? 'bg-[#4B267D] text-white hover:bg-[#7043A6] shadow-md shadow-[#4B267D]/20'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            <span>{isExamOpen ? 'เลือกระดับชั้นเพื่อสอบ' : 'ดูรายละเอียดแบบทดสอบ'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Score Checking */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7043A6] to-[#D6AF55]" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF8FD] border border-[#D6AF55]/30 flex items-center justify-center text-[#7043A6] mb-4 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6 text-[#7043A6]" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-heading font-semibold text-lg text-[#30283A] group-hover:text-[#7043A6] transition-colors">
                ตรวจสอบผลคะแนน
              </h3>
              <span className="text-[11px] font-medium text-[#7043A6]">
                {config.SCORE_SEARCH_ENABLED ? 'พร้อมให้บริการ' : 'รอเปิดระบบ'}
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              ค้นหาคะแนนสอบ คะแนนร้อยละ และระดับรางวัลเหรียญทอง เงิน ทองแดง หรือชมเชย ด้วยระบบความปลอดภัย
            </p>
          </div>
          <button
            onClick={() => onSelectTab('scores')}
            className="w-full py-2.5 px-4 rounded-xl font-heading text-sm font-medium flex items-center justify-center gap-2 bg-[#7043A6] text-white hover:bg-[#4B267D] transition-all shadow-md shadow-[#7043A6]/20 cursor-pointer"
          >
            <span>เข้าสู่ระบบค้นหาคะแนน</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Certificate Download */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D6AF55] to-[#B38F3B]" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF8FD] border border-[#D6AF55]/40 flex items-center justify-center text-[#D6AF55] mb-4 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-[#D6AF55]" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-heading font-semibold text-lg text-[#30283A] group-hover:text-[#B38F3B] transition-colors">
                ดาวน์โหลดเกียรติบัตร
              </h3>
              <span className="text-[11px] font-medium text-[#B38F3B]">
                {config.CERTIFICATE_DOWNLOAD_ENABLED ? 'เปิดดาวน์โหลด' : 'เร็วๆ นี้'}
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              ดาวน์โหลดเกียรติบัตรอิเล็กทรอนิกส์ PDF ของแท้จากโรงเรียน สำหรับผู้ผ่านเกณฑ์ 60% ขึ้นไป
            </p>
          </div>
          <button
            onClick={() => onSelectTab('certificate')}
            className="w-full py-2.5 px-4 rounded-xl font-heading text-sm font-medium flex items-center justify-center gap-2 bg-[#D6AF55] text-[#4B267D] hover:bg-[#C9A043] font-semibold transition-all shadow-md shadow-[#D6AF55]/20 cursor-pointer"
          >
            <span>ค้นหาและดาวน์โหลด</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
