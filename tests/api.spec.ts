import { expect, test } from '@playwright/test';

test('recommendation endpoint returns an explicitly labeled deterministic advisory without an AI key', async ({ request }) => {
  const response = await request.post('/api/recommendation', {
    data: {
      area: 'QA Test Area',
      avgAqi: 75,
      peakAqi: 96,
      category: 'Moderate',
      timeSlotsSummary: 'controlled test data',
    },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.source).toBe('standard');
  expect(body.recommendation).toContain('Air quality is acceptable');
});

test('recommendation endpoint rejects missing, out-of-range, and malformed values', async ({ request }) => {
  const missingAverage = await request.post('/api/recommendation', {
    data: { area: 'QA Test Area' },
  });
  expect(missingAverage.status()).toBe(400);
  expect((await missingAverage.json()).error).toContain('average AQI');

  const invalidAverage = await request.post('/api/recommendation', {
    data: { avgAqi: -1 },
  });
  expect(invalidAverage.status()).toBe(400);

  const invalidCategory = await request.post('/api/recommendation', {
    data: { avgAqi: 120, category: 'Made up category' },
  });
  expect(invalidCategory.status()).toBe(400);

  const invalidJson = await request.post('/api/recommendation', {
    data: '{"avgAqi":',
    headers: { 'content-type': 'application/json' },
  });
  expect(invalidJson.status()).toBe(400);
  expect((await invalidJson.json()).error).toContain('valid JSON');
});

test('unknown API routes return JSON 404 responses instead of the SPA shell', async ({ request }) => {
  const response = await request.get('/api/not-a-route');
  expect(response.status()).toBe(404);
  expect(response.headers()['content-type']).toContain('application/json');
  expect((await response.json()).error).toBe('API route not found.');
});
