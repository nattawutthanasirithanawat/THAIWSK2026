import React from 'react';
import { School, MapPin, Phone, Mail, Globe, Facebook, UserCheck, ShieldCheck } from 'lucide-react';
import { PublicConfig } from '../types';

interface FooterProps {
  config: PublicConfig;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  return (
    <footer className="bg-[#2B1549] text-white border-t-2 border-[#D6AF55] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#4B267D]">
          
          {/* Column 1: School Identity & Department (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D6AF55] flex items-center justify-center font-heading font-bold text-[#4B267D] text-sm shrink-0">
                ก-ฮ
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white">
                  กลุ่มสาระการเรียนรู้ภาษาไทย
                </h3>
                <div className="text-sm text-[#F5E8C7]">
                  โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/75 leading-relaxed max-w-lg">
              โครงการส่งเสริมและพัฒนาความรู้ความสามารถด้านภาษาไทย (THAI WSK 2026) 
              มุ่งเน้นการยกระดับผลสัมฤทธิ์ทางการเรียนและการอนุรักษ์มรดกทางวัฒนธรรมภาษาไทย
            </p>

            <div className="space-y-2 text-xs text-white/80 pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D6AF55] shrink-0 mt-0.5" />
                <span>442/30 ต.ตลาดกระทุ่มแบน อ.กระทุ่มแบน จ.สมุทรสาคร 74110</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D6AF55] shrink-0" />
                <span>โทรศัพท์: 034-471902 · โทรสาร: 034-471901</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D6AF55] shrink-0" />
                <a href="mailto:wisetschool@gmail.com" className="hover:text-[#D6AF55] transition-colors">
                  wisetschool@gmail.com
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://www.wsk.ac.th/wp/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4B267D] hover:bg-[#7043A6] text-xs text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#D6AF55]" />
                <span>เว็บไซต์โรงเรียน</span>
              </a>
              <a
                href="https://www.facebook.com/wisetsamutkhun"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4B267D] hover:bg-[#7043A6] text-xs text-white transition-colors"
              >
                <Facebook className="w-3.5 h-3.5 text-[#D6AF55]" />
                <span>เพจโรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"</span>
              </a>
            </div>
          </div>

          {/* Column 2: System Developer & Academic Credits (6 cols) */}
          <div className="md:col-span-6 space-y-4 bg-[#351A5A]/60 p-6 rounded-2xl border border-[#D6AF55]/20">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#D6AF55] font-semibold">
              <UserCheck className="w-4 h-4" />
              <span>ผู้พัฒนาระบบ</span>
            </div>

            <div>
              <h4 className="font-heading font-semibold text-base text-white">
                {config.DEVELOPER_NAME || 'นายณัฐวุฒิ ธนาศิริธนวัชร์'}
              </h4>
              <p className="text-xs text-white/80 leading-relaxed mt-1">
                {config.DEVELOPER_DETAILS || 'นักศึกษาฝึกประสบการณ์วิชาชีพครู ชั้นปีที่ 2 สาขาวิชาภาษาไทย คณะศึกษาศาสตร์ มหาวิทยาลัยศิลปากร'}
              </p>
            </div>

            <div className="pt-2 border-t border-[#4B267D]/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <a
                href={config.DEVELOPER_FACEBOOK || 'https://www.facebook.com/nattawut.bk'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#F5E8C7] hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4 text-[#D6AF55]" />
                <span>ติดต่อผู้ดูแลระบบ: Nattawut BK</span>
              </a>

              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ฐานข้อมูล Google Sheets ปลอดภัย</span>
              </div>
            </div>

            <div className="text-[11px] text-white/60 pt-1">
              สถาปัตยกรรม Google Apps Script Web App และระบบจัดการแผ่นงานอัตโนมัติ ไม่เปิดเผยข้อมูลส่วนบุคคลโดยไม่ผ่านการยืนยันรหัส
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60 text-center sm:text-left">
          <div>
            © 2026 กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ". สงวนลิขสิทธิ์.
          </div>
          <div className="text-[11px] text-[#D6AF55]">
            THAI WSK 2026 | ระบบบริหารจัดการและทดสอบความรู้ภาษาไทย
          </div>
        </div>

      </div>
    </footer>
  );
};
