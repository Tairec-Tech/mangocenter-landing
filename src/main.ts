import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import {
  CATEGORIES,
  PRODUCTS,
  STORES,
  EVENTS,
  FAQS,
  HERO_SLIDES,
  ODOO_COURSES,
  ODOO_USER_PROFILE,
  ODOO_SLIDES_URL,
  FALLBACK_BCV_RATE,
  type Product,
  type StoreBranch,
  type OdooCourse,
} from './data';
import {
  initGsapAnimations,
  animateFilteredItems,
  pulseElement,
  refreshScrollAnimations,
} from './animations';

type AppView = 'inicio' | 'tienda' | 'nosotros' | 'contacto' | 'cursos';

interface QuoteItem {
  productId: string;
  qty: number;
}

type SoftSwapElement = HTMLElement & { _softTimer?: number };

const STORAGE_QUOTE_KEY = 'mc_quote_list_v2';
const STORAGE_BRANCH_KEY = 'mc_selected_branch_v2';

// Application State
let currentView: AppView = 'inicio';
let bcvRate: number = FALLBACK_BCV_RATE;
let bcvIsLive = false;
let heroCalcUsd = 25;

let activeHeroSlideIndex = 0;
let activeCatalogCategory = 'todos';
let activeCatalogSearch = '';
let activeCatalogSort: 'featured' | 'price-asc' | 'price-desc' = 'featured';

let activeStoreStateFilter = 'Todas';
let selectedStoreId: string = loadSelectedBranchId();
let branchDistancesKm = new Map<string, number>();

let activeCourseFilter: 'todos' | 'populares' | 'recientes' = 'todos';
let activeCourseSearch = '';
let selectedCourseId: string = ODOO_COURSES[0]?.id ?? '';
let collaboratorDemoUnlocked = false;

let quoteItems: QuoteItem[] = loadQuoteItems();

// Google Maps runtime handles
let googleMapInstance: google.maps.Map | null = null;
let googleMarkers = new Map<string, google.maps.Marker>();
let mapsInitialized = false;

// UI Timers & Focus Return
let toastTimer: number | undefined;
let lastFocusedBeforeDrawer: HTMLElement | null = null;
let lastFocusedBeforeModal: HTMLElement | null = null;
const inputRevertTimers = new Map<string, number>();
const tabSyncCallbacks: Array<() => void> = [];

/* ==========================================================================
   1. PERSISTENCE & FORMATTING HELPERS
   ========================================================================== */
function loadQuoteItems(): QuoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_QUOTE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is QuoteItem =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as QuoteItem).productId === 'string' &&
          typeof (item as QuoteItem).qty === 'number' &&
          (item as QuoteItem).qty > 0 &&
          PRODUCTS.some((p) => p.id === (item as QuoteItem).productId)
      )
      .map((item) => ({ productId: item.productId, qty: Math.min(999, Math.floor(item.qty)) }));
  } catch {
    return [];
  }
}

