import './style.css';
import {
  CATEGORIES,
  PRODUCTS,
  STORES,
  EVENTS,
  WHATSAPP_MAIN,
  DEFAULT_BCV_RATE,
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
  badge: string;
  title: string;
  sub: string;
  image: string;
  badgeColor: string;
}

const LANDING_BANNERS: LandingBannerSlide[] = [
  {
    badge: '¡Nueva 9na Sede: Maracaibo 2,000 m²!',
    title: 'Crecemos contigo: 9 Supertiendas en Venezuela',
    sub: 'Zulia (Nueva 2,000 m²) • Aragua (Maracay) • Barinas (3 Sedes) • Portuguesa (2 Sedes) • Lara (2 Sedes)',
    image: './Maracay apertura.jpg',
    badgeColor: 'bg-[#E62E2D] text-white',
  },
  {
    badge: '¡Ubícanos en 5 Estados!',
    title: '9 Sedes estratégicas listas para atenderte',
    sub: 'Barinas, Alto Barinas, Barinas Centro, Guanare, Araure, Cabudare, Barquisimeto, Maracay y Maracaibo.',
    image: './Banner Tiendas actualizado.jpg',
    badgeColor: 'bg-[#09569A] text-white',
  },
  {
    badge: 'Somos 5 Mundos en 1',
    title: 'Tecnología, Hogar, Ferretería, Construcción y Agro',
    sub: 'Todo lo que necesita el profesional y el hogar venezolano ¡Para toda la Familia!',
    image: './Banner Categorias 2.jpg',
    badgeColor: 'bg-[#3B9B8E] text-white',
  },
  {
    badge: 'Eventos y Comunidad',
    title: 'Talleres gratuitos, deporte y actividades familiares',
    sub: 'Vive la experiencia MangoCenter cada fin de semana en nuestras 9 supertiendas.',
    image: './Banner Eventos 2.jpg',
    badgeColor: 'bg-[#E62E2D] text-white',
  },
];

// Global State
let currencyMode: 'both' | 'usd' = 'both';
const bcvRate = DEFAULT_BCV_RATE;

const filterState: FilterState = {
  category: 'all',
  maxPrice: 150,
  onlyOffers: false,
  searchQuery: '',
  sortBy: 'featured',
};

let activeStoreStateFilter = 'all';
let activeEventFilter = 'all';

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
 * SPA NAVIGATION: Switches between 'inicio', 'nosotros', 'contacto', and 'tienda'
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

  // Update desktop header navigation active pills
  document.querySelectorAll<HTMLButtonElement>('header nav [data-nav-view]').forEach((btn) => {
    const viewAttr = btn.dataset.navView as AppView;
    if (viewAttr === 'tienda') {
      // Keep the Store button distinctive
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

function initViewNavigation(): void {
  document.querySelectorAll<HTMLElement>('.nav-view-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const target = (trigger.dataset.navView as AppView) ?? 'inicio';
      switchView(target);
      const mobileDrawer = document.getElementById('mobile-menu-drawer');
      mobileDrawer?.classList.add('hidden');
    });
  });

  // Mobile Menu Hamburger
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-menu-drawer');
  mobileBtn?.addEventListener('click', () => {
    mobileDrawer?.classList.toggle('hidden');
  });
}

/**
 * 1. LANDING PAGE ("INICIO") INTERACTIVITY
 */
