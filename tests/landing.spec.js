import { test, expect } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';

test('keyboard return and responsive composition', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Hello, wanderer' })).toBeVisible();
  await page.screenshot({ path: `qa/${testInfo.project.name}-desktop-day.png` });
  await page.getByRole('button', { name: 'Learn More' }).click();
  await expect(page.getByRole('button', { name: 'Back to the clearing' })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Hello, wanderer' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Learn More' })).toBeFocused();
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByRole('button', { name: 'Learn More' })).toBeInViewport();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
    await page.screenshot({ path: `qa/${testInfo.project.name}-${width}-minimal.png` });
  }
  expect(errors).toEqual([]);
});

test('public build excludes every archived article and legacy data route', async ({ request }) => {
  const files = await readdir('dist', { recursive: true });
  expect(files.some(file => /unpublished|data\.js|posts\/|internal_thoughts/.test(file))).toBe(false);
  for (const path of ['/unpublished/INDEX.json', '/unpublished/original/data.js', '/js/data.js', '/post-agi-economics.html']) {
    expect((await request.get(path)).status()).toBe(404);
  }
  const html = await readFile('dist/index.html', 'utf8');
  expect(html).not.toContain('data.js');
});