function saveQuoteItems(): void {
  try {
    localStorage.setItem(STORAGE_QUOTE_KEY, JSON.stringify(quoteItems));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

function loadSelectedBranchId(): string {
  try {
    const saved = localStorage.getItem(STORAGE_BRANCH_KEY);
    if (saved && STORES.some((s) => s.id === saved)) return saved;
  } catch {
    // Ignore
  }
  return STORES[0].id;
}

function saveSelectedBranchId(id: string): void {
  selectedStoreId = id;
  try {
    localStorage.setItem(STORAGE_BRANCH_KEY, id);
  } catch {
    // Ignore
  }
}

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatBs(usdAmount: number): string {
  const totalBs = usdAmount * bcvRate;
  return totalBs.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatRateVe(rate: number): string {
  return rate.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatWhatsappDisplay(rawNumber: string): string {
  if (rawNumber === '584245956627') return '+58 424-5956627 (Barinas)';
  return '+58 422-6264623 (0422-MANGOCE)';
}

/* ==========================================================================
   2. VENEZUELA TIMEZONE (AMERICA/CARACAS) CLOCK, OPEN STATUS & HAVERSINE
   ========================================================================== */
interface BranchLiveStatus {
  isOpen: boolean;
  label: string;
  todayHours: string;
}

function updateVenezuelaClock(): void {
  const clockEl = document.getElementById('ve-live-clock');
  if (!clockEl) return;
  try {
    const nowStr = new Intl.DateTimeFormat('es-VE', {
      timeZone: 'America/Caracas',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
    clockEl.textContent = nowStr;
  } catch {
    clockEl.textContent = 'UTC-4';
  }
}

function getVenezuelaBranchStatus(branch: StoreBranch): BranchLiveStatus {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Caracas',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
    const hourRaw = Number(parts.find((p) => p.type === 'hour')?.value ?? '12');
    const minuteRaw = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
    const hour = hourRaw === 24 ? 0 : hourRaw;
    const decimalHour = hour + minuteRaw / 60;

    const isSunday = weekday === 'Sun';
    const openAt = isSunday ? branch.sundayOpenHour : branch.openHour;
    const closeAt = isSunday ? branch.sundayCloseHour : branch.closeHour;
    const isOpen = decimalHour >= openAt && decimalHour < closeAt;

    return {
      isOpen,
      label: isOpen ? 'Abierta ahora (VE)' : 'Cerrada en este momento',
      todayHours: isSunday ? branch.hoursSunday : branch.hoursWeek,
    };
  } catch {
    return {
      isOpen: true,
      label: 'Horario habitual activo',
      todayHours: branch.hoursWeek,
    };
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ==========================================================================
   3. TRANSITIONS-DEV REUSABLE ORCHESTRATION HOOKS
   ========================================================================== */

/**
 * 02-number-pop-in.md: Updates numeric string digit-by-digit, keeping unchanged
 * leading digits still via [data-same] and staggering the final two characters.
 */
function setAnimatedDigits(group: HTMLElement | null, nextText: string): void {
  if (!group) return;
  const prev = (group.textContent ?? '').trim();
  let same = 0;
  while (same < prev.length && same < nextText.length && prev[same] === nextText[same]) {
    same++;
  }

  group.classList.remove('is-animating');
  group.replaceChildren();

  const chars = Array.from(nextText);
  chars.forEach((ch, idx) => {
    const span = document.createElement('span');
    span.className = 't-digit';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    if (idx < same) {
      span.setAttribute('data-same', '');
    } else if (idx === chars.length - 2) {
      span.setAttribute('data-stagger', '1');
    } else if (idx === chars.length - 1) {
      span.setAttribute('data-stagger', '2');
    }
    group.appendChild(span);
  });

  void group.offsetWidth;
  group.classList.add('is-animating');
}

/**
 * 34-text-swap-soft.md: Cross-blurs old value into new value in place while easing width.
 */
function softSwap(el: SoftSwapElement | null, next: string): void {
  if (!el) return;
  const prev = el.dataset.text ?? el.textContent ?? '';
  if (prev === next) return;
  el.dataset.text = next;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = next;
    return;
  }

  if (el._softTimer) window.clearTimeout(el._softTimer);

  const out = document.createElement('span');
  out.className = 't-text-soft-old';
  out.setAttribute('aria-hidden', 'true');
  out.textContent = prev;

  const inn = document.createElement('span');
  inn.className = 't-text-soft-new';
  inn.textContent = next;

  const w0 = el.getBoundingClientRect().width;
  el.classList.remove('is-swapping');
  el.replaceChildren(out, inn);
  const w1 = inn.getBoundingClientRect().width;

  if (w0 > 0 && w1 > 0) {
    el.style.width = `${w0}px`;
    void el.offsetWidth;
    el.classList.add('is-swapping');
    el.style.width = `${w1}px`;
  } else {
    el.classList.add('is-swapping');
  }

  el._softTimer = window.setTimeout(() => {
    el.classList.remove('is-swapping');
    el.style.width = '';
    el.textContent = next;
  }, 250);
}

/**
 * 16-tabs-sliding.md: Wires sliding active pill + keyboard WAI-ARIA arrow support.
 */
function setupSlidingTabs(
  barEl: HTMLElement | null,
  onSelect: (tab: HTMLButtonElement) => void
): () => void {
  if (!barEl) return () => {};
  const pill = barEl.querySelector<HTMLElement>('.t-tabs-pill');
  const getTabs = () => Array.from(barEl.querySelectorAll<HTMLButtonElement>('.t-tab'));

  const moveTo = (tab: HTMLButtonElement | undefined, animate: boolean) => {
    if (!pill || !tab) return;
    if (tab.offsetWidth === 0) return;
    barEl.setAttribute('data-pill-ready', 'true');
    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = 'none';
      pill.style.transform = `translateX(${tab.offsetLeft}px)`;
      pill.style.width = `${tab.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${tab.offsetLeft}px)`;
      pill.style.width = `${tab.offsetWidth}px`;
    }
  };

  const getActive = () => {
    const tabs = getTabs();
    return tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0];
  };

  barEl.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>('.t-tab');
    if (!target || !barEl.contains(target)) return;
    getTabs().forEach((t) => t.setAttribute('aria-selected', t === target ? 'true' : 'false'));
    moveTo(target, true);
    onSelect(target);
  });

  barEl.addEventListener('keydown', (e) => {
    const tabs = getTabs();
    if (!tabs.length) return;
    const currentIndex = tabs.findIndex((t) => t === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = -1;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== -1) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      nextTab.focus();
      nextTab.click();
    }
  });

  const sync = () => moveTo(getActive(), false);
  requestAnimationFrame(sync);
  tabSyncCallbacks.push(sync);
  return sync;
}

/**
 * Cursor-tracked radial spotlight on .mc-spotlight surfaces
 */
function bindSpotlightCards(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('.mc-spotlight').forEach((card) => {
    if (card.dataset.spotBound === 'true') return;
    card.dataset.spotBound = 'true';

    card.addEventListener('pointermove', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${(e.clientX - rect.left).toFixed(0)}px`);
      card.style.setProperty('--spot-y', `${(e.clientY - rect.top).toFixed(0)}px`);
    });
  });
}

/**
 * 19-card-tilt.md: Pointer-tracked 3D card tilt on fine pointer (mouse) with glare.
 */
function bindCardTilt(container: HTMLElement | null): void {
  if (!container) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MAX_DEG = 7;

  container.querySelectorAll<HTMLElement>('.t-tilt').forEach((tiltEl) => {
    if (tiltEl.dataset.tiltBound === 'true') return;
    tiltEl.dataset.tiltBound = 'true';

    const card = tiltEl.querySelector<HTMLElement>('.t-tilt-card');
    if (!card) return;

    const reset = () => {
      tiltEl.classList.remove('is-hover');
      card.classList.remove('is-tilting');
      card.style.setProperty('--tilt-rx', '0deg');
      card.style.setProperty('--tilt-ry', '0deg');
    };

    tiltEl.addEventListener('pointermove', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
      const rect = tiltEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      tiltEl.classList.add('is-hover');
      card.classList.add('is-tilting');
      card.style.setProperty('--tilt-ry', `${((px - 0.5) * MAX_DEG).toFixed(2)}deg`);
      card.style.setProperty('--tilt-rx', `${((0.5 - py) * MAX_DEG).toFixed(2)}deg`);
      card.style.setProperty('--tilt-gx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--tilt-gy', `${(py * 100).toFixed(1)}%`);
    });

    tiltEl.addEventListener('pointerleave', reset);
    tiltEl.addEventListener('pointercancel', reset);
  });
}

/**
 * 12-error-state-shake.md: Percussive horizontal shake + accessible error reveal.
 */
function triggerFieldError(wrapId: string, shakeId: string, fieldEl: HTMLElement | null): void {
  const wrap = document.getElementById(wrapId);
  const shakeBox = document.getElementById(shakeId);
  if (!wrap || !shakeBox || !fieldEl) return;

  const existingTimer = inputRevertTimers.get(wrapId);
  if (existingTimer) window.clearTimeout(existingTimer);

  wrap.classList.add('is-error');
  shakeBox.classList.add('is-error');
  fieldEl.classList.add('is-error');
  fieldEl.setAttribute('aria-invalid', 'true');

  shakeBox.classList.remove('is-shaking');
  void shakeBox.offsetWidth;
  shakeBox.classList.add('is-shaking');

  const clearError = () => {
    wrap.classList.remove('is-error');
    shakeBox.classList.remove('is-error', 'is-shaking');
    fieldEl.classList.remove('is-error');
    fieldEl.removeAttribute('aria-invalid');
  };

  fieldEl.addEventListener('input', clearError, { once: true });
  const revertId = window.setTimeout(clearError, 4200);
  inputRevertTimers.set(wrapId, revertId);
}

/**
 * 22-toast.md: Toast feedback with asymmetric 350ms open / 250ms close.
 */
function showToast(message: string): void {
  const toastEl = document.getElementById('app-toast');
  const msgEl = document.getElementById('app-toast-message');
  if (!toastEl || !msgEl) return;

  msgEl.textContent = message;
  toastEl.classList.add('is-open');

  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove('is-open');
  }, 2900);
}

/* ==========================================================================
   4. LIVE BCV RATE FETCH, HERO QUICK CALCULATOR & PRICE PROPAGATION
   ========================================================================== */
function updateHeroCalcResult(animate = true): void {
  const resultEl = document.getElementById('hero-calc-bs-result') as SoftSwapElement | null;
  if (!resultEl) return;
  const formatted = `Bs. ${formatBs(heroCalcUsd)}`;
  if (animate) {
    softSwap(resultEl, formatted);
  } else {
    resultEl.dataset.text = formatted;
    resultEl.textContent = formatted;
  }
}

function initHeroBcvCalculator(): void {
  const usdInput = document.getElementById('hero-calc-usd') as HTMLInputElement | null;
  const presets = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-calc-preset]'));

  const syncPresetStyles = (val: number) => {
    presets.forEach((btn) => {
      const pVal = Number(btn.dataset.calcPreset ?? '0');
      const active = pVal === val;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  presets.forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = Number(btn.dataset.calcPreset ?? '25');
      heroCalcUsd = val;
      if (usdInput) usdInput.value = String(val);
      syncPresetStyles(val);
      updateHeroCalcResult(true);
    });
  });

  usdInput?.addEventListener('input', () => {
    const parsed = Math.max(0, Math.min(999999, Number(usdInput.value) || 0));
    heroCalcUsd = parsed;
    syncPresetStyles(parsed);
    updateHeroCalcResult(true);
  });

  updateHeroCalcResult(false);
}

async function syncLiveBcvRate(): Promise<void> {
  const rateValEl = document.getElementById('bcv-rate-value');
  const rateSourceEl = document.getElementById('bcv-rate-source');
  const heroLedgerVal = document.getElementById('hero-ledger-bcv');
  const heroLedgerNote = document.getElementById('hero-ledger-bcv-note');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4500);

  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      signal: controller.signal,
    });
    window.clearTimeout(timeout);
    if (!res.ok) throw new Error('HTTP status error');
    const data = (await res.json()) as { promedio?: number; fechaActualizacion?: string };

    if (typeof data.promedio === 'number' && data.promedio > 1) {
      bcvRate = Number(data.promedio.toFixed(2));
      bcvIsLive = true;
      const formatted = `Bs. ${formatRateVe(bcvRate)}`;
      setAnimatedDigits(rateValEl, formatted);
      if (rateSourceEl) rateSourceEl.textContent = '· Oficial BCV hoy';
      if (heroLedgerVal) heroLedgerVal.textContent = formatted;
      if (heroLedgerNote) heroLedgerNote.textContent = 'Tasa oficial sincronizada al día';
      refreshAllVisibleBsAmounts();
      return;
    }
    throw new Error('Invalid payload');
  } catch {
    window.clearTimeout(timeout);
    bcvIsLive = false;
    const fallbackFormatted = `Bs. ${formatRateVe(bcvRate)}`;
    if (rateValEl) rateValEl.textContent = fallbackFormatted;
    if (rateSourceEl) rateSourceEl.textContent = '· Ref. mostrador';
    if (heroLedgerVal) heroLedgerVal.textContent = fallbackFormatted;
    if (heroLedgerNote) heroLedgerNote.textContent = 'Referencia local · se valida en caja';
    refreshAllVisibleBsAmounts();
  }
}

function refreshAllVisibleBsAmounts(): void {
  document.querySelectorAll<HTMLElement>('[data-bs-usd]').forEach((el) => {
    const usd = Number(el.dataset.bsUsd ?? '0');
    if (Number.isFinite(usd)) {
      el.textContent = `Bs. ${formatBs(usd)} BCV`;
    }
  });
  updateHeroCalcResult(true);
  renderQuoteDrawerContents();
  syncQuoteCountersAndCards();
  updateCatalogMetaSummary();
}

/* ==========================================================================
   5. HERO SHOWCASE (SLIDING TABS + REAL PHOTOGRAPHY)
   ========================================================================== */
function initHeroShowcase(): void {
  const tabsBar = document.getElementById('hero-showcase-tabs');
  const imgEl = document.getElementById('hero-showcase-img') as HTMLImageElement | null;
  const titleEl = document.getElementById('hero-showcase-title');
  const captionEl = document.getElementById('hero-showcase-caption');
  const metaEl = document.getElementById('hero-showcase-meta') as SoftSwapElement | null;
  const actionBtn = document.getElementById('hero-showcase-action');
  const actionLabel = document.getElementById('hero-showcase-action-label');

  if (!tabsBar || !imgEl || !titleEl || !captionEl || !metaEl || !actionBtn || !actionLabel) return;

  HERO_SLIDES.forEach((slide, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 't-tab !min-h-[34px] !px-3 !py-1 !text-xs';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    btn.dataset.slideIdx = String(idx);
    btn.textContent = slide.tabLabel;
    tabsBar.appendChild(btn);
  });

  const applySlide = (index: number) => {
    const slide = HERO_SLIDES[index] ?? HERO_SLIDES[0];
    activeHeroSlideIndex = index;
    imgEl.style.opacity = '0.35';
    window.setTimeout(() => {
      imgEl.src = slide.image;
      imgEl.alt = slide.alt;
      imgEl.style.opacity = '1';
    }, 90);
    titleEl.textContent = slide.title;
    captionEl.textContent = slide.caption;
    softSwap(metaEl, slide.meta);
    actionLabel.textContent = slide.actionLabel;
  };

  setupSlidingTabs(tabsBar, (tab) => {
    const idx = Number(tab.dataset.slideIdx ?? '0');
    applySlide(idx);
  });

  actionBtn.addEventListener('click', () => {
    const slide = HERO_SLIDES[activeHeroSlideIndex] ?? HERO_SLIDES[0];
    if (slide.actionTarget === 'tienda') {
      switchView('tienda');
    } else if (slide.actionTarget === 'eventos') {
      navigateToSectionOnHome('landing-eventos');
    } else {
      navigateToSectionOnHome('landing-mapa-sedes');
    }
  });
}

/* ==========================================================================
   6. ASYMMETRIC 5-WORLDS ARCHITECTURAL MOSAIC (SPOTLIGHT + COLOR BEAMS)
   ========================================================================== */
function renderWorldsMosaic(): void {
  const grid = document.getElementById('worlds-mosaic-grid');
  if (!grid) return;

  const spanMap: Record<string, string> = {
    ferreteria: 'md:col-span-6 lg:col-span-6 lg:row-span-2 min-h-[330px] lg:min-h-[440px]',
    construccion: 'md:col-span-6 lg:col-span-6 min-h-[215px]',
    hogar: 'md:col-span-3 lg:col-span-3 min-h-[215px]',
    agro: 'md:col-span-3 lg:col-span-3 min-h-[215px]',
    tecnologia: 'md:col-span-3 lg:col-span-6 min-h-[205px]',
    electricidad: 'md:col-span-3 lg:col-span-6 min-h-[205px]',
  };

  const beamColorMap: Record<Category['tone'], string> = {
    blue: 'bg-[#09569A]',
    red: 'bg-[#DF2726]',
    teal: 'bg-[#3B9B8E]',
  };

  const badgeBgMap: Record<Category['tone'], string> = {
    blue: 'bg-[#09569A]',
    red: 'bg-[#DF2726]',
    teal: 'bg-[#216E63]',
  };

  grid.innerHTML = CATEGORIES.map((cat, index) => {
    const spanClasses = spanMap[cat.id] ?? 'md:col-span-3 lg:col-span-4 min-h-[215px]';
    const countInCatalog = PRODUCTS.filter((p) => p.category === cat.slug).length;
    const isFeatured = index === 0;
    const beamClass = beamColorMap[cat.tone];
    const badgeClass = badgeBgMap[cat.tone];

    return `
      <button
        type="button"
        data-stagger-card
        data-world-slug="${cat.slug}"
        class="mc-spotlight t-learn group relative overflow-hidden rounded-[16px] bg-[#053563] text-left text-white p-6 sm:p-7 flex flex-col justify-between shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] cursor-pointer ${spanClasses}"
      >
        <div class="absolute inset-0 mc-photo-frame">
          <img
            src="${cat.image}"
            alt="${escapeHtml(cat.name)}"
            loading="lazy"
            class="${isFeatured ? 'js-parallax-img ' : ''}w-full h-full object-cover opacity-65 group-hover:scale-[1.04] transition-transform duration-[400ms]"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#051B33]/95 via-[#051B33]/60 to-[#051B33]/20"></div>
        </div>

        <div class="relative z-10 w-full flex items-center justify-between gap-3">
          <span class="w-10 h-10 rounded-[8px] ${badgeClass} text-white flex items-center justify-center shadow-[var(--shadow-card)]">
            ${cat.iconSvg}
          </span>
          <span class="font-mono text-xs font-semibold text-white/90 bg-[#111924]/70 px-2.5 py-1 rounded-[6px] tabular-nums">
            ${countInCatalog} ref. BCV
          </span>
        </div>

        <div class="relative z-10 w-full mt-8">
          <h3 class="text-white ${isFeatured ? '!text-2xl sm:!text-3xl' : '!text-xl'} font-extrabold">
            ${escapeHtml(cat.name)}
          </h3>
          <p class="mt-1.5 text-sm text-[#DCEBFA] max-w-[46ch] line-clamp-2">
            ${escapeHtml(cat.subtitle)}
          </p>
          <div class="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-2 text-xs font-semibold">
            <span class="font-mono text-[#F5B800] tabular-nums">${escapeHtml(cat.itemCountLabel)}</span>
            <span class="inline-flex items-center gap-1 text-white font-bold">
              <span>Explorar</span>
              <span class="t-learn-chevron" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path class="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
                  <path class="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
                </svg>
              </span>
            </span>
          </div>
        </div>

        <span class="mc-world-beam ${beamClass}" aria-hidden="true"></span>
      </button>
    `;
  }).join('');

  bindSpotlightCards(grid);

  grid.querySelectorAll<HTMLButtonElement>('[data-world-slug]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.dataset.worldSlug ?? 'todos';
      openCatalogWithCategory(slug);
    });
  });
}

type Category = (typeof CATEGORIES)[number];

/* ==========================================================================
   7. BCV REFERENCE CATALOG & PRODUCT CARDS (WITH SUCCESS CHECK + TILT)
   ========================================================================== */
function createProductCardMarkup(product: Product): string {
  const existingQty = quoteItems.find((item) => item.productId === product.id)?.qty ?? 0;
  const offerPill =
    product.isOffer && product.offerLabel
      ? `<span class="bg-[#DF2726] text-white text-xs font-bold px-2 py-0.5 rounded-[6px] tabular-nums">${escapeHtml(product.offerLabel)}</span>`
      : '';
  const oldPriceHtml =
    typeof product.oldPrice === 'number'
      ? `<del class="text-xs text-[#5E6B7C] font-normal ml-1.5 tabular-nums">${formatUsd(product.oldPrice)}</del>`
      : '';

  return `
    <div class="t-tilt h-full" data-stagger-card>
      <article class="t-tilt-card mc-card mc-card--interactive mc-concentric-lg h-full flex flex-col">
        <figure class="mc-concentric-lg-inner mc-photo-frame relative aspect-[4/3] bg-[#ECEAE3]">
          <img
            src="${product.image}"
            alt="${escapeHtml(product.name)}"
            loading="lazy"
            width="600"
            height="450"
            class="w-full h-full object-cover"
          />
          <div class="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none">
            <span class="bg-[#111924]/85 text-white font-mono text-xs font-semibold px-2 py-0.5 rounded-[6px] tabular-nums">
              ${escapeHtml(product.sku)}
            </span>
            ${offerPill}
          </div>
        </figure>

        <div class="px-2 pt-3.5 pb-2 flex-1 flex flex-col">
          <h3 class="!text-base font-bold text-[#111924] leading-snug line-clamp-2">
            ${escapeHtml(product.name)}
          </h3>

          <p class="mt-1 text-xs font-semibold text-[#5E6B7C]">
            ${escapeHtml(product.brand)} · ${escapeHtml(product.unit)} · ${escapeHtml(product.stockStatus)}
          </p>

          <ul class="mt-2.5 space-y-1 text-xs text-[#435060]">
            ${product.specs
              .slice(0, 3)
              .map(
                (spec) => `
                <li class="flex items-start gap-1.5">
                  <span class="text-[#09569A] font-bold" aria-hidden="true">•</span>
                  <span>${escapeHtml(spec)}</span>
                </li>
              `
              )
              .join('')}
          </ul>

          <div class="mt-auto pt-3.5 border-t border-[#D8D5CC] flex items-end justify-between gap-2 tabular-nums">
            <div>
              <div class="flex items-baseline">
                <strong class="font-display text-xl font-extrabold text-[#111924] leading-none">
                  ${formatUsd(product.price)}
                </strong>
                ${oldPriceHtml}
              </div>
              <span
                data-bs-usd="${product.price}"
                class="block mt-1 font-mono text-xs font-semibold text-[#216E63]"
              >
                Bs. ${formatBs(product.price)} BCV
              </span>
            </div>

            <button
              type="button"
              data-add-quote="${product.id}"
              class="mc-btn ${existingQty > 0 ? 'mc-btn-primary' : 'mc-btn-secondary'} !min-h-[44px] sm:!min-h-[40px] !px-3.5 !py-2 !text-xs shrink-0"
            >
              <span class="t-success-check ${existingQty > 0 ? '' : 'hidden'} w-3.5 h-3.5" data-state="${existingQty > 0 ? 'in' : 'out'}" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2.5 8.5L6.2 12.2L13.5 4.2" />
                </svg>
              </span>
              <span data-quote-btn-label>${existingQty > 0 ? `En lista (${existingQty})` : '+ Cotizar'}</span>
            </button>
          </div>
        </div>

        <div class="t-tilt-glare" aria-hidden="true"></div>
      </article>
    </div>
  `;
}

function renderHomeFeaturedProducts(): void {
  const container = document.getElementById('home-featured-products');
  if (!container) return;

  const featuredIds = ['prod-2', 'prod-3', 'prod-5', 'prod-6'];
  const featured = featuredIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  container.innerHTML = featured.map(createProductCardMarkup).join('');
  bindCardTilt(container);
}

function getFilteredCatalogProducts(): Product[] {
  const query = activeCatalogSearch.trim().toLowerCase();

  const filtered = PRODUCTS.filter((product) => {
    const matchesCat =
      activeCatalogCategory === 'todos' || product.category === activeCatalogCategory;
    if (!matchesCat) return false;
    if (!query) return true;
    const haystack = `${product.name} ${product.brand} ${product.sku} ${product.categoryLabel} ${product.specs.join(' ')}`.toLowerCase();
    return haystack.includes(query);
  });

  if (activeCatalogSort === 'price-asc') {
    return [...filtered].sort((a, b) => a.price - b.price);
  }
  if (activeCatalogSort === 'price-desc') {
    return [...filtered].sort((a, b) => b.price - a.price);
  }
  return filtered;
}

function updateCatalogMetaSummary(countOverride?: number): void {
  const metaEl = document.getElementById('catalog-results-meta');
  if (!metaEl) return;
  const count = countOverride ?? getFilteredCatalogProducts().length;
  const rateText = formatRateVe(bcvRate);
  const statusTag = bcvIsLive ? 'BCV oficial' : 'tasa ref.';
  metaEl.textContent = `Mostrando ${count} ${count === 1 ? 'producto' : 'productos'} · Paridad Bs. ${rateText} / USD (${statusTag})`;
}

function renderCatalogGrid(animate = false): void {
  const grid = document.getElementById('catalog-products-grid');
  const emptyState = document.getElementById('catalog-empty-state');
  const clearBtn = document.getElementById('catalog-search-clear');
  if (!grid || !emptyState) return;

  if (clearBtn) {
    clearBtn.classList.toggle('hidden', activeCatalogSearch.trim().length === 0);
  }

  const list = getFilteredCatalogProducts();
  updateCatalogMetaSummary(list.length);

  if (list.length === 0) {
    grid.innerHTML = '';
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  grid.classList.remove('hidden');
  grid.innerHTML = list.map(createProductCardMarkup).join('');
  bindCardTilt(grid);

  if (animate) {
    animateFilteredItems(grid);
  }
}

let syncCatalogTabsPill: () => void = () => {};

function initCatalogControls(): void {
  const tabsBar = document.getElementById('catalog-category-tabs');
  const searchInput = document.getElementById('catalog-search-input') as HTMLInputElement | null;
  const clearBtn = document.getElementById('catalog-search-clear');
  const sortSelect = document.getElementById('catalog-sort-select') as HTMLSelectElement | null;
  const resetBtn = document.getElementById('btn-reset-catalog-filters');
  const openDrawerBtn = document.getElementById('btn-catalog-open-drawer');

  syncCatalogTabsPill = setupSlidingTabs(tabsBar, (tab) => {
    activeCatalogCategory = tab.dataset.catTab ?? 'todos';
    renderCatalogGrid(true);
  });

  searchInput?.addEventListener('input', () => {
    activeCatalogSearch = searchInput.value;
    renderCatalogGrid(false);
  });

  clearBtn?.addEventListener('click', () => {
    if (!searchInput) return;
    searchInput.value = '';
    activeCatalogSearch = '';
    searchInput.focus();
    renderCatalogGrid(true);
  });

  sortSelect?.addEventListener('change', () => {
    const val = sortSelect.value;
    if (val === 'price-asc' || val === 'price-desc' || val === 'featured') {
      activeCatalogSort = val;
      renderCatalogGrid(true);
    }
  });

  resetBtn?.addEventListener('click', () => {
    activeCatalogCategory = 'todos';
    activeCatalogSearch = '';
    activeCatalogSort = 'featured';
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'featured';
    tabsBar?.querySelectorAll<HTMLButtonElement>('.t-tab').forEach((t) => {
      t.setAttribute('aria-selected', t.dataset.catTab === 'todos' ? 'true' : 'false');
    });
    syncCatalogTabsPill();
    renderCatalogGrid(true);
  });

  openDrawerBtn?.addEventListener('click', openQuoteDrawer);
}

function openCatalogWithCategory(slug: string): void {
  activeCatalogCategory = slug;
  const tabsBar = document.getElementById('catalog-category-tabs');
  tabsBar?.querySelectorAll<HTMLButtonElement>('.t-tab').forEach((t) => {
    t.setAttribute('aria-selected', t.dataset.catTab === slug ? 'true' : 'false');
  });
  switchView('tienda');
  requestAnimationFrame(() => {
    syncCatalogTabsPill();
    renderCatalogGrid(true);
  });
}

/* ==========================================================================
   8. INTERACTIVE QUOTE LIST DRAWER & FLOATING DOCK (WHATSAPP DISPATCH)
   ========================================================================== */
function getTotalQuoteUnits(): number {
  return quoteItems.reduce((acc, item) => acc + item.qty, 0);
}

function getQuoteSubtotalUsd(): number {
  return quoteItems.reduce((acc, item) => {
    const p = PRODUCTS.find((prod) => prod.id === item.productId);
    return acc + (p ? p.price * item.qty : 0);
  }, 0);
}

function addToQuote(productId: string, delta = 1): void {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const existing = quoteItems.find((i) => i.productId === productId);
  if (existing) {
    existing.qty = Math.max(0, Math.min(999, existing.qty + delta));
    if (existing.qty === 0) {
      quoteItems = quoteItems.filter((i) => i.productId !== productId);
    }
  } else if (delta > 0) {
    quoteItems.push({ productId, qty: delta });
  }

  saveQuoteItems();
  syncQuoteCountersAndCards(delta > 0 ? productId : undefined);
  renderQuoteDrawerContents();

  if (delta > 0) {
    pulseElement(document.getElementById('btn-open-quote-drawer'));
    pulseElement(document.getElementById('floating-quote-dock'));
    showToast(`Añadido a tu cotización: ${product.name}`);
  }
}

function syncQuoteCountersAndCards(retriggeredProductId?: string): void {
  const totalUnits = getTotalQuoteUnits();
  const subtotalUsd = getQuoteSubtotalUsd();

  const headerBadge = document.getElementById('header-quote-badge');
  const headerCount = document.getElementById('header-quote-count');
  const mobileCount = document.getElementById('mobile-quote-count');
  const catalogCount = document.getElementById('catalog-drawer-count');

  const dock = document.getElementById('floating-quote-dock');
  const dockCount = document.getElementById('dock-quote-count');
  const dockUsd = document.getElementById('dock-quote-usd');
  const dockBs = document.getElementById('dock-quote-bs');

  if (headerCount) headerCount.textContent = String(totalUnits);
  if (headerBadge) headerBadge.setAttribute('data-open', totalUnits > 0 ? 'true' : 'false');
  if (mobileCount) mobileCount.textContent = String(totalUnits);
  if (catalogCount) catalogCount.textContent = String(totalUnits);

  if (dock) {
    dock.setAttribute('data-visible', totalUnits > 0 ? 'true' : 'false');
  }
  if (dockCount) dockCount.textContent = `${totalUnits} ${totalUnits === 1 ? 'unidad' : 'unidades'}`;
  if (dockUsd) dockUsd.textContent = formatUsd(subtotalUsd);
  if (dockBs) dockBs.textContent = `Bs. ${formatBs(subtotalUsd)}`;

  document.querySelectorAll<HTMLButtonElement>('[data-add-quote]').forEach((btn) => {
    const id = btn.dataset.addQuote ?? '';
    const qty = quoteItems.find((i) => i.productId === id)?.qty ?? 0;
    const labelEl = btn.querySelector<HTMLElement>('[data-quote-btn-label]');
    const checkEl = btn.querySelector<HTMLElement>('.t-success-check');

    if (labelEl) {
      labelEl.textContent = qty > 0 ? `En lista (${qty})` : '+ Cotizar';
    } else {
      btn.textContent = qty > 0 ? `En lista (${qty})` : '+ Cotizar';
    }

    btn.classList.toggle('mc-btn-primary', qty > 0);
    btn.classList.toggle('mc-btn-secondary', qty === 0);

    if (checkEl) {
      if (qty > 0) {
        checkEl.classList.remove('hidden');
        if (retriggeredProductId === id) {
          checkEl.setAttribute('data-state', 'out');
          void checkEl.offsetWidth;
          checkEl.setAttribute('data-state', 'in');
        } else {
          checkEl.setAttribute('data-state', 'in');
        }
      } else {
        checkEl.classList.add('hidden');
        checkEl.setAttribute('data-state', 'out');
      }
    }
  });
}

function renderQuoteDrawerContents(): void {
  const container = document.getElementById('quote-items-container');
  const totalUsdEl = document.getElementById('quote-total-usd');
  const totalBsEl = document.getElementById('quote-total-bs');
  const sendBtn = document.getElementById('btn-send-quote-whatsapp') as HTMLButtonElement | null;
  const clearBtn = document.getElementById('btn-clear-quote') as HTMLButtonElement | null;

  if (!container || !totalUsdEl || !totalBsEl) return;

  if (quoteItems.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center space-y-3">
        <p class="font-display text-lg font-bold text-[#111924]">Tu lista de cotización está vacía</p>
        <p class="text-sm text-[#435060] max-w-[32ch] mx-auto">
          Agrega herramientas, pinturas, bombas o grifería del catálogo para calcular tu presupuesto en USD y Bs. BCV.
        </p>
        <div class="pt-2">
          <button type="button" id="btn-empty-drawer-go-catalog" class="mc-btn mc-btn-secondary text-sm">
            Explorar Catálogo BCV
          </button>
        </div>
      </div>
    `;
    totalUsdEl.textContent = '$0.00';
    totalBsEl.textContent = 'Bs. 0,00';
    if (sendBtn) sendBtn.disabled = true;
    if (clearBtn) clearBtn.disabled = true;

    document.getElementById('btn-empty-drawer-go-catalog')?.addEventListener('click', () => {
      closeQuoteDrawer();
      switchView('tienda');
    });
    return;
  }

  if (sendBtn) sendBtn.disabled = false;
  if (clearBtn) clearBtn.disabled = false;

  let subtotalUsd = 0;

  container.innerHTML = quoteItems
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) return '';
      const lineUsd = product.price * item.qty;
      subtotalUsd += lineUsd;

      return `
        <div class="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="font-display text-sm font-bold text-[#111924] leading-snug line-clamp-2">
              ${escapeHtml(product.name)}
            </p>
            <p class="mt-0.5 font-mono text-xs text-[#5E6B7C] tabular-nums">
              ${escapeHtml(product.sku)} · ${formatUsd(product.price)} c/u
            </p>
            <p class="mt-1 font-mono text-xs font-semibold text-[#216E63] tabular-nums">
              Subtotal: ${formatUsd(lineUsd)} (Bs. ${formatBs(lineUsd)})
            </p>
          </div>

          <div class="flex items-center gap-1.5 shrink-0 tabular-nums">
            <button
              type="button"
              data-quote-step="${product.id}"
              data-step-dir="-1"
              aria-label="Disminuir cantidad"
              class="w-11 h-11 rounded-[8px] bg-[#ECEAE3] hover:bg-[#D8D5CC] active:scale-[0.96] transition-transform duration-[150ms] text-[#111924] font-bold flex items-center justify-center cursor-pointer"
            >
              −
            </button>
            <span class="w-7 text-center font-mono text-sm font-bold text-[#111924]">${item.qty}</span>
            <button
              type="button"
              data-quote-step="${product.id}"
              data-step-dir="1"
              aria-label="Aumentar cantidad"
              class="w-11 h-11 rounded-[8px] bg-[#ECEAE3] hover:bg-[#D8D5CC] active:scale-[0.96] transition-transform duration-[150ms] text-[#111924] font-bold flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  totalUsdEl.textContent = formatUsd(subtotalUsd);
  totalBsEl.textContent = `Bs. ${formatBs(subtotalUsd)} (BCV Bs. ${formatRateVe(bcvRate)})`;
}

function openQuoteDrawer(): void {
  const root = document.getElementById('quote-drawer-root');
  const backdrop = document.getElementById('quote-drawer-backdrop');
  const panel = document.getElementById('quote-drawer-panel');
  const closeBtn = document.getElementById('btn-close-quote-drawer');
  if (!root || !backdrop || !panel) return;

  lastFocusedBeforeDrawer = document.activeElement as HTMLElement | null;
  root.classList.remove('pointer-events-none');
  root.setAttribute('aria-hidden', 'false');
  backdrop.classList.remove('is-closing');
  backdrop.classList.add('is-open');
  panel.setAttribute('data-open', 'true');
  document.body.style.overflow = 'hidden';

  window.setTimeout(() => closeBtn?.focus(), 60);
}

function closeQuoteDrawer(): void {
  const root = document.getElementById('quote-drawer-root');
  const backdrop = document.getElementById('quote-drawer-backdrop');
  const panel = document.getElementById('quote-drawer-panel');
  if (!root || !backdrop || !panel) return;

  panel.setAttribute('data-open', 'false');
  backdrop.classList.remove('is-open');
  backdrop.classList.add('is-closing');
  document.body.style.overflow = '';

  window.setTimeout(() => {
    backdrop.classList.remove('is-closing');
    root.classList.add('pointer-events-none');
    root.setAttribute('aria-hidden', 'true');
    lastFocusedBeforeDrawer?.focus();
  }, 350);
}

function sendQuoteListToWhatsapp(): void {
  if (quoteItems.length === 0) return;
  const branch = STORES.find((s) => s.id === selectedStoreId) ?? STORES[0];

  let subtotalUsd = 0;
  const lines = quoteItems
    .map((item, idx) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) return '';
      const lineUsd = product.price * item.qty;
      subtotalUsd += lineUsd;
      return `${idx + 1}. [${product.sku}] ${product.name} — Cant: ${item.qty} x ${formatUsd(product.price)} = ${formatUsd(lineUsd)}`;
    })
    .filter(Boolean);

  const message = [
    `Hola MangoCenter, deseo confirmar disponibilidad y retiro en *${branch.name}* (${branch.city}):`,
    '',
    ...lines,
    '',
    `Total referencial USD: ${formatUsd(subtotalUsd)}`,
    `Equivalente BCV (Bs. ${formatRateVe(bcvRate)}): Bs. ${formatBs(subtotalUsd)}`,
    'Quedo atento a la confirmación de inventario en mostrador.',
  ].join('\n');

  const url = `https://wa.me/${branch.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ==========================================================================
   9. MASTER STORE LOCATOR & GOOGLE MAPS
   ========================================================================== */
let syncStoreTabsPill: () => void = () => {};

function populateBranchSelectors(): void {
  const quoteSelect = document.getElementById('quote-branch-select') as HTMLSelectElement | null;
  const contactSelect = document.getElementById('contact-branch') as HTMLSelectElement | null;

  const optionsHtml = STORES.map(
    (s) =>
      `<option value="${s.id}" ${s.id === selectedStoreId ? 'selected' : ''}>${escapeHtml(s.city)} — ${escapeHtml(s.name)}</option>`
  ).join('');

  if (quoteSelect) quoteSelect.innerHTML = optionsHtml;
  if (contactSelect) contactSelect.innerHTML = optionsHtml;
  updateContactRouteHint();
}

function syncBranchSelectorsValue(): void {
  const quoteSelect = document.getElementById('quote-branch-select') as HTMLSelectElement | null;
  const contactSelect = document.getElementById('contact-branch') as HTMLSelectElement | null;
  if (quoteSelect && quoteSelect.value !== selectedStoreId) quoteSelect.value = selectedStoreId;
  if (contactSelect && contactSelect.value !== selectedStoreId) contactSelect.value = selectedStoreId;
  updateContactRouteHint();
}

function getFilteredStores(): StoreBranch[] {
  const base =
    activeStoreStateFilter === 'Todas'
      ? [...STORES]
      : STORES.filter((s) => s.stateFilter === activeStoreStateFilter);

  if (branchDistancesKm.size > 0) {
    base.sort(
      (a, b) => (branchDistancesKm.get(a.id) ?? 99999) - (branchDistancesKm.get(b.id) ?? 99999)
    );
  }
  return base;
}

function renderStoreLocator(animateList = false, animateDetail = false): void {
  const listContainer = document.getElementById('stores-list-container');
  const detailPanel = document.getElementById('store-detail-panel');
  if (!listContainer || !detailPanel) return;

  const filtered = getFilteredStores();
  const activeBranch =
    filtered.find((s) => s.id === selectedStoreId) ?? filtered[0] ?? STORES[0];

  if (activeBranch.id !== selectedStoreId) {
    saveSelectedBranchId(activeBranch.id);
    syncBranchSelectorsValue();
  }

  listContainer.innerHTML = filtered
    .map((branch) => {
      const isSelected = branch.id === activeBranch.id;
      const status = getVenezuelaBranchStatus(branch);
      const dist = branchDistancesKm.get(branch.id);
      const distBadge =
        typeof dist === 'number'
          ? `<span class="font-mono text-xs font-semibold text-[#09569A] tabular-nums">· a ${dist.toFixed(1)} km</span>`
          : '';

      return `
        <button
          type="button"
          data-select-branch="${branch.id}"
          aria-pressed="${isSelected ? 'true' : 'false'}"
          class="mc-card w-full text-left p-4 cursor-pointer flex items-start justify-between gap-3 ${
            isSelected
              ? 'ring-2 ring-[#09569A] bg-[#F4F8FD]'
              : 'hover:bg-[#FAF9F6]'
          }"
        >
          <div class="min-w-0 flex-1">
            <h3 class="!text-base font-bold text-[#111924] leading-snug">
              ${escapeHtml(branch.name)}
            </h3>
            <p class="mt-1 text-xs text-[#435060] line-clamp-2">
              ${escapeHtml(branch.address)}
            </p>
            <div class="mt-2.5 flex items-center flex-wrap gap-2 text-xs tabular-nums">
              <span class="inline-flex items-center gap-1.5 font-semibold ${
                status.isOpen ? 'text-[#216E63]' : 'text-[#5E6B7C]'
              }">
                <span class="w-2 h-2 rounded-full ${
                  status.isOpen ? 'bg-[#216E63]' : 'bg-[#8E99A8]'
                }" aria-hidden="true"></span>
                <span>${status.label}</span>
              </span>
              <span class="text-[#5E6B7C]">· ${escapeHtml(branch.stateFilter)}</span>
              ${distBadge}
            </div>
          </div>

          <span
            class="shrink-0 w-8 h-8 rounded-[8px] flex items-center justify-center ${
              isSelected ? 'bg-[#09569A] text-white' : 'bg-[#ECEAE3] text-[#435060]'
            }"
            aria-hidden="true"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      `;
    })
    .join('');

  if (animateList) {
    animateFilteredItems(listContainer);
  }

  const liveStatus = getVenezuelaBranchStatus(activeBranch);
  const directWaUrl = `https://wa.me/${activeBranch.whatsappNumber}?text=${encodeURIComponent(
    `Hola MangoCenter, consulto disponibilidad y atención en la sede *${activeBranch.name}* (${activeBranch.city}).`
  )}`;

  const detailMarkup = `
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="!text-xl sm:!text-2xl font-extrabold text-[#111924]">
          ${escapeHtml(activeBranch.name)}
        </h3>
        <p class="mt-1 max-w-[60ch] text-sm text-[#435060]">
          ${escapeHtml(activeBranch.address)} — <span class="text-[#5E6B7C]">${escapeHtml(activeBranch.reference)}</span>
        </p>
      </div>
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
        liveStatus.isOpen
          ? 'bg-[#216E63] text-white'
          : 'bg-[#ECEAE3] text-[#435060]'
      }">
        <span>${liveStatus.label}</span>
      </span>
    </div>

    <div class="mt-4 py-3.5 border-y border-[#D8D5CC] grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm tabular-nums">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-[#5E6B7C]">Horario Semanal y Dominical</p>
        <p class="mt-1 font-semibold text-[#111924]">${escapeHtml(activeBranch.hoursWeek)}</p>
        <p class="mt-0.5 text-[#216E63] font-semibold">${escapeHtml(activeBranch.hoursSunday)}</p>
      </div>

      <div class="sm:border-l sm:border-[#D8D5CC] sm:pl-4">
        <p class="text-xs font-bold uppercase tracking-wider text-[#5E6B7C]">Contacto Regional y Servicios</p>
        <p class="mt-1 font-mono font-semibold text-[#09569A]">Tel / WhatsApp: ${escapeHtml(activeBranch.phone)}</p>
        <p class="mt-0.5 text-xs text-[#435060]">${activeBranch.services.map(escapeHtml).join(' · ')}</p>
      </div>
    </div>

    <div class="pt-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-2.5">
        <a
          href="${activeBranch.mapsUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="mc-btn mc-btn-secondary mc-btn--icon-left !text-sm"
        >
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span>Abrir ruta en Google Maps</span>
        </a>

        <a
          href="${directWaUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="mc-btn mc-btn-whatsapp mc-btn--icon-left !text-sm"
        >
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span>Escribir a esta sede</span>
        </a>
      </div>

      <span class="font-mono text-xs text-[#5E6B7C] tabular-nums">
        GPS ${activeBranch.lat.toFixed(4)}, ${activeBranch.lng.toFixed(4)}
      </span>
    </div>
  `;

  if (animateDetail && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    detailPanel.setAttribute('data-open', 'false');
    requestAnimationFrame(() => {
      detailPanel.innerHTML = detailMarkup;
      void detailPanel.offsetWidth;
      detailPanel.setAttribute('data-open', 'true');
    });
  } else {
    detailPanel.innerHTML = detailMarkup;
    detailPanel.setAttribute('data-open', 'true');
  }

  updateMapFocus(activeBranch);

  listContainer.querySelectorAll<HTMLButtonElement>('[data-select-branch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.selectBranch ?? STORES[0].id;
      if (id === selectedStoreId) return;
      saveSelectedBranchId(id);
      syncBranchSelectorsValue();
      renderStoreLocator(false, true);
    });
  });
}

