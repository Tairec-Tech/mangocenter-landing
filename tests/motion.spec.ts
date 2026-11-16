import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://ve.dolarapi.com/**', route => route.fulfill({ json: { promedio: 911.62, fechaActualizacion: new Date().toISOString() } }));
});

for (const width of [390, 1440]) test(`BCV stays aligned and reaches the latest amount during rapid input at ${width}px`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  await expect(page.locator('#hero-calc-bs-result')).toHaveText('Bs. 22.790,50');
  await page.locator('#hero-calc-usd').scrollIntoViewIfNeeded();
  const samples = await page.evaluate(async () => {
    const input = document.querySelector<HTMLInputElement>('#hero-calc-usd')!;
    const output = document.querySelector<HTMLOutputElement>('#hero-calc-bs-result')!;
    const sample = () => {
      const a = input.getBoundingClientRect(), b = output.getBoundingClientRect();
      return { x: a.x, width: a.width, outputX: b.x, outputWidth: b.width, font: getComputedStyle(output).fontSize, children: output.children.length, value: output.textContent! };
    };
    const result = [sample()];
    let started = performance.now();
    let lastValue = '';
    await new Promise<void>(resolve => {
      const tick = () => {
        const elapsed = performance.now() - started;
        const value = elapsed < 70 ? '1' : elapsed < 140 ? '10' : '102';
        if (lastValue !== value) { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); lastValue = value; }
        result.push(sample());
        if (elapsed < 650) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    return result;
  });
  const initial = samples[0]!;
  for (const sample of samples) {
    expect(Math.abs(sample.x - initial.x)).toBeLessThan(1);
    expect(Math.abs(sample.width - initial.width)).toBeLessThan(1);
    expect(Math.abs(sample.outputX - initial.outputX)).toBeLessThan(1);
    expect(Math.abs(sample.outputWidth - initial.outputWidth)).toBeLessThan(1);
    expect(sample.font).toBe(initial.font);
    expect(sample.children).toBe(0);
  }
  expect(new Set(samples.map(sample => sample.value)).size).toBeGreaterThan(4);
  await expect(page.locator('#hero-calc-bs-result')).toHaveText('Bs. 92.985,24');
  await expect(page.locator('#hero-calc-announcement')).toContainText('92.985,24 bolívares');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('hero moves, pauses, resumes and reveals its title when returning home', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const liquid = page.locator('[data-liquid]');
  const initial = await liquid.getAttribute('d');
  await expect.poll(() => liquid.getAttribute('d')).not.toBe(initial);
  const pause = page.locator('#hero-motion-toggle');
  await pause.click();
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  const stopped = await liquid.getAttribute('d');
  await page.waitForTimeout(250); // Compare two times to prove a continuous animation actually stopped.
  expect(await liquid.getAttribute('d')).toBe(stopped);
  await pause.click();
  await expect.poll(() => liquid.getAttribute('d')).not.toBe(stopped);
  await page.locator('[data-hero-ctas] [data-open-catalog]').click();
  await page.locator('header [data-nav-view="inicio"]').first().click();
  await expect(page.locator('[data-hero-ctas]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-hero-line]').first()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});

test('reduced motion keeps content visible and converts without a counting animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('#hero-calc-bs-result')).toHaveText('Bs. 22.790,50');
  await expect(page.locator('#hero-motion-toggle')).toBeHidden();
  await expect(page.locator('.mc-particle').first()).toBeHidden();
  await expect(page.locator('[data-hero-ctas]')).toHaveCSS('opacity', '1');
  const value = await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>('#hero-calc-usd')!;
    input.value = '102'; input.dispatchEvent(new Event('input', { bubbles: true }));
    return document.querySelector('#hero-calc-bs-result')!.textContent;
  });
  expect(value).toBe('Bs. 92.985,24');
});
