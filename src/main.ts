import './style.css';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import {
  CATEGORIES,
  PRODUCTS,
  STORES,
  EVENTS,
  WHATSAPP_MAIN,
  FALLBACK_BCV_RATE,
  type Product,
  type StoreBranch,
  type BrandTone,
} from './data';

type AppView = 'inicio' | 'nosotros' | 'contacto' | 'tienda';

interface CartItem {
  product: Product;
  quantity: number;
}

interface FilterState {
  category: string;
  maxPrice: number;
  onlyOffers: boolean;
  searchQuery: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'offers';
}

interface LandingBannerSlide {
  caption: string;
  image: string;
  activeBtnClass: string;
}

const LANDING_BANNERS: LandingBannerSlide[] = [
  {
    caption: 'Sede Maracay (Av. Las Delicias) y expansión nacional a 9 sedes',
    image: './Maracay apertura.jpg',
    activeBtnClass: 'bg-[#E62E2D] text-white',
  },
  {
    caption: '¡Ubícanos! Nuestras sedes en Barinas, Portuguesa, Lara, Aragua y Zulia',
    image: './Banner Tiendas actualizado.jpg',
    activeBtnClass: 'bg-[#09569A] text-white',
  },
  {
    caption: 'Somos Tecnología, Hogar, Ferretería, Construcción y Agro y Jardinería',
    image: './Banner Categorias 2.jpg',
    activeBtnClass: 'bg-[#3B9B8E] text-white',
  },
  {
    caption: 'Eventos, talleres gratuitos y actividades ¡Para toda la Familia!',
    image: './Banner Eventos 2.jpg',
    activeBtnClass: 'bg-[#E62E2D] text-white',
  },
  {
    caption: 'Síguenos en nuestras redes sociales @mangocenter • WhatsApp 0422-6264623',
    image: './Banner REDES.jpg',
    activeBtnClass: 'bg-[#09569A] text-white',
  },
];

// Global State
let currencyMode: 'both' | 'usd' = 'both';
let bcvRate = FALLBACK_BCV_RATE;

const filterState: FilterState = {
  category: 'all',
  maxPrice: 150,
  onlyOffers: false,
  searchQuery: '',
  sortBy: 'featured',
};

let activeStoreStateFilter = 'all';
let selectedStoreId = STORES[0].id; // Default to Maracaibo (9na sede) or user selection
let gmpMapInstance: google.maps.Map | null = null;

let cart: CartItem[] = [
  { product: PRODUCTS[0], quantity: 2 }, // $1.15 x 2
  { product: PRODUCTS[1], quantity: 1 }, // $38.00 x 1
];

/**
 * Formats USD strictly to 2 decimal places ($1.15, $38.00)
 */
function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Formats Bolívares at BCV exchange rate (Bs. 53,88)
 */