async function initStoreMap(): Promise<void> {
  if (mapsInitialized) return;
  mapsInitialized = true;

  const mapDiv = document.getElementById('store-google-map');
  const iframeEl = document.getElementById('store-map-iframe') as HTMLIFrameElement | null;
  if (!mapDiv || !iframeEl) return;

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();

  if (!apiKey) {
    mapDiv.classList.add('hidden');
    iframeEl.classList.remove('hidden');
    const branch = STORES.find((s) => s.id === selectedStoreId) ?? STORES[0];
    iframeEl.src = `https://maps.google.com/maps?q=${branch.lat},${branch.lng}&z=16&output=embed`;
    return;
  }

  try {
    setOptions({ key: apiKey, v: 'weekly' });
    const { Map } = (await importLibrary('maps')) as google.maps.MapsLibrary;
    const initialBranch = STORES.find((s) => s.id === selectedStoreId) ?? STORES[0];

    googleMapInstance = new Map(mapDiv, {
      center: { lat: initialBranch.lat, lng: initialBranch.lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    STORES.forEach((branch) => {
      const marker = new google.maps.Marker({
        position: { lat: branch.lat, lng: branch.lng },
        map: googleMapInstance,
        title: branch.name,
      });
      marker.addListener('click', () => {
        saveSelectedBranchId(branch.id);
        syncBranchSelectorsValue();
        renderStoreLocator(false, true);
      });
      googleMarkers.set(branch.id, marker);
    });
  } catch {
    mapDiv.classList.add('hidden');
    iframeEl.classList.remove('hidden');
    const branch = STORES.find((s) => s.id === selectedStoreId) ?? STORES[0];
    iframeEl.src = `https://maps.google.com/maps?q=${branch.lat},${branch.lng}&z=16&output=embed`;
  }
}

function updateMapFocus(branch: StoreBranch): void {
  const iframeEl = document.getElementById('store-map-iframe') as HTMLIFrameElement | null;
  if (googleMapInstance) {
    googleMapInstance.panTo({ lat: branch.lat, lng: branch.lng });
    googleMapInstance.setZoom(16);
  } else if (iframeEl && !iframeEl.classList.contains('hidden')) {
    const nextSrc = `https://maps.google.com/maps?q=${branch.lat},${branch.lng}&z=16&output=embed`;
    if (iframeEl.src !== nextSrc) {
      iframeEl.src = nextSrc;
    }
  }
}

function jumpToStoreState(stateName: string): void {
  activeStoreStateFilter = stateName;
  const tabsBar = document.getElementById('store-state-tabs');
  tabsBar?.querySelectorAll<HTMLButtonElement>('.t-tab').forEach((t) => {
    t.setAttribute('aria-selected', t.dataset.stateFilter === stateName ? 'true' : 'false');
  });

  const doScrollAndSync = () => {
    syncStoreTabsPill();
    renderStoreLocator(true, true);
    document.getElementById('landing-mapa-sedes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (currentView !== 'inicio') {
    switchView('inicio', true);
    window.setTimeout(doScrollAndSync, 120);
  } else {
    doScrollAndSync();
  }
}

function initStoreLocatorControls(): void {
  const tabsBar = document.getElementById('store-state-tabs');
  const locateBtn = document.getElementById('btn-locate-nearest') as HTMLButtonElement | null;
  const locateLabel = document.getElementById('locate-nearest-label');

  syncStoreTabsPill = setupSlidingTabs(tabsBar, (tab) => {
    activeStoreStateFilter = tab.dataset.stateFilter ?? 'Todas';
    renderStoreLocator(true, true);
  });

  locateBtn?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Tu navegador no admite geolocalización automática.');
      return;
    }
    locateBtn.disabled = true;
    if (locateLabel) locateLabel.textContent = 'Calculando cercanía...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locateBtn.disabled = false;
        const { latitude, longitude } = pos.coords;
        branchDistancesKm.clear();
        STORES.forEach((s) => {
          branchDistancesKm.set(s.id, haversineKm(latitude, longitude, s.lat, s.lng));
        });

        const sorted = [...STORES].sort(
          (a, b) => (branchDistancesKm.get(a.id) ?? 99999) - (branchDistancesKm.get(b.id) ?? 99999)
        );
        const nearest = sorted[0];

        activeStoreStateFilter = 'Todas';
        tabsBar?.querySelectorAll<HTMLButtonElement>('.t-tab').forEach((t) => {
          t.setAttribute('aria-selected', t.dataset.stateFilter === 'Todas' ? 'true' : 'false');
        });
        syncStoreTabsPill();

        saveSelectedBranchId(nearest.id);
        syncBranchSelectorsValue();
        renderStoreLocator(true, true);

        const km = branchDistancesKm.get(nearest.id) ?? 0;
        if (locateLabel) locateLabel.textContent = `Más cercana: ${nearest.city} (${km.toFixed(1)} km)`;
        showToast(`Sede más cercana detectada: ${nearest.name}`);
      },
      () => {
        locateBtn.disabled = false;
        if (locateLabel) locateLabel.textContent = 'Ubicar mi sede más cercana';
        showToast('Activa el permiso de ubicación o selecciona tu estado en la barra.');
      },
      { enableHighAccuracy: false, timeout: 7000 }
    );
  });
}

