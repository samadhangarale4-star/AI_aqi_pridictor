import { 
  AQICategory, 
  IndianAQICategory,
  AQICategoryConfig, 
  Coordinates,
  DayForecast, 
  PredictionResult, 
  RegionalStation, 
  SimulationParams, 
  TimeSlotForecast,
  PollutantDetail,
  ActivityRecommendation,
  DemographicAdvisory,
  HistoricalRecord,
  WeatherAQICorrelation
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
    color: 'text-emerald-800 dark:text-emerald-300',
    badgeBg: 'bg-emerald-500/20 backdrop-blur-md',
    badgeText: 'text-emerald-950 font-bold',
    badgeBorder: 'border-emerald-500/40',
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
    color: 'text-amber-900 dark:text-amber-300',
    badgeBg: 'bg-amber-500/20 backdrop-blur-md',
    badgeText: 'text-amber-950 font-bold',
    badgeBorder: 'border-amber-500/40',
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
    color: 'text-orange-900 dark:text-orange-300',
    badgeBg: 'bg-orange-500/20 backdrop-blur-md',
    badgeText: 'text-orange-950 font-bold',
    badgeBorder: 'border-orange-500/40',
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
    color: 'text-rose-900 dark:text-rose-300',
    badgeBg: 'bg-rose-500/20 backdrop-blur-md',
    badgeText: 'text-rose-950 font-bold',
    badgeBorder: 'border-rose-500/40',
    description: 'Adverse effects possible for general public; sensitive groups at elevated risk.',
    dotColor: 'bg-rose-500',
    chartColor: '#ef4444',
    cardBorderL: 'border-l-rose-500',
    pillBg: 'bg-rose-600 text-white',
    progressGradient: 'from-rose-500 to-rose-700',
  },
  'Very Unhealthy': {
    name: 'Very Unhealthy',
    min: 201,
    max: 300,
    color: 'text-purple-900 dark:text-purple-300',
    badgeBg: 'bg-purple-500/20 backdrop-blur-md',
    badgeText: 'text-purple-950 font-bold',
    badgeBorder: 'border-purple-500/40',
    description: 'Health alert: enhanced severity across the whole population.',
    dotColor: 'bg-purple-600',
    chartColor: '#a855f7',
    cardBorderL: 'border-l-purple-600',
    pillBg: 'bg-purple-700 text-white',
    progressGradient: 'from-purple-500 to-purple-800',
  },
  Hazardous: {
    name: 'Hazardous',
    min: 301,
    max: 500,
    color: 'text-red-950 dark:text-red-200',
    badgeBg: 'bg-red-500/25 backdrop-blur-md',
    badgeText: 'text-red-950 font-bold',
    badgeBorder: 'border-red-600/50',
    description: 'Emergency conditions. Active precautions mandated for all individuals.',
    dotColor: 'bg-red-800',
    chartColor: '#991b1b',
    cardBorderL: 'border-l-red-800',
    pillBg: 'bg-red-900 text-white',
    progressGradient: 'from-red-600 to-red-900',
  },
};

export const INDIAN_AQI_CATEGORIES: Record<IndianAQICategory, { min: number; max: number; label: string; impact: string }> = {
  Good: { min: 0, max: 50, label: 'Good', impact: 'Minimal impact' },
  Satisfactory: { min: 51, max: 100, label: 'Satisfactory', impact: 'Minor breathing discomfort to sensitive people' },
  Moderate: { min: 101, max: 200, label: 'Moderate', impact: 'Breathing discomfort to people with lung, asthma and heart disease' },
  Poor: { min: 201, max: 300, label: 'Poor', impact: 'Breathing discomfort to most people on prolonged exposure' },
  'Very Poor': { min: 301, max: 400, label: 'Very Poor', impact: 'Respiratory illness on prolonged exposure' },
  Severe: { min: 401, max: 500, label: 'Severe', impact: 'Affects healthy people and seriously impacts those with existing disease' },
};

export const POLLUTANT_COLORS: Record<string, { bg: string; text: string; border: string; fill: string }> = {
  'PM2.5': { bg: 'bg-rose-500/15 backdrop-blur-xs', text: 'text-rose-900', border: 'border-rose-400/40', fill: '#f43f5e' },
  'NO2': { bg: 'bg-amber-500/15 backdrop-blur-xs', text: 'text-amber-900', border: 'border-amber-400/40', fill: '#f59e0b' },
  'O3': { bg: 'bg-sky-500/15 backdrop-blur-xs', text: 'text-sky-900', border: 'border-sky-400/40', fill: '#0ea5e9' },
  'PM10': { bg: 'bg-teal-500/15 backdrop-blur-xs', text: 'text-teal-900', border: 'border-teal-400/40', fill: '#14b8a6' },
};

