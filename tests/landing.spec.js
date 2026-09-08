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
  await expect(page.getByRole('region', { name: 'World map', exact: true })).toBeFocused();
  await expect(page.locator('#landmarks > *')).toHaveCount(8);
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

test('night brings a flying owl that settles, can be quieted, and leaves at day', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Night mode' });
  const owl = page.getByRole('button', { name: 'Owl sounds' });
  await expect(owl).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(owl).toHaveClass(/is-flying/);
  await expect(owl).toHaveAttribute('aria-pressed', 'true');
  await expect(owl).toHaveClass(/is-settled/, { timeout: 10000 });
  await expect(page.locator('.owl-rest')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: `qa/${testInfo.project.name}-owl-night.png` });
  await owl.click();
  await expect(owl).toHaveAttribute('aria-pressed', 'false');
  await owl.click();
  await expect(owl).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(owl).toHaveClass(/is-settled/);
  await expect(owl).toHaveAttribute('aria-pressed', 'false');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(owl).toBeInViewport();
  await page.screenshot({ path: `qa/${testInfo.project.name}-owl-mobile.png` });
  await toggle.click();
  await expect(owl).toBeHidden();
  expect(errors).toEqual([]);
});

test('rapid theme changes cancel flight and audio; reduced motion settles immediately', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Night mode' });
  const owl = page.getByRole('button', { name: 'Owl sounds' });
  await toggle.click();
  await toggle.click();
  await expect(owl).toBeHidden();
  await expect(page.locator('#owl')).toHaveAttribute('aria-pressed', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await toggle.click();
  await expect(owl).toHaveClass(/is-settled/);
  await expect(owl).not.toHaveClass(/is-flying/);
  await owl.click();
  await expect(owl).toHaveAttribute('aria-pressed', 'false');
});

test('blocked storage still supports night and second tabs never autoplay', async ({ page, context }) => {
  await page.goto('/');
  const second = await context.newPage();
  await second.goto('/');
  await page.getByRole('button', { name: 'Night mode' }).click();
  await expect(second.getByRole('button', { name: 'Night mode' })).toHaveAttribute('aria-pressed', 'true');
  await expect(second.getByRole('button', { name: 'Owl sounds' })).toHaveAttribute('aria-pressed', 'false');
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
  });
  await page.reload();
  await page.getByRole('button', { name: 'Night mode' }).click();
  await expect(page.getByRole('button', { name: 'Night mode' })).toHaveAttribute('aria-pressed', 'true');
});

test('owl feet stay attached to the artwork branch across viewport crops', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('srikar-theme', 'dark'));
  await page.goto('/');
  for (const width of [1440, 1920, 2560, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => {
      const image = document.querySelector('.landscape-night');
      const scene = image.getBoundingClientRect();
      const sprite = document.querySelector('.owl-rest').getBoundingClientRect();
      const fit = Math.max(scene.width / 1672, scene.height / 941);
      const pos = getComputedStyle(image).objectPosition.split(' ').map(v => parseFloat(v) / 100);
      const branchX = scene.left + (scene.width - 1672 * fit) * pos[0] + 980 * fit;
      const branchY = scene.top + (scene.height - 941 * fit) * pos[1] + 74 * fit;
      return Math.hypot(sprite.left + sprite.width / 2 - branchX, sprite.top + sprite.height * .88 - branchY);
    })).toBeLessThan(1.5);
    await expect(page.getByRole('button', { name: 'Owl sounds' })).toBeInViewport();
  }
});