/* ==========================================================================
   10. EVENTS & WORKSHOPS + ACCORDION FAQ (21-accordion.md)
   ========================================================================== */
function renderEventsAndFaq(): void {
  const eventsContainer = document.getElementById('events-editorial-container');
  const faqContainer = document.getElementById('faq-accordion-list');

  if (eventsContainer && EVENTS.length > 0) {
    const lead = EVENTS[0];
    const secondary = EVENTS.slice(1);
    const leadWa = `https://wa.me/584226264623?text=${encodeURIComponent(
      `Hola MangoCenter, deseo recibir información sobre: ${lead.title} (${lead.branch}).`
    )}`;

    eventsContainer.innerHTML = `
      <article class="lg:col-span-6 mc-blueprint-stage text-white mc-concentric-xl flex flex-col justify-between shadow-[var(--shadow-card)]">
        <figure class="mc-concentric-xl-inner mc-photo-frame aspect-[16/9] bg-[#031F3B]">
          <img
            src="${lead.image}"
            alt="${escapeHtml(lead.title)}"
            loading="lazy"
            width="900"
            height="506"
            class="w-full h-full object-cover"
          />
        </figure>
        <div class="p-4 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-white !text-2xl font-extrabold">${escapeHtml(lead.title)}</h3>
            <p class="mt-2 max-w-[54ch] text-[#DCEBFA] text-sm sm:text-base leading-relaxed">
              ${escapeHtml(lead.description)}
            </p>
          </div>
          <div class="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
            <div class="text-xs text-[#DCEBFA] tabular-nums">
              <strong class="text-[#F5B800] block font-mono">${escapeHtml(lead.branch)}</strong>
              <span>${escapeHtml(lead.date)} · ${escapeHtml(lead.time)}</span>
            </div>
            <a
              href="${leadWa}"
              target="_blank"
              rel="noopener noreferrer"
              class="mc-btn mc-btn-primary !text-sm"
            >
              Consultar programación
            </a>
          </div>
        </div>
      </article>

      <div class="lg:col-span-6 flex flex-col justify-between divide-y divide-[#D8D5CC] border-y border-[#D8D5CC]">
        ${secondary
          .map((evt) => {
            const waUrl = `https://wa.me/584226264623?text=${encodeURIComponent(
              `Hola MangoCenter, quiero reservar cupo en la actividad: ${evt.title} (${evt.branch}).`
            )}`;
            return `
              <article class="py-5 first:pt-4 last:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1.5 max-w-[50ch]">
                  <h3 class="!text-lg font-bold text-[#111924]">${escapeHtml(evt.title)}</h3>
                  <p class="text-sm text-[#435060]">${escapeHtml(evt.description)}</p>
                  <p class="text-xs font-semibold text-[#5E6B7C] tabular-nums">
                    ${escapeHtml(evt.branch)} · ${escapeHtml(evt.date)} (${escapeHtml(evt.time)}) · <span class="text-[#216E63]">${escapeHtml(evt.spotsAvailable)}</span>
                  </p>
                </div>
                <a
                  href="${waUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="t-learn shrink-0 inline-flex items-center gap-1.5 text-sm font-bold text-[#09569A] hover:text-[#053563] py-1"
                >
                  <span>Inscribirme</span>
                  <span class="t-learn-chevron" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path class="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
                      <path class="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
                    </svg>
                  </span>
                </a>
              </article>
            `;
          })
          .join('')}
      </div>
    `;
  }

  if (faqContainer) {
    faqContainer.innerHTML = FAQS.map(
      (faq, index) => `
        <div class="t-acc" data-open="${index === 0 ? 'true' : 'false'}">
          <button
            type="button"
            class="t-acc-head w-full py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
            aria-expanded="${index === 0 ? 'true' : 'false'}"
          >
            <span class="font-display text-base sm:text-lg font-bold text-[#111924]">
              ${escapeHtml(faq.question)}
            </span>
            <span class="t-acc-chevron shrink-0 w-8 h-8 rounded-[8px] bg-[#ECEAE3] text-[#111924] items-center justify-center" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 6.5L8 10.5L12 6.5" />
              </svg>
            </span>
          </button>
          <div class="t-acc-panel">
            <div class="t-acc-panel-inner">
              <p class="pb-5 pr-8 max-w-[65ch] text-sm sm:text-base text-[#435060] leading-relaxed">
                ${escapeHtml(faq.answer)}
              </p>
            </div>
          </div>
        </div>
      `
    ).join('');

    faqContainer.querySelectorAll<HTMLElement>('.t-acc').forEach((acc) => {
      const head = acc.querySelector<HTMLButtonElement>('.t-acc-head');
      head?.addEventListener('click', () => {
        const isOpen = acc.getAttribute('data-open') === 'true';
        acc.setAttribute('data-open', String(!isOpen));
        head.setAttribute('aria-expanded', String(!isOpen));
        window.setTimeout(refreshScrollAnimations, 270);
      });
    });
  }
}

