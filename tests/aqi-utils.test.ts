import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  generateForecast,
  generateWeeklyWeatherOutlook,
  getCategoryFromAQI,
  getIndianCategoryFromAQI,
} from '../src/utils/aqi.ts';

test('EPA AQI category thresholds map boundary values correctly', () => {
  const expected = [
    [0, 'Good'],
    [50, 'Good'],
    [51, 'Moderate'],
    [100, 'Moderate'],
    [101, 'Unhealthy for Sensitive Groups'],
    [150, 'Unhealthy for Sensitive Groups'],
    [151, 'Unhealthy'],
    [200, 'Unhealthy'],
    [201, 'Very Unhealthy'],
    [300, 'Very Unhealthy'],
    [301, 'Hazardous'],
    [500, 'Hazardous'],
  ] as const;

  for (const [aqi, category] of expected) {
    assert.equal(getCategoryFromAQI(aqi), category);
  }
});

test('AQI categorization rejects non-finite and out-of-range values', () => {
  for (const aqi of [Number.NaN, Number.POSITIVE_INFINITY, -1, 501]) {
    assert.throws(() => getCategoryFromAQI(aqi), RangeError);
    assert.throws(() => getIndianCategoryFromAQI(aqi), RangeError);
  }
});

test('forecast generation returns two valid days with five consistent slots each', () => {
  const forecast = generateForecast('Central Downtown');

  assert.equal(forecast.days.length, 2);
  assert.deepEqual(forecast.days.map((day) => day.timeSlots.length), [5, 5]);
  assert.equal(forecast.days[0].dayTitle, 'Day 1 (Tomorrow)');
  assert.equal(forecast.days[1].dayTitle, 'Day 2 (Day After)');

  for (const day of forecast.days) {
    const values = day.timeSlots.map((slot) => slot.aqi);
    assert.equal(day.averageAqi, Math.round(values.reduce((sum, value) => sum + value, 0) / values.length));
    assert.equal(day.peakAqi, Math.max(...values));

    for (const slot of day.timeSlots) {
      assert.ok(slot.aqi >= 12 && slot.aqi <= 480);
      assert.equal(slot.category, getCategoryFromAQI(slot.aqi));
      assert.equal(slot.indianCategory, getIndianCategoryFromAQI(slot.aqi));
      assert.ok(slot.confidenceLower <= slot.aqi);
      assert.ok(slot.confidenceUpper >= slot.aqi);
    }
  }
});

test('seven-day outlook weekday and calendar labels match the generated dates', () => {
  const outlook = generateWeeklyWeatherOutlook('Central Downtown', 100);
  const today = new Date();

  assert.equal(outlook.length, 7);
  for (const [index, day] of outlook.entries()) {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    assert.equal(day.dayShort, date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase());
    assert.equal(
      day.dateFormatted,
      `${date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()} ${date.getDate()}`
    );
  }
});
