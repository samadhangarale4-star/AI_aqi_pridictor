import React, { useState, useEffect, useMemo } from 'react';
import { 
  AQI_CATEGORIES, 
  POLLUTANT_COLORS,
  POPULAR_AREA_ITEMS, 
  generateForecast 
} from './utils/aqi';
import { 
  AQICategory, 
  PredictionResult, 
  SimulationParams, 
  TimeSlotForecast 
} from './types';
import { 
  Wind, 
  Sparkles, 
  Search, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  SlidersHorizontal,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Gauge,
  Thermometer,
  Droplets,
  Layers,
  TrendingDown,
  TrendingUp,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  Sun,
  Flame,
  CheckCircle2,
  HeartHandshake,
  ShieldAlert,
  Home,
  Footprints
} from 'lucide-react';
import AQIMap from './components/AQIMap';
import AQIGauge from './components/AQIGauge';
import TimelinePlayer from './components/TimelinePlayer';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend
} from 'recharts';

interface ChartPoint {
  slotId: string;
  dayIndex: number;
  dayLabel: string;
  time: string;
  fullLabel: string;
  shortLabel: string;
  aqi: number;
  category: AQICategory;
  pollutant: string;
  temperature: string;
  humidity: string;
  windSpeed: string;
}

export default function App() {
  const [selectedArea, setSelectedArea] = useState<string>('Central Downtown');
  const [customInput, setCustomInput] = useState<string>('Central Downtown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [forecastResult, setForecastResult] = useState<PredictionResult | null>(null);
  
  // Interactive UI States
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeDayFilter, setActiveDayFilter] = useState<'both' | 0 | 1>('both');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotForecast | null>(null);
  const [highlightCategory, setHighlightCategory] = useState<AQICategory | null>(null);
  const [showSimControls, setShowSimControls] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [activeChartTab, setActiveChartTab] = useState<'timeline' | 'diurnal' | 'pollutants'>('timeline');
  const [activeAdvisoryTab, setActiveAdvisoryTab] = useState<'activity' | 'mask' | 'ventilation' | 'vulnerable'>('activity');

  // Environmental simulation parameters
  const [simParams, setSimParams] = useState<SimulationParams>({
    windDispersion: 'normal',
    trafficProfile: 'standard',
  });

  // Execute prediction
  const handlePredict = async (
    areaToPredict?: string,
    currentParams: SimulationParams = simParams
  ) => {
    const targetArea = (areaToPredict || customInput).trim() || 'Central Urban Area';
    setIsLoading(true);

    const basePrediction = generateForecast(targetArea, currentParams);

    let recommendationText = '';
    let recommendationSource: 'ai' | 'standard' = 'standard';

    try {
      const timeSlotsSummary = basePrediction.days
        .map((d) => `${d.dayTitle}: Avg ${d.averageAqi}, Peak ${d.peakAqi} (${d.category})`)
        .join('; ');

      const response = await fetch('/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: targetArea,
          peakAqi: basePrediction.peakAqi,
          avgAqi: basePrediction.overallAqi,
          category: basePrediction.category,
          timeSlotsSummary,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        recommendationText = data.recommendation;
        recommendationSource = data.source || 'ai';
      }
    } catch {
      // Handled gracefully with deterministic advisory
    }

    if (!recommendationText) {
      if (basePrediction.overallAqi <= 50) {
        recommendationText = 'Air quality is satisfactory across the 48-hour horizon. Normal outdoor activity, natural building ventilation, and physical recreation can proceed without restrictions.';
      } else if (basePrediction.overallAqi <= 100) {
        recommendationText = 'Air quality remains acceptable for the general public. Sensitive individuals with chronic respiratory conditions should monitor morning and evening peak traffic hours.';
      } else if (basePrediction.overallAqi <= 150) {
        recommendationText = 'Vulnerable demographics (children, elderly, asthmatics) should moderate intense outdoor exertion. Close windows during morning (10 AM) and evening (6 PM) commute peaks.';
      } else if (basePrediction.overallAqi <= 200) {
        recommendationText = 'Elevated particulate concentration expected. Sensitive groups should avoid outdoor exertion; general population should wear certified particulate filtration (N95) outdoors.';
      } else {
        recommendationText = 'High particulate alert. All individuals are advised to remain indoors, activate HEPA filtration systems, and suspend all outdoor strenuous cardiovascular activities.';
      }
    }

    setForecastResult({
      ...basePrediction,
      recommendation: recommendationText,
      recommendationSource,
    });

    setSelectedArea(targetArea);
    setCustomInput(targetArea);
    
    // Select highest peak slot by default for immediate inspection
    const firstDayPeak = basePrediction.days[0].timeSlots.reduce((prev, curr) => 
      curr.aqi > prev.aqi ? curr : prev
    );
    setSelectedSlot(firstDayPeak);
    setIsLoading(false);
  };

  useEffect(() => {
    handlePredict('Central Downtown');
  }, []);

  // Copy structured forecast report to clipboard
  const handleCopyReport = () => {
    if (!forecastResult) return;
    const lines = [
      `=== AIR QUALITY PREDICTION REPORT ===`,
      `Target Area: ${forecastResult.area}`,
      `Prediction Timestamp: ${forecastResult.predictedAt}`,
      `Overall 48h Mean AQI: ${forecastResult.overallAqi} (${forecastResult.category})`,
      `Peak Predicted AQI: ${forecastResult.peakAqi}`,
      ``,
      ...forecastResult.days.map((day) => {
        return [
          `[${day.dayTitle} - ${day.dateFormatted}] (Day Mean: ${day.averageAqi} AQI)`,
          ...day.timeSlots.map((s) => `  - ${s.time.padEnd(8)}: ${s.aqi} AQI [${s.category}] | Primary: ${s.mainPollutant} | ${s.temperature}`),
          ``
        ].join('\n');
      }),
      `Advisory: ${forecastResult.recommendation}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2200);
  };

  const overallConfig = forecastResult ? AQI_CATEGORIES[forecastResult.category] : null;

  // Filtered days based on active tab
  const displayedDays = useMemo(() => {
    if (!forecastResult) return [];
    if (activeDayFilter === 0) return [forecastResult.days[0]];
    if (activeDayFilter === 1) return [forecastResult.days[1]];
    return forecastResult.days;
  }, [forecastResult, activeDayFilter]);

  // Flatten all 10 scheduled slots for the timeline scrubber player
  const allTenSlots = useMemo(() => {
    if (!forecastResult) return [];
    return forecastResult.days.flatMap((day, dayIndex) =>
      day.timeSlots.map((slot) => ({
        dayIndex,
        dayTitle: day.dayTitle,
        slot,
      }))
    );
  }, [forecastResult]);

  // Transform 48-Hour Continuous Timeline for Recharts
  const timelineChartData = useMemo<ChartPoint[]>(() => {
    if (!forecastResult) return [];
    const points: ChartPoint[] = [];

    forecastResult.days.forEach((day, dayIndex) => {
      day.timeSlots.forEach((slot) => {
        points.push({
          slotId: slot.id,
          dayIndex,
          dayLabel: dayIndex === 0 ? 'Day 1' : 'Day 2',
          time: slot.time,
          fullLabel: `${dayIndex === 0 ? 'Day 1' : 'Day 2'} • ${slot.time}`,
          shortLabel: `${dayIndex === 0 ? 'D1' : 'D2'} ${slot.time.replace(':00 ', '')}`,
          aqi: slot.aqi,
          category: slot.category,
          pollutant: slot.mainPollutant,
          temperature: slot.temperature,
          humidity: slot.humidity,
          windSpeed: slot.windSpeed,
        });
      });
    });

    return points;
  }, [forecastResult]);

  // Diurnal 5 Time-Slots Comparison Data (Day 1 vs Day 2)
  const diurnalComparisonData = useMemo(() => {
    if (!forecastResult || forecastResult.days.length < 2) return [];
    const day1Slots = forecastResult.days[0].timeSlots;
    const day2Slots = forecastResult.days[1].timeSlots;

    return day1Slots.map((slot, index) => ({
      time: slot.time,
      day1Aqi: slot.aqi,
      day2Aqi: day2Slots[index]?.aqi ?? slot.aqi,
      pollutant: slot.mainPollutant,
    }));
  }, [forecastResult]);

  // Pollutant Share & Average AQI by Pollutant
  const pollutantAnalyticsData = useMemo(() => {
    if (!forecastResult) return [];
    const counts: Record<string, { count: number; totalAqi: number }> = {};
    
    forecastResult.days.forEach((day) => {
      day.timeSlots.forEach((slot) => {
        if (!counts[slot.mainPollutant]) {
          counts[slot.mainPollutant] = { count: 0, totalAqi: 0 };
        }
        counts[slot.mainPollutant].count += 1;
        counts[slot.mainPollutant].totalAqi += slot.aqi;
      });
    });

    return Object.entries(counts).map(([name, stat]) => ({
      pollutant: name,
      frequency: stat.count,
      avgAqi: Math.round(stat.totalAqi / stat.count),
      fillColor: POLLUTANT_COLORS[name]?.fill || '#64748b',
    }));
  }, [forecastResult]);

  // Comprehensive Analytics Metrics
  const analyticsSummary = useMemo(() => {
    if (!forecastResult) return null;
    const allSlots = forecastResult.days.flatMap((d) => d.timeSlots);
    
    const peakSlot = allSlots.reduce((max, s) => (s.aqi > max.aqi ? s : max), allSlots[0]);
    const cleanestSlot = allSlots.reduce((min, s) => (s.aqi < min.aqi ? s : min), allSlots[0]);

    const safeSlots = allSlots.filter((s) => s.aqi <= 100).length;
    const safePercentage = Math.round((safeSlots / allSlots.length) * 100);

    const day1Avg = forecastResult.days[0]?.averageAqi || 0;
    const day2Avg = forecastResult.days[1]?.averageAqi || 0;
    const diffPct = Math.round(((day2Avg - day1Avg) / (day1Avg || 1)) * 100);

    return {
      peakSlot,
      cleanestSlot,
      safePercentage,
      safeSlotsCount: safeSlots,
      totalSlots: allSlots.length,
      day1Avg,
      day2Avg,
      diffPct,
    };
  }, [forecastResult]);

  // Category specific health advice cards
  const healthAdvisoryDetails = useMemo(() => {
    if (!forecastResult) return { activity: '', mask: '', ventilation: '', vulnerable: '' };
    const aqi = forecastResult.overallAqi;

    if (aqi <= 50) {
      return {
        activity: 'Ideal conditions for running, cycling, sports, and outdoor workouts.',
        mask: 'No particulate mask required. Ambient air is clean and wholesome.',
        ventilation: 'Keep windows open for fresh natural airflow throughout the day.',
        vulnerable: 'Completely safe for children, seniors, and asthma sufferers.',
      };
    } else if (aqi <= 100) {
      return {
        activity: 'Outdoor exercise is generally fine; avoid heavy exertion near major highway corridors.',
        mask: 'Masks not needed for healthy individuals; highly sensitive persons may carry one.',
        ventilation: 'Natural room ventilation is safe; briefly close windows during morning rush hour.',
        vulnerable: 'Unusually sensitive individuals should watch for throat irritation.',
      };
    } else if (aqi <= 150) {
      return {
        activity: 'Reduce prolonged or heavy outdoor cardio workouts. Reschedule to early afternoon.',
        mask: 'Wear an N95/KN95 respirator if commuting during rush hours or near industrial areas.',
        ventilation: 'Keep windows mostly closed; utilize HEPA air filtration if available.',
        vulnerable: 'Children, asthmatics, and older adults should remain indoors during peak hours.',
      };
    } else if (aqi <= 200) {
      return {
        activity: 'Avoid outdoor physical exertion. Move all sports and workouts indoors.',
        mask: 'Well-fitting certified particulate respirator (N95) strongly advised for outdoor transit.',
        ventilation: 'Seal windows and doors; run indoor air purifiers on high filtration.',
        vulnerable: 'High risk of respiratory aggravation; keep emergency inhalers accessible.',
      };
    } else {
      return {
        activity: 'Strictly avoid any outdoor activity. Remain inside with air conditioning and filtration.',
        mask: 'Mandatory tight-sealing N95/P100 respirator for any essential brief outdoor exposure.',
        ventilation: 'Completely seal all entryways; run multi-stage HEPA filters continuously.',
        vulnerable: 'Serious health alert; vulnerable persons should stay in controlled clean air rooms.',
      };
    }
  }, [forecastResult]);

  // Custom Chart Tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTimelineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartPoint;
      const catConfig = AQI_CATEGORIES[data.category];
      const pollConfig = POLLUTANT_COLORS[data.pollutant] || { bg: 'bg-slate-100', text: 'text-slate-800' };

      return (
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-xl text-xs font-sans min-w-[220px]">
          <div className="font-mono text-slate-500 text-[11px] font-bold border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
            <span className="font-extrabold text-slate-900">{data.fullLabel}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${pollConfig.bg} ${pollConfig.text}`}>
              {data.pollutant}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-slate-600 font-medium">Predicted Index:</span>
            <span className="font-mono text-xl font-black text-slate-950">{data.aqi} AQI</span>
          </div>
          <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-bold text-xs mb-2.5 ${catConfig.badgeBg} ${catConfig.badgeBorder} ${catConfig.badgeText}`}>
            <span className={`w-2 h-2 rounded-full ${catConfig.dotColor}`} />
            <span>{data.category}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-mono space-y-1">
            <div className="flex justify-between">
              <span>Temperature:</span>
              <strong className="text-slate-900">{data.temperature}</strong>
            </div>
            <div className="flex justify-between">
              <span>Wind Velocity:</span>
              <strong className="text-slate-900">{data.windSpeed}</strong>
            </div>
            <div className="flex justify-between">
              <span>Rel. Humidity:</span>
              <strong className="text-slate-900">{data.humidity}</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased font-sans selection:bg-teal-200">
      
      {/* Decorative top vibrant environmental bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 via-sky-500 via-indigo-600 to-purple-600" />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
        
        {/* Header: Clean, Vibrant, Elevated */}
        <header className="mb-8 pb-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-50 via-emerald-50 to-sky-50 border border-teal-200/80 text-teal-900 text-xs font-bold mb-2.5 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
                </span>
                <span>Atmospheric Modeling Framework</span>
                <span className="text-teal-300">•</span>
                <span className="text-emerald-700">Predictive Sensor Grid</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Air Quality Prediction System
              </h1>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                2-Day Air Quality Forecast & Analytical Progression
              </p>
            </div>

            {/* Quick Export & Simulation Trigger */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowSimControls(!showSimControls)}
                className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border font-bold transition-all cursor-pointer shadow-xs ${
                  showSimControls
                    ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                <span>Simulation Factors</span>
                {showSimControls ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {forecastResult && (
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer font-bold shadow-xs"
                  title="Copy formatted forecast report to clipboard"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-extrabold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Export Brief</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Interactive Simulation Parameters Drawer */}
          {showSimControls && (
            <div className="mt-4 p-4.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-sky-50/60 to-teal-50/70 border border-indigo-200/90 text-xs text-slate-700 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-extrabold text-indigo-950 flex items-center gap-2 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  Meteorological & Dispersion Factor Simulation
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/90 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Live Dynamic Recalculation
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Wind Velocity & Planetary Boundary Layer Dispersion
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['calm', 'normal', 'breezy'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          const updated = { ...simParams, windDispersion: mode };
                          setSimParams(updated);
                          handlePredict(customInput, updated);
                        }}
                        className={`py-1.5 px-2 rounded-xl border text-center capitalize transition-all cursor-pointer font-bold ${
                          simParams.windDispersion === mode
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    Commuter & Vehicular Emission Profile
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['reduced', 'standard', 'heavy'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          const updated = { ...simParams, trafficProfile: mode };
                          setSimParams(updated);
                          handlePredict(customInput, updated);
                        }}
                        className={`py-1.5 px-2 rounded-xl border text-center capitalize transition-all cursor-pointer font-bold ${
                          simParams.trafficProfile === mode
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Input & Prediction Action */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm mb-7 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-600" />
          
          <label htmlFor="area-input" className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
            Enter or Select Target Geographic Zone
          </label>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handlePredict(customInput);
            }} 
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="area-input"
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type a city, neighborhood, sensor point, or campus..."
                className="w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:bg-white transition-all font-sans font-medium"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 active:scale-98 text-white text-sm font-bold transition-all shadow-md shadow-teal-600/20 hover:shadow-lg disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Prediction...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Predict Air Quality</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Area Presets as Vibrant Cards */}
          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <span className="block text-slate-500 font-extrabold text-[11px] uppercase tracking-wide mb-2">
              Popular Monitoring Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {POPULAR_AREA_ITEMS.map((preset) => {
                const isSelected = selectedArea.toLowerCase() === preset.name.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setCustomInput(preset.name);
                      handlePredict(preset.name);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20 scale-102 font-bold'
                        : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-base">{preset.emoji}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${preset.badgeColor}`}>
                        {preset.tag}
                      </span>
                    </div>
                    <div className="text-xs font-bold truncate">{preset.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Prediction Results */}
        {forecastResult && overallConfig && analyticsSummary && (
          <main className="space-y-7">
            
            {/* Highlighted Area & Predicted AQI Banner with Integrated SVG Dial Gauge */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm relative overflow-hidden">
              {/* Vibrant Category Color Stripe */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${overallConfig.progressGradient}`} />

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-1">
                
                {/* Area Details & Key Highlights */}
                <div className="space-y-2 flex-1">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Active Spatial Monitoring Target
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-mono">
                      Timestamp: {forecastResult.predictedAt}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {forecastResult.area}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Continuous 48-Hour Micro-Forecast • 10 Standard Time Measurement Windows
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${overallConfig.badgeBg} ${overallConfig.badgeBorder} ${overallConfig.badgeText}`}>
                      {overallConfig.name} Quality Tier
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      Mean: {forecastResult.overallAqi} AQI
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                      Peak: {forecastResult.peakAqi} AQI
                    </span>
                  </div>
                </div>

                {/* Arched SVG AQI Dial Gauge */}
                <div className="shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex items-center justify-center">
                  <AQIGauge
                    aqi={forecastResult.overallAqi}
                    category={forecastResult.category}
                    peakAqi={forecastResult.peakAqi}
                  />
                </div>

              </div>

              {/* Progress scale bar */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1.5 font-bold">
                  <span>EPA Air Quality Index Gradient Spectrum:</span>
                  <span className="text-slate-800">Mean Index: {forecastResult.overallAqi} / 500 AQI</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 flex overflow-hidden shadow-inner">
                  <div className="h-full bg-emerald-500 w-[10%]" title="Good (0-50)" />
                  <div className="h-full bg-amber-500 w-[10%]" title="Moderate (51-100)" />
                  <div className="h-full bg-orange-500 w-[10%]" title="Sensitive (101-150)" />
                  <div className="h-full bg-rose-500 w-[10%]" title="Unhealthy (151-200)" />
                  <div className="h-full bg-purple-600 w-[20%]" title="Very Unhealthy (201-300)" />
                  <div className="h-full bg-red-900 w-[40%]" title="Hazardous (301-500)" />
                </div>
              </div>
            </section>

            {/* Interactive Leaflet Geographic Map with Regional AQI Markers */}
            <AQIMap
              areaName={forecastResult.area}
              centerCoords={forecastResult.coordinates}
              currentAqi={forecastResult.overallAqi}
              currentCategory={forecastResult.category}
              regionalStations={forecastResult.regionalStations}
              onSelectStation={(stationArea) => {
                setCustomInput(stationArea);
                handlePredict(stationArea);
              }}
            />

            {/* Interactive 48-Hour Progression Player */}
            <TimelinePlayer
              slots={allTenSlots}
              selectedSlotId={selectedSlot?.id || null}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />

            {/* COLORFUL ANALYTICS KPI DASHBOARD METRICS */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-rose-500 p-4 shadow-xs bg-gradient-to-br from-rose-50/40 to-white hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-rose-700 text-[11px] font-black uppercase mb-1">
                  <span>Peak Exposure</span>
                  <Flame className="w-4 h-4 text-rose-500" />
                </div>
                <div className="font-mono text-xl font-black text-rose-950">
                  {analyticsSummary.peakSlot.aqi} <span className="text-xs font-normal text-rose-700">AQI</span>
                </div>
                <div className="text-xs text-rose-800 font-bold truncate mt-1">
                  {analyticsSummary.peakSlot.time} ({analyticsSummary.peakSlot.category})
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 p-4 shadow-xs bg-gradient-to-br from-emerald-50/40 to-white hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-emerald-700 text-[11px] font-black uppercase mb-1">
                  <span>Cleanest Air Window</span>
                  <Sun className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="font-mono text-xl font-black text-emerald-950">
                  {analyticsSummary.cleanestSlot.aqi} <span className="text-xs font-normal text-emerald-700">AQI</span>
                </div>
                <div className="text-xs text-emerald-800 font-bold truncate mt-1">
                  {analyticsSummary.cleanestSlot.time} ({analyticsSummary.cleanestSlot.category})
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-500 p-4 shadow-xs bg-gradient-to-br from-sky-50/40 to-white hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-sky-700 text-[11px] font-black uppercase mb-1">
                  <span>Safe Window Rate</span>
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                </div>
                <div className="font-mono text-xl font-black text-sky-950">
                  {analyticsSummary.safePercentage}%
                </div>
                <div className="text-xs text-sky-800 font-bold truncate mt-1">
                  {analyticsSummary.safeSlotsCount} of {analyticsSummary.totalSlots} slots ≤ 100 AQI
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-indigo-500 p-4 shadow-xs bg-gradient-to-br from-indigo-50/40 to-white hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-indigo-700 text-[11px] font-black uppercase mb-1">
                  <span>Day 2 Progression</span>
                  {analyticsSummary.diffPct <= 0 ? (
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div className="font-mono text-xl font-black text-indigo-950 flex items-center gap-1">
                  <span className={analyticsSummary.diffPct <= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {analyticsSummary.diffPct > 0 ? `+${analyticsSummary.diffPct}%` : `${analyticsSummary.diffPct}%`}
                  </span>
                </div>
                <div className="text-xs text-indigo-800 font-mono font-bold truncate mt-1">
                  D1: {analyticsSummary.day1Avg} → D2: {analyticsSummary.day2Avg}
                </div>
              </div>
            </section>

            {/* COLORFUL RECHARTS DATA VISUALIZATION SUITE */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3.5 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-teal-600" />
                    48-Hour Pollution Progression & Trend Analytics
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any point or bar to inspect underlying meteorological and pollutant readings
                  </p>
                </div>

                {/* Graph Tab Switcher */}
                <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs shrink-0 gap-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveChartTab('timeline')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                      activeChartTab === 'timeline'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LineChartIcon className="w-3.5 h-3.5" />
                    <span>Progression Curve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChartTab('diurnal')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                      activeChartTab === 'diurnal'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Diurnal Compare</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChartTab('pollutants')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                      activeChartTab === 'pollutants'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Pollutant Profiles</span>
                  </button>
                </div>
              </div>

              {/* Chart 1: 48-Hour Continuous Progression Line Chart */}
              {activeChartTab === 'timeline' && (
                <div className="w-full">
                  <div className="h-[290px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={timelineChartData}
                        margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onClick={(e: any) => {
                          if (e && e.activePayload && e.activePayload[0]) {
                            const point = e.activePayload[0].payload as ChartPoint;
                            const slot = forecastResult.days[point.dayIndex]?.timeSlots.find(
                              (s) => s.id === point.slotId
                            );
                            if (slot) setSelectedSlot(slot);
                          }
                        }}
                      >
                        <defs>
                          <linearGradient id="vibrantAqiGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#0d9488" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="shortLabel"
                          tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, (dataMax: number) => Math.max(120, Math.ceil(dataMax / 25) * 25 + 15)]}
                        />
                        <Tooltip content={<CustomTimelineTooltip />} />
                        <ReferenceLine
                          y={50}
                          stroke="#10b981"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{ value: 'Good (50)', fill: '#059669', fontSize: 10, fontWeight: 700, position: 'right' }}
                        />
                        <ReferenceLine
                          y={100}
                          stroke="#f59e0b"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{ value: 'Moderate (100)', fill: '#d97706', fontSize: 10, fontWeight: 700, position: 'right' }}
                        />
                        <ReferenceLine
                          y={150}
                          stroke="#f97316"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          label={{ value: 'Unhealthy (150)', fill: '#ea580c', fontSize: 10, fontWeight: 700, position: 'right' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="aqi"
                          stroke="#0284c7"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#vibrantAqiGrad)"
                          activeDot={{ r: 6, fill: '#0369a1', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5 font-bold text-sky-700">
                      <span className="w-3 h-1 bg-sky-600 rounded-full inline-block" />
                      Predicted AQI Continuous Curve
                    </span>
                    <span className="text-slate-400">
                      Threshold Reference Bands: <strong className="text-emerald-600">50 Good</strong> • <strong className="text-amber-600">100 Moderate</strong> • <strong className="text-orange-600">150 Sensitive</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Chart 2: Diurnal Comparison (Day 1 vs Day 2 by Time Slot) */}
              {activeChartTab === 'diurnal' && (
                <div className="w-full">
                  <div className="h-[290px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={diurnalComparisonData}
                        margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, (dataMax: number) => Math.max(120, Math.ceil(dataMax / 25) * 25 + 15)]}
                        />
                        <Tooltip
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any, name: any) => [
                            `${value} AQI`,
                            name === 'day1Aqi' ? 'Day 1 (Tomorrow)' : 'Day 2 (Day After)',
                          ]}
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#cbd5e1',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.1)',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px', fontWeight: 700 }}
                          formatter={(value) => (value === 'day1Aqi' ? 'Day 1 (Tomorrow)' : 'Day 2 (Day After)')}
                        />
                        <Bar dataKey="day1Aqi" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="day2Aqi" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono text-center">
                    Direct diurnal rush-hour alignment: compares identical clock periods (<span className="text-blue-600 font-bold">Day 1 Blue</span> vs <span className="text-emerald-600 font-bold">Day 2 Green</span>)
                  </div>
                </div>
              )}

              {/* Chart 3: Pollutant Profiles & Dominance Breakdown */}
              {activeChartTab === 'pollutants' && (
                <div className="w-full">
                  <div className="h-[290px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pollutantAnalyticsData}
                        margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="pollutant"
                          tick={{ fontSize: 11, fill: '#334155', fontFamily: 'monospace', fontWeight: 'bold' }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any, name: any) => [
                            name === 'avgAqi' ? `${value} AQI` : `${value} Hours`,
                            name === 'avgAqi' ? 'Average Index Level' : 'Dominant Frequency (Hours)',
                          ]}
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#cbd5e1',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            boxShadow: '0 8px 16px -4px rgb(0 0 0 / 0.1)',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px', fontWeight: 700 }}
                          formatter={(value) => (value === 'avgAqi' ? 'Average AQI When Dominant' : 'Slot Frequency Count')}
                        />
                        <Bar dataKey="avgAqi" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={38} />
                        <Bar dataKey="frequency" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={38} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono text-center">
                    Particle composition profile across <strong className="text-rose-600">PM2.5</strong>, <strong className="text-amber-600">NO2</strong>, <strong className="text-sky-600">O3</strong>, and <strong className="text-teal-600">PM10</strong> classifications
                  </div>
                </div>
              )}
            </section>

            {/* Interactive Day Filter & View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              {/* Day filter tabs */}
              <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 text-xs border border-slate-300/60 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveDayFilter('both')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer font-extrabold ${
                    activeDayFilter === 'both'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Both Days (10 Slots)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDayFilter(0)}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer font-extrabold ${
                    activeDayFilter === 0
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Day 1 (Tomorrow)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDayFilter(1)}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer font-extrabold ${
                    activeDayFilter === 1
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Day 2 (Day After)
                </button>
              </div>

              {/* Layout Switcher (Cards / Table) */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Display Mode:</span>
                <div className="inline-flex p-1 rounded-2xl bg-slate-200/80 text-xs border border-slate-300/60 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer font-extrabold ${
                      viewMode === 'cards'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Card Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer font-extrabold ${
                      viewMode === 'table'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Data Table
                  </button>
                </div>
              </div>
            </div>

            {/* COLORFUL EPA AQI Legend: Click a category to highlight matching time slots */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs text-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider font-extrabold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-200" />
                  EPA Index Scale Spectrum (Click to filter matching slots)
                </span>
                {highlightCategory && (
                  <button
                    type="button"
                    onClick={() => setHighlightCategory(null)}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {Object.values(AQI_CATEGORIES).map((cat) => {
                  const isFiltered = highlightCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setHighlightCategory(isFiltered ? null : cat.name)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        cat.badgeBg
                      } ${cat.badgeBorder} ${
                        isFiltered
                          ? 'ring-2 ring-slate-900 shadow-md scale-102 font-extrabold'
                          : 'hover:shadow-xs hover:scale-101'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-xs mb-1">
                        <span className={`w-2 h-2 rounded-full ring-1 ring-white ${cat.dotColor}`} />
                        <span className={cat.badgeText}>{cat.name}</span>
                      </div>
                      <div className="font-mono text-slate-700 font-black text-[11px]">{cat.min}–{cat.max} AQI</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card Layout with Vibrant Left Borders & Colorful Pollutant Chips */}
            {viewMode === 'cards' && (
              <div className={`grid grid-cols-1 ${displayedDays.length > 1 ? 'md:grid-cols-2' : ''} gap-5`}>
                {displayedDays.map((day, dayIndex) => {
                  const dayCatConfig = AQI_CATEGORIES[day.category];
                  const dayTheme = dayIndex === 0 ? 'border-t-teal-500' : 'border-t-indigo-500';

                  return (
                    <div
                      key={day.dayTitle}
                      className={`bg-white rounded-2xl border border-slate-200 border-t-4 ${dayTheme} overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col`}
                    >
                      {/* Day Header */}
                      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{day.dayTitle}</span>
                          </div>
                          <div className="text-base font-black text-slate-900 mt-0.5">
                            {day.dateFormatted}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${dayCatConfig.badgeBg} ${dayCatConfig.badgeBorder} ${dayCatConfig.badgeText} font-extrabold shadow-2xs`}>
                            <span className={`w-2 h-2 rounded-full ${dayCatConfig.dotColor}`} />
                            {day.category}
                          </span>
                          <div className="text-[11px] font-mono text-slate-500 mt-1 font-semibold">
                            Day Mean: <strong className="text-slate-800">{day.averageAqi} AQI</strong>
                          </div>
                        </div>
                      </div>

                      {/* Exactly 5 Time Slots / Day */}
                      <div className="p-4 space-y-2.5 flex-1">
                        {day.timeSlots.map((slot) => {
                          const slotConfig = AQI_CATEGORIES[slot.category];
                          const pollConfig = POLLUTANT_COLORS[slot.mainPollutant] || { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' };
                          const isSelected = selectedSlot?.id === slot.id;
                          const matchesFilter = !highlightCategory || slot.category === highlightCategory;

                          return (
                            <div
                              key={slot.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedSlot(slot)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setSelectedSlot(slot);
                                }
                              }}
                              className={`py-2.5 px-3.5 rounded-xl border border-slate-200/80 border-l-4 ${slotConfig.cardBorderL} transition-all cursor-pointer flex items-center justify-between text-sm ${
                                isSelected
                                  ? 'bg-teal-50/60 ring-2 ring-teal-500/80 shadow-xs'
                                  : 'bg-white hover:bg-slate-50/90'
                              } ${!matchesFilter ? 'opacity-35' : 'opacity-100'}`}
                            >
                              {/* Time & Pollutant */}
                              <div className="flex items-center gap-3">
                                <Clock className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                                <div>
                                  <div className="font-mono font-extrabold text-slate-900">
                                    {slot.time}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                                    <span className={`px-2 py-0.2 rounded text-[10px] font-extrabold border ${pollConfig.bg} ${pollConfig.text} ${pollConfig.border}`}>
                                      {slot.mainPollutant}
                                    </span>
                                    <span>• {slot.temperature}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Numeric AQI & Category Badge */}
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="font-mono text-base font-black text-slate-900">
                                    {slot.aqi}
                                  </span>
                                  <span className="font-mono text-[11px] text-slate-500 ml-1">AQI</span>
                                </div>

                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold w-26 justify-center shadow-2xs ${slotConfig.badgeBg} ${slotConfig.badgeBorder} ${slotConfig.badgeText}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${slotConfig.dotColor}`} />
                                  <span className="truncate">{slot.category}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center font-mono">
                        <span>5 Standard Measurement Windows</span>
                        <span>Peak: <strong className="text-slate-900">{day.peakAqi} AQI</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table Layout */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-4 font-bold">Forecast Horizon</th>
                        <th className="py-3 px-4 font-bold">Scheduled Window</th>
                        <th className="py-3 px-4 font-bold">Predicted Index</th>
                        <th className="py-3 px-4 font-bold">Category Tier</th>
                        <th className="py-3 px-4 font-bold">Primary Pollutant</th>
                        <th className="py-3 px-4 font-bold">Est. Temp & Wind</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {displayedDays.map((day, dayIndex) => (
                        <React.Fragment key={day.dayTitle}>
                          {day.timeSlots.map((slot, slotIndex) => {
                            const slotConfig = AQI_CATEGORIES[slot.category];
                            const pollConfig = POLLUTANT_COLORS[slot.mainPollutant] || { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' };
                            const isSelected = selectedSlot?.id === slot.id;
                            const matchesFilter = !highlightCategory || slot.category === highlightCategory;

                            return (
                              <tr 
                                key={slot.id} 
                                onClick={() => setSelectedSlot(slot)}
                                className={`transition-colors cursor-pointer ${
                                  isSelected ? 'bg-teal-50/60 font-medium' : 'hover:bg-slate-50'
                                } ${slotIndex === 0 && dayIndex > 0 ? 'border-t-2 border-slate-200' : ''} ${
                                  !matchesFilter ? 'opacity-35' : 'opacity-100'
                                }`}
                              >
                                {slotIndex === 0 ? (
                                  <td 
                                    rowSpan={5} 
                                    className="py-3 px-4 align-top font-bold text-slate-900 border-r border-slate-200 bg-slate-50/40"
                                  >
                                    <div>{day.dayTitle}</div>
                                    <div className="text-xs text-slate-500 font-normal">{day.dateFormatted}</div>
                                    <div className="mt-2 text-xs font-mono text-slate-700">
                                      Mean: <span className="text-teal-700 font-bold">{day.averageAqi} AQI</span>
                                    </div>
                                  </td>
                                ) : null}
                                <td className="py-3 px-4 font-mono text-slate-900 font-bold">
                                  {slot.time}
                                </td>
                                <td className="py-3 px-4 font-mono">
                                  <span className="text-base font-extrabold text-slate-900">{slot.aqi}</span>
                                  <span className="text-xs text-slate-500 ml-1">AQI</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${slotConfig.badgeBg} ${slotConfig.badgeBorder} ${slotConfig.badgeText}`}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${slotConfig.dotColor}`} />
                                    {slot.category}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${pollConfig.bg} ${pollConfig.text} ${pollConfig.border}`}>
                                    {slot.mainPollutant}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-xs font-mono text-slate-600">
                                  {slot.temperature} • {slot.windSpeed}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COLORFUL Interactive Selected Time Slot Details Inspector */}
            {selectedSlot && (
              <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm border-l-4 border-l-teal-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-teal-600 ring-4 ring-teal-100" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                      Active Slot Deep-Dive: {selectedSlot.time}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-extrabold ${AQI_CATEGORIES[selectedSlot.category].badgeBg} ${AQI_CATEGORIES[selectedSlot.category].badgeBorder} ${AQI_CATEGORIES[selectedSlot.category].badgeText}`}>
                      {selectedSlot.aqi} AQI • {selectedSlot.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 italic">
                    Click any slot in the scrubber or cards to inspect
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-white border border-rose-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-rose-700 font-extrabold mb-1">
                      <Layers className="w-4 h-4 text-rose-500" />
                      <span>Dominant Agent</span>
                    </div>
                    <div className="font-mono text-lg font-black text-rose-950">{selectedSlot.mainPollutant}</div>
                    <div className="text-[11px] text-rose-700 mt-0.5 font-medium">Primary driving particle</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-white border border-amber-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-amber-700 font-extrabold mb-1">
                      <Thermometer className="w-4 h-4 text-amber-500" />
                      <span>Ambient Temp</span>
                    </div>
                    <div className="font-mono text-lg font-black text-amber-950">{selectedSlot.temperature}</div>
                    <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Surface boundary layer</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-white border border-sky-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-sky-700 font-extrabold mb-1">
                      <Droplets className="w-4 h-4 text-sky-500" />
                      <span>Relative Humidity</span>
                    </div>
                    <div className="font-mono text-lg font-black text-sky-950">{selectedSlot.humidity}</div>
                    <div className="text-[11px] text-sky-700 mt-0.5 font-medium">Aerosol condensation</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50/70 to-white border border-teal-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-teal-700 font-extrabold mb-1">
                      <Gauge className="w-4 h-4 text-teal-500" />
                      <span>Wind Velocity</span>
                    </div>
                    <div className="font-mono text-lg font-black text-teal-950">{selectedSlot.windSpeed}</div>
                    <div className="text-[11px] text-teal-700 mt-0.5 font-medium">Horizontal dispersion</div>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-700 flex items-center gap-2">
                  <span className="font-mono font-bold text-teal-800">Atmospheric Context:</span>
                  <span>{selectedSlot.hourlyNote}.</span>
                </div>
              </section>
            )}

            {/* COLORFUL AI Health Recommendation with Interactive Categorized Tabs */}
            <section className="bg-gradient-to-r from-indigo-50/90 via-sky-50/60 to-teal-50/70 rounded-2xl border border-indigo-200/90 border-l-4 border-l-indigo-600 p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="text-base font-extrabold tracking-tight text-indigo-950 flex items-center gap-2">
                      AI Health Recommendation & Guidance
                    </h3>
                    <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {forecastResult.recommendationSource === 'ai' ? 'Synthesized via Gemini AI' : 'Standard Epidemiological Advisory'}
                    </span>
                  </div>

                  {/* Primary LLM text */}
                  <p className="text-sm text-slate-800 leading-relaxed font-normal mb-4">
                    {forecastResult.recommendation}
                  </p>

                  {/* Interactive Action Advisory Tabs */}
                  <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3 border border-indigo-100 shadow-2xs mb-3">
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      <button
                        type="button"
                        onClick={() => setActiveAdvisoryTab('activity')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeAdvisoryTab === 'activity'
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Footprints className="w-3.5 h-3.5" />
                        <span>Outdoor Exercise</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveAdvisoryTab('mask')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeAdvisoryTab === 'mask'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Respiratory Masks</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveAdvisoryTab('ventilation')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeAdvisoryTab === 'ventilation'
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>Room Ventilation</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveAdvisoryTab('vulnerable')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeAdvisoryTab === 'vulnerable'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Sensitive Groups</span>
                      </button>
                    </div>

                    <div className="text-xs text-slate-700 font-medium pl-1 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{healthAdvisoryDetails[activeAdvisoryTab]}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Tailored for {forecastResult.area}</span>
                    </div>
                    <div className="text-slate-700">
                      Tier: <strong className={`font-bold ${overallConfig.badgeText}`}>{forecastResult.category}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </main>
        )}

        {/* Minimal Footer */}
        <footer className="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-6 font-mono">
          <p className="font-bold text-slate-600">Air Quality Prediction System • Academic Environmental Engineering</p>
          <p className="mt-1 text-slate-400">
            5 Time Slots / Day • Interactive Leaflet Geospatial Sensor Grid & Timeline Progression
          </p>
        </footer>

      </div>
    </div>
  );
}
