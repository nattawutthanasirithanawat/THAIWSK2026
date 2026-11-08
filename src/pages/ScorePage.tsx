import React, { useState } from 'react';
import { Search, Award, CheckCircle2, XCircle, AlertCircle, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { PublicConfig, ScoreRecord } from '../types';
import { ApiService } from '../services/api';

interface ScorePageProps {
  config: PublicConfig;
  onNavigateToCertificate: () => void;
}

export const ScorePage: React.FC<ScorePageProps> = ({ config, onNavigateToCertificate }) => {
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchState, setSearchState] = useState<
    'IDLE' | 'LOADING' | 'FOUND' | 'NOT_FOUND' | 'MULTIPLE_MATCHES' | 'SYSTEM_CLOSED' | 'INVALID_INPUT' | 'ERROR'
  >('IDLE');
  const [statusMessage, setStatusMessage] = useState('');
  const [resultRecord, setResultRecord] = useState<ScoreRecord | null>(null);
  const [multipleRecords, setMultipleRecords] = useState<ScoreRecord[]>([]);

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
    setResultRecord(null);
    setMultipleRecords([]);

    try {
      const response = await ApiService.searchScore(nameInput);
      setSearchState(response.status);
      setStatusMessage(response.message);
      if (response.record) {
        setResultRecord(response.record);
      }
      if (response.records) {
        setMultipleRecords(response.records);
      }
    } catch {
      setSearchState('ERROR');
      setStatusMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecord = (record: ScoreRecord) => {
    setResultRecord(record);
    setSearchState('FOUND');
    setStatusMessage('พบข้อมูลผลการทดสอบเรียบร้อยแล้ว');
  };

  const getAwardBadge = (awardLevel: string) => {
    switch (awardLevel) {
      case 'เหรียญทอง':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: 'เหรียญทอง (ยอดเยี่ยม)',
        };
      case 'เหรียญเงิน':
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          label: 'เหรียญเงิน (ดีเด่น)',
        };
      case 'เหรียญทองแดง':
        return {
          bg: 'bg-orange-100 text-orange-900 border-orange-300',
          label: 'เหรียญทองแดง (ดี)',
        };
      default:
        return {
          bg: 'bg-stone-100 text-stone-700 border-stone-200',
          label: 'ระดับชมเชย',
        };
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-[#FAF8FD] min-h-[75vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#7043A6] font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-[#D6AF55]" />
            <span>ระบบตรวจสอบคะแนนสอบมาตรฐานความปลอดภัย</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#30283A] mb-3">
            ตรวจสอบผลคะแนนการทดสอบความรู้ความสามารถด้านภาษาไทย
          </h1>
          <p className="text-sm text-stone-600">
            สืบศิลป์ถิ่นอักษร สืบสุนทรภาษาไทย กลุ่มสาระการเรียนรู้ภาษาไทย โรงเรียนกระทุ่มแบน "วิเศษสมุทคุณ"
          </p>
        </div>

        {/* Search Form Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 sm:p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-5">
            
            {/* Student Name Input */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                ชื่อ หรือ ชื่อ-นามสกุล ผู้เข้าสอบ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="เช่น กิตติพงษ์ รักอักษร (ใส่หรือไม่ใส่คำนำหน้าได้)"
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7043A6] focus:border-transparent text-sm text-[#30283A] placeholder:text-stone-400"
                />
              </div>
              
              {/* Admin Editable Search Instruction */}
              <p className="text-xs text-stone-500 mt-2">
                {config.SCORE_SEARCH_INSTRUCTION || 'กรุณากรอกชื่อจริง หรือชื่อ-นามสกุล ของท่านเพื่อค้นหาผลคะแนนสอบ (ระบบรองรับการค้นหาทั้งแบบมีและไม่มีคำนำหน้า)'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !config.SCORE_SEARCH_ENABLED}
              className="w-full py-3.5 px-6 rounded-xl font-heading font-semibold text-sm bg-[#4B267D] hover:bg-[#7043A6] text-white flex items-center justify-center gap-2 shadow-md shadow-[#4B267D]/20 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังค้นหาข้อมูลในระบบ...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>ตรวจสอบผลคะแนน</span>
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
              คลิกเลือกชื่อและระดับชั้นของท่านเพื่อดูผลคะแนน:
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
                      {item.Level} {item.Class && `· ห้อง ${item.Class}`} {item.School && `· ${item.School}`}
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-[#4B267D] text-white text-xs font-heading font-medium hover:bg-[#7043A6] transition-colors self-start sm:self-auto">
                    ดูผลคะแนน
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State: Not Found */}
        {searchState === 'NOT_FOUND' && (
          <div className="p-6 rounded-2xl bg-stone-100 border border-stone-300 text-stone-800 shadow-sm mb-8 text-center">
            <AlertCircle className="w-8 h-8 text-stone-500 mx-auto mb-2" />
            <h3 className="font-heading font-semibold text-base mb-1">
              ไม่พบข้อมูลผู้เข้าสอบ
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              {statusMessage || 'กรุณาตรวจสอบการสะกดชื่อ-นามสกุลให้ถูกต้องอีกครั้ง'}
            </p>
          </div>
        )}

        {/* State: System Closed */}
        {searchState === 'SYSTEM_CLOSED' && (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 shadow-sm mb-8 text-center">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h3 className="font-heading font-semibold text-base mb-1">
              ระบบตรวจสอบคะแนนปิดให้บริการชั่วคราว
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 max-w-md mx-auto leading-relaxed">
              {statusMessage}
            </p>
          </div>
        )}

        {/* State: Found Record */}
        {searchState === 'FOUND' && resultRecord && (
          <div className="bg-white rounded-2xl border-2 border-[#D6AF55]/60 shadow-xl overflow-hidden animate-fade-in mb-8">
            
            {/* Header of Score Card */}
            <div className="bg-gradient-to-r from-[#4B267D] to-[#7043A6] p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#D6AF55] font-semibold mb-1">
                  ผลการทดสอบอย่างเป็นทางการ
                </div>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                  {resultRecord.Prefix} {resultRecord.First_Name} {resultRecord.Last_Name}
                </h3>
                <div className="text-xs text-[#F5E8C7]/90 mt-1">
                  {resultRecord.Level} {resultRecord.Class && `· ห้อง ${resultRecord.Class}`} · รหัสผู้สอบ: {resultRecord.Participant_ID}
                </div>
              </div>

              {/* Award Medal Badge */}
              <div className="shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${getAwardBadge(resultRecord.Award_Level).bg}`}>
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>{resultRecord.Award_Level}</span>
                </span>
              </div>
            </div>

            {/* Score Metrics Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Score Highlight Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-[#FAF8FD] p-4 rounded-xl border border-stone-200">
                  <div className="text-xs text-stone-500 mb-1">คะแนนที่ได้</div>
                  <div className="font-heading font-extrabold text-3xl text-[#4B267D] tabular-nums">
                    {resultRecord.Score}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">คะแนนเต็ม {resultRecord.Full_Score}</div>
                </div>

                <div className="bg-[#FAF8FD] p-4 rounded-xl border border-stone-200">
                  <div className="text-xs text-stone-500 mb-1">คิดเป็นร้อยละ</div>
                  <div className="font-heading font-extrabold text-3xl text-[#7043A6] tabular-nums">
                    {resultRecord.Percentage}%
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">เกณฑ์ผ่าน {config.PASS_PERCENT || 60}%</div>
                </div>

                <div className="bg-[#FAF8FD] p-4 rounded-xl border border-stone-200">
                  <div className="text-xs text-stone-500 mb-1">ผลการประเมิน</div>
                  <div className="flex items-center justify-center gap-1.5 font-heading font-bold text-xl sm:text-2xl mt-1">
                    {resultRecord.Result === 'ผ่าน' ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>ผ่าน</span>
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <XCircle className="w-5 h-5" />
                        <span>ไม่ผ่าน</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">ตามเกณฑ์การทดสอบ</div>
                </div>

                <div className="bg-[#FAF8FD] p-4 rounded-xl border border-stone-200">
                  <div className="text-xs text-stone-500 mb-1">ระดับรางวัล</div>
                  <div className="font-heading font-bold text-lg sm:text-xl text-[#B38F3B] mt-1.5">
                    {resultRecord.Award_Level}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">ประจำปีการศึกษา 2569</div>
                </div>
              </div>

              {/* Score Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-stone-600 font-medium mb-1.5">
                  <span>ความก้าวหน้าคะแนน</span>
                  <span className="tabular-nums font-semibold">{resultRecord.Score} / {resultRecord.Full_Score} ({resultRecord.Percentage}%)</span>
                </div>
                <div className="w-full h-3.5 bg-stone-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7043A6] via-[#D6AF55] to-emerald-500 transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, resultRecord.Percentage))}%` }}
                  />
                </div>
              </div>

              {/* Action Banner for Certificate */}
              {resultRecord.Result === 'ผ่าน' ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-emerald-900 text-sm">
                        ท่านผ่านเกณฑ์การประเมินและมีสิทธิ์รับเกียรติบัตร
                      </div>
                      <div className="text-xs text-emerald-700">
                        สามารถไปที่ระบบดาวน์โหลดเกียรติบัตรเพื่อรับไฟล์ PDF ได้ทันที
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToCertificate}
                    className="px-4 py-2.5 rounded-lg bg-[#4B267D] hover:bg-[#7043A6] text-white font-heading text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    <span>ไปดาวน์โหลดเกียรติบัตร</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 text-center">
                  ขอขอบคุณที่เข้าร่วมการทดสอบความรู้ความสามารถทางภาษาไทย สามารถติดตามกิจกรรมและการทดสอบในรอบถัดไปได้จากทางกลุ่มสาระฯ
                </div>
              )}

              <div className="text-[11px] text-stone-400 text-right">
                อัปเดตข้อมูลเมื่อ: {resultRecord.Updated_At}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
