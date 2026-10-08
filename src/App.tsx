import React, { useState, useEffect, useMemo } from 'react';
import { 
  AQI_CATEGORIES, 
  POPULAR_AREAS, 
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
  Sun
} from 'lucide-react';
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
  Legend,
  TooltipProps
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

  // Custom Chart Tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTimelineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartPoint;
      const catConfig = AQI_CATEGORIES[data.category];
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-stone-300 shadow-md text-xs font-sans min-w-[190px]">
          <div className="font-mono text-slate-500 text-[11px] font-semibold border-b border-stone-100 pb-1.5 mb-1.5 flex items-center justify-between">
            <span>{data.fullLabel}</span>
            <span>{data.pollutant}</span>
          </div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-slate-500 font-medium">Predicted Index:</span>
            <span className="font-mono text-base font-bold text-slate-900">{data.aqi} AQI</span>
          </div>
          <div className={`px-2 py-0.5 rounded border inline-flex items-center gap-1.5 font-semibold text-[11px] mb-2 ${catConfig.badgeBg} ${catConfig.badgeBorder} ${catConfig.badgeText}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${catConfig.dotColor}`} />
            <span>{data.category}</span>
          </div>
          <div className="pt-1.5 border-t border-stone-100 text-[11px] text-slate-500 font-mono space-y-0.5">
            <div>Temp: {data.temperature} • Wind: {data.windSpeed}</div>
            <div>Humidity: {data.humidity}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-stone-50/60 text-slate-800 antialiased font-sans selection:bg-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
        
        {/* Header: Clean, Professional, Scientific */}
        <header className="mb-7 pb-6 border-b border-stone-200/80">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
                <span>Atmospheric Modeling Framework</span>
                <span className="text-slate-300">•</span>
                <span>Academic Prototype</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                Air Quality Prediction System
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                2-Day Air Quality Forecast & Analytical Progression
              </p>
            </div>

            {/* Quick Export & Simulation Trigger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSimControls(!showSimControls)}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer ${
                  showSimControls
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-stone-300 hover:bg-stone-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Model Factors</span>
                {showSimControls ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {forecastResult && (
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-stone-300 bg-white text-slate-700 hover:bg-stone-50 transition-colors cursor-pointer"
                  title="Copy formatted forecast report to clipboard"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export Brief</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Interactive Simulation Parameters Drawer */}
          {showSimControls && (
            <div className="mt-4 p-4 rounded-lg bg-stone-100/90 border border-stone-300/80 text-xs text-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  Meteorological & Dispersion Factor Simulation
                </span>
                <span className="text-[11px] text-slate-500">Live parameter modulation</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1.5">
                    Wind & Boundary Layer Dispersion
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
                        className={`py-1 px-2 rounded border text-center capitalize transition-colors cursor-pointer ${
                          simParams.windDispersion === mode
                            ? 'bg-slate-900 text-white border-slate-900 font-medium'
                            : 'bg-white text-slate-700 border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1.5">
                    Commuter & Vehicular Volume
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
                        className={`py-1 px-2 rounded border text-center capitalize transition-colors cursor-pointer ${
                          simParams.trafficProfile === mode
                            ? 'bg-slate-900 text-white border-slate-900 font-medium'
                            : 'bg-white text-slate-700 border-stone-300 hover:bg-stone-50'
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
        <section className="bg-white rounded-lg border border-stone-200 p-5 shadow-2xs mb-6">
          <label htmlFor="area-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Target Geographic Zone or Sensor Station
          </label>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handlePredict(customInput);
            }} 
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="area-input"
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter city, district, monitoring node, or area..."
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-md border border-stone-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-sans"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing...</span>
                </>
              ) : (
                <span>Predict Air Quality</span>
              )}
            </button>
          </form>

          {/* Quick Area Presets */}
          <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium mr-1 text-[11px] uppercase tracking-wide">
              Quick Presets:
            </span>
            {POPULAR_AREAS.map((preset) => {
              const isSelected = selectedArea.toLowerCase() === preset.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setCustomInput(preset);
                    handlePredict(preset);
                  }}
                  className={`px-2.5 py-1 rounded border text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 font-medium'
                      : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </section>

        {/* Prediction Results */}
        {forecastResult && overallConfig && analyticsSummary && (
          <main className="space-y-6">
            
            {/* Highlighted Area & Predicted AQI Banner */}
            <section className="bg-white rounded-lg border border-stone-200 p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                
                <div className="space-y-1">
                  <div className="text-[11px] uppercase tracking-wider font-mono font-semibold text-slate-500">
                    Active Spatial Focus
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {forecastResult.area}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Run timestamp: <span className="font-mono text-slate-700">{forecastResult.predictedAt}</span>
                    </span>
                    <span>•</span>
                    <span>48-Hour Continuous Micro-Forecast</span>
                  </div>
                </div>

                {/* Overall Index Score */}
                <div className="flex items-center gap-5 border-t sm:border-t-0 sm:border-l border-stone-200 pt-4 sm:pt-0 sm:pl-6">
                  <div>
                    <div className="text-[11px] font-mono text-slate-500 uppercase">2-Day Mean AQI</div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
                        {forecastResult.overallAqi}
                      </span>
                      <span className="text-xs font-mono text-slate-500">AQI</span>
                    </div>
                  </div>

                  <div className={`px-3 py-2 rounded border min-w-[150px] text-left ${overallConfig.badgeBg} ${overallConfig.badgeBorder}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${overallConfig.dotColor}`} />
                      <span className={`text-xs font-bold ${overallConfig.badgeText}`}>
                        {forecastResult.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">
                      Peak: <strong className="text-slate-900">{forecastResult.peakAqi} AQI</strong>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* ANALYTICS KPI DASHBOARD METRICS */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase mb-1">
                  <span>Peak Exposure Window</span>
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="font-mono text-base font-bold text-slate-900">
                  {analyticsSummary.peakSlot.aqi} <span className="text-xs font-normal text-slate-500">AQI</span>
                </div>
                <div className="text-xs text-slate-600 truncate mt-0.5">
                  {analyticsSummary.peakSlot.time} ({analyticsSummary.peakSlot.category})
                </div>
              </div>

              <div className="bg-white rounded-lg border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase mb-1">
                  <span>Cleanest Air Window</span>
                  <Sun className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="font-mono text-base font-bold text-slate-900">
                  {analyticsSummary.cleanestSlot.aqi} <span className="text-xs font-normal text-slate-500">AQI</span>
                </div>
                <div className="text-xs text-slate-600 truncate mt-0.5">
                  {analyticsSummary.cleanestSlot.time} ({analyticsSummary.cleanestSlot.category})
                </div>
              </div>

              <div className="bg-white rounded-lg border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase mb-1">
                  <span>Safe Window Rate</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="font-mono text-base font-bold text-slate-900">
                  {analyticsSummary.safePercentage}%
                </div>
                <div className="text-xs text-slate-600 truncate mt-0.5">
                  {analyticsSummary.safeSlotsCount} of {analyticsSummary.totalSlots} slots ≤ 100 AQI
                </div>
              </div>

              <div className="bg-white rounded-lg border border-stone-200 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase mb-1">
                  <span>Day 2 Progression</span>
                  {analyticsSummary.diffPct <= 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                  )}
                </div>
                <div className="font-mono text-base font-bold text-slate-900 flex items-center gap-1">
                  <span>{analyticsSummary.diffPct > 0 ? `+${analyticsSummary.diffPct}%` : `${analyticsSummary.diffPct}%`}</span>
                </div>
                <div className="text-xs text-slate-600 truncate mt-0.5 font-mono">
                  D1: {analyticsSummary.day1Avg} → D2: {analyticsSummary.day2Avg}
                </div>
              </div>
            </section>

            {/* RECHARTS DATA VISUALIZATION SUITE */}
            <section className="bg-white rounded-lg border border-stone-200 p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-slate-700" />
                    48-Hour Pollution Progression & Trend Analytics
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any point or bar to inspect underlying meteorological and pollutant readings
                  </p>
                </div>

                {/* Graph Tab Switcher */}
                <div className="inline-flex p-0.5 rounded-md bg-stone-200/70 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveChartTab('timeline')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeChartTab === 'timeline'
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LineChartIcon className="w-3.5 h-3.5" />
                    <span>Progression Line</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChartTab('diurnal')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeChartTab === 'diurnal'
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Diurnal Compare</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChartTab('pollutants')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeChartTab === 'pollutants'
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
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
                  <div className="h-[270px] w-full">
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
                          <linearGradient id="aqiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#334155" stopOpacity={0.16} />
                            <stop offset="95%" stopColor="#334155" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                        <XAxis
                          dataKey="shortLabel"
                          tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'monospace' }}
                          axisLine={{ stroke: '#d6d3d1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'monospace' }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, (dataMax: number) => Math.max(120, Math.ceil(dataMax / 25) * 25 + 15)]}
                        />
                        <Tooltip content={<CustomTimelineTooltip />} />
                        <ReferenceLine
                          y={50}
                          stroke="#10b981"
                          strokeDasharray="3 3"
                          label={{ value: 'Good (50)', fill: '#10b981', fontSize: 9, position: 'right' }}
                        />
                        <ReferenceLine
                          y={100}
                          stroke="#f59e0b"
                          strokeDasharray="3 3"
                          label={{ value: 'Moderate (100)', fill: '#f59e0b', fontSize: 9, position: 'right' }}
                        />
                        <ReferenceLine
                          y={150}
                          stroke="#f97316"
                          strokeDasharray="3 3"
                          label={{ value: 'Unhealthy (150)', fill: '#f97316', fontSize: 9, position: 'right' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="aqi"
                          stroke="#0f172a"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#aqiAreaGrad)"
                          activeDot={{ r: 5, fill: '#0f172a', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-100 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-0.5 bg-slate-900 inline-block" />
                      Predicted AQI Continuous Curve
                    </span>
                    <span className="text-slate-400">
                      Standardized EPA Reference Thresholds: 50 (Good) • 100 (Moderate) • 150 (Unhealthy)
                    </span>
                  </div>
                </div>
              )}

              {/* Chart 2: Diurnal Comparison (Day 1 vs Day 2 by Time Slot) */}
              {activeChartTab === 'diurnal' && (
                <div className="w-full">
                  <div className="h-[270px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={diurnalComparisonData}
                        margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'monospace' }}
                          axisLine={{ stroke: '#d6d3d1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'monospace' }}
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
                            borderColor: '#e7e5e4',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
                          formatter={(value) => (value === 'day1Aqi' ? 'Day 1 (Tomorrow)' : 'Day 2 (Day After)')}
                        />
                        <Bar dataKey="day1Aqi" fill="#1e293b" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="day2Aqi" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 pt-2 border-t border-stone-100 text-[11px] text-slate-500 font-mono text-center">
                    Direct diurnal rush-hour alignment: compares identical clock periods across consecutive days
                  </div>
                </div>
              )}

              {/* Chart 3: Pollutant Profiles & Dominance Breakdown */}
              {activeChartTab === 'pollutants' && (
                <div className="w-full">
                  <div className="h-[270px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pollutantAnalyticsData}
                        margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                        <XAxis
                          dataKey="pollutant"
                          tick={{ fontSize: 11, fill: '#78716c', fontFamily: 'monospace', fontWeight: 'bold' }}
                          axisLine={{ stroke: '#d6d3d1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'monospace' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any, name: any) => [
                            name === 'avgAqi' ? `${value} AQI` : `${value} Slots`,
                            name === 'avgAqi' ? 'Average Index Level' : 'Dominant Frequency (Hours)',
                          ]}
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#e7e5e4',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
                          formatter={(value) => (value === 'avgAqi' ? 'Average AQI When Dominant' : 'Slot Frequency Count')}
                        />
                        <Bar dataKey="avgAqi" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={38} />
                        <Bar dataKey="frequency" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={38} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 pt-2 border-t border-stone-100 text-[11px] text-slate-500 font-mono text-center">
                    Particle composition profile across PM2.5, NO2, O3, and PM10 aerodynamic classifications
                  </div>
                </div>
              )}
            </section>

            {/* Interactive Day Filter & View Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              {/* Day filter tabs */}
              <div className="inline-flex p-0.5 rounded-md bg-stone-200/70 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveDayFilter('both')}
                  className={`px-3 py-1 rounded transition-all cursor-pointer ${
                    activeDayFilter === 'both'
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Both Days (10 Slots)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDayFilter(0)}
                  className={`px-3 py-1 rounded transition-all cursor-pointer ${
                    activeDayFilter === 0
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Day 1 (Tomorrow)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDayFilter(1)}
                  className={`px-3 py-1 rounded transition-all cursor-pointer ${
                    activeDayFilter === 1
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Day 2 (Day After)
                </button>
              </div>

              {/* Layout Switcher (Cards / Table) */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">View Format:</span>
                <div className="inline-flex p-0.5 rounded-md bg-stone-200/70 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Card Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Data Table
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive EPA AQI Legend: Click a category to highlight matching time slots */}
            <div className="bg-white rounded-lg border border-stone-200 p-3 shadow-2xs text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500">
                  EPA Index Scale (Click to highlight slots)
                </span>
                {highlightCategory && (
                  <button
                    type="button"
                    onClick={() => setHighlightCategory(null)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                {Object.values(AQI_CATEGORIES).map((cat) => {
                  const isFiltered = highlightCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setHighlightCategory(isFiltered ? null : cat.name)}
                      className={`p-2 rounded border text-left transition-all cursor-pointer ${
                        cat.badgeBg
                      } ${
                        isFiltered
                          ? 'ring-2 ring-slate-900 border-slate-900 shadow-2xs'
                          : `${cat.badgeBorder} hover:border-slate-400`
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-[11px] mb-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.dotColor}`} />
                        <span className={cat.badgeText}>{cat.name}</span>
                      </div>
                      <div className="font-mono text-slate-600 text-[11px]">{cat.min}–{cat.max}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card Layout with Click-to-Inspect Interactivity */}
            {viewMode === 'cards' && (
              <div className={`grid grid-cols-1 ${displayedDays.length > 1 ? 'md:grid-cols-2' : ''} gap-5`}>
                {displayedDays.map((day) => {
                  const dayCatConfig = AQI_CATEGORIES[day.category];
                  return (
                    <div
                      key={day.dayTitle}
                      className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-2xs flex flex-col"
                    >
                      {/* Day Header */}
                      <div className="px-4 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 uppercase">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{day.dayTitle}</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {day.dateFormatted}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${dayCatConfig.badgeBg} ${dayCatConfig.badgeBorder} ${dayCatConfig.badgeText} font-semibold`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dayCatConfig.dotColor}`} />
                            {day.category}
                          </span>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            Day Mean: <strong className="text-slate-800">{day.averageAqi}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Exactly 5 Time Slots / Day */}
                      <div className="p-3 divide-y divide-stone-100 flex-1">
                        {day.timeSlots.map((slot) => {
                          const slotConfig = AQI_CATEGORIES[slot.category];
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
                              className={`py-2.5 px-2.5 rounded-md transition-all cursor-pointer flex items-center justify-between text-sm ${
                                isSelected
                                  ? 'bg-stone-100 ring-1 ring-slate-400/80 shadow-2xs'
                                  : 'hover:bg-stone-50'
                              } ${!matchesFilter ? 'opacity-35' : 'opacity-100'}`}
                            >
                              {/* Time & Pollutant */}
                              <div className="flex items-center gap-3">
                                <Clock className={`w-4 h-4 ${isSelected ? 'text-slate-800' : 'text-slate-400'}`} />
                                <div>
                                  <div className="font-mono font-medium text-slate-900">
                                    {slot.time}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    Pollutant: {slot.mainPollutant} • {slot.temperature}
                                  </div>
                                </div>
                              </div>

                              {/* Numeric AQI & Category Badge */}
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="font-mono text-base font-bold text-slate-900">
                                    {slot.aqi}
                                  </span>
                                  <span className="font-mono text-[11px] text-slate-500 ml-1">AQI</span>
                                </div>

                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold w-24 justify-center ${slotConfig.badgeBg} ${slotConfig.badgeBorder} ${slotConfig.badgeText}`}
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
                      <div className="px-4 py-2 bg-stone-50/50 border-t border-stone-200 text-xs text-slate-500 flex justify-between items-center font-mono">
                        <span>5 Standard Time Slots</span>
                        <span>Peak: <strong className="text-slate-900">{day.peakAqi} AQI</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table Layout */}
            {viewMode === 'table' && (
              <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4 font-semibold">Forecast Period</th>
                        <th className="py-2.5 px-4 font-semibold">Scheduled Slot</th>
                        <th className="py-2.5 px-4 font-semibold">Predicted AQI</th>
                        <th className="py-2.5 px-4 font-semibold">Category Classification</th>
                        <th className="py-2.5 px-4 font-semibold">Primary Pollutant</th>
                        <th className="py-2.5 px-4 font-semibold">Est. Temp & Wind</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-slate-700">
                      {displayedDays.map((day, dayIndex) => (
                        <React.Fragment key={day.dayTitle}>
                          {day.timeSlots.map((slot, slotIndex) => {
                            const slotConfig = AQI_CATEGORIES[slot.category];
                            const isSelected = selectedSlot?.id === slot.id;
                            const matchesFilter = !highlightCategory || slot.category === highlightCategory;

                            return (
                              <tr 
                                key={slot.id} 
                                onClick={() => setSelectedSlot(slot)}
                                className={`transition-colors cursor-pointer ${
                                  isSelected ? 'bg-stone-100 font-medium' : 'hover:bg-stone-50/70'
                                } ${slotIndex === 0 && dayIndex > 0 ? 'border-t-2 border-stone-200' : ''} ${
                                  !matchesFilter ? 'opacity-35' : 'opacity-100'
                                }`}
                              >
                                {slotIndex === 0 ? (
                                  <td 
                                    rowSpan={5} 
                                    className="py-3 px-4 align-top font-semibold text-slate-900 border-r border-stone-200 bg-stone-50/40"
                                  >
                                    <div>{day.dayTitle}</div>
                                    <div className="text-xs text-slate-500 font-normal">{day.dateFormatted}</div>
                                    <div className="mt-2 text-xs font-mono text-slate-600">
                                      Mean: <span className="text-slate-900 font-bold">{day.averageAqi}</span>
                                    </div>
                                  </td>
                                ) : null}
                                <td className="py-2.5 px-4 font-mono text-slate-900 font-medium">
                                  {slot.time}
                                </td>
                                <td className="py-2.5 px-4 font-mono">
                                  <span className="text-base font-bold text-slate-900">{slot.aqi}</span>
                                  <span className="text-xs text-slate-500 ml-1">AQI</span>
                                </td>
                                <td className="py-2.5 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-semibold ${slotConfig.badgeBg} ${slotConfig.badgeBorder} ${slotConfig.badgeText}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${slotConfig.dotColor}`} />
                                    {slot.category}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-xs font-mono text-slate-600">
                                  {slot.mainPollutant}
                                </td>
                                <td className="py-2.5 px-4 text-xs font-mono text-slate-600">
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

            {/* Interactive Selected Time Slot Details Inspector */}
            {selectedSlot && (
              <section className="bg-white rounded-lg border border-stone-200 p-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Slot Deep-Dive: {selectedSlot.time}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${AQI_CATEGORIES[selectedSlot.category].badgeBg} ${AQI_CATEGORIES[selectedSlot.category].badgeBorder} ${AQI_CATEGORIES[selectedSlot.category].badgeText}`}>
                      {selectedSlot.aqi} AQI • {selectedSlot.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 italic">
                    Click any time slot in the chart, cards, or table above to inspect
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                  <div className="p-2.5 rounded bg-stone-50 border border-stone-200/80">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dominant Agent</span>
                    </div>
                    <div className="font-mono text-sm font-bold text-slate-900">{selectedSlot.mainPollutant}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Primary driving particle</div>
                  </div>

                  <div className="p-2.5 rounded bg-stone-50 border border-stone-200/80">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ambient Temp</span>
                    </div>
                    <div className="font-mono text-sm font-bold text-slate-900">{selectedSlot.temperature}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Surface level estimation</div>
                  </div>

                  <div className="p-2.5 rounded bg-stone-50 border border-stone-200/80">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <Droplets className="w-3.5 h-3.5 text-slate-400" />
                      <span>Relative Humidity</span>
                    </div>
                    <div className="font-mono text-sm font-bold text-slate-900">{selectedSlot.humidity}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Aerosol hygroscopy</div>
                  </div>

                  <div className="p-2.5 rounded bg-stone-50 border border-stone-200/80">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      <span>Wind Velocity</span>
                    </div>
                    <div className="font-mono text-sm font-bold text-slate-900">{selectedSlot.windSpeed}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Horizontal transport</div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100 text-xs text-slate-600 flex items-center gap-2">
                  <span className="font-mono font-medium text-slate-700">Atmospheric context:</span>
                  <span>{selectedSlot.hourlyNote}.</span>
                </div>
              </section>
            )}

            {/* AI Recommendation Section at bottom */}
            <section className="bg-white rounded-lg border border-stone-200 p-5 shadow-2xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded bg-stone-100 text-slate-700 shrink-0">
                  <Sparkles className="w-4 h-4 text-slate-800" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      AI Health Recommendation
                    </h3>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-stone-100 text-slate-600 border border-stone-200">
                      {forecastResult.recommendationSource === 'ai' ? 'Synthesized via Gemini' : 'Standard Epidemiological Advisory'}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {forecastResult.recommendation}
                  </p>

                  <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Calibrated for {forecastResult.area}</span>
                    </div>
                    <div>
                      AQI Risk Tier: <strong className="text-slate-800">{forecastResult.category}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </main>
        )}

        {/* Professional Minimal Footer */}
        <footer className="mt-10 text-center text-xs text-slate-400 border-t border-stone-200/80 pt-6 font-mono">
          <p>Air Quality Prediction System • Academic Environmental Engineering</p>
          <p className="mt-0.5 text-slate-400">
            5 Time Slots / Day • 48-Hour Recharts Analytics Progression
          </p>
        </footer>

      </div>
    </div>
  );
}
