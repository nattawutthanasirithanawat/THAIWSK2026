import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  deadlineIso: string;
  isOpen: boolean;
  onStatusChange?: (isExpired: boolean) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  deadlineIso,
  isOpen,
  onStatusChange,
}) => {
  const calculateTimeLeft = (): TimeLeft => {
    if (!isOpen) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    try {
      const targetTime = new Date(deadlineIso).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (isNaN(difference) || difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    } catch {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isExpired && onStatusChange) {
        onStatusChange(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineIso, isOpen]);

  if (timeLeft.isExpired || !isOpen) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 sm:p-5 text-center backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-center gap-2 text-amber-300 font-heading font-semibold text-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>ปิดระบบรับสมัครและทำแบบทดสอบแล้ว</span>
        </div>
        <p className="text-xs text-white/80 mt-1">
          โครงการสิ้นสุดระยะเวลาการทำแบบทดสอบตามกำหนดการ ขอขอบคุณผู้เข้าร่วมโครงการทุกท่าน
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl bg-white/10 border border-[#D6AF55]/40 backdrop-blur-md p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-center gap-2 text-[#F5E8C7] text-sm font-medium mb-3">
        <Clock className="w-4 h-4 text-[#D6AF55]" />
        <span>นับถอยหลังสู่การปิดระบบรับสมัครและส่งคำตอบ</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
        {/* Days */}
        <div className="bg-[#4B267D]/80 border border-[#D6AF55]/30 rounded-xl p-2.5 sm:p-3.5 shadow-md">
          <span className="block font-heading font-bold text-2xl sm:text-4xl text-[#D6AF55] tabular-nums">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[11px] sm:text-xs text-[#F5E8C7] font-medium mt-0.5 block">
            วัน
          </span>
        </div>

        {/* Hours */}
        <div className="bg-[#4B267D]/80 border border-[#D6AF55]/30 rounded-xl p-2.5 sm:p-3.5 shadow-md">
          <span className="block font-heading font-bold text-2xl sm:text-4xl text-[#D6AF55] tabular-nums">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[11px] sm:text-xs text-[#F5E8C7] font-medium mt-0.5 block">
            ชั่วโมง
          </span>
        </div>

        {/* Minutes */}
        <div className="bg-[#4B267D]/80 border border-[#D6AF55]/30 rounded-xl p-2.5 sm:p-3.5 shadow-md">
          <span className="block font-heading font-bold text-2xl sm:text-4xl text-[#D6AF55] tabular-nums">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[11px] sm:text-xs text-[#F5E8C7] font-medium mt-0.5 block">
            นาที
          </span>
        </div>

        {/* Seconds */}
        <div className="bg-[#4B267D]/80 border border-[#D6AF55]/30 rounded-xl p-2.5 sm:p-3.5 shadow-md">
          <span className="block font-heading font-bold text-2xl sm:text-4xl text-[#D6AF55] tabular-nums">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[11px] sm:text-xs text-[#F5E8C7] font-medium mt-0.5 block">
            วินาที
          </span>
        </div>
      </div>

      <div className="text-center text-[11px] text-white/60 mt-3">
        เขตเวลามาตรฐานประเทศไทย (Asia/Bangkok)
      </div>
    </div>
  );
};
