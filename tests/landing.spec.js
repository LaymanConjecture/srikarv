import { test, expect } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';

test('scene controls, keyboard return, saved theme and responsive composition', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Hello, wanderer.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'false');
  await page.screenshot({ path: `qa/${testInfo.project.name}-desktop-day.png` });
  await page.getByRole('button', { name: 'Take in the view' }).click();
  await expect(page.getByRole('button', { name: 'Back to the clearing' })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Hello, wanderer.' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Take in the view' })).toBeFocused();
  await page.getByRole('button', { name: 'Pause animation' }).click();
  await expect(page.getByRole('button', { name: 'Resume animation' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Ambient sound' }).click();
  await expect(page.getByRole('button', { name: 'Ambient sound' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Ambient sound' }).click();
  await expect(page.getByRole('button', { name: 'Ambient sound' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: `qa/${testInfo.project.name}-desktop-night.png` });
  for (const width of [768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByRole('button', { name: 'Take in the view' })).toBeInViewport();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
    await page.screenshot({ path: `qa/${testInfo.project.name}-${width}-night.png` });
  }
  expect(errors).toEqual([]);
});

test('reduced motion and unavailable storage retain working controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Resume animation' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
});

test('theme synchronizes between tabs', async ({ page, context }) => {
  await page.goto('/');
  const second = await context.newPage();
  await second.goto('/');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(second.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
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
