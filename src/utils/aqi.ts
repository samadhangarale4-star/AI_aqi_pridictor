import { 
  AQICategory, 
  AQICategoryConfig, 
  DayForecast, 
  PredictionResult, 
  SimulationParams, 
  TimeSlotForecast 
} from '../types';

export interface EnhancedCategoryConfig extends AQICategoryConfig {
  chartColor: string;
  cardBorderL: string;
  pillBg: string;
  progressGradient: string;
}

export const AQI_CATEGORIES: Record<AQICategory, EnhancedCategoryConfig> = {
  Good: {
    name: 'Good',
    min: 0,
    max: 50,
    color: 'text-emerald-700 dark:text-emerald-300',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    badgeText: 'text-emerald-800 dark:text-emerald-200',
    badgeBorder: 'border-emerald-300 dark:border-emerald-800',
    description: 'Air quality is satisfactory with negligible health risk.',
    dotColor: 'bg-emerald-500',
    chartColor: '#10b981',
    cardBorderL: 'border-l-emerald-500',
    pillBg: 'bg-emerald-500 text-white',
    progressGradient: 'from-emerald-400 to-emerald-600',
  },
  Moderate: {
    name: 'Moderate',
    min: 51,
    max: 100,
    color: 'text-amber-800 dark:text-amber-300',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
    badgeText: 'text-amber-900 dark:text-amber-200',
    badgeBorder: 'border-amber-300 dark:border-amber-800',
    description: 'Acceptable quality. Very sensitive persons may experience mild symptoms.',
    dotColor: 'bg-amber-500',
    chartColor: '#f59e0b',
    cardBorderL: 'border-l-amber-500',
    pillBg: 'bg-amber-500 text-white',
    progressGradient: 'from-amber-400 to-amber-600',
  },
  'Unhealthy for Sensitive Groups': {
    name: 'Unhealthy for Sensitive Groups',
    min: 101,
    max: 150,
    color: 'text-orange-800 dark:text-orange-300',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/50',
    badgeText: 'text-orange-900 dark:text-orange-200',
    badgeBorder: 'border-orange-300 dark:border-orange-800',
    description: 'Children, elderly, and individuals with lung conditions may experience irritation.',
    dotColor: 'bg-orange-500',
    chartColor: '#f97316',
    cardBorderL: 'border-l-orange-500',
    pillBg: 'bg-orange-500 text-white',
    progressGradient: 'from-orange-400 to-orange-600',
  },
  Unhealthy: {
    name: 'Unhealthy',
    min: 151,
    max: 200,
    color: 'text-rose-800 dark:text-rose-300',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/50',
    badgeText: 'text-rose-900 dark:text-rose-200',
    badgeBorder: 'border-rose-300 dark:border-rose-800',
    description: 'Adverse effects possible for general public; sensitive groups at elevated risk.',
    dotColor: 'bg-rose-500',
    chartColor: '#ef4444',
    cardBorderL: 'border-l-rose-500',
    pillBg: 'bg-rose-500 text-white',
    progressGradient: 'from-rose-400 to-rose-600',
  },
  'Very Unhealthy': {
    name: 'Very Unhealthy',
    min: 201,
    max: 300,
    color: 'text-purple-800 dark:text-purple-300',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/50',
    badgeText: 'text-purple-900 dark:text-purple-200',
    badgeBorder: 'border-purple-300 dark:border-purple-800',
    description: 'Health alert: enhanced severity across the whole population.',
    dotColor: 'bg-purple-600',
    chartColor: '#a855f7',
    cardBorderL: 'border-l-purple-500',
    pillBg: 'bg-purple-600 text-white',
    progressGradient: 'from-purple-400 to-purple-600',
  },
  Hazardous: {
    name: 'Hazardous',
    min: 301,
    max: 500,
    color: 'text-red-950 dark:text-red-200',
    badgeBg: 'bg-red-100 dark:bg-red-950/70',
    badgeText: 'text-red-950 dark:text-red-100',
    badgeBorder: 'border-red-400 dark:border-red-800',
    description: 'Emergency conditions. Active precautions mandated for all individuals.',
    dotColor: 'bg-red-800',
    chartColor: '#991b1b',
    cardBorderL: 'border-l-red-800',
    pillBg: 'bg-red-900 text-white',
    progressGradient: 'from-red-600 to-red-900',
  },
};

export const POLLUTANT_COLORS: Record<string, { bg: string; text: string; border: string; fill: string }> = {
  'PM2.5': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', fill: '#f43f5e' },
  'NO2': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', fill: '#f59e0b' },
  'O3': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', fill: '#0ea5e9' },
  'PM10': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', fill: '#14b8a6' },
};

