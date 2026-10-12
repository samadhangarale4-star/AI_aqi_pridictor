import React from 'react';
import { AQICategory } from '../types';
import { AQI_CATEGORIES } from '../utils/aqi';

interface AQIGaugeProps {
  aqi: number;
  category: AQICategory;
  peakAqi: number;
}

export default function AQIGauge({ aqi, category, peakAqi }: AQIGaugeProps) {
  // Clamped AQI between 0 and 400 for gauge visualization
  const clampedAqi = Math.min(400, Math.max(0, aqi));
  
  // Percent from 0 to 1
  const percent = clampedAqi / 400;
  
  // Angle from -90 deg (left) to +90 deg (right)
  const angle = -90 + percent * 180;

  const categoryConfig = AQI_CATEGORIES[category] || AQI_CATEGORIES.Moderate;

  // Arc path parameters
  const radius = 80;
  const strokeWidth = 14;
  const center = 100;

  // Calculate needle tip
  const needleLength = 65;
  const needleRad = (angle * Math.PI) / 180;
  const needleX = center + needleLength * Math.sin(needleRad);
  const needleY = center - needleLength * Math.cos(needleRad);

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative w-[210px] h-[115px] flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="75%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Semi-circle Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={251.2}
            strokeDashoffset={251.2 * (1 - percent)}
            className="transition-all duration-700 ease-out"
          />

          {/* Needle Center Pivot Base */}
          <circle cx={center} cy={100} r="9" fill="#0f172a" />
          <circle cx={center} cy={100} r="4" fill="#38bdf8" />

          {/* Needle Pointer */}
          <line
            x1={center}
            y1={100}
            x2={needleX}
            y2={needleY}
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#needleGlow)"
            className="transition-all duration-700 ease-out origin-bottom"
          />
        </svg>

        {/* Min / Max Labels */}
        <span className="absolute bottom-1 left-2 font-mono text-[10px] font-bold text-emerald-600">0</span>
        <span className="absolute bottom-1 right-2 font-mono text-[10px] font-bold text-purple-700">400+</span>
      </div>

      {/* Numerical Display and Status Badge */}
      <div className="text-center -mt-3">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-black font-mono tracking-tight text-slate-900">{aqi}</span>
          <span className="text-xs font-mono font-bold text-slate-500">AQI</span>
        </div>
        
        <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold border shadow-2xs ${categoryConfig.badgeBg} ${categoryConfig.badgeBorder} ${categoryConfig.badgeText}`}>
          <span className={`w-2 h-2 rounded-full ring-2 ring-white animate-pulse ${categoryConfig.dotColor}`} />
          <span>{category}</span>
        </div>

        <div className="text-[11px] font-mono text-slate-500 mt-1">
          Peak Window: <strong className="text-slate-800">{peakAqi} AQI</strong>
        </div>
      </div>
    </div>
  );
}