function initLandingHeroBanner(): void {
  const imgEl = document.getElementById('landing-hero-img') as HTMLImageElement | null;
  const badgeEl = document.getElementById('landing-hero-badge');
  const titleEl = document.getElementById('landing-hero-title');
  const subEl = document.getElementById('landing-hero-sub');
  const btns = document.querySelectorAll<HTMLButtonElement>('.landing-banner-btn');

  function setBanner(index: number): void {
    const slide = LANDING_BANNERS[index];
    if (!slide || !imgEl || !badgeEl || !titleEl || !subEl) return;

    imgEl.src = slide.image;
    badgeEl.textContent = slide.badge;
    badgeEl.className = `${slide.badgeColor} text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm`;
    titleEl.textContent = slide.title;
    subEl.textContent = slide.sub;

    const activeColors = ['bg-[#E62E2D]', 'bg-[#09569A]', 'bg-[#3B9B8E]', 'bg-[#E62E2D]'];
    btns.forEach((b, idx) => {
      if (idx === index) {
        b.className = `landing-banner-btn px-3 py-2 rounded-xl text-xs font-extrabold ${activeColors[idx]} text-white shadow-xs transition-all cursor-pointer truncate`;
      } else {
        b.className =
          'landing-banner-btn px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer truncate';
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
 * Renders the 6 Category Cards on the Landing Page with Red, Blue, and Teal accents
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
        class="group relative h-60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 text-left flex flex-col justify-between p-4 cursor-pointer focus:outline-none ${toneStyle.borderTop}"
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
          <span class="text-[11px] font-bold text-amber-200 block">${cat.itemCount}</span>
          <h3 class="text-base sm:text-lg font-black leading-tight mt-0.5">${cat.name}</h3>
          <p class="text-[11px] text-white/90 line-clamp-2 mt-1 leading-snug">${cat.subtitle}</p>
        </div>
      </button>
    `;
  }).join('');

  // Clicking a category on Landing opens the Store filtered by that category
  container.querySelectorAll<HTMLButtonElement>('[data-landing-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.landingCat ?? 'all';
      filterState.category = catId;
      renderSidebarCategoryFilters();
      renderCatalog();
      switchView('tienda');
      const catObj = CATEGORIES.find((c) => c.id === catId);
      if (catObj) {
        showToast(`Departamento: ${catObj.name}`, `Explorando productos de ${catObj.name} en la Tienda.`, catObj.tone);
      }
    });
  });
}

/**
 * 2. STORES SECTION: LAS 9 SEDES (Maracaibo es la 9na y Nueva Sede)
 */
function renderStoresSection(): void {
  const tabsContainer = document.getElementById('store-tabs-container');
  const spotlightContainer = document.getElementById('store-spotlight');
  const gridContainer = document.getElementById('stores-grid');
  if (!tabsContainer || !spotlightContainer || !gridContainer) return;

  const stateTabs = [
    { id: 'all', label: 'Todas las 9 Sedes', tone: 'red' as BrandTone },
    { id: 'Zulia', label: '★ Zulia: Maracaibo (9na Sede)', tone: 'red' as BrandTone },
    { id: 'Aragua', label: 'Aragua: Maracay (#8)', tone: 'blue' as BrandTone },
    { id: 'Barinas', label: 'Barinas (3 Sedes)', tone: 'teal' as BrandTone },
    { id: 'Portuguesa', label: 'Portuguesa (2 Sedes)', tone: 'blue' as BrandTone },
    { id: 'Lara', label: 'Lara (2 Sedes)', tone: 'red' as BrandTone },
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
          class="px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
            active
              ? `${activeBg} shadow-sm`
              : 'bg-[#F8FAFC] text-slate-700 hover:bg-slate-200/70 border border-slate-200'
          }"
        >
          ${tab.label}
        </button>
      `;
    })
    .join('');

  // Featured Store Spotlight (Sede #9 Maracaibo 2,000 m² by default, or first matching state)
  const spotlight: StoreBranch =
    activeStoreStateFilter === 'all'
      ? STORES[0]
      : STORES.find((s) => s.stateFilter === activeStoreStateFilter) ?? STORES[0];

  const spotlightWa = `https://wa.me/${spotlight.whatsappNumber}?text=${encodeURIComponent(
    `Hola MangoCenter! Solicito información de la *${spotlight.name}* (${spotlight.city}).`
  )}`;

  spotlightContainer.innerHTML = `
    <div class="bg-white rounded-3xl border-2 border-[#E62E2D]/25 shadow-lg overflow-hidden">
      <div class="h-1.5 w-full mc-tricolor-bar"></div>
      <div class="grid grid-cols-1 lg:grid-cols-12 items-center">
        <div class="lg:col-span-7 p-6 sm:p-8 space-y-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="bg-[#E62E2D] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              ${spotlight.highlightBadge}
            </span>
            <span class="bg-emerald-50 border border-[#3B9B8E]/40 text-[#2A786D] text-xs font-extrabold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#25D366] animate-ping"></span>
              Abierto ahora
            </span>
            <span class="bg-blue-50 text-[#09569A] text-xs font-extrabold px-3 py-1 rounded-full">
              ${spotlight.areaM2} de Exhibición
            </span>
          </div>

          <div>
            <p class="text-xs font-extrabold uppercase tracking-wider text-[#09569A]">${spotlight.state}</p>
            <h3 class="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">${spotlight.name}</h3>
            <p class="text-xs sm:text-sm text-slate-600 mt-2">
              📍 <strong>Dirección:</strong> ${spotlight.address}
            </p>
            <p class="text-xs text-slate-500 mt-1">${spotlight.reference}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/80">
              <span class="text-[10px] font-extrabold uppercase text-[#09569A] block">Horario Lunes a Sábado</span>
              <strong class="text-slate-900">${spotlight.hoursWeek}</strong>
            </div>
            <div class="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200/80">
              <span class="text-[10px] font-extrabold uppercase text-[#2A786D] block">Horario Domingos</span>
              <strong class="text-slate-900">${spotlight.hoursSunday}</strong>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="${spotlightWa}"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
            >
              WhatsApp Sede ${spotlight.city}
            </a>
            <a
              href="${spotlight.mapsUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-[#09569A] hover:bg-[#063B6B] text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl inline-flex items-center gap-2 shadow-sm transition-all"
            >
              Ubicación en Google Maps
            </a>
          </div>
        </div>

        <div class="lg:col-span-5 h-64 lg:h-full">
          <img
            src="${spotlight.image}"
            alt="${spotlight.name}"
            class="w-full h-full object-cover min-h-[260px]"
          />
        </div>
      </div>
    </div>
  `;

  // Filter stores for the 9-branch grid
  const visibleStores =
    activeStoreStateFilter === 'all'
      ? STORES
      : STORES.filter((s) => s.stateFilter === activeStoreStateFilter);

  gridContainer.innerHTML = visibleStores
    .map((store) => {
      const toneStyle = getToneClasses(store.tone);
      const waLink = `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(
        `Hola MangoCenter! Me comunico para consultar sobre la *${store.name}* (${store.city}).`
      )}`;

      return `
        <article class="bg-white rounded-3xl border border-slate-200/90 ${toneStyle.borderTop} shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
          <div>
            <div class="relative h-44 bg-slate-900 overflow-hidden">
              <img
                src="${store.image}"
                alt="${store.name}"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

              <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <span class="${toneStyle.badgeBg} text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  ${store.highlightBadge}
                </span>
                <span class="bg-white/95 text-[#15803D] text-[11px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs">
                  <span class="w-2 h-2 rounded-full bg-[#25D366] animate-ping"></span>
                  Abierto ahora
                </span>
              </div>

              <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <span class="text-[11px] font-bold text-amber-300 block">${store.state}</span>
                  <h3 class="text-lg font-black leading-tight">${store.city}</h3>
                </div>
                <span class="bg-white/20 backdrop-blur-xs text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                  ${store.areaM2}
                </span>
              </div>
            </div>

            <div class="p-5 space-y-3">
              <h4 class="font-extrabold text-slate-900 text-sm">${store.name}</h4>
              <p class="text-xs text-slate-600 leading-relaxed">📍 ${store.address}</p>
              <div class="text-xs text-slate-600 bg-[#F8FAFC] p-2.5 rounded-xl border border-slate-100">
                <p class="font-bold text-slate-800">⏰ ${store.hoursWeek}</p>
                <p class="text-[11px] text-slate-500">${store.hoursSunday}</p>
              </div>
              <div class="flex flex-wrap gap-1.5">
                ${store.services
                  .map(
                    (srv) => `
                  <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${toneStyle.softBg}">
                    ${srv}
                  </span>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <div class="p-5 pt-3 border-t border-slate-100 bg-[#F8FAFC] grid grid-cols-2 gap-2.5">
            <a
              href="${waLink}"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-extrabold text-xs py-2.5 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 transition-all"
            >
              WhatsApp
            </a>
            <a
              href="${store.mapsUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="${toneStyle.btnBg} font-extrabold text-xs py-2.5 px-3 rounded-xl inline-flex items-center justify-center gap-1.5 transition-all"
            >
              Google Maps
            </a>
          </div>
        </article>
      `;
    })
    .join('');

  tabsContainer.querySelectorAll<HTMLButtonElement>('[data-state-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeStoreStateFilter = btn.dataset.stateTab ?? 'all';
      renderStoresSection();
    });
  });
}

/**
 * 3. EVENTS SECTION (With Tricolor Identity)
 */
function renderEventsSection(): void {
  const grid = document.getElementById('events-grid');
  if (!grid) return;

  const filtered =
    activeEventFilter === 'all'
      ? EVENTS
      : EVENTS.filter((e) => e.category === activeEventFilter);

  grid.innerHTML = filtered
    .map((evt) => {
      const toneStyle = getToneClasses(evt.tone);
      const waRegister = `https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent(
        `Hola MangoCenter! Quiero inscribirme gratis en: *${evt.title}* (${evt.date}).`
      )}`;

      return `
        <article class="bg-white rounded-3xl border border-slate-200/90 ${toneStyle.borderTop} overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div class="relative h-44 bg-slate-900 overflow-hidden">
              <img
                src="${evt.image}"
                alt="${evt.title}"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span class="absolute top-3 left-3 ${toneStyle.badgeBg} text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                ${evt.category}
              </span>
              <span class="absolute bottom-3 right-3 bg-white/95 text-[#2A786D] text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-xs">
                GRATUITO
              </span>
            </div>

            <div class="p-5 space-y-2.5">
              <p class="text-[11px] font-extrabold ${toneStyle.textAccent}">📅 ${evt.date}</p>
              <h3 class="font-extrabold text-slate-900 text-base leading-snug">${evt.title}</h3>
              <p class="text-xs text-slate-600 leading-relaxed">${evt.description}</p>
              <div class="pt-2 space-y-1 text-[11px] text-slate-500 border-t border-slate-100">
                <p><strong>📍 Lugar:</strong> ${evt.branch}</p>
                <p><strong>⏰ Horario:</strong> ${evt.time}</p>
                <p><strong>🎟️ Cupos:</strong> <span class="text-[#2A786D] font-bold">${evt.spotsAvailable}</span></p>
              </div>
            </div>
          </div>

          <div class="p-5 pt-0">
            <a
              href="${waRegister}"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full ${toneStyle.btnBg} font-extrabold text-xs py-2.5 px-4 rounded-xl inline-flex items-center justify-center gap-2 transition-colors"
            >
              Inscribirme vía WhatsApp
            </a>
          </div>
        </article>
      `;
    })
    .join('');
}

function initEventsFilter(): void {
  const btns = document.querySelectorAll<HTMLButtonElement>('.event-filter-btn');
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeEventFilter = btn.dataset.eventFilter ?? 'all';
      btns.forEach((b) => {
        if ((b.dataset.eventFilter ?? 'all') === activeEventFilter) {
          b.className =
            'event-filter-btn px-4 py-2 rounded-full text-xs font-extrabold bg-[#E62E2D] text-white cursor-pointer transition-all';
        } else {
          b.className =
            'event-filter-btn px-4 py-2 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-[#09569A] cursor-pointer transition-all';
        }
      });
      renderEventsSection();
    });
  });
}

/**
 * 4. STORE ("TIENDA") CATALOG WITH TRICOLOR CARDS & BCV EXCHANGE RATE
 */
function renderSidebarCategoryFilters(): void {
  const container = document.getElementById('sidebar-category-filters');
  if (!container) return;

  const items = [
    { id: 'all', name: 'Todos los Departamentos', count: PRODUCTS.length, tone: 'red' as BrandTone },
    ...CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      count: PRODUCTS.filter((p) => p.category === c.id).length,
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
          <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            active ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
          }">${item.count}</span>
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
  const countLabel = document.getElementById('catalog-count-label');
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

  if (countLabel) {
    countLabel.textContent = `${filtered.length} ${
      filtered.length === 1 ? 'producto disponible' : 'productos disponibles'
    }`;
  }

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
        <p class="text-xs text-slate-500">Restablece los filtros para ver todo el catálogo de MangoCenter.</p>
        <button id="empty-reset-btn" type="button" class="bg-[#E62E2D] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl cursor-pointer">
          Ver Todos los Productos
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
            <!-- Clean Product Image Container -->
            <div class="relative h-48 bg-slate-100 overflow-hidden">
              <img
                src="${product.image}"
                alt="${product.name}"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <!-- Tricolor Offer / Category Pill -->
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

            <!-- Card Content with Generous Breathing Room -->
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

          <!-- Pricing (2-Decimal USD + Live BCV Bs.) & Actions -->
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
                        ≈ ${formattedBs} <span class="font-normal text-slate-400">(Tasa BCV)</span>
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

  // Currency Mode Switcher in Store Header (USD + Bs. BCV vs Solo USD)
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
 * 5. CART DRAWER & CONTACT FORM
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

    window.open(`https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  });

  // Contact Page Form
  const contactForm = document.getElementById('contact-page-form') as HTMLFormElement | null;
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('contact-name') as HTMLInputElement | null)?.value ?? '';
    const branch = (document.getElementById('contact-branch') as HTMLSelectElement | null)?.value ?? '';
    const message = (document.getElementById('contact-message') as HTMLTextAreaElement | null)?.value ?? '';

    showToast(
      `¡Gracias, ${name}!`,
      `Redirigiendo tu solicitud para ${branch} vía WhatsApp oficial.`,
      'teal'
    );

    const waMsg = `Hola MangoCenter! Soy *${name}*, escribo para la sede *${branch}*: ${message}`;
    setTimeout(() => {
      window.open(`https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent(waMsg)}`, '_blank', 'noopener,noreferrer');
    }, 700);
    contactForm.reset();
  });

  // Newsletter Form
  const newsForm = document.getElementById('newsletter-form') as HTMLFormElement | null;
  const newsEmail = document.getElementById('newsletter-email') as HTMLInputElement | null;
  newsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (newsEmail?.value) {
      showToast('¡Suscripción Exitosa!', `Recibirás nuestras ofertas en ${newsEmail.value}`, 'blue');
      newsEmail.value = '';
    }
  });
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initViewNavigation();
  initLandingHeroBanner();
  renderLandingCategories();
  renderStoresSection();
  renderEventsSection();
  initEventsFilter();
  renderSidebarCategoryFilters();
  renderCatalog();
  initStoreControls();
  renderCart();
  initCartAndForms();
});