function formatBsBCV(usdAmount: number): string {
  const bs = usdAmount * bcvRate;
  return `Bs. ${bs.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Fetches live official BCV exchange rate from public API with graceful fallback
 */
async function fetchLiveBCVRate(): Promise<void> {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    if (!res.ok) return;
    const data = (await res.json()) as { promedio?: number; fechaActualizacion?: string };
    if (typeof data.promedio === 'number' && data.promedio > 0) {
      bcvRate = data.promedio;
      updateBCVLabels(true);
      renderLandingFeaturedProducts();
      renderCatalog();
      renderCart();
    }
  } catch {
    // Graceful fallback if offline
    updateBCVLabels(false);
  }
}

function updateBCVLabels(isLive: boolean): void {
  const formattedRate = bcvRate.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const topRate = document.getElementById('top-bcv-rate');
  const storeRate = document.getElementById('store-header-bcv-val');
  const statusTag = document.getElementById('bcv-status-tag');
  const cartSubtitle = document.getElementById('cart-bcv-subtitle');

  if (topRate) topRate.textContent = `Bs. ${formattedRate} / $1.00`;
  if (storeRate) storeRate.textContent = `Bs. ${formattedRate}`;
  if (statusTag) {
    statusTag.textContent = isLive ? 'Tasa Oficial BCV (En Vivo)' : 'Tasa BCV Referencial';
  }
  if (cartSubtitle) {
    cartSubtitle.textContent = `Tasa BCV aplicada: Bs. ${formattedRate} / $1.00`;
  }
}

/**
 * Checks whether a branch is currently open based on real Venezuela time (America/Caracas)
 */
function getStoreOpenStatus(store: StoreBranch): { isOpen: boolean; label: string } {
  try {
    const nowCaracas = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'America/Caracas' })
    );
    const hour = nowCaracas.getHours();
    const isOpen = hour >= store.openHour && hour < store.closeHour;
    return {
      isOpen,
      label: isOpen ? 'Abierto ahora' : `Cerrado • Abre ${store.openHour}:00 AM`,
    };
  } catch {
    return { isOpen: true, label: 'Horario habitual activo' };
  }
}

/**
 * Helper to return tricolor classes based on BrandTone ('red' | 'blue' | 'teal')
 */
function getToneClasses(tone: BrandTone): {
  badgeBg: string;
  borderTop: string;
  textAccent: string;
  softBg: string;
  btnBg: string;
} {
  if (tone === 'red') {
    return {
      badgeBg: 'bg-[#E62E2D] text-white',
      borderTop: 'border-t-4 border-t-[#E62E2D]',
      textAccent: 'text-[#E62E2D]',
      softBg: 'bg-red-50 text-[#E62E2D] border-red-200',
      btnBg: 'bg-[#E62E2D] hover:bg-[#c81e23] text-white',
    };
  }
  if (tone === 'teal') {
    return {
      badgeBg: 'bg-[#3B9B8E] text-white',
      borderTop: 'border-t-4 border-t-[#3B9B8E]',
      textAccent: 'text-[#2A786D]',
      softBg: 'bg-emerald-50 text-[#2A786D] border-emerald-200',
      btnBg: 'bg-[#3B9B8E] hover:bg-[#2A786D] text-white',
    };
  }
  return {
    badgeBg: 'bg-[#09569A] text-white',
    borderTop: 'border-t-4 border-t-[#09569A]',
    textAccent: 'text-[#09569A]',
    softBg: 'bg-blue-50 text-[#09569A] border-blue-200',
    btnBg: 'bg-[#09569A] hover:bg-[#063B6B] text-white',
  };
}

/**
 * Toast Notification
 */
function showToast(title: string, subtitle: string, tone: BrandTone = 'teal'): void {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toneStyle = getToneClasses(tone);
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto bg-white text-slate-900 p-4 rounded-2xl shadow-xl border border-slate-200 ${toneStyle.borderTop} flex items-start gap-3 transition-all duration-300 translate-y-2 opacity-0`;
  toast.innerHTML = `
    <div class="w-7 h-7 rounded-xl ${toneStyle.badgeBg} flex items-center justify-center shrink-0 font-black text-xs">
      ✓
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-xs font-extrabold text-slate-900 truncate">${title}</p>
      <p class="text-[11px] text-slate-600 mt-0.5 leading-snug">${subtitle}</p>
    </div>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * SPA NAVIGATION WITH URL HASH ROUTING (#/inicio, #/nosotros, #/contacto, #/tienda)
 */
function switchView(targetView: AppView, scrollToTop = true): void {
  const views: AppView[] = ['inicio', 'nosotros', 'contacto', 'tienda'];
  views.forEach((v) => {
    const el = document.getElementById(`view-${v}`);
    if (!el) return;
    if (v === targetView) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  const targetHash = `#/${targetView}`;
  if (window.location.hash !== targetHash) {
    history.pushState(null, '', targetHash);
  }

  // Update desktop header navigation active pills
  document.querySelectorAll<HTMLElement>('header nav [data-nav-view]').forEach((btn) => {
    const viewAttr = btn.dataset.navView as AppView;
    if (viewAttr === 'tienda') {
      if (targetView === 'tienda') {
        btn.className =
          'nav-view-trigger ml-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-extrabold bg-[#E62E2D] text-white shadow-md transition-all cursor-pointer';
      } else {
        btn.className =
          'nav-view-trigger ml-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-extrabold bg-[#09569A] hover:bg-[#063B6B] text-white shadow-md hover:-translate-y-0.5 transition-all cursor-pointer';
      }
    } else {
      if (viewAttr === targetView) {
        btn.className =
          'nav-view-trigger px-4 py-2 rounded-full text-sm font-extrabold transition-all cursor-pointer bg-[#E62E2D] text-white shadow-xs';
      } else {
        btn.className =
          'nav-view-trigger px-4 py-2 rounded-full text-sm font-bold text-slate-700 hover:text-[#09569A] hover:bg-slate-100 transition-all cursor-pointer';
      }
    }
  });

  if (scrollToTop) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function syncViewFromHash(): void {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash === 'nosotros' || hash === 'contacto' || hash === 'tienda' || hash === 'inicio') {
    switchView(hash, false);
  }
}

function initViewNavigation(): void {
  document.querySelectorAll<HTMLElement>('.nav-view-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const target = (trigger.dataset.navView as AppView) ?? 'inicio';
      switchView(target);
      document.getElementById('mobile-menu-drawer')?.classList.add('hidden');
    });
  });

  window.addEventListener('hashchange', syncViewFromHash);

  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-menu-drawer');
  mobileBtn?.addEventListener('click', () => {
    mobileDrawer?.classList.toggle('hidden');
  });

  // Mobile bottom bar "9 Sedes" button switches to Inicio and scrolls to map
  document.getElementById('mobile-bottom-sedes-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('inicio', false);
    document.getElementById('landing-mapa-sedes')?.scrollIntoView({ behavior: 'smooth' });
  });
}

/**
 * 1. LANDING PAGE PANORAMIC BANNER SWITCHER (No cropping!)
 */
function initLandingHeroBanner(): void {
  const imgEl = document.getElementById('landing-hero-img') as HTMLImageElement | null;
  const captionEl = document.getElementById('landing-hero-caption');
  const btns = document.querySelectorAll<HTMLButtonElement>('.landing-banner-btn');

  function setBanner(index: number): void {
    const slide = LANDING_BANNERS[index];
    if (!slide || !imgEl) return;

    imgEl.src = slide.image;
    if (captionEl) captionEl.textContent = slide.caption;

    btns.forEach((b, idx) => {
      if (idx === index) {
        b.className = `landing-banner-btn px-3.5 py-2 rounded-xl text-xs font-extrabold ${slide.activeBtnClass} shadow-xs transition-all cursor-pointer whitespace-nowrap`;
      } else {
        b.className =
          'landing-banner-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer whitespace-nowrap';
      }
    });
  }

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.landingBanner ?? 0);
      setBanner(idx);
    });
  });
}