/* ==========================================================================
   11. CONTACT FORM WITH BRANCH ROUTING & SHAKE VALIDATION
   ========================================================================== */
function updateContactRouteHint(): void {
  const selectEl = document.getElementById('contact-branch') as HTMLSelectElement | null;
  const hintEl = document.getElementById('contact-route-hint');
  if (!selectEl || !hintEl) return;
  const branch = STORES.find((s) => s.id === selectEl.value) ?? STORES[0];
  hintEl.textContent = `Destino WhatsApp: ${formatWhatsappDisplay(branch.whatsappNumber)}`;
}

function initContactForm(): void {
  const form = document.getElementById('contact-whatsapp-form') as HTMLFormElement | null;
  const nameInput = document.getElementById('contact-name') as HTMLInputElement | null;
  const branchSelect = document.getElementById('contact-branch') as HTMLSelectElement | null;
  const deptSelect = document.getElementById('contact-department') as HTMLSelectElement | null;
  const phoneInput = document.getElementById('contact-phone') as HTMLInputElement | null;
  const msgInput = document.getElementById('contact-message') as HTMLTextAreaElement | null;
  const clearBtn = document.getElementById('btn-contact-clear');

  branchSelect?.addEventListener('change', () => {
    saveSelectedBranchId(branchSelect.value);
    syncBranchSelectorsValue();
    renderStoreLocator(false, false);
  });

  clearBtn?.addEventListener('click', () => {
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
    if (msgInput) msgInput.value = '';
    showToast('Formulario limpio.');
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameVal = (nameInput?.value ?? '').trim();
    const msgVal = (msgInput?.value ?? '').trim();

    let hasError = false;
    if (nameVal.length < 2) {
      triggerFieldError('wrap-contact-name', 'shake-contact-name', nameInput);
      nameInput?.focus();
      hasError = true;
    }
    if (msgVal.length < 4) {
      triggerFieldError('wrap-contact-message', 'shake-contact-message', msgInput);
      if (!hasError) msgInput?.focus();
      hasError = true;
    }
    if (hasError) return;

    const branch = STORES.find((s) => s.id === branchSelect?.value) ?? STORES[0];
    const dept = deptSelect?.value ?? 'Cotización General';
    const phone = (phoneInput?.value ?? '').trim();

    const textLines = [
      `Hola MangoCenter, escribo para la sede *${branch.name}* (${branch.city}):`,
      `Nombre / Empresa: ${nameVal}`,
      `Departamento: ${dept}`,
      phone ? `Teléfono de contacto: ${phone}` : '',
      `Consulta / Requerimiento: ${msgVal}`,
    ].filter(Boolean);

    const waUrl = `https://wa.me/${branch.whatsappNumber}?text=${encodeURIComponent(
      textLines.join('\n')
    )}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast(`Abriendo WhatsApp de ${branch.city}. Tu texto se mantiene guardado.`);
  });
}

/* ==========================================================================
   12. COLLABORATOR MODAL (06-modal.md) & ODOO CAMPUS VIEW
   ========================================================================== */
function openCollaboratorModal(): void {
  const root = document.getElementById('collaborator-modal-root');
  const backdrop = document.getElementById('collaborator-modal-backdrop');
  const dialog = document.getElementById('collaborator-modal-dialog');
  const emailInput = document.getElementById('collab-email') as HTMLInputElement | null;
  if (!root || !backdrop || !dialog) return;

  lastFocusedBeforeModal = document.activeElement as HTMLElement | null;
  root.classList.remove('pointer-events-none');
  root.setAttribute('aria-hidden', 'false');
  backdrop.classList.remove('is-closing');
  backdrop.classList.add('is-open');
  dialog.classList.remove('is-closing');
  dialog.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  window.setTimeout(() => emailInput?.focus(), 60);
}

function closeCollaboratorModal(): void {
  const root = document.getElementById('collaborator-modal-root');
  const backdrop = document.getElementById('collaborator-modal-backdrop');
  const dialog = document.getElementById('collaborator-modal-dialog');
  if (!root || !backdrop || !dialog) return;

  dialog.classList.remove('is-open');
  dialog.classList.add('is-closing');
  backdrop.classList.remove('is-open');
  backdrop.classList.add('is-closing');
  document.body.style.overflow = '';

  window.setTimeout(() => {
    dialog.classList.remove('is-closing');
    backdrop.classList.remove('is-closing');
    root.classList.add('pointer-events-none');
    root.setAttribute('aria-hidden', 'true');
    lastFocusedBeforeModal?.focus();
  }, 150);
}

let syncCursosTabsPill: () => void = () => {};

function getCourseSvgIcon(type: OdooCourse['iconType']): string {
  switch (type) {
    case 'accounting':
      return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18M7 15l4-4 3 3 5-6"/></svg>`;
    case 'marketing':
      return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>`;
    case 'recruitment':
      return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`;
    case 'safety':
      return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;
    case 'billing':
      return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/></svg>`;
    default:
      return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`;
  }
}

function renderCursosView(animatePanel = false): void {
  const grid = document.getElementById('cursos-grid');
  const detailPanel = document.getElementById('course-detail-panel');
  if (!grid || !detailPanel) return;

  const q = activeCourseSearch.trim().toLowerCase();
  const filtered = ODOO_COURSES.filter((c) => {
    if (activeCourseFilter === 'populares' && !c.isPopular) return false;
    if (activeCourseFilter === 'recientes' && !c.isRecent) return false;
    if (!q) return true;
    return `${c.title} ${c.category} ${c.description}`.toLowerCase().includes(q);
  });

  const activeCourse =
    filtered.find((c) => c.id === selectedCourseId) ?? filtered[0] ?? ODOO_COURSES[0];
  selectedCourseId = activeCourse.id;

  grid.innerHTML = filtered
    .map((course) => {
      const isSelected = course.id === activeCourse.id;
      return `
        <button
          type="button"
          data-select-course="${course.id}"
          aria-pressed="${isSelected ? 'true' : 'false'}"
          class="mc-card text-left p-5 flex flex-col justify-between gap-4 cursor-pointer ${
            isSelected ? 'ring-2 ring-[#09569A] bg-[#F4F8FD]' : 'hover:bg-[#FAF9F6]'
          }"
        >
          <div>
            <div class="flex items-center justify-between gap-3 mb-3">
              <span class="w-10 h-10 rounded-[8px] bg-[#09569A] text-white flex items-center justify-center shrink-0">
                ${getCourseSvgIcon(course.iconType)}
              </span>
              <span class="font-mono text-xs font-semibold text-[#5E6B7C] tabular-nums">
                ${escapeHtml(course.level)} · ${escapeHtml(course.steps)}
              </span>
            </div>
            <h3 class="!text-lg font-bold text-[#111924]">${escapeHtml(course.title)}</h3>
            <p class="mt-1 text-xs font-semibold text-[#09569A]">${escapeHtml(course.category)}</p>
            <p class="mt-2 text-sm text-[#435060] line-clamp-2">${escapeHtml(course.description)}</p>
          </div>

          <div class="pt-3 border-t border-[#D8D5CC] flex items-center justify-between text-xs font-bold text-[#09569A]">
            <span>${escapeHtml(course.duration ?? 'Autoformativo')}</span>
            <span>Ver ficha →</span>
          </div>
        </button>
      `;
    })
    .join('');

  const detailHtml = `
    <h2 class="!text-xl text-[#111924]">${escapeHtml(activeCourse.title)}</h2>
    <p class="mt-1 text-xs font-bold text-[#09569A]">
      ${escapeHtml(activeCourse.category)} · Nivel ${escapeHtml(activeCourse.level)}
    </p>
    <p class="mt-3 text-sm text-[#435060] leading-relaxed">
      ${escapeHtml(activeCourse.description)}
    </p>

    <dl class="mt-5 py-3.5 border-y border-[#D8D5CC] space-y-2 text-xs tabular-nums">
      <div class="flex justify-between">
        <dt class="text-[#5E6B7C] font-semibold">Unidades / Pasos:</dt>
        <dd class="font-mono font-bold text-[#111924]">${escapeHtml(activeCourse.steps)}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-[#5E6B7C] font-semibold">Duración estimada:</dt>
        <dd class="font-mono font-bold text-[#111924]">${escapeHtml(activeCourse.duration ?? '20 minutos')}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-[#5E6B7C] font-semibold">Perfil activo:</dt>
        <dd class="font-semibold text-[#216E63]">${escapeHtml(ODOO_USER_PROFILE.fullName)}</dd>
      </div>
    </dl>

    <p class="mt-4 text-xs text-[#5E6B7C] leading-relaxed">
      ${escapeHtml(ODOO_USER_PROFILE.unverifiedWarning)}
    </p>

    <div class="mt-5">
      <a
        href="${ODOO_SLIDES_URL}"
        target="_blank"
        rel="noopener noreferrer"
        class="mc-btn mc-btn-primary w-full !text-sm"
      >
        Iniciar módulo en Odoo Corporativo
      </a>
    </div>
  `;

  if (animatePanel && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    detailPanel.setAttribute('data-open', 'false');
    requestAnimationFrame(() => {
      detailPanel.innerHTML = detailHtml;
      void detailPanel.offsetWidth;
      detailPanel.setAttribute('data-open', 'true');
    });
  } else {
    detailPanel.innerHTML = detailHtml;
    detailPanel.setAttribute('data-open', 'true');
  }

  grid.querySelectorAll<HTMLButtonElement>('[data-select-course]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedCourseId = btn.dataset.selectCourse ?? ODOO_COURSES[0].id;
      renderCursosView(true);
    });
  });
}