export function getCategoryFromAQI(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export const POPULAR_AREAS = [
  'Central Downtown',
  'Industrial Sector 9',
  'Suburban Green Park',
  'East Valley Residential',
  'Riverside Harbor',
  'Delhi Urban Corridor',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Exactly 5 time slots per day
export const TIME_SLOT_HOURS = [
  { 
    time: '6:00 AM', 
    factor: 0.94, 
    mainPollutant: 'PM2.5', 
    tempBase: 16, 
    humidityBase: 78, 
    windBase: 6,
    note: 'Inversion layer with morning baseline' 
  },
  { 
    time: '10:00 AM', 
    factor: 1.18, 
    mainPollutant: 'NO2', 
    tempBase: 21, 
    humidityBase: 62, 
    windBase: 9,
    note: 'Morning commuter traffic concentration' 
  },
  { 
    time: '2:00 PM', 
    factor: 0.86, 
    mainPollutant: 'O3', 
    tempBase: 26, 
    humidityBase: 44, 
    windBase: 14,
    note: 'Afternoon thermal mixing & photochemical ozone' 
  },
  { 
    time: '6:00 PM', 
    factor: 1.26, 
    mainPollutant: 'PM2.5', 
    tempBase: 23, 
    humidityBase: 58, 
    windBase: 8,
    note: 'Evening rush hour & cooling surface layer' 
  },
  { 
    time: '10:00 PM', 
    factor: 1.04, 
    mainPollutant: 'PM10', 
    tempBase: 18, 
    humidityBase: 71, 
    windBase: 5,
    note: 'Night stagnation & reduced boundary height' 
  },
];

export function generateForecast(
  areaName: string, 
  simParams: SimulationParams = { windDispersion: 'normal', trafficProfile: 'standard' }
): Omit<PredictionResult, 'recommendation' | 'recommendationSource'> {
  const cleanName = areaName.trim();
  const hash = hashCode(cleanName.toLowerCase() || 'central');
  
  let baseAQI = 50 + (hash % 110);

  const lower = cleanName.toLowerCase();
  if (lower.includes('industrial') || lower.includes('factory') || lower.includes('delhi') || lower.includes('beijing')) {
    baseAQI = 150 + (hash % 110);
  } else if (lower.includes('park') || lower.includes('green') || lower.includes('mountain') || lower.includes('forest') || lower.includes('rural')) {
    baseAQI = 25 + (hash % 35);
  } else if (lower.includes('coastal') || lower.includes('harbor') || lower.includes('sea') || lower.includes('beach')) {
    baseAQI = 35 + (hash % 45);
  } else if (lower.includes('downtown') || lower.includes('central') || lower.includes('metro')) {
    baseAQI = 90 + (hash % 70);
  }

  // Simulation parameter modulations
  let windMultiplier = 1.0;
  if (simParams.windDispersion === 'breezy') windMultiplier = 0.82;
  if (simParams.windDispersion === 'calm') windMultiplier = 1.18;

  let trafficMultiplier = 1.0;
  if (simParams.trafficProfile === 'heavy') trafficMultiplier = 1.15;
  if (simParams.trafficProfile === 'reduced') trafficMultiplier = 0.88;

  const combinedBase = baseAQI * windMultiplier * trafficMultiplier;

  const now = new Date();
  
  const days: DayForecast[] = [1, 2].map((dayOffset) => {
    const dateObj = new Date(now);
    dateObj.setDate(now.getDate() + dayOffset);
    
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const monthDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayTitle = dayOffset === 1 ? 'Day 1 (Tomorrow)' : 'Day 2 (Day After)';
    const dateFormatted = `${dayName}, ${monthDate}`;

    const dayTrend = dayOffset === 1 ? 1.0 : (hash % 3 === 0 ? 0.90 : (hash % 3 === 1 ? 1.10 : 0.98));

    const timeSlots: TimeSlotForecast[] = TIME_SLOT_HOURS.map((slot, index) => {
      const variance = (((hash + index * 17 + dayOffset * 31) % 19) - 9);
      const calculatedAqi = Math.max(12, Math.min(480, Math.round(combinedBase * slot.factor * dayTrend + variance)));
      
      const tempDelta = ((hash + index * 7) % 5) - 2;
      const humidityDelta = ((hash + index * 11) % 9) - 4;
      const windDelta = simParams.windDispersion === 'breezy' ? 6 : simParams.windDispersion === 'calm' ? -2 : 0;

      return {
        id: `day-${dayOffset}-slot-${index}`,
        time: slot.time,
        aqi: calculatedAqi,
        category: getCategoryFromAQI(calculatedAqi),
        mainPollutant: slot.mainPollutant,
        temperature: `${slot.tempBase + tempDelta}°C`,
        humidity: `${Math.min(95, Math.max(25, slot.humidityBase + humidityDelta))}%`,
        windSpeed: `${Math.max(2, slot.windBase + windDelta)} km/h`,
        hourlyNote: slot.note,
      };
    });

    const dayAqiValues = timeSlots.map((s) => s.aqi);
    const averageAqi = Math.round(dayAqiValues.reduce((a, b) => a + b, 0) / dayAqiValues.length);
    const peakAqi = Math.max(...dayAqiValues);

    return {
      dayTitle,
      dateFormatted,
      averageAqi,
      peakAqi,
      category: getCategoryFromAQI(averageAqi),
      timeSlots,
    };
  });

  const allAqiValues = days.flatMap((d) => d.timeSlots.map((s) => s.aqi));
  const overallAqi = Math.round(allAqiValues.reduce((a, b) => a + b, 0) / allAqiValues.length);
  const peakAqi = Math.max(...allAqiValues);
  const category = getCategoryFromAQI(overallAqi);

  return {
    area: cleanName,
    predictedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    overallAqi,
    peakAqi,
    category,
    days,
  };
}