/**
 * 2. LANDING CATEGORIES GRID (6 Tricolor Cards without fake item counts)
 */
function renderLandingCategories(): void {
  const container = document.getElementById('landing-categories-grid');
  if (!container) return;

  container.innerHTML = CATEGORIES.map((cat) => {
    const toneStyle = getToneClasses(cat.tone);
    return `
      <button
        type="button"
        data-landing-cat="${cat.id}"
        class="group relative h-56 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 text-left flex flex-col justify-between p-4 cursor-pointer focus:outline-none ${toneStyle.borderTop}"
      >
        <img
          src="${cat.image}"
          alt="${cat.name}"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t ${cat.accentColor} via-slate-950/35 to-slate-950/10"></div>

        <div class="relative z-10 flex items-center justify-between w-full">
          <div class="w-10 h-10 rounded-2xl bg-white/95 text-slate-900 flex items-center justify-center shadow-sm">
            ${cat.iconSvg}
          </div>
          <span class="${cat.pillColor} text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
            ${cat.badge ?? 'Ver'}
          </span>
        </div>

        <div class="relative z-10 text-white">
          <h3 class="text-base sm:text-lg font-black leading-tight">${cat.name}</h3>
          <p class="text-[11px] text-white/90 line-clamp-2 mt-1 leading-snug">${cat.subtitle}</p>
        </div>
      </button>
    `;
  }).join('');

  container.querySelectorAll<HTMLButtonElement>('[data-landing-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.landingCat ?? 'all';
      filterState.category = catId;
      renderSidebarCategoryFilters();
      renderCatalog();
      switchView('tienda');
    });
  });
}

/**
 * 3. LANDING FEATURED WEEKLY OFFERS (4 Products Preview -> Bridge to Store)
 */