export function getCategoryFromAQI(aqi: number): AQICategory {
  if (!Number.isFinite(aqi) || aqi < 0 || aqi > 500) {
    throw new RangeError('AQI must be a finite number between 0 and 500.');
  }

  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getIndianCategoryFromAQI(aqi: number): IndianAQICategory {
  if (!Number.isFinite(aqi) || aqi < 0 || aqi > 500) {
    throw new RangeError('AQI must be a finite number between 0 and 500.');
  }

  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

// Convert AQI to scientific PM2.5 concentration in µg/m³ using EPA piecewise linear breakpoints
export function aqiToPm25(aqi: number): number {
  if (aqi <= 50) return Number(((aqi / 50) * 12.0).toFixed(1));
  if (aqi <= 100) return Number((12.1 + ((aqi - 51) / 49) * (35.4 - 12.1)).toFixed(1));
  if (aqi <= 150) return Number((35.5 + ((aqi - 101) / 49) * (55.4 - 35.5)).toFixed(1));
  if (aqi <= 200) return Number((55.5 + ((aqi - 151) / 49) * (150.4 - 55.5)).toFixed(1));
  if (aqi <= 300) return Number((150.5 + ((aqi - 201) / 99) * (250.4 - 150.5)).toFixed(1));
  return Number((250.5 + ((aqi - 301) / 199) * (500.0 - 250.5)).toFixed(1));
}

// Convert AQI to scientific PM10 concentration in µg/m³
export function aqiToPm10(aqi: number): number {
  if (aqi <= 50) return Number(((aqi / 50) * 54.0).toFixed(1));
  if (aqi <= 100) return Number((55.0 + ((aqi - 51) / 49) * (154.0 - 55.0)).toFixed(1));
  if (aqi <= 150) return Number((155.0 + ((aqi - 101) / 49) * (254.0 - 155.0)).toFixed(1));
  if (aqi <= 200) return Number((255.0 + ((aqi - 151) / 49) * (354.0 - 255.0)).toFixed(1));
  if (aqi <= 300) return Number((355.0 + ((aqi - 201) / 99) * (424.0 - 355.0)).toFixed(1));
  return Number((425.0 + ((aqi - 301) / 199) * (604.0 - 425.0)).toFixed(1));
}

// Convert AQI to scientific NO2 concentration in µg/m³
export function aqiToNo2(aqi: number): number {
  if (aqi <= 50) return Number(((aqi / 50) * 53.0).toFixed(1));
  if (aqi <= 100) return Number((54.0 + ((aqi - 51) / 49) * (100.0 - 54.0)).toFixed(1));
  if (aqi <= 150) return Number((101.0 + ((aqi - 101) / 49) * (360.0 - 101.0)).toFixed(1));
  if (aqi <= 200) return Number((361.0 + ((aqi - 151) / 49) * (649.0 - 361.0)).toFixed(1));
  return Number((650.0 + ((aqi - 201) / 99) * (1249.0 - 650.0)).toFixed(1));
}

// Convert AQI to scientific Ozone O3 concentration in µg/m³
export function aqiToO3(aqi: number): number {
  if (aqi <= 50) return Number(((aqi / 50) * 54.0).toFixed(1));
  if (aqi <= 100) return Number((55.0 + ((aqi - 51) / 49) * (70.0 - 55.0)).toFixed(1));
  if (aqi <= 150) return Number((71.0 + ((aqi - 101) / 49) * (85.0 - 71.0)).toFixed(1));
  if (aqi <= 200) return Number((86.0 + ((aqi - 151) / 49) * (105.0 - 86.0)).toFixed(1));
  return Number((106.0 + ((aqi - 201) / 99) * (200.0 - 106.0)).toFixed(1));
}

export const POPULAR_AREAS = [
  'Central Downtown',
  'Industrial Sector 9',
  'Suburban Green Park',
  'East Valley Residential',
  'Riverside Harbor',
  'Delhi Urban Corridor',
];

export interface PopularAreaItem {
  name: string;
  tag: string;
  badgeColor: string;
}

export const POPULAR_AREA_ITEMS: PopularAreaItem[] = [
  { name: 'Central Downtown', tag: 'Urban Core', badgeColor: 'bg-sky-500/15 text-sky-900 border-sky-400/40 backdrop-blur-xs' },
  { name: 'Industrial Sector 9', tag: 'Industrial', badgeColor: 'bg-amber-500/15 text-amber-900 border-amber-400/40 backdrop-blur-xs' },
  { name: 'Suburban Green Park', tag: 'Eco Reserve', badgeColor: 'bg-emerald-500/15 text-emerald-900 border-emerald-400/40 backdrop-blur-xs' },
  { name: 'East Valley Residential', tag: 'Residential', badgeColor: 'bg-teal-500/15 text-teal-900 border-teal-400/40 backdrop-blur-xs' },
  { name: 'Riverside Harbor', tag: 'Coastal Port', badgeColor: 'bg-blue-500/15 text-blue-900 border-blue-400/40 backdrop-blur-xs' },
  { name: 'Delhi Urban Corridor', tag: 'Megacity', badgeColor: 'bg-rose-500/15 text-rose-900 border-rose-400/40 backdrop-blur-xs' },
];

export const AREA_COORDINATES: Record<string, Coordinates> = {
  'central downtown': { lat: 37.7749, lng: -122.4194 },
  'industrial sector 9': { lat: 37.8044, lng: -122.2712 },
  'suburban green park': { lat: 37.8715, lng: -122.2730 },
  'east valley residential': { lat: 37.3382, lng: -121.8863 },
  'riverside harbor': { lat: 37.7955, lng: -122.3937 },
  'delhi urban corridor': { lat: 28.6139, lng: 77.2090 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAreaCoordinates(areaName: string): Coordinates {
  const lower = areaName.toLowerCase().trim();
  if (AREA_COORDINATES[lower]) {
    return AREA_COORDINATES[lower];
  }

  for (const [key, coords] of Object.entries(AREA_COORDINATES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return coords;
    }
  }

  const hash = hashCode(lower);
  const latOffset = ((hash % 1000) - 500) / 10000;
  const lngOffset = (((hash >> 3) % 1000) - 500) / 10000;
  
  return {
    lat: Number((37.7749 + latOffset).toFixed(4)),
    lng: Number((-122.4194 + lngOffset).toFixed(4)),
  };
}

export function getRegionalStations(
  areaName: string,
  center: Coordinates,
  baseAqi: number
): RegionalStation[] {
  const hash = hashCode(areaName.toLowerCase().trim());

  const stationTemplates = [
    { suffix: 'North Sensor Grid', dLat: 0.032, dLng: 0.015, factor: 0.92, pollutant: 'PM2.5', tempDelta: -1, dist: 3.8 },
    { suffix: 'Industrial Logistics Node', dLat: 0.012, dLng: -0.038, factor: 1.28, pollutant: 'NO2', tempDelta: 2, dist: 4.1 },
    { suffix: 'Ecological Forest Reserve', dLat: -0.026, dLng: 0.028, factor: 0.68, pollutant: 'O3', tempDelta: -2, dist: 3.5 },
    { suffix: 'Harbor Waterfront Node', dLat: 0.019, dLng: 0.041, factor: 0.84, pollutant: 'PM10', tempDelta: -1, dist: 4.6 },
    { suffix: 'Civic Metro Interchange', dLat: -0.031, dLng: -0.024, factor: 1.15, pollutant: 'PM2.5', tempDelta: 1, dist: 3.9 },
    { suffix: 'Valley Residential Node', dLat: -0.044, dLng: 0.018, factor: 0.96, pollutant: 'PM10', tempDelta: 0, dist: 5.1 },
  ];

  return stationTemplates.map((template, idx) => {
    const stationAqi = Math.max(12, Math.min(480, Math.round(baseAqi * template.factor + (((hash + idx * 13) % 11) - 5))));
    const cleanName = `${areaName} - ${template.suffix}`;
    
    return {
      id: `station-${idx}-${hash}`,
      name: cleanName,
      lat: Number((center.lat + template.dLat).toFixed(4)),
      lng: Number((center.lng + template.dLng).toFixed(4)),
      aqi: stationAqi,
      category: getCategoryFromAQI(stationAqi),
      mainPollutant: template.pollutant,
      distanceKm: template.dist,
      temperature: `${20 + template.tempDelta}°C`,
    };
  });
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
    note: 'Inversion layer with morning baseline particulate accumulation',
    uncertaintyBase: 6
  },
  { 
    time: '10:00 AM', 
    factor: 1.18, 
    mainPollutant: 'NO2', 
    tempBase: 21, 
    humidityBase: 62, 
    windBase: 9,
    note: 'Morning commuter traffic concentration & combustion emission peak',
    uncertaintyBase: 8
  },
  { 
    time: '2:00 PM', 
    factor: 0.86, 
    mainPollutant: 'O3', 
    tempBase: 26, 
    humidityBase: 44, 
    windBase: 14,
    note: 'Afternoon thermal mixing & sunlight-driven photochemical ozone formation',
    uncertaintyBase: 9
  },
  { 
    time: '6:00 PM', 
    factor: 1.26, 
    mainPollutant: 'PM2.5', 
    tempBase: 23, 
    humidityBase: 58, 
    windBase: 8,
    note: 'Evening rush hour traffic spike & cooling surface boundary layer',
    uncertaintyBase: 10
  },
  { 
    time: '10:00 PM', 
    factor: 1.04, 
    mainPollutant: 'PM10', 
    tempBase: 18, 
    humidityBase: 71, 
    windBase: 5,
    note: 'Nighttime atmospheric stagnation & reduced planetary boundary layer',
    uncertaintyBase: 11
  },
];

export function generatePollutantDetails(overallAqi: number): Record<string, PollutantDetail> {
  const pm25Conc = aqiToPm25(overallAqi);
  const pm10Conc = aqiToPm10(overallAqi);
  const no2Conc = aqiToNo2(overallAqi);
  const o3Conc = aqiToO3(overallAqi);

  return {
    'PM2.5': {
      code: 'PM2.5',
      name: 'Fine Particulate Matter (<2.5 µm)',
      concentration: pm25Conc,
      unit: 'µg/m³',
      subIndex: overallAqi,
      whoGuideline: '15 µg/m³ (24h mean)',
      cpcbStandard: '60 µg/m³ (24h mean)',
      sources: 'Vehicular exhaust, industrial combustion, biomass burning, and road dust resuspension.',
      healthEffects: 'Fine particles can penetrate deep into the lungs and may aggravate respiratory or cardiovascular conditions.',
      benchmarkStatus: pm25Conc <= 15 ? 'Within Safe Limits' : pm25Conc <= 60 ? 'Exceeds WHO Guideline' : 'Hazardous Level',
    },
    'PM10': {
      code: 'PM10',
      name: 'Coarse Particulate Matter (<10 µm)',
      concentration: pm10Conc,
      unit: 'µg/m³',
      subIndex: Math.round(overallAqi * 0.88),
      whoGuideline: '45 µg/m³ (24h mean)',
      cpcbStandard: '100 µg/m³ (24h mean)',
      sources: 'Construction activities, mechanical grinding, unpaved road dust, and agricultural tillage.',
      healthEffects: 'Causes upper airway irritation, bronchitis, coughing, and aggravated asthma episodes.',
      benchmarkStatus: pm10Conc <= 45 ? 'Within Safe Limits' : pm10Conc <= 100 ? 'Exceeds WHO Guideline' : 'Hazardous Level',
    },
    'NO2': {
      code: 'NO2',
      name: 'Nitrogen Dioxide',
      concentration: no2Conc,
      unit: 'µg/m³',
      subIndex: Math.round(overallAqi * 0.82),
      whoGuideline: '25 µg/m³ (24h mean)',
      cpcbStandard: '80 µg/m³ (24h mean)',
      sources: 'Internal combustion engines, diesel engines, fossil fuel power generation plants.',
      healthEffects: 'Triggers bronchial hyper-reactivity, airway inflammation, and heightened allergen sensitivity.',
      benchmarkStatus: no2Conc <= 25 ? 'Within Safe Limits' : no2Conc <= 80 ? 'Exceeds WHO Guideline' : 'Hazardous Level',
    },
    'O3': {
      code: 'O3',
      name: 'Ground-Level Ozone',
      concentration: o3Conc,
      unit: 'µg/m³',
      subIndex: Math.round(overallAqi * 0.74),
      whoGuideline: '100 µg/m³ (8h mean)',
      cpcbStandard: '100 µg/m³ (8h mean)',
      sources: 'Photochemical reaction of NOx and VOCs under intense ultraviolet sunlight.',
      healthEffects: 'Powerful oxidant causing chest tightness, reduced lung capacity, and cellular damage.',
      benchmarkStatus: o3Conc <= 100 ? 'Within Safe Limits' : 'Exceeds WHO Guideline',
    },
  };
}

export function generateActivityRecommendations(overallAqi: number): ActivityRecommendation[] {
  if (overallAqi <= 50) {
    return [
      { id: 'act-1', activity: 'Outdoor Exercise', category: 'exercise', level: 'recommended', badgeLabel: 'Recommended', badgeColor: 'bg-emerald-500/20 text-emerald-900 border-emerald-500/30', advice: 'Optimal atmospheric ventilation. Full cardio, HIIT, and training workouts are safe.', optimalTime: 'Anytime' },
      { id: 'act-2', activity: 'Walking & Commuting', category: 'walking', level: 'recommended', badgeLabel: 'Ideal', badgeColor: 'bg-emerald-500/20 text-emerald-900 border-emerald-500/30', advice: 'Excellent air quality for pedestrian commutes, dog walking, and leisurely strolls.', optimalTime: 'All day' },
      { id: 'act-3', activity: 'Running & Jogging', category: 'running', level: 'recommended', badgeLabel: 'Recommended', badgeColor: 'bg-emerald-500/20 text-emerald-900 border-emerald-500/30', advice: 'Maximal pulmonary comfort. Long-distance endurance runs are safe without restrictions.', optimalTime: 'Morning or Evening' },
      { id: 'act-4', activity: 'Road & Trail Cycling', category: 'cycling', level: 'recommended', badgeLabel: 'Recommended', badgeColor: 'bg-emerald-500/20 text-emerald-900 border-emerald-500/30', advice: 'Low ambient particulate load along transit corridors. Safe for distance cycling.', optimalTime: 'Daytime' },
      { id: 'act-5', activity: 'Outdoor Sports', category: 'sports', level: 'recommended', badgeLabel: 'No Restrictions', badgeColor: 'bg-emerald-500/20 text-emerald-900 border-emerald-500/30', advice: 'Ideal for football, cricket, tennis, and school athletic tournaments.', optimalTime: 'Full schedule' },
      { id: 'act-6', activity: 'General Outdoor Events', category: 'outdoor', level: 'recommended', badgeLabel: 'Optimal', badgeColor: 'bg-emerald-500/20 text-emerald-900 border-emerald-500/30', advice: 'Perfect conditions for outdoor dining, open-air festivals, and garden recreation.', optimalTime: 'Unrestricted' },
    ];
  } else if (overallAqi <= 100) {
    return [
      { id: 'act-1', activity: 'Outdoor Exercise', category: 'exercise', level: 'moderate', badgeLabel: 'Acceptable', badgeColor: 'bg-amber-500/20 text-amber-900 border-amber-500/30', advice: 'Generally safe. Individuals unusually sensitive to ozone or particulates should monitor exertion.', optimalTime: '2:00 PM – 5:00 PM' },
      { id: 'act-2', activity: 'Walking & Commuting', category: 'walking', level: 'recommended', badgeLabel: 'Safe', badgeColor: 'bg-emerald-500/20 text-emerald-900 border-emerald-500/30', advice: 'Normal walking is safe. Choose routes through parks rather than bumper-to-bumper highways.', optimalTime: 'Midday' },
      { id: 'act-3', activity: 'Running & Jogging', category: 'running', level: 'moderate', badgeLabel: 'Moderate', badgeColor: 'bg-amber-500/20 text-amber-900 border-amber-500/30', advice: 'Plan runs during midday dispersion windows when morning rush-hour exhausts have cleared.', optimalTime: '1:00 PM – 4:00 PM' },
      { id: 'act-4', activity: 'Road & Trail Cycling', category: 'cycling', level: 'moderate', badgeLabel: 'Safe', badgeColor: 'bg-amber-500/20 text-amber-900 border-amber-500/30', advice: 'Wear clear eyewear and choose designated cycling lanes away from diesel bus routes.', optimalTime: 'Midday' },
      { id: 'act-5', activity: 'Outdoor Sports', category: 'sports', level: 'moderate', badgeLabel: 'Normal Play', badgeColor: 'bg-amber-500/20 text-amber-900 border-amber-500/30', advice: 'Sports can proceed normally. Ensure players have water breaks; asthmatic players keep inhalers close.', optimalTime: 'Afternoon' },
      { id: 'act-6', activity: 'General Outdoor Events', category: 'outdoor', level: 'recommended', badgeLabel: 'Enjoyable', badgeColor: 'bg-emerald-500/20 text-emerald-900 border-emerald-500/30', advice: 'Fine conditions for outdoor activities and family park outings.', optimalTime: 'Daytime' },
    ];
  } else if (overallAqi <= 150) {
    return [
      { id: 'act-1', activity: 'Outdoor Exercise', category: 'exercise', level: 'caution', badgeLabel: 'Reduce Intensity', badgeColor: 'bg-orange-500/20 text-orange-950 border-orange-500/30', advice: 'Sensitive groups should transition high-intensity aerobic sessions to indoor gyms with air filtration.', optimalTime: 'Cleanest slot (2:00 PM)' },
      { id: 'act-2', activity: 'Walking & Commuting', category: 'walking', level: 'moderate', badgeLabel: 'Caution', badgeColor: 'bg-amber-500/20 text-amber-900 border-amber-500/30', advice: 'Keep walking pace moderate. Elderly individuals should avoid walking along congested arterial roads.', optimalTime: '12:00 PM – 3:00 PM' },
      { id: 'act-3', activity: 'Running & Jogging', category: 'running', level: 'caution', badgeLabel: 'Shorten Duration', badgeColor: 'bg-orange-500/20 text-orange-950 border-orange-500/30', advice: 'Deep hyperventilation accelerates particulate deposition in bronchi. Limit runs to 30 mins or treadmill.', optimalTime: 'Afternoon window' },
      { id: 'act-4', activity: 'Road & Trail Cycling', category: 'cycling', level: 'caution', badgeLabel: 'Limit Exposure', badgeColor: 'bg-orange-500/20 text-orange-950 border-orange-500/30', advice: 'Avoid rush-hour road cycling and choose low-traffic routes when air quality is poor.', optimalTime: 'Low traffic hours' },
      { id: 'act-5', activity: 'Outdoor Sports', category: 'sports', level: 'caution', badgeLabel: 'Frequent Breaks', badgeColor: 'bg-orange-500/20 text-orange-950 border-orange-500/30', advice: 'Schools should limit prolonged competitive games. Allow frequent hydration and bench rotations.', optimalTime: 'Midday only' },
      { id: 'act-6', activity: 'General Outdoor Events', category: 'outdoor', level: 'moderate', badgeLabel: 'Take Precautions', badgeColor: 'bg-amber-500/20 text-amber-900 border-amber-500/30', advice: 'Outdoor events acceptable, but provide shaded, ventilated rest zones for children and seniors.', optimalTime: 'Afternoon' },
    ];
  } else {
    return [
      { id: 'act-1', activity: 'Outdoor Exercise', category: 'exercise', level: 'avoid', badgeLabel: 'Avoid Outdoors', badgeColor: 'bg-rose-500/20 text-rose-950 border-rose-500/40', advice: 'High risk of acute lung irritation and bronchospasm. All cardiovascular workouts must remain indoors.', optimalTime: 'Move indoors' },
      { id: 'act-2', activity: 'Walking & Commuting', category: 'walking', level: 'caution', badgeLabel: 'N95 Mask Needed', badgeColor: 'bg-rose-500/20 text-rose-950 border-rose-500/40', advice: 'Wear a well-fitted certified N95 or FFP2 particulate respirator when stepping outdoors for essential errands.', optimalTime: 'Essential trips only' },
      { id: 'act-3', activity: 'Running & Jogging', category: 'running', level: 'avoid', badgeLabel: 'Strictly Avoid', badgeColor: 'bg-red-500/20 text-red-950 border-red-500/40', advice: 'Poor air quality can irritate the lungs; choose indoor exercise when AQI is high.', optimalTime: 'Indoor treadmill' },
      { id: 'act-4', activity: 'Road & Trail Cycling', category: 'cycling', level: 'avoid', badgeLabel: 'Avoid Road Cycling', badgeColor: 'bg-rose-500/20 text-rose-950 border-rose-500/40', advice: 'Exhaust plume from vehicular traffic compounds ambient air pollution. Switch to stationary indoor cycling.', optimalTime: 'Indoor trainer' },
      { id: 'act-5', activity: 'Outdoor Sports', category: 'sports', level: 'avoid', badgeLabel: 'Cancel / Postpone', badgeColor: 'bg-rose-500/20 text-rose-950 border-rose-500/40', advice: 'Cancel competitive matches and school athletic sessions. Reschedule inside HEPA-filtered sports arenas.', optimalTime: 'Postpone' },
      { id: 'act-6', activity: 'General Outdoor Events', category: 'outdoor', level: 'avoid', badgeLabel: 'Stay Indoors', badgeColor: 'bg-rose-500/20 text-rose-950 border-rose-500/40', advice: 'Keep windows and doors sealed. Run indoor air purifiers and minimize opening outside entrances.', optimalTime: 'Remain indoors' },
    ];
  }
}

export function generateDemographicAdvisories(overallAqi: number): DemographicAdvisory[] {
  const isHigh = overallAqi > 100;
  const isSevere = overallAqi > 200;

  return [
    {
      id: 'demo-1',
      groupName: 'General Population',
      targetGroup: 'general',
      riskLevel: overallAqi <= 50 ? 'Low' : overallAqi <= 100 ? 'Moderate' : overallAqi <= 200 ? 'High' : 'Severe',
      iconName: 'Users',
      keyAdvice: isSevere 
        ? 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.'
        : isHigh 
          ? 'Most healthy adults will not notice immediate symptoms, but should avoid heavy cardiovascular exhaustion during peak hours.'
          : 'Air quality poses little or no risk to the general population. Enjoy daily outdoor activities.',
      actionItems: [
        isHigh ? 'Wear an N95 particulate mask during heavy traffic commute hours.' : 'Normal daily commutes and activities require no restrictions.',
        isHigh ? 'Seal windows during morning (10 AM) and evening (6 PM) traffic spikes.' : 'Ventilate indoor living spaces during midday sunny hours.',
        'Stay well hydrated to maintain respiratory mucosal barrier hydration.',
      ],
    },
    {
      id: 'demo-2',
      groupName: 'Children & Infants',
      targetGroup: 'children',
      riskLevel: overallAqi <= 50 ? 'Low' : overallAqi <= 100 ? 'Moderate' : overallAqi <= 150 ? 'High' : 'Severe',
      iconName: 'Baby',
      keyAdvice: isHigh 
        ? 'Children breathe more air per pound of body weight than adults and their lungs are actively developing. Restrict outdoor recess.'
        : 'Safe for school recess, outdoor sports, and playground games.',
      actionItems: [
        isHigh ? 'Move school PE classes and playground recess indoors.' : 'Full outdoor sports and playground play is safe.',
        isHigh ? 'Keep classroom windows closed facing busy arterial roadways.' : 'Encourage active physical play outdoors.',
        'Ensure children wash hands and face after playing outside to remove particulate matter.',
      ],
    },
    {
      id: 'demo-3',
      groupName: 'Elderly Individuals (65+)',
      targetGroup: 'elderly',
      riskLevel: overallAqi <= 50 ? 'Low' : overallAqi <= 100 ? 'Moderate' : 'High',
      iconName: 'HeartPulse',
      keyAdvice: isHigh
        ? 'Air pollution may aggravate existing heart or lung conditions. Reduce prolonged outdoor exertion and follow your care plan.'
        : 'Air quality is favorable. Mild outdoor walks and park visits are recommended for cardiovascular well-being.',
      actionItems: [
        isHigh ? 'Choose indoor walking or a low-exposure route when air quality is poor.' : 'Morning walks in parks are beneficial.',
        'Follow your clinician-provided care plan and seek medical help for concerning symptoms.',
        isHigh ? 'Run an air purifier equipped with true HEPA filtration in the bedroom.' : 'Keep rooms well ventilated.',
      ],
    },
    {
      id: 'demo-4',
      groupName: 'Respiratory & Asthmatic Patients',
      targetGroup: 'respiratory',
      riskLevel: overallAqi <= 50 ? 'Low' : overallAqi <= 100 ? 'Moderate' : 'Severe',
      iconName: 'ShieldAlert',
      keyAdvice: isHigh
        ? 'Air pollution may worsen respiratory symptoms. Reduce outdoor exertion and follow your clinician-provided asthma action plan.'
        : 'Low trigger environment. Asthma action plan can proceed on normal baseline maintenance.',
      actionItems: [
        'Carry prescribed reliever medication and follow your clinician-provided asthma action plan.',
        isHigh ? 'Wear a certified N95 respirator if outdoor transit is mandatory.' : 'Check local pollen & ozone levels before intense runs.',
        'If experiencing persistent coughing, tightness in the chest, or wheezing, consult your healthcare provider immediately.',
      ],
    },
  ];
}

export function generateHistoricalAnalytics(areaName: string, baseAqi: number): HistoricalRecord[] {
  const hash = Math.abs(hashCode(areaName.toLowerCase().trim() || 'central'));
  const daysShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const now = new Date();

  return [-6, -5, -4, -3, -2, -1, 0].map((offset) => {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const fullDay = d.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Deterministic realistic variance based on station hash and day
    const dayVariance = (((hash + offset * 19) % 45) - 22);
    const dayAqi = Math.max(18, Math.min(380, Math.round(baseAqi + dayVariance)));
    
    const pollutantsList = ['PM2.5', 'PM10', 'NO2', 'PM2.5'];
    const dominant = pollutantsList[Math.abs(hash + offset) % pollutantsList.length];

    return {
      date: formattedDate,
      dayShort: dayName,
      dayFull: fullDay,
      aqi: dayAqi,
      category: getCategoryFromAQI(dayAqi),
      dominantPollutant: dominant,
      pm25: aqiToPm25(dayAqi),
      pm10: aqiToPm10(dayAqi),
      no2: aqiToNo2(dayAqi),
      o3: aqiToO3(dayAqi),
      temp: 18 + ((hash + offset * 3) % 9),
      humidity: 50 + ((hash + offset * 5) % 25),
      windSpeed: 6 + ((hash + offset * 2) % 12),
      weatherCondition: (hash + offset) % 3 === 0 ? 'Rainy' : (hash + offset) % 2 === 0 ? 'Sunny' : 'Partly Cloudy',
    };
  });
}

export function getWeatherAQICorrelation(overallAqi: number, simParams: SimulationParams): WeatherAQICorrelation {
  const isBreezy = simParams.windDispersion === 'breezy';
  const isCalm = simParams.windDispersion === 'calm';

  return {
    temperatureImpact: 'Nocturnal surface radiative cooling produces a thermal inversion cap that prevents vertical mechanical convection, trapping exhaust gases within the first 150 meters above ground level.',
    windDispersionEffect: isBreezy 
      ? 'Elevated wind velocity (>14 km/h) creates vigorous advective dilution and rapid horizontal particulate transport, suppressing local AQI accumulation by approximately 18%.'
      : isCalm
        ? 'Stagnant surface air currents (<4 km/h) fail to disperse vehicular exhausts, causing persistent localized particulate and NO2 accumulation near roadway corridors.'
        : 'Moderate surface wind vectors provide standard boundary layer ventilation, maintaining equilibrium between local emissions and regional dispersion.',
    humidityImpact: 'High relative humidity (>65%) promotes hygroscopic aerosol growth, causing fine hydrophilic particles (sulfates & nitrates) to swell in diameter and scatter sunlight more intensely.',
    solarOzoneEffect: 'Peak ultraviolet sunlight exposure between 12:00 PM and 3:00 PM acts as a chemical catalyst, photolyzing nitrogen dioxide (NO2) into ground-level ozone (O3) and secondary organic aerosols.',
  };
}

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

      // Confidence uncertainty interval calculation
      const marginPct = (slot.uncertaintyBase + (dayOffset === 2 ? 3 : 0)) / 100;
      const margin = Math.round(calculatedAqi * marginPct);

      return {
        id: `day-${dayOffset}-slot-${index}`,
        time: slot.time,
        aqi: calculatedAqi,
        category: getCategoryFromAQI(calculatedAqi),
        indianCategory: getIndianCategoryFromAQI(calculatedAqi),
        mainPollutant: slot.mainPollutant,
        temperature: `${slot.tempBase + tempDelta}°C`,
        humidity: `${Math.min(95, Math.max(25, slot.humidityBase + humidityDelta))}%`,
        windSpeed: `${Math.max(2, slot.windBase + windDelta)} km/h`,
        hourlyNote: slot.note,
        confidenceMargin: margin,
        confidenceLower: Math.max(1, calculatedAqi - margin),
        confidenceUpper: calculatedAqi + margin,
        pollutants: {
          pm25: aqiToPm25(calculatedAqi),
          pm10: aqiToPm10(calculatedAqi),
          no2: aqiToNo2(calculatedAqi),
          o3: aqiToO3(calculatedAqi),
        },
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
      indianCategory: getIndianCategoryFromAQI(averageAqi),
      timeSlots,
    };
  });

  const allAqiValues = days.flatMap((d) => d.timeSlots.map((s) => s.aqi));
  const overallAqi = Math.round(allAqiValues.reduce((a, b) => a + b, 0) / allAqiValues.length);
  const peakAqi = Math.max(...allAqiValues);
  const category = getCategoryFromAQI(overallAqi);
  const indianCategory = getIndianCategoryFromAQI(overallAqi);

  const coordinates = getAreaCoordinates(cleanName);
  const regionalStations = getRegionalStations(cleanName, coordinates, overallAqi);
  const pollutants = generatePollutantDetails(overallAqi);
  const activityRecommendations = generateActivityRecommendations(overallAqi);
  const demographicAdvisories = generateDemographicAdvisories(overallAqi);
  const historicalRecords = generateHistoricalAnalytics(cleanName, overallAqi);
  const weatherCorrelation = getWeatherAQICorrelation(overallAqi, simParams);

  return {
    area: cleanName,
    predictedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    overallAqi,
    peakAqi,
    category,
    indianCategory,
    days,
    coordinates,
    regionalStations,
    pollutants,
    activityRecommendations,
    demographicAdvisories,
    historicalRecords,
    weatherCorrelation,
    dataSourceInfo: {
      telemetrySource: 'Synthetic deterministic demonstration data; no monitoring network is connected',
      modelType: 'Rule-based scenario generator; not a trained machine-learning model',
      cpcbStandardApplied: true,
      epaStandardApplied: true,
      confidenceLevel: 'Illustrative scenario range; not a statistically validated confidence interval',
    },
  };
}