function initCollaboratorFlows(): void {
  const openTop = document.getElementById('btn-open-collaborator-top');
  const openMobile = document.getElementById('btn-open-collaborator-mobile');
  const openFooter = document.getElementById('btn-open-collaborator-footer');
  const closeBtn = document.getElementById('btn-close-collaborator-modal');
  const backdrop = document.getElementById('collaborator-modal-backdrop');
  const form = document.getElementById('collaborator-login-form') as HTMLFormElement | null;
  const emailInput = document.getElementById('collab-email') as HTMLInputElement | null;
  const logoutBtn = document.getElementById('btn-logout-demo');
  const topLabel = document.getElementById('collaborator-top-label');

  const handleOpenTrigger = () => {
    closeMobileDropdown();
    if (collaboratorDemoUnlocked) {
      switchView('cursos');
      return;
    }
    openCollaboratorModal();
  };

  openTop?.addEventListener('click', handleOpenTrigger);
  openMobile?.addEventListener('click', handleOpenTrigger);
  openFooter?.addEventListener('click', handleOpenTrigger);
  closeBtn?.addEventListener('click', closeCollaboratorModal);
  backdrop?.addEventListener('click', closeCollaboratorModal);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawEmail = (emailInput?.value ?? '').trim();
    if (rawEmail.length > 0 && (!rawEmail.includes('@') || !rawEmail.includes('.'))) {
      triggerFieldError('wrap-collab-email', 'shake-collab-email', emailInput);
      emailInput?.focus();
      return;
    }

    collaboratorDemoUnlocked = true;
    if (rawEmail) {
      ODOO_USER_PROFILE.email = rawEmail;
      const summary = document.getElementById('cursos-user-summary');
      if (summary) {
        summary.textContent = `Sesión demostrativa activa (${rawEmail}) · Módulos internos de capacitación MangoCenter.`;
      }
    }
    if (topLabel) topLabel.textContent = 'Campus Colaboradores';
    closeCollaboratorModal();
    switchView('cursos');
    showToast('Vista demostrativa del Campus Colaboradores abierta.');
  });

  logoutBtn?.addEventListener('click', () => {
    collaboratorDemoUnlocked = false;
    if (topLabel) topLabel.textContent = 'Portal Colaboradores';
    switchView('inicio');
    showToast('Has salido de la vista de colaboradores.');
  });

  const cursosTabs = document.getElementById('cursos-filter-tabs');
  const cursosSearch = document.getElementById('cursos-search-input') as HTMLInputElement | null;

  syncCursosTabsPill = setupSlidingTabs(cursosTabs, (tab) => {
    const val = tab.dataset.courseTab;
    if (val === 'todos' || val === 'populares' || val === 'recientes') {
      activeCourseFilter = val;
      renderCursosView(true);
    }
  });

  cursosSearch?.addEventListener('input', () => {
    activeCourseSearch = cursosSearch.value;
    renderCursosView(false);
  });
}