function renderLandingFeaturedProducts(): void {
  const container = document.getElementById('landing-featured-products');
  if (!container) return;

  const featured = PRODUCTS.slice(0, 4);
  container.innerHTML = featured
    .map((product) => {
      const toneStyle = getToneClasses(product.tone);
      const formattedPrice = formatUSD(product.price);
      const formattedOldPrice = product.oldPrice ? formatUSD(product.oldPrice) : null;
      const formattedBs = formatBsBCV(product.price);

      return `
        <article class="bg-[#F8FAFC] rounded-3xl border border-slate-200/90 ${toneStyle.borderTop} p-4 flex flex-col justify-between hover:shadow-lg transition-all group">
          <div>
            <div class="relative h-40 rounded-2xl overflow-hidden bg-white mb-3">
              <img
                src="${product.image}"
                alt="${product.name}"
                loading="lazy"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span class="absolute top-2.5 left-2.5 ${toneStyle.badgeBg} text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                ${product.offerLabel ?? product.categoryLabel}
              </span>
            </div>
            <p class="text-[10px] font-extrabold uppercase tracking-wider ${toneStyle.textAccent}">${product.brand}</p>
            <h3 class="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 mt-0.5">${product.name}</h3>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-200/80 flex items-end justify-between gap-2">
            <div>
              <div class="flex items-baseline gap-1.5">
                <span class="text-xl font-black text-slate-900">${formattedPrice}</span>
                ${
                  formattedOldPrice
                    ? `<span class="text-[11px] text-slate-400 line-through">${formattedOldPrice}</span>`
                    : ''
                }
              </div>
              <p class="text-[11px] font-bold text-[#2A786D]">≈ ${formattedBs}</p>
            </div>

            <button
              type="button"
              data-landing-add="${product.id}"
              class="${toneStyle.btnBg} text-xs font-extrabold px-3 py-2 rounded-xl cursor-pointer transition-all"
            >
              + Carrito
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  container.querySelectorAll<HTMLButtonElement>('[data-landing-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prod = PRODUCTS.find((p) => p.id === btn.dataset.landingAdd);
      if (prod) addToCart(prod);
    });
  });
}

/**
 * 4. INTERACTIVE 9-STORE LOCATOR WITH GOOGLE MAPS PLATFORM
 */
async function initGoogleMapsPlatformIfKeyPresent(): Promise<void> {
  const apiKey = (import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    // No API key set in .env yet -> interactive iframe map handles rendering seamlessly
    return;
  }

  const mapCanvas = document.getElementById('gmp-js-map-canvas');
  const mapIframe = document.getElementById('store-map-iframe');
  if (!mapCanvas) return;

  try {
    setOptions({
      key: apiKey,
      v: 'weekly',
      language: 'es',
      region: 'VE',
    });

    const { Map } = (await importLibrary('maps')) as google.maps.MapsLibrary;
    const { AdvancedMarkerElement, PinElement } = (await importLibrary(
      'marker'
    )) as google.maps.MarkerLibrary;

    mapCanvas.classList.remove('hidden');
    mapIframe?.classList.add('hidden');

    const initialStore = STORES.find((s) => s.id === selectedStoreId) ?? STORES[0];
    gmpMapInstance = new Map(mapCanvas, {
      center: { lat: initialStore.lat, lng: initialStore.lng },
      zoom: 14,
      mapId: 'DEMO_MAP_ID',
      internalUsageAttributionIds: ['gmp_git_agentskills_v1'],
    });

    STORES.forEach((store) => {
      const pinBg =
        store.tone === 'red' ? '#E62E2D' : store.tone === 'teal' ? '#3B9B8E' : '#09569A';
      const pin = new PinElement({
        background: pinBg,
        borderColor: '#FFFFFF',
        glyphColor: '#FFFFFF',
        glyphText: 'M',
      });

      const marker = new AdvancedMarkerElement({
        map: gmpMapInstance,
        position: { lat: store.lat, lng: store.lng },
        title: store.name,
      });
      marker.append(pin);

      marker.addEventListener('click', () => {
        selectStoreOnMap(store.id);
      });
    });
  } catch {
    // Fallback to iframe if Maps JS fails
    mapCanvas.classList.add('hidden');
    mapIframe?.classList.remove('hidden');
  }
}

function selectStoreOnMap(storeId: string): void {
  selectedStoreId = storeId;
  const store = STORES.find((s) => s.id === storeId) ?? STORES[0];

  // Update interactive iframe query
  const iframe = document.getElementById('store-map-iframe') as HTMLIFrameElement | null;
  if (iframe) {
    iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(
      store.mapsQuery
    )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // Pan Google Maps JS API instance if initialized
  if (gmpMapInstance) {
    gmpMapInstance.panTo({ lat: store.lat, lng: store.lng });
    gmpMapInstance.setZoom(15);
  }

  renderStoresSection();
}

function renderStoresSection(): void {
  const tabsContainer = document.getElementById('store-tabs-container');
  const listContainer = document.getElementById('stores-locator-list');
  const detailContainer = document.getElementById('selected-store-detail');
  if (!tabsContainer || !listContainer || !detailContainer) return;

  const stateTabs = [
    { id: 'all', label: 'Todas (9)', tone: 'red' as BrandTone },
    { id: 'Zulia', label: '★ Zulia (9na Sede)', tone: 'red' as BrandTone },
    { id: 'Aragua', label: 'Aragua', tone: 'blue' as BrandTone },
    { id: 'Barinas', label: 'Barinas (3)', tone: 'teal' as BrandTone },
    { id: 'Portuguesa', label: 'Portuguesa (2)', tone: 'blue' as BrandTone },
    { id: 'Lara', label: 'Lara (2)', tone: 'red' as BrandTone },
  ];

  tabsContainer.innerHTML = stateTabs
    .map((tab) => {
      const active = activeStoreStateFilter === tab.id;
      const activeBg =
        tab.tone === 'red'
          ? 'bg-[#E62E2D] text-white'
          : tab.tone === 'teal'
          ? 'bg-[#3B9B8E] text-white'
          : 'bg-[#09569A] text-white';

      return `
        <button
          type="button"
          data-state-tab="${tab.id}"
          class="px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            active
              ? `${activeBg} shadow-xs`
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }"
        >
          ${tab.label}
        </button>
      `;
    })
    .join('');

  const visibleStores =
    activeStoreStateFilter === 'all'
      ? STORES
      : STORES.filter((s) => s.stateFilter === activeStoreStateFilter);

  // Ensure selectedStoreId is inside visibleStores
  if (!visibleStores.some((s) => s.id === selectedStoreId) && visibleStores.length > 0) {
    selectedStoreId = visibleStores[0].id;
  }

  const activeStore = STORES.find((s) => s.id === selectedStoreId) ?? STORES[0];

  // Render Left Compact Store Cards
  listContainer.innerHTML = visibleStores
    .map((store) => {
      const isSelected = store.id === activeStore.id;
      const toneStyle = getToneClasses(store.tone);
      const status = getStoreOpenStatus(store);

      return `
        <button
          type="button"
          data-select-store="${store.id}"
          class="w-full text-left bg-white rounded-2xl p-4 border transition-all cursor-pointer flex items-start justify-between gap-3 ${
            isSelected
              ? 'border-2 border-[#09569A] shadow-md ring-2 ring-[#09569A]/15'
              : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
          }"
        >
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="${toneStyle.badgeBg} text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                ${store.highlightBadge}
              </span>
              <span class="text-[11px] font-bold ${
                status.isOpen ? 'text-[#15803D]' : 'text-amber-600'
              }">
                ● ${status.label}
              </span>
            </div>
            <h3 class="font-black text-slate-900 text-sm sm:text-base truncate">${store.name}</h3>
            <p class="text-xs text-slate-600 line-clamp-2">📍 ${store.address}</p>
            <p class="text-[11px] text-slate-400">${store.hoursWeek}</p>
          </div>

          <span class="shrink-0 w-8 h-8 rounded-xl ${
            isSelected ? 'bg-[#09569A] text-white' : 'bg-slate-100 text-slate-600'
          } flex items-center justify-center text-xs font-bold">
            →
          </span>
        </button>
      `;
    })
    .join('');

  // Render Right Selected Store Detail Footer under the Map
  const activeStatus = getStoreOpenStatus(activeStore);
  const activeTone = getToneClasses(activeStore.tone);
  const waLink = `https://wa.me/${activeStore.whatsappNumber}?text=${encodeURIComponent(
    `Hola MangoCenter! Consulto por la sede *${activeStore.name}* (${activeStore.address}).`
  )}`;

  detailContainer.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="${activeTone.badgeBg} text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
            ${activeStore.state}
          </span>
          <span class="text-xs font-extrabold ${
            activeStatus.isOpen ? 'text-[#15803D]' : 'text-amber-600'
          }">
            ● ${activeStatus.label}
          </span>
        </div>
        <h3 class="text-lg sm:text-xl font-black text-slate-900">${activeStore.name}</h3>
        <p class="text-xs text-slate-600">📍 <strong>Dirección:</strong> ${activeStore.address}</p>
        <p class="text-xs text-slate-500">${activeStore.reference} • ⏰ ${activeStore.hoursWeek}</p>
      </div>

      <div class="flex sm:flex-col gap-2 shrink-0">
        <a
          href="${waLink}"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 transition-all"
        >
          WhatsApp Sede
        </a>
        <a
          href="${activeStore.mapsUrl}"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-[#09569A] hover:bg-[#063B6B] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 transition-all"
        >
          Abrir en Google Maps ↗
        </a>
      </div>
    </div>
  `;

  tabsContainer.querySelectorAll<HTMLButtonElement>('[data-state-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeStoreStateFilter = btn.dataset.stateTab ?? 'all';
      const firstMatch =
        activeStoreStateFilter === 'all'
          ? STORES[0]
          : STORES.find((s) => s.stateFilter === activeStoreStateFilter) ?? STORES[0];
      selectStoreOnMap(firstMatch.id);
    });
  });

  listContainer.querySelectorAll<HTMLButtonElement>('[data-select-store]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.selectStore ?? STORES[0].id;
      selectStoreOnMap(id);
    });
  });
}

