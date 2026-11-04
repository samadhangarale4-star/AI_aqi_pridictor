import { expect, test } from '@playwright/test';

test('dashboard renders without page-level horizontal overflow at required viewport widths', async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Central Downtown' })).toBeVisible({ timeout: 15_000 });

  const results = [];
  for (const width of [1920, 1440, 1366, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(100);
    results.push(await page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      return {
        width,
        scrollWidth: document.documentElement.scrollWidth,
        overflowing: Array.from(document.querySelectorAll('body *'))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName,
              text: (element.textContent || '').trim().slice(0, 60),
              className: typeof element.className === 'string' ? element.className : '',
              right: Math.round(rect.right),
            };
          })
          .filter((element) => element.right > width + 1)
          .slice(0, 5),
      };
    }));
  }

  expect(results).toHaveLength(6);
  for (const result of results) {
    expect(result.scrollWidth, `horizontal overflow at ${result.width}px: ${JSON.stringify(result.overflowing)}`).toBeLessThanOrEqual(result.width);
  }
  expect(await page.locator('img').evaluateAll((images) =>
    images.every((image) => image.complete && image.naturalWidth > 0)
  )).toBe(true);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
