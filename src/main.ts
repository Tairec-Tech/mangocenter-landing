import './style.css';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import {
  CATEGORIES,
  STORES,
  EVENTS,
  ODOO_COURSES,
  ODOO_USER_PROFILE,
  ODOO_SLIDES_URL,
  WHATSAPP_MAIN,
  FALLBACK_BCV_RATE,
  type BrandTone,
  type OdooCourse,
} from './data';

type AppView = 'inicio' | 'nosotros' | 'cursos' | 'contacto' | 'tienda';

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
let bcvRate = FALLBACK_BCV_RATE;
let activeStoreStateFilter = 'all';
let selectedStoreId = STORES[0].id; // Default to Maracaibo
let gmpMapInstance: google.maps.Map | null = null;
let isLoggedIn = false;

/**
 * Fetches live official BCV exchange rate from public API with graceful fallback
 */
async function fetchLiveBCVRate(): Promise<void> {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    if (!res.ok) return;
    const data = (await res.json()) as { promedio?: number };
    if (typeof data.promedio === 'number' && data.promedio > 0) {
      bcvRate = data.promedio;
      updateBCVLabels();
    }
  } catch {
    updateBCVLabels();
  }
}

function updateBCVLabels(): void {
  const formattedRate = bcvRate.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const topRate = document.getElementById('top-bcv-rate');
  const storeRate = document.getElementById('store-header-bcv-val');

  if (topRate) topRate.textContent = `Bs. ${formattedRate} / $1.00`;
  if (storeRate) storeRate.textContent = `Bs. ${formattedRate}`;
}

/**
 * Helper to return tricolor classes based on BrandTone
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

  const badge = document.createElement('div');
  badge.className = `w-7 h-7 rounded-xl ${toneStyle.badgeBg} flex items-center justify-center shrink-0 font-black text-xs`;
  badge.textContent = '✓';

  const body = document.createElement('div');
  body.className = 'flex-1 min-w-0';

  const titleEl = document.createElement('p');
  titleEl.className = 'text-xs font-extrabold text-slate-900 truncate';
  titleEl.textContent = title;

  const subtitleEl = document.createElement('p');
  subtitleEl.className = 'text-[11px] text-slate-600 mt-0.5 leading-snug';
  subtitleEl.textContent = subtitle;

  body.append(titleEl, subtitleEl);
  toast.append(badge, body);
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/**
 * Auth State Controller: Controls visibility of Cursos tab and header label
 */
function updateAuthStateUI(): void {
  const authBtnLabel = document.getElementById('auth-btn-label');
  const navCursos = document.getElementById('nav-cursos-link');
  const mobileCursos = document.getElementById('mobile-cursos-link');
  const lockedGate = document.getElementById('cursos-locked-gate');
  const loggedContent = document.getElementById('cursos-logged-content');

  if (isLoggedIn) {
    if (authBtnLabel) authBtnLabel.textContent = 'Juan Sarco (Salir)';
    navCursos?.classList.remove('hidden');
    navCursos?.classList.add('inline-flex');
    mobileCursos?.classList.remove('hidden');
    lockedGate?.classList.add('hidden');
    loggedContent?.classList.remove('hidden');
  } else {
    if (authBtnLabel) authBtnLabel.textContent = 'Identificarse';
    navCursos?.classList.add('hidden');
    navCursos?.classList.remove('inline-flex');
    mobileCursos?.classList.add('hidden');
    lockedGate?.classList.remove('hidden');
    loggedContent?.classList.add('hidden');
  }
}

/**
 * SPA NAVIGATION (#/inicio, #/nosotros, #/cursos, #/contacto, #/tienda)
 */
