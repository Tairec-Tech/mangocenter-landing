import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://ve.dolarapi.com/**', route => route.fulfill({ json: { promedio: 914.02, fechaActualizacion: new Date().toISOString() } }));
});

for (const width of [390, 1905]) test(`hero selects an appropriately sized image without fetching the hidden full JPG at ${width}px`, async ({ page }) => {
  const requested: string[] = [];
  page.on('request', request => requested.push(decodeURIComponent(request.url())));
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  const image = page.locator('.mc-hero-photo>img');
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const source = await image.evaluate((img: HTMLImageElement) => img.currentSrc);
  expect(source).toMatch(width === 390 ? /maracay-480\.webp$/ : /maracay-800\.webp$/);
  expect(requested.some(url => url.endsWith('/Maracay apertura.jpg'))).toBe(false);
  if (width === 390) {
    await page.locator('#btn-mobile-menu').click();
    await page.locator('#mobile-nav-dropdown [data-nav-view="nosotros"]').click();
  } else {
    await page.locator('header [data-nav-view="nosotros"]').first().click();
  }
  const branchImage = page.locator('#view-nosotros img[src="/media/maracay.webp"]');
  await branchImage.scrollIntoViewIfNeeded();
  await expect.poll(() => branchImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});

test('hero releases its animated layer and stops morphing outside the viewport and on other routes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const hero = page.locator('.mc-hero');
  const mesh = page.locator('.mc-mesh-colors');
  const liquid = page.locator('[data-liquid]');
  await expect(hero).toHaveAttribute('data-motion-state', 'running');
  await expect(mesh).toHaveCSS('will-change', 'transform');
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await expect(hero).toHaveAttribute('data-motion-state', 'paused');
  await expect(mesh).toHaveCSS('will-change', 'auto');
  const offscreen = await liquid.getAttribute('d');
  await page.waitForTimeout(250);
  expect(await liquid.getAttribute('d')).toBe(offscreen);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(hero).toHaveAttribute('data-motion-state', 'running');
  await expect.poll(() => liquid.getAttribute('d')).not.toBe(offscreen);
  await page.locator('header [data-nav-view="contacto"]').first().click();
  await expect(hero).toHaveAttribute('data-motion-state', 'paused');
  const otherRoute = await liquid.getAttribute('d');
  await page.waitForTimeout(250);
  expect(await liquid.getAttribute('d')).toBe(otherRoute);
});

test('resizing preserves a paused hero without hiding its headline or CTA', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('#hero-motion-toggle').click();
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.locator('#hero-motion-toggle')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-hero-ctas]')).toHaveCSS('opacity', '1');
  await expect(page.locator('.mc-hero h1')).toBeVisible();
  await expect(page.locator('.mc-hero')).toHaveAttribute('data-motion-state', 'paused');
  await page.locator('#hero-motion-toggle').click();
  await expect(page.locator('.mc-hero')).toHaveAttribute('data-motion-state', 'running');
});