/* ==========================================================================
   13. MOBILE DROPDOWN MENU (05-menu-dropdown.md) & SPA ROUTER + VIEW TRANSITIONS
   ========================================================================== */
let mobileDropdownOpen = false;

function openMobileDropdown(): void {
  const dropdown = document.getElementById('mobile-nav-dropdown');
  const btn = document.getElementById('btn-mobile-menu');
  const iconOpen = document.getElementById('mobile-menu-icon-open');
  const iconClose = document.getElementById('mobile-menu-icon-close');
  if (!dropdown || !btn) return;

  mobileDropdownOpen = true;
  btn.setAttribute('aria-expanded', 'true');
  iconOpen?.classList.add('hidden');
  iconClose?.classList.remove('hidden');
  dropdown.classList.remove('is-closing');
  dropdown.classList.add('is-open');
}

function closeMobileDropdown(): void {
  if (!mobileDropdownOpen) return;
  const dropdown = document.getElementById('mobile-nav-dropdown');
  const btn = document.getElementById('btn-mobile-menu');
  const iconOpen = document.getElementById('mobile-menu-icon-open');
  const iconClose = document.getElementById('mobile-menu-icon-close');
  if (!dropdown || !btn) return;

  mobileDropdownOpen = false;
  btn.setAttribute('aria-expanded', 'false');
  iconOpen?.classList.remove('hidden');
  iconClose?.classList.add('hidden');
  dropdown.classList.remove('is-open');
  dropdown.classList.add('is-closing');
  window.setTimeout(() => dropdown.classList.remove('is-closing'), 150);
}