function switchView(targetView: AppView, scrollToTop = true): void {
  const views: AppView[] = ['inicio', 'nosotros', 'cursos', 'contacto', 'tienda'];
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

  // Update navigation active pills
  document.querySelectorAll<HTMLElement>('header nav [data-nav-view]').forEach((btn) => {
    const viewAttr = btn.dataset.navView as AppView;
    if (viewAttr === 'tienda') {
      if (targetView === 'tienda') {
        btn.className =
          'nav-view-trigger ml-1 inline-flex items-center gap-2 px-4.5 py-2 rounded-full text-sm font-extrabold bg-[#E62E2D] text-white shadow-md transition-all cursor-pointer';
      } else {
        btn.className =
          'nav-view-trigger ml-1 inline-flex items-center gap-2 px-4.5 py-2 rounded-full text-sm font-extrabold bg-[#09569A] hover:bg-[#063B6B] text-white shadow-md hover:-translate-y-0.5 transition-all cursor-pointer';
      }
    } else {
      if (viewAttr === targetView) {
        btn.className =
          'nav-view-trigger px-3.5 py-2 rounded-full text-sm font-extrabold transition-all cursor-pointer bg-[#E62E2D] text-white shadow-xs';
      } else {
        btn.className =
          'nav-view-trigger px-3.5 py-2 rounded-full text-sm font-bold text-slate-700 hover:text-[#09569A] hover:bg-slate-100 transition-all cursor-pointer';
      }
    }
  });

  if (targetView === 'cursos') {
    updateAuthStateUI();
  }

  if (scrollToTop) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function syncViewFromHash(): void {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash === 'nosotros' || hash === 'cursos' || hash === 'contacto' || hash === 'tienda' || hash === 'inicio') {
    switchView(hash as AppView, false);
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
}

/**
 * 1. LANDING PAGE BANNER SWITCHER
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
 * 2. LANDING CATEGORIES GRID
 */
function renderLandingCategories(): void {
  const container = document.getElementById('landing-categories-grid');
  if (!container) return;

  container.innerHTML = CATEGORIES.map((cat) => {
    const toneStyle = getToneClasses(cat.tone);
    return `
      <div
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
      </div>
    `;
  }).join('');
}

/**
 * 3. INTERACTIVE 9-STORE LOCATOR WITH VERIFIED GOOGLE MAPS COORDS & LINKS
 */
async function initGoogleMapsPlatformIfKeyPresent(): Promise<void> {
  const apiKey = (import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
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
    mapCanvas.classList.add('hidden');
    mapIframe?.classList.remove('hidden');
  }
}

function selectStoreOnMap(storeId: string): void {
  selectedStoreId = storeId;
  const store = STORES.find((s) => s.id === storeId) ?? STORES[0];

  const iframe = document.getElementById('store-map-iframe') as HTMLIFrameElement | null;
  if (iframe) {
    iframe.src = `https://maps.google.com/maps?q=${store.lat},${store.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

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
    { id: 'all', label: 'Todas las Sedes', tone: 'red' as BrandTone },
    { id: 'Barinas', label: 'Barinas (3)', tone: 'teal' as BrandTone },
    { id: 'Portuguesa', label: 'Portuguesa (2)', tone: 'blue' as BrandTone },
    { id: 'Lara', label: 'Lara (2)', tone: 'teal' as BrandTone },
    { id: 'Aragua', label: 'Aragua (1)', tone: 'blue' as BrandTone },
    { id: 'Zulia', label: '★ Zulia (Nueva Sede)', tone: 'red' as BrandTone },
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

  if (!visibleStores.some((s) => s.id === selectedStoreId) && visibleStores.length > 0) {
    selectedStoreId = visibleStores[0].id;
  }

  const activeStore = STORES.find((s) => s.id === selectedStoreId) ?? STORES[0];

  listContainer.innerHTML = visibleStores
    .map((store) => {
      const isSelected = store.id === activeStore.id;
      const toneStyle = getToneClasses(store.tone);

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
              <span class="text-[11px] font-bold text-emerald-700">
                ● Abierto Habitual
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
          <span class="text-xs font-extrabold text-[#15803D]">
            ● Sede Activa
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

  // Sincronizar selección en las mini tarjetas de estados
  document.querySelectorAll<HTMLButtonElement>('[data-state-card]').forEach((card) => {
    const cardState = card.dataset.stateCard;
    const isCardActive = activeStoreStateFilter === cardState;
    if (isCardActive) {
      card.classList.add('ring-2', 'ring-[#09569A]', 'border-[#09569A]', 'bg-blue-50/60');
      card.classList.remove('bg-white');
    } else {
      card.classList.remove('ring-2', 'ring-[#09569A]', 'border-[#09569A]', 'bg-blue-50/60');
      card.classList.add('bg-white');
    }

    card.onclick = () => {
      activeStoreStateFilter = cardState ?? 'all';
      const firstMatch =
        activeStoreStateFilter === 'all'
          ? STORES[0]
          : STORES.find((s) => s.stateFilter === activeStoreStateFilter) ?? STORES[0];
      selectStoreOnMap(firstMatch.id);
    };
  });

  listContainer.querySelectorAll<HTMLButtonElement>('[data-select-store]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.selectStore ?? STORES[0].id;
      selectStoreOnMap(id);
    });
  });
}

/**
 * 4. EVENTS SHOWCASE
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

    <!-- 3 Compact Workshops List -->
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
 * 5. ODOO ELEARNING / CURSOS SECTION
 */
function renderCursosSection(): void {
  const popularGrid = document.getElementById('odoo-popular-courses-grid');
  const recentGrid = document.getElementById('odoo-recent-courses-grid');
  const userCard = document.getElementById('odoo-user-card');
  const badgesCard = document.getElementById('odoo-badges-card');

  if (popularGrid) {
    const popularCourses = ODOO_COURSES.filter((c) => c.isPopular);
    popularGrid.innerHTML = popularCourses
      .map((course) => renderCourseCard(course))
      .join('');
  }

  if (recentGrid) {
    const recentCourses = ODOO_COURSES.filter((c) => c.isRecent);
    recentGrid.innerHTML = recentCourses
      .map((course) => renderCourseCard(course))
      .join('');
  }

  if (userCard) {
    userCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
            ${ODOO_USER_PROFILE.initials}
          </div>
          <div>
            <h4 class="font-black text-slate-900 text-sm sm:text-base leading-tight">${ODOO_USER_PROFILE.fullName}</h4>
            <p class="text-[11px] text-slate-500 font-bold">${ODOO_USER_PROFILE.role}</p>
          </div>
        </div>
      </div>

      <div class="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 text-center space-y-2">
        <p class="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Siguiente Grado</p>
        <div class="flex items-center justify-center gap-3">
          <div class="relative w-16 h-16 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path class="text-slate-200" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="text-[#09569A]" stroke-dasharray="15, 100" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="font-black text-slate-900 text-sm leading-none">5</span>
              <span class="text-[9px] font-bold text-slate-500">Newbie</span>
            </div>
          </div>
          <div class="text-left">
            <p class="text-xs font-black text-slate-800">${ODOO_USER_PROFILE.nextRank}</p>
            <p class="text-[11px] font-extrabold text-[#09569A]">${ODOO_USER_PROFILE.currentXp} / ${ODOO_USER_PROFILE.targetXp} XP</p>
          </div>
        </div>
        <p class="text-[11px] text-slate-500 leading-snug">
          Gana puntos completando tus módulos de capacitación en Odoo.
        </p>
      </div>

      <div class="pt-1">
        <a
          href="${ODOO_SLIDES_URL}"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full bg-[#09569A] hover:bg-[#063B6B] text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition-all inline-flex items-center justify-center gap-2 shadow-xs"
        >
          <span>Abrir Odoo eLearning Externo</span>
          <span>↗</span>
        </a>
      </div>
    `;
  }

  if (badgesCard) {
    badgesCard.innerHTML = `
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <h4 class="font-black text-slate-900 text-sm">Insignias Obtenidas</h4>
        <span class="text-xs font-bold text-slate-400">Progreso</span>
      </div>
      <div class="space-y-2.5">
        ${ODOO_USER_PROFILE.badges
          .map(
            (b) => `
            <div class="flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors">
              <span class="w-6 h-6 rounded-full ${
                b.unlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
              } flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ${b.unlocked ? '★' : '○'}
              </span>
              <div>
                <p class="text-xs font-extrabold text-slate-800">${b.title}</p>
                <p class="text-[11px] text-slate-500 leading-tight">${b.description}</p>
              </div>
            </div>
          `
          )
          .join('')}
      </div>
    `;
  }

  // Bind course cards clicks
  document.querySelectorAll<HTMLElement>('[data-odoo-course]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const courseId = btn.dataset.odooCourse;
      const course = ODOO_COURSES.find((c) => c.id === courseId);
      if (course) {
        showToast(
          course.title,
          `Módulo Odoo: ${course.steps} • Contenido cargado con éxito.`,
          course.tone
        );
      }
    });
  });
}

