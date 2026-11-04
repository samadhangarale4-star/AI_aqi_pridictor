import { expect, test } from '@playwright/test';

test('health guidance covers the requested groups and activities for the selected AQI slot', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Central Downtown' })).toBeVisible();

  await page.getByRole('button', { name: /Demographics & AI/ }).click();
  for (const group of [
    'General Population',
    'Children & Infants',
    'Elderly Individuals (65+)',
    'Respiratory & Asthmatic Patients',
  ]) {
    await expect(page.getByText(group, { exact: true })).toBeVisible();
  }

  await page.getByRole('button', { name: 'All Dashboard' }).click();
  await page.getByRole('button', { name: /Hourly Forecast/ }).click();
  const firstSlot = page.locator('main [role="button"]').filter({ hasText: '6:00 AM' }).first();
  const firstSlotAqi = Number(await firstSlot.locator('div.text-right > span').first().innerText());
  expect(Number.isFinite(firstSlotAqi)).toBe(true);
  await firstSlot.click();
  await page.getByRole('button', { name: /Activity Matrix/ }).click();
  await expect(page.getByText(`Activity guidance for the selected forecast slot (${firstSlotAqi} AQI).`)).toBeVisible();
  for (const activity of ['Outdoor Exercise', 'Walking & Commuting', 'Running & Jogging', 'Road & Trail Cycling', 'Outdoor Sports']) {
    await expect(page.getByText(activity, { exact: true })).toBeVisible();
  }
});

test('pollutant view and chart controls render their data visualizations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Pollutant Deep-Dive/ }).click();
  for (const pollutant of ['PM2.5', 'PM10', 'NO2', 'O3']) {
    await expect(page.getByText(pollutant, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText('Estimated Concentration (Derived)').first()).toBeVisible();

  await page.getByRole('button', { name: /Charts & Trends/ }).click();
  await expect(page.getByText('D1 6AM', { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Diurnal Compare' }).click();
  await page.getByRole('button', { name: 'Pollutant Profiles' }).click();
  await page.getByRole('button', { name: 'EPA (US Standard)' }).click();
  await expect(page.getByText('2-Day Mean AQI')).toBeVisible();
});

test('historical view contains seven clearly labeled simulated records', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /7-Day History/ }).click();
  await expect(page.getByText('Illustrative simulated history', { exact: false })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(7);
});
