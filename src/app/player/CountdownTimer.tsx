"use client";

import { useEffect, useState } from "react";

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; secs: number } | null>(null);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null); // veya { days: 0, hours: 0, mins: 0, secs: 0 }
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-black text-xs shadow-sm flex items-center gap-1 animate-pulse">
        <span className="w-2 h-2 bg-amber-500 rounded-full"></span> VAKİT GELDİ
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center bg-white border border-amber-200 w-10 py-1 rounded-lg shadow-sm">
          <span className="font-black text-amber-600 text-sm">{timeLeft.days}</span>
          <span className="text-[8px] font-bold text-amber-800">GÜN</span>
        </div>
      )}
      <div className="flex flex-col items-center bg-white border border-amber-200 w-10 py-1 rounded-lg shadow-sm">
        <span className="font-black text-amber-600 text-sm">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-[8px] font-bold text-amber-800">SAAT</span>
      </div>
      <div className="flex flex-col items-center bg-white border border-amber-200 w-10 py-1 rounded-lg shadow-sm">
        <span className="font-black text-amber-600 text-sm">{timeLeft.mins.toString().padStart(2, '0')}</span>
        <span className="text-[8px] font-bold text-amber-800">DK</span>
      </div>
    </div>
  );
}
