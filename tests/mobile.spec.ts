import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ hasTouch: true, isMobile: true });
test.beforeEach(async ({ page }) => {
  await page.route('https://ve.dolarapi.com/**', route => route.fulfill({ json: { promedio: 914.02, fechaActualizacion: new Date().toISOString() } }));
});

async function expectInsideViewport(page: Page, selector: string) {
  const viewport = page.viewportSize()!;
  await expect.poll(async () => {
    const box = await page.locator(selector).boundingBox();
    return !!box && box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1;
  }, { message: `${selector} should remain within the visible viewport` }).toBe(true);
}

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
  test(`mobile routes fit ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['/', '/tienda', '/contacto', '/nosotros', '/privacidad']) {
      await page.goto(route);
      await expect(page.locator('.spa-view:not(.view-hidden) h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

for (const viewport of [{ width: 320, height: 568 }, { width: 667, height: 375 }]) {
  test(`a long quote keeps totals and actions available at ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => localStorage.setItem('mc_quote_list_v2', JSON.stringify(Array.from({ length: 12 }, (_, i) => ({ productId: `prod-${i + 1}`, qty: 999 })))));
    await page.goto('/tienda');
    await page.locator('#btn-mobile-open-quote').tap();
    await expectInsideViewport(page, '#btn-send-quote-whatsapp');
    await expectInsideViewport(page, '#quote-total-usd');
    await expectInsideViewport(page, '#quote-total-bs');
    await expectInsideViewport(page, '#btn-close-quote-drawer');
    expect(await page.locator('#quote-drawer-panel').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    const body = page.locator('.mc-quote-body');
    expect(await body.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    await body.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expectInsideViewport(page, '#btn-send-quote-whatsapp');
    await page.locator('#btn-clear-quote').tap();
    await expect(page.locator('#btn-send-quote-whatsapp')).toBeDisabled();
    await expectInsideViewport(page, '#btn-undo-clear-quote');
    await page.locator('#btn-undo-clear-quote').tap();
    await expect(page.locator('#mobile-quote-count')).toHaveText(String(12 * 999));
    await page.locator('#btn-close-quote-drawer').tap();
    await expect(page.locator('#btn-mobile-open-quote')).toBeFocused();
  });
}

test('touch shopping exposes details, quantity controls, store choice and a recoverable empty list', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tienda');
  const product = page.locator('#catalog-products-grid article').first();
  await expect(product.locator('.mc-product-specs')).not.toHaveAttribute('open', '');
  await product.locator('summary').tap();
  await expect(product.locator('.mc-product-sku')).toBeVisible();
  await expect(product.locator('.t-success-check')).toBeHidden();
  await product.locator('[data-add-quote]').tap();
  await expect(product.locator('.t-success-check')).toBeVisible();
  await expect(page.locator('#btn-mobile-open-quote')).toHaveAttribute('data-has-items', 'true');
  await expect(page.locator('#floating-quote-dock')).toBeHidden();
  await page.locator('#btn-mobile-open-quote').tap();
  await page.locator('#quote-branch-select').selectOption('barinas-centro');
  await page.locator('[data-step-dir="1"]').tap();
  await expect(page.locator('#mobile-quote-count')).toHaveText('2');
  await page.locator('[data-step-dir="-1"]').tap();
  await page.locator('[data-step-dir="-1"]').tap();
  await expect(page.locator('#btn-send-quote-whatsapp')).toBeDisabled();
  await page.locator('#btn-empty-drawer-go-catalog').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.mc-quote-hours summary')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.mc-quote-hours')).toHaveAttribute('open', '');
  await page.locator('#btn-empty-drawer-go-catalog').tap();
  await expect(page.locator('#quote-drawer-root')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#view-tienda')).toBeVisible();
  await page.reload();
  await expect(page.locator('#quote-branch-select')).toHaveValue('barinas-centro');
});

test('category strips accept horizontal swipes without selecting a category or blocking vertical scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tienda');
  const tabs = page.locator('#catalog-category-tabs');
  await tabs.scrollIntoViewIfNeeded();
  const rect = (await tabs.boundingBox())!;
  const y = rect.y + rect.height / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 330, y }] });
  for (const x of [290, 230, 170, 110, 50]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => tabs.evaluate(el => el.parentElement!.scrollLeft)).toBeGreaterThan(50);
  await expect(page.locator('[data-cat-tab="todos"]')).toHaveAttribute('aria-selected', 'true');
  const scrollBefore = await page.evaluate(() => scrollY);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y }] });
  for (const dy of [30, 60, 90, 120]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y: y - dy }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore);
  await expect(page.locator('[data-cat-tab="todos"]')).toHaveAttribute('aria-selected', 'true');
  await page.locator('[data-cat-tab="tecnologia"]').tap();
  await expect(page.locator('#catalog-products-grid article')).toHaveCount(1);
});

for (const route of ['/', '/tienda', '/contacto']) test(`mobile accessibility ${route}`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
  if (route === '/tienda') {
    await page.locator('#catalog-products-grid [data-add-quote]').first().tap();
    await page.locator('#btn-mobile-open-quote').tap();
  }
  const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(report.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});
