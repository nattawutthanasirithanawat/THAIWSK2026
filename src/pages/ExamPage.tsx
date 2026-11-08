import React from 'react';
import { ExternalLink, AlertTriangle, BookOpen, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PublicConfig } from '../types';

interface ExamPageProps {
  config: PublicConfig;
  isExpired: boolean;
}

export const ExamPage: React.FC<ExamPageProps> = ({ config, isExpired }) => {
  const isRegistrationOpen = config.REGISTRATION_OPEN && !isExpired;

  const handleOpenForm = (url: string) => {
    if (!url || url.trim() === '') {
      alert('ผู้ดูแลระบบยังไม่ได้กำหนด URL ของแบบทดสอบ');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const showJunior = config.FORM_JUNIOR_ENABLED !== false;
  const showSenior = config.FORM_SENIOR_ENABLED !== false;
  const instructions = config.EXAM_INSTRUCTIONS || [];

  return (
    <div className="py-12 sm:py-16 bg-[#FAF8FD] min-h-[75vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#7043A6] font-semibold mb-2">
            <BookOpen className="w-4 h-4 text-[#D6AF55]" />
            <span>ระบบทำแบบทดสอบออนไลน์</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-4xl text-[#30283A] mb-3">
            เลือกระดับชั้นเพื่อเข้าทำแบบทดสอบ
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            แบบทดสอบวัดความรู้ความสามารถด้านภาษาไทย ประจำปีการศึกษา 2569 จัดทำโดยกลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"
          </p>
        </div>

        {/* System Closed Alert */}
        {!isRegistrationOpen && (
          <div className="mb-10 p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-4 shadow-xs">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-heading font-semibold text-base mb-1">
                ระบบปิดรับสมัครและส่งคำตอบแบบทดสอบแล้ว
              </div>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                เนื่องจากหมดระยะเวลาที่กำหนด หรือระบบถูกระงับชั่วคราวโดยผู้ดูแลระบบ 
                ท่านยังสามารถตรวจสอบผลคะแนนและดาวน์โหลดเกียรติบัตรได้ตามกำหนดการ
              </p>
            </div>
          </div>
        )}

        {/* Level Cards Grid */}
        <div className={`grid grid-cols-1 ${showJunior && showSenior ? 'md:grid-cols-2' : 'max-w-xl mx-auto'} gap-8 mb-12`}>
          
          {/* Card 1: Junior High School */}
          {showJunior && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-md hover:shadow-lg transition-all p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#4B267D]" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#4B267D] bg-[#FAF8FD] border border-[#7043A6]/20 px-3 py-1 rounded-full">
                    ระดับชั้น ม.1 – ม.3
                  </span>
                  <span className={`text-xs font-medium ${isRegistrationOpen ? 'text-emerald-700' : 'text-stone-500'}`}>
                    {isRegistrationOpen ? 'พร้อมให้ทำแบบทดสอบ' : 'ปิดระบบ'}
                  </span>
                </div>

                <h2 className="font-heading font-bold text-xl text-[#30283A] mb-3 group-hover:text-[#4B267D] transition-colors">
                  {config.FORM_JUNIOR_TITLE || 'ข้อสอบวัดความรู้ความสามารถด้านภาษาไทย ระดับชั้นมัธยมศึกษาตอนต้น (ม.1–3)'}
                </h2>

                <p className="text-sm text-stone-600 leading-relaxed mb-6">
                  {config.FORM_JUNIOR_DESC || 'ครอบคลุมเนื้อหาหลักภาษาไทย การสะกดคำ การใช้คำตามความหมาย สำนวนสุภาษิต และวรรณคดีระดับมัธยมศึกษาตอนต้น'}
                </p>

                <div className="space-y-2 text-xs text-stone-500 mb-6 bg-[#FAF8FD] p-4 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7043A6]" />
                    <span>จำนวนข้อสอบ: {config.FULL_SCORE || 20} ข้อ (คะแนนเต็ม {config.FULL_SCORE || 20} คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#7043A6]" />
                    <span>เกณฑ์ผ่านรับเกียรติบัตร: {config.PASS_PERCENT || 60}% ขึ้นไป</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenForm(config.FORM_JUNIOR_URL)}
                disabled={!isRegistrationOpen || !config.FORM_JUNIOR_URL}
                className={`w-full py-3.5 px-6 rounded-xl font-heading font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  isRegistrationOpen && config.FORM_JUNIOR_URL
                    ? 'bg-[#4B267D] text-white hover:bg-[#7043A6] shadow-md shadow-[#4B267D]/20 hover:scale-[1.01]'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span>{isRegistrationOpen ? 'เข้าสู่แบบทดสอบ (ม.ต้น)' : 'ปิดรับคำตอบแล้ว'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Card 2: Senior High School */}
          {showSenior && (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-md hover:shadow-lg transition-all p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#7043A6]" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#7043A6] bg-[#FAF8FD] border border-[#D6AF55]/30 px-3 py-1 rounded-full">
                    ระดับชั้น ม.4 – ม.6
                  </span>
                  <span className={`text-xs font-medium ${isRegistrationOpen ? 'text-emerald-700' : 'text-stone-500'}`}>
                    {isRegistrationOpen ? 'พร้อมให้ทำแบบทดสอบ' : 'ปิดระบบ'}
                  </span>
                </div>

                <h2 className="font-heading font-bold text-xl text-[#30283A] mb-3 group-hover:text-[#7043A6] transition-colors">
                  {config.FORM_SENIOR_TITLE || 'ข้อสอบวัดความรู้ความสามารถด้านภาษาไทย ระดับชั้นมัธยมศึกษาตอนปลาย (ม.4–6)'}
                </h2>

                <p className="text-sm text-stone-600 leading-relaxed mb-6">
                  {config.FORM_SENIOR_DESC || 'ครอบคลุมเนื้อหาหลักการใช้ภาษาเชิงวิชาการ วรรณคดีวิจักษ์ ฉันทลักษณ์ไทย และทักษะการคิดวิเคราะห์ระดับมัธยมศึกษาตอนปลาย'}
                </p>

                <div className="space-y-2 text-xs text-stone-500 mb-6 bg-[#FAF8FD] p-4 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D6AF55]" />
                    <span>จำนวนข้อสอบ: {config.FULL_SCORE || 20} ข้อ (คะแนนเต็ม {config.FULL_SCORE || 20} คะแนน)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#D6AF55]" />
                    <span>เกณฑ์ผ่านรับเกียรติบัตร: {config.PASS_PERCENT || 60}% ขึ้นไป</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenForm(config.FORM_SENIOR_URL)}
                disabled={!isRegistrationOpen || !config.FORM_SENIOR_URL}
                className={`w-full py-3.5 px-6 rounded-xl font-heading font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                  isRegistrationOpen && config.FORM_SENIOR_URL
                    ? 'bg-[#7043A6] text-white hover:bg-[#4B267D] shadow-md shadow-[#7043A6]/20 hover:scale-[1.01]'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <span>{isRegistrationOpen ? 'เข้าสู่แบบทดสอบ (ม.ปลาย)' : 'ปิดรับคำตอบแล้ว'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Security & Instructions Notice (Editable by Admin) */}
        {instructions.length > 0 && (
          <div className="p-6 rounded-2xl bg-white border border-stone-200/90 text-xs sm:text-sm text-stone-600 leading-relaxed space-y-2">
            <div className="font-heading font-semibold text-stone-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#7043A6]" />
              <span>คำชี้แจงในการทำแบบทดสอบ:</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-stone-600">
              {instructions.map((inst, index) => (
                <li key={index}>{inst}</li>
              ))}
            </ol>
          </div>
        )}

      </div>
    </div>
  );
};