/**
 * 5. EVENTS SHOWCASE (1 Featured Uncropped Event + 3 Compact Cards)
 */
function renderEventsSection(): void {
  const container = document.getElementById('events-showcase-layout');
  if (!container) return;

  const mainEvent = EVENTS[0];
  const secondaryEvents = EVENTS.slice(1);
  const mainWa = `https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent(
    `Hola MangoCenter! Quiero información sobre: *${mainEvent.title}*.`
  )}`;

  container.innerHTML = `
    <!-- Featured Main Event -->
    <div class="lg:col-span-6 bg-[#F8FAFC] rounded-3xl border border-slate-200/90 border-t-4 border-t-[#E62E2D] overflow-hidden flex flex-col justify-between shadow-xs">
      <div>
        <div class="bg-[#042442] p-2">
          <img
            src="${mainEvent.image}"
            alt="${mainEvent.title}"
            loading="lazy"
            class="w-full h-auto max-h-64 object-contain mx-auto rounded-xl"
          />
        </div>
        <div class="p-6 space-y-2.5">
          <div class="flex items-center gap-2">
            <span class="bg-[#E62E2D] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              ${mainEvent.category}
            </span>
            <span class="text-xs font-bold text-[#09569A]">${mainEvent.date}</span>
          </div>
          <h3 class="text-xl font-black text-slate-900">${mainEvent.title}</h3>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">${mainEvent.description}</p>
          <p class="text-xs text-slate-500 pt-1">📍 <strong>Sede:</strong> ${mainEvent.branch} • 🎟️ ${mainEvent.spotsAvailable}</p>
        </div>
      </div>
      <div class="px-6 pb-6">
        <a
          href="${mainWa}"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full bg-[#E62E2D] hover:bg-[#c81e23] text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl inline-flex items-center justify-center transition-colors"
        >
          Consultar Detalles vía WhatsApp
        </a>
      </div>
    </div>

    <!-- 3 Compact Workshops & Courses List -->
    <div class="lg:col-span-6 flex flex-col justify-between gap-4">
      ${secondaryEvents
        .map((evt) => {
          const toneStyle = getToneClasses(evt.tone);
          const waUrl = `https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent(
            `Hola MangoCenter! Quiero inscribirme gratis en: *${evt.title}*.`
          )}`;
          return `
            <article class="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 ${toneStyle.borderTop} p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="${toneStyle.badgeBg} text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    ${evt.category}
                  </span>
                  <span class="text-[11px] font-bold text-slate-500">📍 ${evt.branch}</span>
                </div>
                <h4 class="font-extrabold text-slate-900 text-sm sm:text-base">${evt.title}</h4>
                <p class="text-xs text-slate-600 line-clamp-2">${evt.description}</p>
              </div>
              <a
                href="${waUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="${toneStyle.btnBg} text-xs font-extrabold px-4 py-2.5 rounded-xl shrink-0 transition-all"
              >
                Inscribirme
              </a>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

/**
 * 6. STORE ("TIENDA") CATALOG WITH TRICOLOR CARDS & LIVE BCV RATE
 */
function renderSidebarCategoryFilters(): void {
  const container = document.getElementById('sidebar-category-filters');
  if (!container) return;

  const items = [
    { id: 'all', name: 'Todos los Departamentos', tone: 'red' as BrandTone },
    ...CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      tone: c.tone,
    })),
  ];

  container.innerHTML = items
    .map((item) => {
      const active = filterState.category === item.id;
      const activeBg =
        item.tone === 'red'
          ? 'bg-[#E62E2D] text-white'
          : item.tone === 'teal'
          ? 'bg-[#3B9B8E] text-white'
          : 'bg-[#09569A] text-white';

      const dotColor =
        item.tone === 'red'
          ? 'bg-[#E62E2D]'
          : item.tone === 'teal'
          ? 'bg-[#3B9B8E]'
          : 'bg-[#09569A]';

      return `
        <button
          type="button"
          data-sidebar-cat="${item.id}"
          class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            active
              ? `${activeBg} shadow-xs`
              : 'bg-[#F8FAFC] text-slate-700 hover:bg-slate-100 border border-slate-200/60'
          }"
        >
          <span class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${active ? 'bg-white' : dotColor}"></span>
            <span>${item.name}</span>
          </span>
          <span>→</span>
        </button>
      `;
    })
    .join('');

  container.querySelectorAll<HTMLButtonElement>('[data-sidebar-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filterState.category = btn.dataset.sidebarCat ?? 'all';
      renderSidebarCategoryFilters();
      renderCatalog();
    });
  });
}

