import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const route of ['/', '/tienda', '/contacto', '/privacidad']) {
 test(`accessibility ${route}`, async ({page}) => {
  await page.route('https://ve.dolarapi.com/**',r=>r.abort());
  await page.goto(route);await page.locator('#catalog-products-grid article').first().waitFor({state:'attached'});await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('.spa-view:not(.view-hidden) h1')).toBeVisible();
  if (route === '/') await expect(page.locator('[data-hero-ctas]')).toHaveCSS('opacity','1');
  const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(report.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
 });
}