function syncNavActiveStates(activeView: AppView, highlightSedes = false): void {
  document.querySelectorAll<HTMLElement>('[data-nav-view]').forEach((el) => {
    const target = el.dataset.navView;
    if (target === activeView && !highlightSedes) {
      el.setAttribute('aria-current', 'page');
    } else {
      el.removeAttribute('aria-current');
    }
  });

  document.querySelectorAll<HTMLElement>('[data-mobile-tab]').forEach((tab) => {
    const key = tab.dataset.mobileTab;
    const isActive = highlightSedes ? key === 'sedes' : key === activeView;
    tab.classList.toggle('text-[#09569A]', isActive);
    tab.classList.toggle('font-bold', isActive);
    tab.classList.toggle('text-[#435060]', !isActive);
    tab.classList.toggle('font-semibold', !isActive);
    if (isActive) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
  });
}

function switchView(nextView: AppView, skipScrollTop = false, useTransition = true): void {
  const prevView = currentView;
  currentView = nextView;
  closeMobileDropdown();

  const applyDomSwitch = () => {
    const views: AppView[] = ['inicio', 'tienda', 'nosotros', 'contacto', 'cursos'];
    views.forEach((v) => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        el.classList.toggle('view-hidden', v !== nextView);
      }
    });

    const targetHash = `#/${nextView}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }

    syncNavActiveStates(nextView, false);

    if (!skipScrollTop) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    requestAnimationFrame(() => {
      tabSyncCallbacks.forEach((fn) => fn());
      if (nextView === 'tienda') syncCatalogTabsPill();
      if (nextView === 'cursos') syncCursosTabsPill();
      if (nextView === 'inicio') syncStoreTabsPill();
      refreshScrollAnimations();
    });
  };

  const docWithVT = document as Document & {
    startViewTransition?: (cb: () => void) => void;
  };
  const allowVT =
    useTransition &&
    prevView !== nextView &&
    typeof docWithVT.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (allowVT) {
    docWithVT.startViewTransition!(() => {
      applyDomSwitch();
    });
  } else {
    applyDomSwitch();
  }
}

function navigateToSectionOnHome(sectionId: string): void {
  closeMobileDropdown();
  const scrollTarget = () => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (sectionId === 'landing-mapa-sedes') {
        syncNavActiveStates('inicio', true);
      }
    }
  };

  if (currentView !== 'inicio') {
    switchView('inicio', true);
    window.setTimeout(scrollTarget, 110);
  } else {
    scrollTarget();
  }
}

function parseHashRoute(): AppView {
  const raw = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (raw === 'tienda' || raw === 'nosotros' || raw === 'contacto' || raw === 'cursos') {
    return raw;
  }
  return 'inicio';
}

/* ==========================================================================
   14. GLOBAL EVENT DELEGATION & BOOTSTRAP
   ========================================================================== */
function bindGlobalInteractions(): void {
  document.querySelectorAll<HTMLElement>('[data-nav-view]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = (link.dataset.navView ?? 'inicio') as AppView;
      switchView(view);
    });
  });

  document.querySelectorAll<HTMLElement>('[data-open-catalog]').forEach((btn) => {
    btn.addEventListener('click', () => switchView('tienda'));
  });

  document.querySelectorAll<HTMLElement>('[data-goto-sedes]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToSectionOnHome('landing-mapa-sedes');
    });
  });

  document.querySelectorAll<HTMLElement>('[data-jump-state]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const stateName = btn.dataset.jumpState ?? 'Todas';
      jumpToStoreState(stateName);
    });
  });

  const mobileMenuBtn = document.getElementById('btn-mobile-menu');
  mobileMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (mobileDropdownOpen) closeMobileDropdown();
    else openMobileDropdown();
  });

  document.addEventListener('click', (e) => {
    if (!mobileDropdownOpen) return;
    const dropdown = document.getElementById('mobile-nav-dropdown');
    const target = e.target as Node;
    if (dropdown && !dropdown.contains(target) && !mobileMenuBtn?.contains(target)) {
      closeMobileDropdown();
    }
  });

  document.getElementById('btn-open-quote-drawer')?.addEventListener('click', openQuoteDrawer);
  document.getElementById('btn-mobile-open-quote')?.addEventListener('click', openQuoteDrawer);
  document.getElementById('btn-dock-open-drawer')?.addEventListener('click', openQuoteDrawer);
  document.getElementById('btn-process-open-drawer')?.addEventListener('click', openQuoteDrawer);
  document.getElementById('btn-close-quote-drawer')?.addEventListener('click', closeQuoteDrawer);
  document.getElementById('quote-drawer-backdrop')?.addEventListener('click', closeQuoteDrawer);
  document.getElementById('btn-send-quote-whatsapp')?.addEventListener('click', sendQuoteListToWhatsapp);

  document.getElementById('btn-clear-quote')?.addEventListener('click', () => {
    quoteItems = [];
    saveQuoteItems();
    syncQuoteCountersAndCards();
    renderQuoteDrawerContents();
    showToast('Lista de cotización vaciada.');
  });

  const quoteBranchSelect = document.getElementById('quote-branch-select') as HTMLSelectElement | null;
  quoteBranchSelect?.addEventListener('change', () => {
    saveSelectedBranchId(quoteBranchSelect.value);
    syncBranchSelectorsValue();
    renderStoreLocator(false, false);
  });

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const addBtn = target.closest<HTMLButtonElement>('[data-add-quote]');
    if (addBtn) {
      const productId = addBtn.dataset.addQuote ?? '';
      addToQuote(productId, 1);
      return;
    }

    const stepBtn = target.closest<HTMLButtonElement>('[data-quote-step]');
    if (stepBtn) {
      const productId = stepBtn.dataset.quoteStep ?? '';
      const dir = Number(stepBtn.dataset.stepDir ?? '0');
      if (productId && dir !== 0) {
        addToQuote(productId, dir);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modalDialog = document.getElementById('collaborator-modal-dialog');
    if (modalDialog?.classList.contains('is-open')) {
      closeCollaboratorModal();
      return;
    }
    const drawerPanel = document.getElementById('quote-drawer-panel');
    if (drawerPanel?.getAttribute('data-open') === 'true') {
      closeQuoteDrawer();
      return;
    }
    if (mobileDropdownOpen) {
      closeMobileDropdown();
    }
  });

  window.addEventListener('resize', () => {
    tabSyncCallbacks.forEach((fn) => fn());
  });

  window.addEventListener('hashchange', () => {
    const next = parseHashRoute();
    if (next !== currentView) {
      switchView(next, false, true);
    }
  });
}

function bootstrap(): void {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  updateVenezuelaClock();
  window.setInterval(updateVenezuelaClock, 30000);

  populateBranchSelectors();
  initHeroShowcase();
  initHeroBcvCalculator();
  renderWorldsMosaic();
  renderHomeFeaturedProducts();
  initCatalogControls();
  renderCatalogGrid(false);
  initStoreLocatorControls();
  renderStoreLocator(false, false);
  void initStoreMap();
  renderEventsAndFaq();
  initContactForm();
  initCollaboratorFlows();
  renderCursosView(false);
  syncQuoteCountersAndCards();
  renderQuoteDrawerContents();
  bindSpotlightCards(document);
  bindGlobalInteractions();

  const initialRoute = parseHashRoute();
  if (initialRoute !== 'inicio') {
    switchView(initialRoute, true, false);
  }

  initGsapAnimations();
  void syncLiveBcvRate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
