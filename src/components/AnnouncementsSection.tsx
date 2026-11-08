import React from 'react';
import { Bell, Calendar, Megaphone } from 'lucide-react';
import { Announcement } from '../types';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ announcements }) => {
  const publishedAnnouncements = announcements.filter(item => item.Status === 'PUBLISHED');

  return (
    <section className="py-14 bg-white border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#7043A6] font-semibold mb-1">
              <Megaphone className="w-3.5 h-3.5 text-[#D6AF55]" />
              <span>ข่าวสารและประกาศ</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#30283A]">
              ประกาศจากคณะกรรมการดำเนินงาน
            </h2>
          </div>
          <div className="text-xs text-stone-500">
            อัปเดตข้อมูลล่าสุดจากฐานข้อมูลกลาง
          </div>
        </div>

        {publishedAnnouncements.length === 0 ? (
          <div className="p-8 text-center text-stone-500 bg-[#FAF8FD] rounded-xl border border-stone-200">
            ยังไม่มีประกาศใหม่ในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publishedAnnouncements.map((item) => (
              <article
                key={item.Announcement_ID}
                className="bg-[#FAF8FD] rounded-xl border border-stone-200/80 p-6 flex flex-col justify-between hover:border-[#7043A6]/40 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#7043A6]" />
                      <span>{item.Published_Date}</span>
                    </span>
                    {item.Priority === 'HIGH' && (
                      <span className="text-amber-800 font-medium">ประกาศสำคัญ</span>
                    )}
                  </div>
                  
                  <h3 className="font-heading font-semibold text-base text-[#30283A] mb-2 leading-snug">
                    {item.Title}
                  </h3>
                  
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {item.Description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500">
                  <span>รหัส: {item.Announcement_ID}</span>
                  <span className="text-[#4B267D] font-medium">กลุ่มสาระภาษาไทย</span>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