function renderCatalog(): void {
  const grid = document.getElementById('products-grid');
  const activeCatPill = document.getElementById('active-category-pill');
  if (!grid) return;

  let filtered = PRODUCTS.filter((p) => {
    if (filterState.category !== 'all' && p.category !== filterState.category) return false;
    if (p.price > filterState.maxPrice) return false;
    if (filterState.onlyOffers && !p.isOffer) return false;
    if (filterState.searchQuery.trim() !== '') {
      const q = filterState.searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchCat = p.categoryLabel.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchSku && !matchCat) return false;
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (filterState.sortBy === 'price-asc') return a.price - b.price;
    if (filterState.sortBy === 'price-desc') return b.price - a.price;
    if (filterState.sortBy === 'offers') return Number(b.isOffer) - Number(a.isOffer);
    return 0;
  });

  if (activeCatPill) {
    if (filterState.category !== 'all') {
      const catObj = CATEGORIES.find((c) => c.id === filterState.category);
      activeCatPill.textContent = catObj?.name ?? filterState.category;
      activeCatPill.classList.remove('hidden');
    } else {
      activeCatPill.classList.add('hidden');
    }
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3">
        <p class="text-base font-black text-slate-800">No encontramos productos con esos filtros</p>
        <p class="text-xs text-slate-500">Restablece los filtros para ver el catálogo de MangoCenter.</p>
        <button id="empty-reset-btn" type="button" class="bg-[#E62E2D] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl cursor-pointer">
          Restablecer Filtros
        </button>
      </div>
    `;
    document.getElementById('empty-reset-btn')?.addEventListener('click', resetAllFilters);
    return;
  }

  grid.innerHTML = filtered
    .map((product) => {
      const toneStyle = getToneClasses(product.tone);
      const formattedPrice = formatUSD(product.price);
      const formattedOldPrice = product.oldPrice ? formatUSD(product.oldPrice) : null;
      const formattedBs = formatBsBCV(product.price);

      const waText = encodeURIComponent(
        `Hola MangoCenter! Me interesa el producto: *${product.name}* (SKU: ${product.sku}) — Precio: *${formattedPrice}* (${formattedBs} a tasa BCV).`
      );
      const waUrl = `https://wa.me/${WHATSAPP_MAIN}?text=${waText}`;

      return `
        <article class="bg-white rounded-3xl border border-slate-200/90 ${toneStyle.borderTop} shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
          <div>
            <div class="relative h-48 bg-slate-100 overflow-hidden">
              <img
                src="${product.image}"
                alt="${product.name}"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div class="absolute top-3 left-3 flex flex-col gap-1">
                ${
                  product.isOffer
                    ? `<span class="bg-[#E62E2D] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-xs">
                        ${product.offerLabel ?? 'Oferta'}
                      </span>`
                    : ''
                }
                <span class="${toneStyle.badgeBg} text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs w-fit">
                  ${product.categoryLabel}
                </span>
              </div>

              <span class="absolute top-3 right-3 bg-white/95 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-2xs">
                ${product.sku}
              </span>
            </div>

            <div class="p-5">
              <div class="flex items-center justify-between text-[11px] mb-1.5">
                <span class="font-extrabold uppercase tracking-wider ${toneStyle.textAccent}">${product.brand}</span>
                <span class="text-amber-500 font-bold">★ ${product.rating.toFixed(1)}</span>
              </div>

              <h3 class="font-extrabold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.6rem]">
                ${product.name}
              </h3>

              <ul class="mt-3 space-y-1 text-[11px] text-slate-500">
                ${product.specs
                  .map(
                    (spec) => `
                  <li class="flex items-center gap-1.5 truncate">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                    <span>${spec}</span>
                  </li>
                `
                  )
                  .join('')}
              </ul>

              <div class="mt-3.5 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${toneStyle.softBg}">
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                ${product.stockStatus}
              </div>
            </div>
          </div>

          <div class="p-5 pt-3.5 border-t border-slate-100 bg-[#F8FAFC]/70">
            <div class="flex items-end justify-between mb-3.5">
              <div>
                <span class="text-[10px] font-bold uppercase text-slate-400 block">Precio (${product.unit})</span>
                <div class="flex items-baseline gap-2">
                  <span class="text-2xl font-black text-slate-900">${formattedPrice}</span>
                  ${
                    formattedOldPrice
                      ? `<span class="text-xs font-bold text-slate-400 line-through">${formattedOldPrice}</span>`
                      : ''
                  }
                </div>
                ${
                  currencyMode === 'both'
                    ? `<p class="text-[11px] font-extrabold text-[#2A786D] mt-0.5">
                        ≈ ${formattedBs} <span class="font-normal text-slate-400">(BCV)</span>
                      </p>`
                    : ''
                }
              </div>

              ${
                product.oldPrice
                  ? `<span class="text-[10px] font-extrabold text-[#E62E2D] bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                      -${formatUSD(product.oldPrice - product.price)}
                    </span>`
                  : ''
              }
            </div>

            <div class="grid grid-cols-1 gap-2">
              <button
                type="button"
                data-add-to-cart="${product.id}"
                class="w-full ${toneStyle.btnBg} font-extrabold text-xs py-2.5 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <span>+ Añadir al Carrito (${formattedPrice})</span>
              </button>

              <a
                href="${waUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full bg-white hover:bg-[#25D366] text-slate-700 hover:text-slate-950 font-bold text-xs py-2 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 border border-slate-200 hover:border-[#25D366] transition-all"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  grid.querySelectorAll<HTMLButtonElement>('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prod = PRODUCTS.find((p) => p.id === btn.dataset.addToCart);
      if (prod) addToCart(prod);
    });
  });
}

function resetAllFilters(): void {
  filterState.category = 'all';
  filterState.maxPrice = 150;
  filterState.onlyOffers = false;
  filterState.searchQuery = '';
  filterState.sortBy = 'featured';

  const slider = document.getElementById('price-range-slider') as HTMLInputElement | null;
  const priceLabel = document.getElementById('price-range-label');
  const offersCheck = document.getElementById('filter-only-offers') as HTMLInputElement | null;
  const searchInput = document.getElementById('catalog-search-input') as HTMLInputElement | null;
  const sortSelect = document.getElementById('catalog-sort-select') as HTMLSelectElement | null;

  if (slider) slider.value = '150';
  if (priceLabel) priceLabel.textContent = 'Hasta $150.00';
  if (offersCheck) offersCheck.checked = false;
  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'featured';

  renderSidebarCategoryFilters();
  renderCatalog();
}

function initStoreControls(): void {
  const slider = document.getElementById('price-range-slider') as HTMLInputElement | null;
  const priceLabel = document.getElementById('price-range-label');
  const offersCheck = document.getElementById('filter-only-offers') as HTMLInputElement | null;
  const searchInput = document.getElementById('catalog-search-input') as HTMLInputElement | null;
  const sortSelect = document.getElementById('catalog-sort-select') as HTMLSelectElement | null;
  const resetBtn = document.getElementById('reset-filters-btn');

  slider?.addEventListener('input', () => {
    const val = Number(slider.value);
    filterState.maxPrice = val;
    if (priceLabel) priceLabel.textContent = `Hasta ${formatUSD(val)}`;
    renderCatalog();
  });

  document.querySelectorAll<HTMLButtonElement>('.price-tier-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const maxVal = Number(btn.dataset.priceMax ?? 150);
      filterState.maxPrice = maxVal;
      if (slider) slider.value = String(maxVal);
      if (priceLabel) priceLabel.textContent = `Hasta ${formatUSD(maxVal)}`;
      renderCatalog();
    });
  });

  offersCheck?.addEventListener('change', () => {
    filterState.onlyOffers = offersCheck.checked;
    renderCatalog();
  });

  searchInput?.addEventListener('input', () => {
    filterState.searchQuery = searchInput.value;
    renderCatalog();
  });

  sortSelect?.addEventListener('change', () => {
    filterState.sortBy = sortSelect.value as FilterState['sortBy'];
    renderCatalog();
  });

  resetBtn?.addEventListener('click', () => {
    resetAllFilters();
    showToast('Filtros Limpiados', 'Mostrando todos los productos del catálogo.', 'blue');
  });

  const currencyBtns = document.querySelectorAll<HTMLButtonElement>('.currency-mode-btn');
  currencyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currencyMode = (btn.dataset.currencyMode as 'both' | 'usd') ?? 'both';
      currencyBtns.forEach((b) => {
        if (b.dataset.currencyMode === currencyMode) {
          b.className =
            'currency-mode-btn px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold bg-[#09569A] text-white cursor-pointer transition-all';
        } else {
          b.className =
            'currency-mode-btn px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-all';
        }
      });
      renderCatalog();
    });
  });
}

/**
 * 7. CART DRAWER & CONTACT FORM
 */
function addToCart(product: Product): void {
  const existing = cart.find((item) => item.product.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ product, quantity: 1 });
  }
  renderCart();
  showToast(
    'Añadido al Carrito',
    `${product.name} — ${formatUSD(product.price)} (${formatBsBCV(product.price)})`,
    product.tone
  );
}

function updateCartQuantity(productId: string, delta: number): void {
  const idx = cart.findIndex((i) => i.product.id === productId);
  if (idx === -1) return;
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) {
    cart.splice(idx, 1);
  }
  renderCart();
}

function renderCart(): void {
  const badge = document.getElementById('cart-count-badge');
  const container = document.getElementById('cart-items-container');
  const totalEl = document.getElementById('cart-total-amount');
  const totalBsEl = document.getElementById('cart-total-bs');
  const savingsEl = document.getElementById('cart-savings-amount');

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalSavings = cart.reduce((acc, item) => {
    const diff = item.product.oldPrice ? item.product.oldPrice - item.product.price : 0;
    return acc + diff * item.quantity;
  }, 0);

  if (badge) badge.textContent = String(totalItems);
  if (totalEl) totalEl.textContent = formatUSD(totalPrice);
  if (totalBsEl) totalBsEl.textContent = formatBsBCV(totalPrice);
  if (savingsEl) savingsEl.textContent = `-${formatUSD(totalSavings)}`;

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 space-y-2">
        <p class="text-sm font-black text-slate-800">Tu carrito está vacío</p>
        <p class="text-xs text-slate-500">Explora la Tienda para añadir productos con precios a 2 decimales y tasa BCV.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cart
    .map(({ product, quantity }) => {
      const subUsd = formatUSD(product.price * quantity);
      const subBs = formatBsBCV(product.price * quantity);
      return `
        <div class="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/80">
          <img src="${product.image}" alt="${product.name}" class="w-14 h-14 rounded-xl object-cover shrink-0 bg-white border border-slate-200" />
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-mono text-slate-400">${product.sku}</p>
            <h4 class="text-xs font-extrabold text-slate-900 truncate">${product.name}</h4>
            <p class="text-xs font-bold text-[#09569A] mt-0.5">
              ${formatUSD(product.price)} x ${quantity} = <strong class="text-slate-900">${subUsd}</strong>
            </p>
            <p class="text-[10px] font-bold text-[#2A786D]">${subBs}</p>
          </div>
          <div class="flex flex-col items-center gap-1">
            <button type="button" data-cart-qty="${product.id}" data-delta="1" class="w-6 h-6 rounded-lg bg-white border border-slate-300 hover:bg-[#09569A] hover:text-white text-xs font-black cursor-pointer">+</button>
            <span class="text-xs font-extrabold">${quantity}</span>
            <button type="button" data-cart-qty="${product.id}" data-delta="-1" class="w-6 h-6 rounded-lg bg-white border border-slate-300 hover:bg-[#E62E2D] hover:text-white text-xs font-black cursor-pointer">-</button>
          </div>
        </div>
      `;
    })
    .join('');

  container.querySelectorAll<HTMLButtonElement>('[data-cart-qty]').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateCartQuantity(btn.dataset.cartQty ?? '', Number(btn.dataset.delta ?? 0));
    });
  });
}

function initCartAndForms(): void {
  const cartOpenBtn = document.getElementById('cart-open-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartClearBtn = document.getElementById('cart-clear-btn');
  const cartWhatsappBtn = document.getElementById('cart-whatsapp-checkout-btn');

  cartOpenBtn?.addEventListener('click', () => cartBackdrop?.classList.remove('hidden'));
  cartCloseBtn?.addEventListener('click', () => cartBackdrop?.classList.add('hidden'));
  cartBackdrop?.addEventListener('click', (e) => {
    if (e.target === cartBackdrop) cartBackdrop.classList.add('hidden');
  });

  cartClearBtn?.addEventListener('click', () => {
    cart = [];
    renderCart();
    showToast('Carrito vaciado', 'Se eliminaron los productos.', 'red');
  });

  cartWhatsappBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Carrito vacío', 'Añade productos desde la Tienda antes de enviar.', 'red');
      return;
    }
    const total = cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    const lines = cart.map(
      (i) =>
        `• ${i.quantity}x ${i.product.name} (${i.product.sku}) — ${formatUSD(
          i.product.price * i.quantity
        )} (${formatBsBCV(i.product.price * i.quantity)})`
    );
    const msg = [
      '¡Hola *MangoCenter Hiperferretería*! 🛒',
      'Deseo solicitar el siguiente pedido desde la Tienda Online:',
      '',
      ...lines,
      '',
      `*TOTAL USD: ${formatUSD(total)}*`,
      `*EQUIVALENTE BCV (Bs. ${bcvRate.toFixed(2)}): ${formatBsBCV(total)}*`,
    ].join('\n');

    window.open(
      `https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent(msg)}`,
      '_blank',
      'noopener,noreferrer'
    );
  });

  const contactForm = document.getElementById('contact-page-form') as HTMLFormElement | null;
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('contact-name') as HTMLInputElement | null)?.value ?? '';
    const branch =
      (document.getElementById('contact-branch') as HTMLSelectElement | null)?.value ?? '';
    const message =
      (document.getElementById('contact-message') as HTMLTextAreaElement | null)?.value ?? '';

    showToast(
      `¡Gracias, ${name}!`,
      `Redirigiendo tu solicitud para ${branch} vía WhatsApp oficial.`,
      'teal'
    );

    const waMsg = `Hola MangoCenter! Soy *${name}*, escribo para la sede *${branch}*: ${message}`;
    setTimeout(() => {
      window.open(
        `https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent(waMsg)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }, 700);
    contactForm.reset();
  });

  const newsForm = document.getElementById('newsletter-form') as HTMLFormElement | null;
  const newsEmail = document.getElementById('newsletter-email') as HTMLInputElement | null;
  newsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (newsEmail?.value) {
      showToast(
        '¡Suscripción Exitosa!',
        `Recibirás nuestras ofertas en ${newsEmail.value}`,
        'blue'
      );
      newsEmail.value = '';
    }
  });
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initViewNavigation();
  syncViewFromHash();
  initLandingHeroBanner();
  renderLandingCategories();
  renderLandingFeaturedProducts();
  renderStoresSection();
  renderEventsSection();
  renderSidebarCategoryFilters();
  renderCatalog();
  initStoreControls();
  renderCart();
  initCartAndForms();
  void fetchLiveBCVRate();
  void initGoogleMapsPlatformIfKeyPresent();
});