export type WeatherConditionKey = 'sunny' | 'partlyCloudy' | 'rainy' | 'cloudy' | 'thunderstorm';

export interface WeekDayForecast {
  id: string;
  dayShort: string;
  dayFull: string;
  dateFormatted: string;
  weatherType: WeatherConditionKey;
  conditionLabel: string;
  highTemp: number;
  lowTemp: number;
  currentTemp: number;
  aqi: number;
  category: AQICategory;
  pressureHpa: number;
  sunrise: string;
  sunset: string;
  humidity: string;
  windSpeed: string;
}

export function generateWeeklyWeatherOutlook(areaName: string, baseAqi: number): WeekDayForecast[] {
  const isDefaultCity = !areaName || areaName.toLowerCase().trim() === 'city';
  const hash = Math.abs(hashCode(areaName.toLowerCase().trim() || 'city'));
  
  const daysMeta: Array<{
    dayShort: string;
    dayFull: string;
    weatherType: WeatherConditionKey;
    conditionLabel: string;
    baseHigh: number;
    baseLow: number;
  }> = [
    { dayShort: 'SUN', dayFull: 'Sunday', weatherType: 'sunny', conditionLabel: 'CLOUDY', baseHigh: 20, baseLow: 10 },
    { dayShort: 'MON', dayFull: 'Monday', weatherType: 'rainy', conditionLabel: 'RAIN', baseHigh: 17, baseLow: 8 },
    { dayShort: 'TUE', dayFull: 'Tuesday', weatherType: 'partlyCloudy', conditionLabel: 'PARTLY CLOUDY', baseHigh: 18, baseLow: 7 },
    { dayShort: 'WED', dayFull: 'Wednesday', weatherType: 'rainy', conditionLabel: 'SHOWERS', baseHigh: 16, baseLow: 6 },
    { dayShort: 'THU', dayFull: 'Thursday', weatherType: 'partlyCloudy', conditionLabel: 'CLOUDY', baseHigh: 18, baseLow: 9 },
    { dayShort: 'FRI', dayFull: 'Friday', weatherType: 'cloudy', conditionLabel: 'OVERCAST', baseHigh: 19, baseLow: 10 },
    { dayShort: 'SAT', dayFull: 'Saturday', weatherType: 'thunderstorm', conditionLabel: 'THUNDERSTORM', baseHigh: 17, baseLow: 5 },
  ];

  const now = new Date();

  return daysMeta.map((meta, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + index);
    const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const dayFull = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateFormatted = `${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${date.getDate()}`;
    const tempOffset = isDefaultCity ? 0 : (((hash + index * 7) % 5) - 2);
    const high = meta.baseHigh + tempOffset;
    const low = meta.baseLow + tempOffset;
    const dayAqi = Math.max(18, Math.min(320, Math.round(baseAqi + (((hash + index * 17) % 31) - 15))));

    return {
      id: `week-day-${index}-${date.toISOString().slice(0, 10)}`,
      dayShort,
      dayFull,
      dateFormatted,
      weatherType: meta.weatherType,
      conditionLabel: meta.conditionLabel,
      highTemp: high,
      lowTemp: low,
      currentTemp: high,
      aqi: dayAqi,
      category: getCategoryFromAQI(dayAqi),
      pressureHpa: isDefaultCity ? 1021 : (1018 + ((hash + index * 3) % 9)),
      sunrise: '6:38',
      sunset: '18:03',
      humidity: `${55 + ((hash + index * 9) % 25)}%`,
      windSpeed: `${8 + ((hash + index * 5) % 12)} km/h`,
    };
  });
}
