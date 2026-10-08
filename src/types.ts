export interface TimeSlotForecast {
  id: string;
  time: string; // e.g. "6:00 AM", "10:00 AM", "2:00 PM", "6:00 PM", "10:00 PM"
  aqi: number;
  category: AQICategory;
  mainPollutant: string; // e.g. "PM2.5", "NO2", "O3", "PM10"
  temperature: string; // e.g. "18°C"
  humidity: string; // e.g. "62%"
  windSpeed: string; // e.g. "8 km/h"
  hourlyNote: string; // e.g. "Morning vehicular buildup"
}

export interface DayForecast {
  dayTitle: string; // e.g. "Day 1 (Tomorrow)"
  dateFormatted: string; // e.g. "Thursday, Oct 8"
  averageAqi: number;
  peakAqi: number;
  category: AQICategory;
  timeSlots: TimeSlotForecast[]; // Exactly 5 time slots
}

export interface PredictionResult {
  area: string;
  predictedAt: string;
  overallAqi: number;
  peakAqi: number;
  category: AQICategory;
  days: DayForecast[]; // Exactly 2 days
  recommendation: string;
  recommendationSource: 'ai' | 'standard';
}

export type AQICategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

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

export interface SimulationParams {
  windDispersion: 'calm' | 'normal' | 'breezy';
  trafficProfile: 'reduced' | 'standard' | 'heavy';
}
