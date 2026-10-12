import React, { useState, useEffect } from 'react';
import { TimeSlotForecast } from '../types';
import { AQI_CATEGORIES } from '../utils/aqi';
import { Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';

interface TimelinePlayerProps {
  slots: { dayIndex: number; dayTitle: string; slot: TimeSlotForecast }[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: TimeSlotForecast) => void;
}

export default function TimelinePlayer({
  slots,
  selectedSlotId,
  onSelectSlot,
}: TimelinePlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying || slots.length === 0) return;

    const timer = setInterval(() => {
      const currentIndex = slots.findIndex((item) => item.slot.id === selectedSlotId);
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % slots.length : 0;
      onSelectSlot(slots[nextIndex].slot);
    }, 1600);

    return () => clearInterval(timer);
  }, [isPlaying, selectedSlotId, slots, onSelectSlot]);

  const activeItem = slots.find((item) => item.slot.id === selectedSlotId) || slots[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              48-Hour Progression Player
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Interactive Simulation
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Scrub or autoplay through all 10 scheduled monitoring periods
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isPlaying
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              if (slots.length > 0) onSelectSlot(slots[0].slot);
            }}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            title="Reset to Day 1 Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 10 Time Slot Interactive Scrubber Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-1.5">
        {slots.map((item, index) => {
          const isSelected = item.slot.id === selectedSlotId;
          const catConfig = AQI_CATEGORIES[item.slot.category] || AQI_CATEGORIES.Moderate;
          const dayBadge = item.dayIndex === 0 ? 'D1' : 'D2';

          return (
            <button
              key={item.slot.id}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onSelectSlot(item.slot);
              }}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[64px] ${
                isSelected
                  ? 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/70 shadow-sm scale-102'
                  : 'bg-slate-50/80 border-slate-200/90 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-500">
                <span className={`font-bold ${item.dayIndex === 0 ? 'text-teal-700' : 'text-indigo-700'}`}>
                  {dayBadge}
                </span>
                <span className="text-[9px]">{item.slot.time.replace(':00 ', '')}</span>
              </div>

              <div className="font-mono text-sm font-black text-slate-900 my-0.5">
                {item.slot.aqi}
              </div>

              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${catConfig.dotColor}`} />
                <span className="text-[9px] font-bold text-slate-600 truncate max-w-[50px]">
                  {item.slot.category.split(' ')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Selected Node Preview Bar */}
      {activeItem && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              {activeItem.dayTitle} • {activeItem.slot.time}
            </span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${AQI_CATEGORIES[activeItem.slot.category].badgeBg} ${AQI_CATEGORIES[activeItem.slot.category].badgeText} border ${AQI_CATEGORIES[activeItem.slot.category].badgeBorder}`}>
              {activeItem.slot.aqi} AQI ({activeItem.slot.category})
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            {activeItem.slot.mainPollutant} • {activeItem.slot.temperature} • Wind: {activeItem.slot.windSpeed}
          </div>
        </div>
      )}
    </div>
  );
}