function renderCourseCard(course: OdooCourse): string {
  const toneStyle = getToneClasses(course.tone);
  const iconMarkup = getCourseIcon(course.iconType, toneStyle.badgeBg);

  return `
    <article
      data-odoo-course="${course.id}"
      class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group"
    >
      <div class="p-5">
        <div class="h-28 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center mb-4 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
          ${course.image ? `<img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover" />` : iconMarkup}
          <span class="absolute top-2.5 right-2.5 bg-white/90 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs">
            ${course.level}
          </span>
        </div>

        <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
          ${course.category}
        </span>
        <h4 class="font-black text-slate-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          ${course.title}
        </h4>
        <p class="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-snug">
          ${course.description}
        </p>
      </div>

      <div class="p-4 pt-3 border-t border-slate-100 bg-[#F8FAFC]/60 flex items-center justify-between text-xs font-bold text-slate-600">
        <span class="flex items-center gap-1.5 text-slate-500">
          <span>📚</span>
          <span>${course.steps}</span>
        </span>
        <span class="text-[#09569A] font-extrabold group-hover:translate-x-1 transition-transform">
          Ver Contenido →
        </span>
      </div>
    </article>
  `;
}

function getCourseIcon(type: OdooCourse['iconType'], bgClass: string): string {
  if (type === 'accounting') {
    return `
      <div class="w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center text-white font-black text-xl shadow-xs">
        📊
      </div>
    `;
  }
  if (type === 'marketing') {
    return `
      <div class="w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center text-white font-black text-xl shadow-xs">
        📢
      </div>
    `;
  }
  if (type === 'recruitment') {
    return `
      <div class="w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center text-white font-black text-xl shadow-xs">
        🔍
      </div>
    `;
  }
  if (type === 'billing') {
    return `
      <div class="w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center text-white font-black text-xl shadow-xs">
        🧾
      </div>
    `;
  }
  return `
    <div class="w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center text-white font-black text-xl shadow-xs">
      🛠️
    </div>
  `;
}

/**
 * 6. MODAL DE IDENTIFICACIÓN
 */
function openOdooModal(): void {
  const modal = document.getElementById('odoo-login-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
}

function closeOdooModal(): void {
  const modal = document.getElementById('odoo-login-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

function initOdooModal(): void {
  const modal = document.getElementById('odoo-login-modal');
  const closeBtn = document.getElementById('odoo-modal-close-btn');
  const topAuthBtn = document.getElementById('top-odoo-login-btn');
  const gateLoginBtn = document.getElementById('cursos-gate-login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const form = document.getElementById('odoo-login-form') as HTMLFormElement | null;

  topAuthBtn?.addEventListener('click', () => {
    if (isLoggedIn) {
      isLoggedIn = false;
      updateAuthStateUI();
      showToast('Sesión Finalizada', 'Has cerrado sesión del portal Odoo.', 'red');
      if (window.location.hash.includes('cursos')) {
        switchView('inicio');
      }
    } else {
      openOdooModal();
    }
  });

  gateLoginBtn?.addEventListener('click', openOdooModal);

  logoutBtn?.addEventListener('click', () => {
    isLoggedIn = false;
    updateAuthStateUI();
    showToast('Sesión Finalizada', 'Has cerrado sesión del portal Odoo.', 'red');
    switchView('inicio');
  });

  closeBtn?.addEventListener('click', closeOdooModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeOdooModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeOdooModal();
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('odoo-email') as HTMLInputElement | null;
    const email = emailInput?.value.trim() ?? 'colaborador';

    const submitBtn = document.getElementById('odoo-submit-btn');
    if (submitBtn) {
      submitBtn.innerHTML = `
        <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        <span>Verificando...</span>
      `;
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.innerHTML = `
          <span>Identificarse</span>
          <span>→</span>
        `;
      }
      isLoggedIn = true;
      updateAuthStateUI();
      closeOdooModal();
      showToast(
        'Identificación Exitosa',
        `Bienvenido, Juan Sebastian Sarco Ereú (${email}). Pestaña de Cursos habilitada.`,
        'teal'
      );
      switchView('cursos');
    }, 400);
  });
}

/**
 * 7. CONTACT FORM & CART DRAWER
 */
function initCartAndForms(): void {
  const cartOpenBtn = document.getElementById('cart-open-btn');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartBackdrop = document.getElementById('cart-drawer-backdrop');

  cartOpenBtn?.addEventListener('click', () => {
    cartBackdrop?.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  });
  cartCloseBtn?.addEventListener('click', () => {
    cartBackdrop?.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  });
  cartBackdrop?.addEventListener('click', (e) => {
    if (e.target === cartBackdrop) {
      cartBackdrop.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  });

  const contactForm = document.getElementById('contact-page-form') as HTMLFormElement | null;
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('contact-name') as HTMLInputElement | null)?.value.trim() ?? '';
    const phone = (document.getElementById('contact-phone') as HTMLInputElement | null)?.value.trim() ?? '';
    const email = (document.getElementById('contact-email') as HTMLInputElement | null)?.value.trim() ?? '';
    const branch = (document.getElementById('contact-branch') as HTMLSelectElement | null)?.value ?? '';
    const message = (document.getElementById('contact-message') as HTMLTextAreaElement | null)?.value.trim() ?? '';

    const lines = [
      `¡Hola *MangoCenter*! 👋`,
      `• *Cliente:* ${name}`,
      `• *Teléfono:* ${phone}`,
      email ? `• *Correo:* ${email}` : null,
      `• *Sede:* ${branch}`,
      '',
      `*Consulta:* ${message}`,
    ].filter(Boolean);

    window.open(
      `https://wa.me/${WHATSAPP_MAIN}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener,noreferrer'
    );

    showToast(
      `¡Gracias, ${name}!`,
      `Abriendo WhatsApp para atender tu consulta en ${branch}.`,
      'teal'
    );
    contactForm.reset();
  });

  const newsForm = document.getElementById('newsletter-form') as HTMLFormElement | null;
  const newsEmail = document.getElementById('newsletter-email') as HTMLInputElement | null;
  newsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (newsEmail?.value) {
      showToast(
        '¡Suscripción Exitosa!',
        `Recibirás nuestras promociones en ${newsEmail.value}`,
        'blue'
      );
      newsEmail.value = '';
    }
  });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initViewNavigation();
  syncViewFromHash();
  initLandingHeroBanner();
  renderLandingCategories();
  renderStoresSection();
  renderEventsSection();
  renderCursosSection();
  initOdooModal();
  updateAuthStateUI();
  initCartAndForms();
  void fetchLiveBCVRate();
  void initGoogleMapsPlatformIfKeyPresent();
});
