import { test, expect } from '@playwright/test';
test.beforeEach(async ({page}) => {
 await page.route('https://ve.dolarapi.com/**', route => route.fulfill({json:{promedio:100,fechaActualizacion:new Date().toISOString()}}));
});
test('catalog search, category filtering, quote quantities and persistence', async ({page}) => {
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/tienda');
 await expect(page.locator('#catalog-products-grid article')).toHaveCount(12);
 await page.locator('#catalog-search-input').fill('taladro');
 await expect(page.locator('#catalog-products-grid article')).toHaveCount(1);
 await page.locator('#catalog-search-input').fill('');
 await page.locator('[data-cat-tab="tecnologia"]').click();
 await expect(page.locator('#catalog-products-grid article')).toHaveCount(1);
 await page.locator('[data-cat-tab="todos"]').click();
 await page.locator('#catalog-products-grid [data-add-quote]').first().click();
 await page.locator('#btn-open-quote-drawer').click();
 const total=Number((await page.locator('#quote-total-usd').innerText()).replace(/[^\d.]/g,''));
 await page.locator('[data-step-dir="1"]').click();
 await expect(page.locator('#header-quote-count')).toHaveText('2');
 expect(Number((await page.locator('#quote-total-usd').innerText()).replace(/[^\d.]/g,''))).toBe(total*2);
 await page.reload();await expect(page.locator('#header-quote-count')).toHaveText('2');expect(errors).toEqual([]);
});
test('contact validates and prepares message without claiming delivery', async ({page}) => {
 await page.goto('/contacto');await page.locator('#contact-whatsapp-form button[type="submit"]').click();
 await expect(page).toHaveURL(/contacto/);
 await page.locator('#contact-name').fill('Ana <script>');await page.locator('#contact-message').fill('Necesito dos taladros & una llave');
 await page.locator('#contact-whatsapp-form button[type="submit"]').click();
 await expect(page).toHaveURL(/gracias/);await expect(page.locator('#view-gracias')).toContainText('no puede confirmar la recepción');
 const href=await page.locator('#thanks-whatsapp').getAttribute('href');expect(href).toContain('https://wa.me/');expect(new URL(href!).searchParams.get('text')).toContain('Ana <script>');
 await page.goBack();await expect(page).toHaveURL(/contacto/);await expect(page.locator('#contact-name')).toHaveValue('Ana <script>');
});
test('404, privacy, metadata and browser back navigation', async ({page}) => {
 await page.goto('/ruta-inexistente');await expect(page.locator('#view-no-encontrado')).toBeVisible();await expect(page).toHaveTitle(/no encontrada/);
 await page.locator('#view-no-encontrado .mc-btn[data-nav-view="inicio"]').click();await expect(page).toHaveURL(/\/$/);
 await page.locator('footer [data-nav-view="privacidad"]').click();await expect(page).toHaveTitle(/privacidad/);await expect(page.locator('#view-privacidad h1')).toBeFocused();
 await page.goBack();await expect(page.locator('#view-inicio')).toBeVisible();
});
test('six FAQs support keyboard and map requires an explicit request', async ({page}) => {
 let mapRequests=0;await page.route('https://maps.google.com/**', route=>{mapRequests++;return route.fulfill({body:'<html><body>Map test fixture</body></html>',contentType:'text/html'})});
 await page.goto('/');await expect(page.locator('#faq-accordion-list .t-acc')).toHaveCount(6);
 const question=page.locator('#faq-accordion-list button').nth(2);await question.focus();await page.keyboard.press('Enter');await expect(question).toHaveAttribute('aria-expanded','true');
 expect(mapRequests).toBe(0);await page.getByRole('button',{name:'Cargar mapa',exact:true}).click();await expect.poll(()=>mapRequests).toBe(1);
});
test('stale and unavailable rates never claim to be current', async ({page}) => {
 await page.route('https://ve.dolarapi.com/**', route=>route.fulfill({json:{promedio:99,fechaActualizacion:'2020-01-01T00:00:00Z'}}));
 await page.goto('/');await expect(page.locator('#bcv-rate-source')).toContainText('sin actualizar');
 await page.unroute('https://ve.dolarapi.com/**');await page.route('https://ve.dolarapi.com/**',route=>route.abort());
 await page.reload();await expect(page.locator('#bcv-rate-source')).toContainText('sin actualizar');
});
for(const width of [360,390,768,1440]) test(`layout and loaded local assets at ${width}px`, async ({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 const cta=page.locator('[data-hero-ctas] [data-open-catalog]');const box=await cta.boundingBox();expect(box!.y+box!.height).toBeLessThan(900);
 await expect.poll(()=>page.locator('[data-hero-photo] img').evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
 expect(await page.evaluate(()=>[...document.fonts].some(f=>f.family.includes('Barlow')&&f.status==='loaded'))).toBe(true);
});
test('quote dialog traps keyboard focus and restores it on escape',async({page})=>{
 await page.goto('/');const opener=page.locator('#btn-open-quote-drawer');await opener.click();
 await expect(page.locator('#btn-close-quote-drawer')).toBeFocused();
 await page.keyboard.press('Shift+Tab');expect(await page.evaluate(()=>document.querySelector('#quote-drawer-root')?.contains(document.activeElement))).toBe(true);
 await page.keyboard.press('Escape');await expect(opener).toBeFocused();await expect(page.locator('#main-content')).not.toHaveAttribute('inert','');
});

test('selected quote and contact recipients survive previous map filters', async ({page}) => {
 await page.goto('/');
 await page.locator('[data-state-filter="Zulia"]').click();
 await page.locator('#btn-open-quote-drawer').click();
 await page.locator('#quote-branch-select').selectOption('barinas-centro');
 await expect(page.locator('#quote-branch-select')).toHaveValue('barinas-centro');
 await page.keyboard.press('Escape');
 await page.locator('footer [data-nav-view="contacto"]').click();
 await expect(page.locator('#contact-branch')).toHaveValue('barinas-centro');
 await page.locator('#contact-branch').selectOption('maracay');
 await expect(page.locator('#contact-branch')).toHaveValue('maracay');
 await expect(page.locator('#contact-route-hint')).toContainText('422');
});

test('quote quantities keep keyboard focus and offline totals stay unconfirmed', async ({page}) => {
 await page.route('https://ve.dolarapi.com/**',r=>r.abort());
 await page.goto('/tienda');
 await page.locator('#catalog-products-grid [data-add-quote]').first().click();
 await page.locator('#btn-open-quote-drawer').click();
 const increment=page.locator('[data-step-dir="1"]').first();
 await increment.focus();await page.keyboard.press('Enter');
 await expect(increment).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('#header-quote-count')).toHaveText('3');
 await expect(page.locator('#quote-total-bs')).toHaveText('Por confirmar');
 await expect(page.locator('#quote-rate-note')).toContainText('Tasa sin actualizar');
 await page.evaluate(()=>{window.open=(url)=>{(window as any).__quoteUrl=String(url);return null;}});
 await page.locator('#btn-send-quote-whatsapp').click();
 const prepared=await page.evaluate(()=>(window as any).__quoteUrl as string);
 expect(new URL(prepared).searchParams.get('text')).toContain('Tasa sin actualizar');
});

test('mobile store selection exposes its detail and WhatsApp action', async ({page}) => {
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.locator('[data-select-branch="barinas-centro"]').click();
 const panel=page.locator('#store-detail-panel');
 await expect(panel).toBeFocused();await expect(panel).toContainText('Barinas');
 await expect.poll(async()=>{const b=await panel.boundingBox();return b!.y>=0&&b!.y<300}).toBe(true);
});

test('contact completion starts at the heading with normal motion', async ({page}) => {
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:390,height:844});await page.goto('/contacto');
 await page.locator('#contact-name').fill('Ana Pérez');await page.locator('#contact-message').fill('Necesito una cotización');
 await page.locator('#contact-whatsapp-form button[type="submit"]').click();
 await expect(page).toHaveURL(/gracias/);
 await expect(page.locator('#view-gracias h1')).toBeInViewport();
 await expect(page.locator('#view-gracias')).toContainText('3 horas de atención');
 await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0);
});

test('clearing a saved quote can be undone with its quantities intact',async({page})=>{
 await page.goto('/tienda');
 await page.locator('#catalog-products-grid [data-add-quote]').first().click();
 await page.locator('#btn-open-quote-drawer').click();
 await page.locator('[data-step-dir="1"]').click();
 const previous=await page.locator('#quote-total-usd').innerText();
 await page.locator('#btn-clear-quote').click();
 await expect(page.locator('#header-quote-count')).toHaveText('0');
 await expect(page.locator('#btn-undo-clear-quote')).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#quote-total-usd')).toHaveText(previous);
 await expect(page.locator('#header-quote-count')).toHaveText('2');
 await page.reload();await expect(page.locator('#header-quote-count')).toHaveText('2');
});
