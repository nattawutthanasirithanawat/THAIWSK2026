import React, { useState } from 'react';
import { Search, Award, Download, ExternalLink, AlertCircle, Eye, CheckCircle, UserCheck } from 'lucide-react';
import { PublicConfig, CertificateRecord } from '../types';
import { ApiService } from '../services/api';

interface CertificatePageProps {
  config: PublicConfig;
}

export const CertificatePage: React.FC<CertificatePageProps> = ({ config }) => {
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchState, setSearchState] = useState<'IDLE' | 'LOADING' | 'FOUND' | 'NOT_FOUND' | 'MULTIPLE_MATCHES' | 'SYSTEM_CLOSED' | 'INVALID_INPUT' | 'ERROR'>('IDLE');
  const [statusMessage, setStatusMessage] = useState('');
  const [certificateRecord, setCertificateRecord] = useState<CertificateRecord | null>(null);
  const [multipleRecords, setMultipleRecords] = useState<CertificateRecord[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setSearchState('INVALID_INPUT');
      setStatusMessage('กรุณากรอกชื่อหรือชื่อ-นามสกุลของผู้เข้าสอบ');
      return;
    }

    setIsLoading(true);
    setSearchState('LOADING');
    setStatusMessage('');
    setCertificateRecord(null);
    setMultipleRecords([]);

    try {
      const response = await ApiService.searchCertificate(nameInput);
      setSearchState(response.status);
      setStatusMessage(response.message);
      if (response.record) {
        setCertificateRecord(response.record);
      }
      if (response.records) {
        setMultipleRecords(response.records);
      }
    } catch {
      setSearchState('ERROR');
      setStatusMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบเกียรติบัตร');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecord = (record: CertificateRecord) => {
    setCertificateRecord(record);
    setSearchState('FOUND');
    setStatusMessage('พบข้อมูลเกียรติบัตรเรียบร้อยแล้ว');
  };

  const handleDownload = () => {
    if (!certificateRecord) return;
    
    if (certificateRecord.PDF_URL && !certificateRecord.PDF_URL.includes('SAMPLE')) {
      window.open(certificateRecord.PDF_URL, '_blank');
      return;
    }

    // In demo or print mode
    window.print();
  };

  return (
    <div className="py-12 sm:py-16 bg-[#FAF8FD] min-h-[75vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#7043A6] font-semibold mb-2">
            <Award className="w-4 h-4 text-[#D6AF55]" />
            <span>ระบบเกียรติบัตรอิเล็กทรอนิกส์</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#30283A] mb-3">
            ค้นหาและดาวน์โหลดเกียรติบัตร
          </h1>
          <p className="text-sm text-stone-600">
            {config.CERTIFICATE_ANNOUNCEMENT || 'ดาวน์โหลดเกียรติบัตรออนไลน์อย่างเป็นทางการ สำหรับผู้ผ่านเกณฑ์ 60% ขึ้นไป'}
          </p>
        </div>

        {/* Search Form Card (No verification code required) */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 sm:p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-5">
            
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                ชื่อ หรือ ชื่อ-นามสกุล ผู้เข้าสอบ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="เช่น กิตติพงษ์ รักอักษร (ใส่หรือไม่ใส่คำนำหน้าได้)"
                className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7043A6] focus:border-transparent text-sm text-[#30283A] placeholder:text-stone-400"
              />

              {/* Admin Editable Search Instruction */}
              <p className="text-xs text-stone-500 mt-2">
                {config.CERTIFICATE_SEARCH_INSTRUCTION || 'กรุณากรอกชื่อ หรือชื่อ-นามสกุล เพื่อค้นหาและดาวน์โหลดเกียรติบัตรอิเล็กทรอนิกส์ PDF ของท่าน'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !config.CERTIFICATE_DOWNLOAD_ENABLED}
              className="w-full py-3.5 px-6 rounded-xl font-heading font-semibold text-sm bg-[#4B267D] hover:bg-[#7043A6] text-white flex items-center justify-center gap-2 shadow-md shadow-[#4B267D]/20 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังค้นหาข้อมูลเกียรติบัตร...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>ค้นหาเกียรติบัตร</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Multiple Matches Disambiguation */}
        {searchState === 'MULTIPLE_MATCHES' && multipleRecords.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 mb-8">
            <h3 className="font-heading font-semibold text-base text-[#4B267D] mb-2 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#D6AF55]" />
              <span>{statusMessage}</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              คลิกเลือกชื่อและระดับชั้นของท่านเพื่อดูเกียรติบัตร:
            </p>
            <div className="space-y-3">
              {multipleRecords.map((item) => (
                <div
                  key={item.Participant_ID}
                  onClick={() => handleSelectRecord(item)}
                  className="p-4 rounded-xl border border-stone-200 hover:border-[#7043A6] hover:bg-[#FAF8FD] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-heading font-semibold text-base text-[#30283A]">
                      {item.Prefix} {item.First_Name} {item.Last_Name}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {item.Level} {item.Class && `· ห้อง ${item.Class}`} · รางวัล{item.Award_Level}
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-[#D6AF55] text-[#4B267D] font-bold text-xs font-heading hover:bg-[#C9A043] transition-colors self-start sm:self-auto">
                    เลือกรายการนี้
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* States Display */}
        {searchState === 'NOT_FOUND' && (
          <div className="p-6 rounded-2xl bg-stone-100 border border-stone-300 text-stone-800 shadow-sm mb-8 text-center">
            <AlertCircle className="w-8 h-8 text-stone-500 mx-auto mb-2" />
            <h3 className="font-heading font-semibold text-base mb-1">
              ไม่พบข้อมูลเกียรติบัตร
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              {statusMessage || 'ยังไม่มีเกียรติบัตรสำหรับรายการนี้ หรือกรอกชื่อไม่ถูกต้อง'}
            </p>
          </div>
        )}

        {/* State: Found Certificate */}
        {searchState === 'FOUND' && certificateRecord && (
          <div className="bg-white rounded-2xl border-2 border-[#D6AF55] shadow-xl overflow-hidden animate-fade-in mb-8">
            
            {/* Certificate Header Banner */}
            <div className="bg-gradient-to-r from-[#4B267D] via-[#7043A6] to-[#4B267D] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#D6AF55] font-semibold mb-1">
                  เกียรติบัตรอิเล็กทรอนิกส์ฉบับจริง
                </div>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                  {certificateRecord.Prefix} {certificateRecord.First_Name} {certificateRecord.Last_Name}
                </h3>
                <div className="text-xs text-[#F5E8C7]/90 mt-1">
                  {certificateRecord.Level} {certificateRecord.Class && `· ห้อง ${certificateRecord.Class}`} · รหัสผู้สอบ: {certificateRecord.Participant_ID}
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {certificateRecord.Status === 'READY' ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>พร้อมดาวน์โหลด</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>กำลังจัดเตรียมไฟล์ ({certificateRecord.Status})</span>
                  </span>
                )}
              </div>
            </div>

            {/* Certificate Details & Preview */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8FD] border border-stone-200 text-center">
                <div>
                  <div className="text-xs text-stone-500 mb-1">ระดับรางวัล</div>
                  <div className="font-heading font-bold text-lg text-[#B38F3B]">
                    {certificateRecord.Award_Level}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-stone-500 mb-1">วันที่ออกเอกสาร</div>
                  <div className="text-xs font-medium text-stone-700 mt-1">
                    {certificateRecord.Created_At}
                  </div>
                </div>
              </div>

              {/* Visual PDF Preview Box */}
              {config.CERTIFICATE_PREVIEW_ENABLED && (
                <div className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 p-4">
                  <div className="flex items-center justify-between mb-3 text-xs text-stone-600">
                    <span className="font-medium flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#7043A6]" />
                      <span>ตัวอย่างเกียรติบัตร (Certificate Preview)</span>
                    </span>
                    <span className="text-[11px] text-stone-400">ขนาด A4 แนวนอน</span>
                  </div>

                  <div className="max-w-2xl mx-auto rounded-lg overflow-hidden border border-stone-300 shadow-md relative group">
                    <img
                      src="/src/assets/images/certificate_preview_1794124484424.jpg"
                      alt="ตัวอย่างเกียรติบัตรโครงการสืบศิลป์ถิ่นอักษร"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover"
                    />
                    
                    {/* Watermark overlay showing student's verified name */}
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] flex items-center justify-center p-4">
                      <div className="bg-white/95 border border-[#D6AF55] shadow-lg rounded-xl p-4 text-center max-w-sm">
                        <div className="font-heading font-bold text-base text-[#4B267D] mb-1">
                          {certificateRecord.Prefix} {certificateRecord.First_Name} {certificateRecord.Last_Name}
                        </div>
                        <div className="text-xs text-stone-600 mb-1">
                          ได้รับรางวัลระดับ <strong className="text-[#B38F3B]">{certificateRecord.Award_Level}</strong>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {config.SCHOOL_NAME}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-stone-200">
                {certificateRecord.Status === 'READY' ? (
                  <>
                    <button
                      onClick={handleDownload}
                      className="px-5 py-2.5 rounded-xl bg-[#4B267D] hover:bg-[#7043A6] text-white font-heading font-semibold text-sm flex items-center gap-2 shadow-md shadow-[#4B267D]/20 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>ดาวน์โหลดเกียรติบัตร PDF</span>
                    </button>

                    {certificateRecord.PDF_URL && (
                      <a
                        href={certificateRecord.PDF_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-heading font-medium text-sm flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>เปิดไฟล์ในแท็บใหม่</span>
                      </a>
                    )}
                  </>
                ) : (
                  <div className="w-full text-center text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    เกียรติบัตรของท่านอยู่ในขั้นตอนการประมวลผล (PENDING) เมื่อไฟล์พร้อมแล้วท่านจะสามารถดาวน์โหลดได้ทันที
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
