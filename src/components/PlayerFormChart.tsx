"use client";

import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

export interface FormMatchPoint {
  date: string;
  earnedRating: number;
  position?: string;
}

export default function PlayerFormChart({ matches }: { matches: FormMatchPoint[] }) {
  if (!matches || matches.length < 2) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">Son 5 Maç Form Grafiği</h3>
        </div>
        <p className="text-xs text-slate-400 font-medium py-4 text-center">
          Grafik oluşması için en az 2 tamamlanmış maç verisi gereklidir.
        </p>
      </div>
    );
  }

  // En son 5 maçı kronolojik sıraya al (eskiden yeniye)
  const chartData = [...matches].slice(-5);
  const ratings = chartData.map(m => Math.ceil(m.earnedRating));

  const firstRating = ratings[0];
  const lastRating = ratings[ratings.length - 1];
  const delta = lastRating - firstRating;

  const minVal = Math.min(...ratings) - 3;
  const maxVal = Math.max(...ratings) + 3;
  const range = maxVal - minVal || 1;

  const width = 360;
  const height = 130;
  const paddingX = 35;
  const paddingTop = 25;
  const paddingBottom = 30;

  const points = chartData.map((m, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingBottom - ((Math.ceil(m.earnedRating) - minVal) / range) * (height - paddingTop - paddingBottom);
    return { x, y, rating: Math.ceil(m.earnedRating), date: m.date, position: m.position };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight">Son 5 Maç Form Grafiği</h3>
            <p className="text-[11px] text-slate-400 font-medium">Son maçlardaki OVR gelişim eğrisi</p>
          </div>
        </div>

        {/* Delta Badge */}
        <div className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 border shadow-2xs ${
          delta > 0 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : delta < 0 
            ? 'bg-rose-50 text-rose-700 border-rose-200' 
            : 'bg-slate-50 text-slate-600 border-slate-200'
        }`}>
          {delta > 0 && <TrendingUp size={14} className="text-emerald-600" />}
          {delta < 0 && <TrendingDown size={14} className="text-rose-600" />}
          {delta === 0 && <Minus size={14} className="text-slate-500" />}
          <span>{delta > 0 ? `+${delta} OVR Yükseliş 🔥` : delta < 0 ? `${delta} OVR Düşüş` : 'Dengeli Form'}</span>
        </div>
      </div>

      {/* SVG Form Graph */}
      <div className="w-full relative overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="formGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={delta >= 0 ? "#3b82f6" : "#f43f5e"} stopOpacity="0.25" />
              <stop offset="100%" stopColor={delta >= 0 ? "#3b82f6" : "#f43f5e"} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#formGradient)" />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke={delta >= 0 ? "#2563eb" : "#e11d48"}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points and Labels */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Rating Label Above Point */}
              <rect
                x={p.x - 14}
                y={p.y - 20}
                width="28"
                height="15"
                rx="4"
                fill={delta >= 0 ? "#1e40af" : "#9f1239"}
              />
              <text
                x={p.x}
                y={p.y - 9}
                textAnchor="middle"
                fontSize="10"
                fontWeight="900"
                fill="#ffffff"
              >
                {p.rating}
              </text>

              {/* Point Circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="#ffffff"
                stroke={delta >= 0 ? "#2563eb" : "#e11d48"}
                strokeWidth="3"
              />

              {/* Date Label Below Chart */}
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#94a3b8"
              >
                {p.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
