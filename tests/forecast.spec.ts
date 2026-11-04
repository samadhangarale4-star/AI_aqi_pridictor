import { expect, test } from '@playwright/test';

test('forecast workflow shows ten categorized slots and responds to simulation settings', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Central Downtown' })).toBeVisible();
  await expect(page.getByText('DEMO DATA • NOT LIVE READINGS')).toBeVisible();
  await expect(page.locator('input[type="range"]')).toHaveAttribute('max', '9');

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Export Brief' }).click();
  await expect(page.getByRole('button', { name: 'Report Copied!' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Target Area: Central Downtown');

  await page.getByRole('button', { name: /Hourly Forecast/ }).click();
  await expect(page.getByText('5 Standard Measurement Windows').first()).toBeVisible();
  await expect(page.locator('main').getByText('Day 1 (Tomorrow)').last()).toBeVisible();
  await expect(page.locator('main').getByText('Day 2 (Day After)').last()).toBeVisible();
  await expect(page.getByText(/±\d+ AQI \[\d+-\d+\]/).first()).toBeVisible();

  await page.getByRole('button', { name: 'All Dashboard' }).click();
  await page.getByRole('textbox', { name: 'Search city or sensor station...' }).fill('Delhi');
  await page.getByRole('button', { name: 'Forecast', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Delhi' })).toBeVisible();

  await page.getByRole('button', { name: 'Simulation' }).click();
  await page.getByRole('button', { name: 'breezy', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Delhi' })).toBeVisible();
});
