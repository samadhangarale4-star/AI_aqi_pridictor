export type AQICategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export type IndianAQICategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface AQICategoryConfig {
  name: AQICategory;
  min: number;
  max: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
  dotColor: string;
}

export interface PollutantDetail {
  code: 'PM2.5' | 'PM10' | 'NO2' | 'O3';
  name: string;
  concentration: number;
  unit: string;
  subIndex: number;
  whoGuideline: string;
  cpcbStandard: string;
  sources: string;
  healthEffects: string;
  benchmarkStatus: 'Within Safe Limits' | 'Exceeds WHO Guideline' | 'Hazardous Level';
}

export interface TimeSlotForecast {
  id: string;
  time: string; // e.g. "6:00 AM", "10:00 AM", "2:00 PM", "6:00 PM", "10:00 PM"
  aqi: number;
  category: AQICategory;
  indianCategory: IndianAQICategory;
  mainPollutant: string; // e.g. "PM2.5", "NO2", "O3", "PM10"
  temperature: string; // e.g. "18°C"
  humidity: string; // e.g. "62%"
  windSpeed: string; // e.g. "8 km/h"
  hourlyNote: string; // e.g. "Morning vehicular buildup"
  confidenceMargin: number; // e.g. 6 (meaning +/- 6 AQI)
  confidenceLower: number;
  confidenceUpper: number;
  pollutants: {
    pm25: number; // in µg/m³
    pm10: number; // in µg/m³
    no2: number;  // in µg/m³
    o3: number;   // in µg/m³
  };
}

export interface DayForecast {
  dayTitle: string; // e.g. "Day 1 (Tomorrow)"
  dateFormatted: string; // e.g. "Thursday, Oct 8"
  averageAqi: number;
  peakAqi: number;
  category: AQICategory;
  indianCategory: IndianAQICategory;
  timeSlots: TimeSlotForecast[]; // Exactly 5 time slots
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RegionalStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  category: AQICategory;
  mainPollutant: string;
  distanceKm: number;
  temperature: string;
}

export type ActivityLevel = 'recommended' | 'moderate' | 'caution' | 'avoid';

export interface ActivityRecommendation {
  id: string;
  activity: string;
  category: 'exercise' | 'walking' | 'running' | 'cycling' | 'sports' | 'outdoor';
  level: ActivityLevel;
  badgeLabel: string;
  badgeColor: string;
  advice: string;
  optimalTime: string;
}

export interface DemographicAdvisory {
  id: string;
  groupName: string;
  targetGroup: 'general' | 'children' | 'elderly' | 'respiratory';
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  iconName: string;
  keyAdvice: string;
  actionItems: string[];
}

export interface HistoricalRecord {
  date: string;
  dayShort: string;
  dayFull: string;
  aqi: number;
  category: AQICategory;
  dominantPollutant: string;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  weatherCondition: string;
}

export interface WeatherAQICorrelation {
  temperatureImpact: string;
  windDispersionEffect: string;
  humidityImpact: string;
  solarOzoneEffect: string;
}

export interface PredictionResult {
  area: string;
  predictedAt: string;
  overallAqi: number;
  peakAqi: number;
  category: AQICategory;
  indianCategory: IndianAQICategory;
  days: DayForecast[]; // Exactly 2 days, 5 slots each
  recommendation: string;
  recommendationSource: 'ai' | 'standard';
  coordinates: Coordinates;
  regionalStations: RegionalStation[];
  pollutants: Record<string, PollutantDetail>;
  activityRecommendations: ActivityRecommendation[];
  demographicAdvisories: DemographicAdvisory[];
  historicalRecords: HistoricalRecord[];
  weatherCorrelation: WeatherAQICorrelation;
  dataSourceInfo: {
    telemetrySource: string;
    modelType: string;
    cpcbStandardApplied: boolean;
    epaStandardApplied: boolean;
    confidenceLevel: string;
  };
}

export interface SimulationParams {
  windDispersion: 'calm' | 'normal' | 'breezy';
  trafficProfile: 'reduced' | 'standard' | 'heavy';
}
