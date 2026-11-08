import React from 'react';
import { CalendarClock, CheckCircle, Clock3 } from 'lucide-react';
import { ScheduleItem } from '../types';

interface ScheduleSectionProps {
  schedule: ScheduleItem[];
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ schedule }) => {
  return (
    <section className="py-16 sm:py-20 bg-[#FAF8FD]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#7043A6] font-semibold mb-2">
            <CalendarClock className="w-3.5 h-3.5 text-[#D6AF55]" />
            <span>กำหนดการและระยะเวลา</span>
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#30283A] mb-3">
            กำหนดการสำคัญของโครงการ
          </h2>
          <p className="text-sm text-stone-600">
            โปรดติดตามช่วงเวลาการสอบ การประกาศผล และการดาวน์โหลดเกียรติบัตรอย่างสม่ำเสมอ
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#7043A6]/30 space-y-8 ml-2 sm:ml-4">
          {schedule.map((item, index) => {
            const isCompleted = item.Status === 'COMPLETED';
            const isInProgress = item.Status === 'IN_PROGRESS';

            return (
              <div key={item.Schedule_ID || index} className="relative group">
                
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isInProgress
                      ? 'bg-[#7043A6] border-[#D6AF55] text-white shadow-md'
                      : isCompleted
                      ? 'bg-emerald-600 border-white text-white'
                      : 'bg-white border-stone-300 text-stone-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Clock3 className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-xs hover:border-[#7043A6]/30 hover:shadow-sm transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-heading font-semibold text-base text-[#30283A]">
                      {item.Event_Name}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        isInProgress
                          ? 'bg-[#7043A6]/10 text-[#4B267D]'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {isInProgress ? 'กำลังดำเนินการ' : isCompleted ? 'เสร็จสิ้น' : 'เร็วๆ นี้'}
                    </span>
                  </div>

                  <div className="text-xs text-[#7043A6] font-medium mb-2">
                    วันที่: {item.Event_Date} {item.Start_Time && `(${item.Start_Time} - ${item.End_Time})`}
                  </div>

                  <p className="text-sm text-stone-600 leading-relaxed">
                    {item.Description}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
