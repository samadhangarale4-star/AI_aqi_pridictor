import { expect, test } from '@playwright/test';

test('measures application, dashboard, recommendation API, and chart readiness', async ({ page, request }) => {
  const apiRequests: string[] = [];
  page.on('request', (requestEvent) => apiRequests.push(requestEvent.url()));

  const navigationStartedAt = performance.now();
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  const navigationFinishedAt = performance.now();

  await expect(page.getByRole('heading', { name: 'Central Downtown' })).toBeVisible();
  await expect(page.getByText('DEMO DATA • NOT LIVE READINGS')).toBeVisible();
  const dashboardReadyAt = performance.now();
  expect(apiRequests.filter((url) => url.includes('/api/recommendation'))).toHaveLength(1);

  await page.getByRole('button', { name: /Charts & Trends/ }).click();
  await expect(page.getByText('D1 6AM', { exact: true })).toBeVisible();
  const chartsReadyAt = performance.now();

  const apiStartedAt = performance.now();
  const apiResponse = await request.post('/api/recommendation', {
    data: { avgAqi: 70, peakAqi: 90, category: 'Moderate' },
  });
  const apiDurationMs = performance.now() - apiStartedAt;
  expect(apiResponse.status()).toBe(200);

  const navigation = await page.evaluate(() => {
    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoadedMs: Math.round(entry.domContentLoadedEventEnd),
      loadEventMs: Math.round(entry.loadEventEnd),
    };
  });

  console.log(JSON.stringify({
    navigationResponseMs: Math.round(navigationFinishedAt - navigationStartedAt),
    dashboardReadyMs: Math.round(dashboardReadyAt - navigationStartedAt),
    chartReadyMs: Math.round(chartsReadyAt - dashboardReadyAt),
    recommendationApiMs: Math.round(apiDurationMs),
    navigation,
  }));
});
