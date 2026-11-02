export type BrandTone = 'red' | 'blue' | 'teal';

export interface Category {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  isCoreWorld: boolean;
  itemCountLabel: string;
  image: string;
  tone: BrandTone;
  pillColor: string;
  iconSvg: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  categoryLabel: string;
  tone: BrandTone;
  price: number;
  oldPrice?: number;
  isOffer: boolean;
  offerLabel?: string;
  rating: number;
  reviews: number;
  stockStatus: string;
  unit: string;
  image: string;
  specs: string[];
}

export interface StoreBranch {
  id: string;
  city: string;
  stateFilter: 'Zulia' | 'Aragua' | 'Barinas' | 'Portuguesa' | 'Lara';
  name: string;
  state: string;
  tone: BrandTone;
  address: string;
  reference: string;
  hoursWeek: string;
  hoursSunday: string;
  openHour: number;
  closeHour: number;
  sundayOpenHour: number;
  sundayCloseHour: number;
  phone: string;
  whatsappNumber: string;
  mapsQuery: string;
  mapsUrl: string;
  lat: number;
  lng: number;
  image: string;
  services: string[];
  highlightBadge: string;
}

export interface StoreEvent {
  id: string;
  title: string;
  category: 'Taller Técnico' | 'Familiar' | 'Cursos E-Learning';
  tone: BrandTone;
  date: string;
  time: string;
  branch: string;
  instructorOrHost: string;
  spotsAvailable: string;
  isFree: boolean;
  description: string;
  image: string;
}

export interface HeroSlide {
  id: string;
  tabLabel: string;
  title: string;
  caption: string;
  meta: string;
  image: string;
  alt: string;
  actionLabel: string;
  actionTarget: 'sedes' | 'tienda' | 'eventos';
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface OdooCourse {
  id: string;
  title: string;
  category: string;
  level: string;
  duration?: string;
  steps: string;
  isPopular: boolean;
  isRecent: boolean;
  tone: BrandTone;
  iconType: 'accounting' | 'marketing' | 'recruitment' | 'safety' | 'billing' | 'service';
  image?: string;
  description: string;
}

export interface OdooUserProfile {
  fullName: string;
  initials: string;
  email: string;
  role: string;
  nextRank: string;
  currentXp: number;
  targetXp: number;
  odooPortalUrl: string;
  unverifiedWarning: string;
  badges: Array<{
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
  }>;
}

export const WHATSAPP_MAIN = '584226264623';
export const WHATSAPP_BARINAS = '584245956627';
export const WHATSAPP_DISPLAY = '0422-6264623 (0422-MANGOCE)';
export const CORPORATE_EMAIL = 'mercadeo@mangocenter.com.ve';
export const FALLBACK_BCV_RATE = 46.85;
export const ODOO_DEFAULT_LOGIN_URL = 'https://odoo.mangocenter.com.ve/web/login';
export const ODOO_SLIDES_URL = 'https://odoo.mangocenter.com.ve/slides';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-sedes',
    tabLabel: 'Red Nacional',
    title: 'Supertiendas en Zulia, Aragua, Lara, Portuguesa y Barinas',
    caption: 'Naves comerciales luminosas con estacionamiento propio, pasillos señalizados y despacho ágil en mostrador.',
    meta: '9 SEDES OPERATIVAS • LUN A DOM',
    image: './Banner Tiendas actualizado.jpg',
    alt: 'Fachada arquitectónica y red nacional de supertiendas MangoCenter en Venezuela',
    actionLabel: 'Ver mapa interactivo',
    actionTarget: 'sedes',
  },
  {
    id: 'slide-mundos',
    tabLabel: '5 Mundos',
    title: 'De la obra pesada y el campo al equipamiento completo del hogar',
    caption: 'Ferretería industrial, construcción, agro, baños, cocina, iluminación LED y respaldo eléctrico bajo un mismo techo.',
    meta: '5 DEPARTAMENTOS + LÍNEA LED',
    image: './Banner Categorias 2.jpg',
    alt: 'Departamentos principales de MangoCenter: ferretería, construcción, agro, hogar y tecnología',
    actionLabel: 'Explorar catálogo BCV',
    actionTarget: 'tienda',
  },
  {
    id: 'slide-maracay',
    tabLabel: 'Ciudad Jardín',
    title: 'Av. Las Delicias: compra cómoda para maestros de obra y familias',
    caption: 'Asesoría técnica personalizada para contratistas, instaladores y proyectos de remodelación residencial.',
    meta: 'MARACAY, ARAGUA • ESTACIONAMIENTO',
    image: './Maracay apertura.jpg',
    alt: 'Supertienda MangoCenter en Avenida Las Delicias, Maracay, Estado Aragua',
    actionLabel: 'Ubicar supertiendas',
    actionTarget: 'sedes',
  },
  {
    id: 'slide-comunidad',
    tabLabel: 'Talleres y Familia',
    title: 'Clínicas de herramientas, impermeabilización y domingos familiares',
    caption: 'Demostraciones prácticas con especialistas aliados y jornadas gratuitas de bricolaje para padres e hijos.',
    meta: 'AGENDA ABIERTA • ENTRADA LIBRE',
    image: './Banner Eventos 2.jpg',
    alt: 'Jornadas familiares, demostraciones técnicas y eventos comunitarios en MangoCenter',
    actionLabel: 'Ver agenda de actividades',
    actionTarget: 'eventos',
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'ferreteria',
    name: 'Ferretería Profesional',
    slug: 'ferreteria',
    subtitle: 'Herramientas eléctricas, manuales, discos de corte, dados Cr-V y cerrajería.',
    isCoreWorld: true,
    itemCountLabel: 'Equipos y consumibles de taller',
    tone: 'blue',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=900&q=80',
    pillColor: 'bg-[#09569A] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
  },
  {
    id: 'construccion',
    name: 'Construcción y Pintura',
    slug: 'construccion',
    subtitle: 'Pinturas Clase A, mantos fibrados, impermeabilizantes, plomería y acabados de obra.',
    isCoreWorld: true,
    itemCountLabel: 'Protección y recubrimiento',
    tone: 'red',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
    pillColor: 'bg-[#DF2726] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-5 8v-5h4v5"/></svg>`,
  },
  {
    id: 'hogar',
    name: 'Hogar, Cocina y Baños',
    slug: 'hogar',
    subtitle: 'Grifería monomando en acero 304, estantería metálica de carga, orden y confort familiar.',
    isCoreWorld: true,
    itemCountLabel: 'Renovación residencial',
    tone: 'red',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    pillColor: 'bg-[#DF2726] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10.5L12 3l9 7.5M5.25 9v10.5A1.5 1.5 0 006.75 21h10.5a1.5 1.5 0 001.5-1.5V9M9.75 21v-6h4.5v6"/></svg>`,
  },
  {
    id: 'agro',
    name: 'Agro y Jardinería',
    slug: 'agro',
    subtitle: 'Desmalezadoras a gasolina, bombas periféricas 100% cobre, sistemas de riego y campo.',
    isCoreWorld: true,
    itemCountLabel: 'Potencia hídrica y agrícola',
    tone: 'teal',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
    pillColor: 'bg-[#216E63] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21c0-4.5 3-8.25 7.5-9-1.5-4.5-5.25-6.75-7.5-6.75S6 7.5 4.5 12C9 12.75 12 16.5 12 21zm0 0V9"/></svg>`,
  },
  {
    id: 'tecnologia',
    name: 'Tecnología y Seguridad',
    slug: 'tecnologia',
    subtitle: 'Cámaras WiFi 360° IP66, domótica residencial, respaldo eléctrico UPS y conectividad.',
    isCoreWorld: true,
    itemCountLabel: 'Monitoreo y control inteligente',
    tone: 'blue',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=80',
    pillColor: 'bg-[#09569A] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><rect x="3" y="4" width="18" height="12" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 20h8m-4-4v4"/></svg>`,
  },
  {
    id: 'electricidad',
    name: 'Iluminación LED y Eléctricos',
    slug: 'electricidad',
    subtitle: 'Reflectores exteriores IP65, bombillos multivoltaje 85V-265V, breakers y protección.',
    isCoreWorld: false,
    itemCountLabel: 'Especialidad multivoltaje',
    tone: 'teal',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80',
    pillColor: 'bg-[#216E63] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>`,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'MC-FER-0104',
    name: 'Disco de Corte Fino para Metal y Acero Inox 4-1/2" x 1.0mm',
    brand: 'Total Tools Pro',
    category: 'ferreteria',
    categoryLabel: 'Ferretería',
    tone: 'blue',
    price: 1.15,
    oldPrice: 1.65,
    isOffer: true,
    offerLabel: '-30%',
    rating: 4.9,
    reviews: 214,
    stockStatus: 'Disponible en las 9 sedes',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=640&q=80',
    specs: ['Medida: 115mm (4-1/2")', 'Corte limpio sin rebaba', 'Máx. 13.300 RPM'],
  },
  {
    id: 'prod-2',
    sku: 'MC-FER-2088',
    name: 'Taladro Percutor Industrial 1/2" 750W Velocidad Variable + Maletín',
    brand: 'Ingco Industrial',
    category: 'ferreteria',
    categoryLabel: 'Ferretería',
    tone: 'blue',
    price: 38.00,
    oldPrice: 49.50,
    isOffer: true,
    offerLabel: 'Ahorra $11.50',
    rating: 4.8,
    reviews: 148,
    stockStatus: 'Retiro inmediato en tienda',
    unit: 'Kit Completo',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=640&q=80',
    specs: ['Potencia: 750W cobre puro', 'Mandril metálico 13mm (1/2")', 'Incluye 5 mechas + mango auxiliar'],
  },
  {
    id: 'prod-3',
    sku: 'MC-CON-3310',
    name: 'Cuñete Pintura Caucho Mate Clase A Lavable Antihongos (4 Galones)',
    brand: 'MangoColor Premium',
    category: 'construccion',
    categoryLabel: 'Construcción',
    tone: 'red',
    price: 42.50,
    oldPrice: 54.00,
    isOffer: true,
    offerLabel: 'Oferta Apertura',
    rating: 4.9,
    reviews: 312,
    stockStatus: 'Alta disponibilidad',
    unit: 'Cuñete 4 Gal',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=640&q=80',
    specs: ['Acabado mate de alta cobertura', 'Uso interior y exterior', 'Secado al tacto: 30 min'],
  },
  {
    id: 'prod-4',
    sku: 'MC-ELE-0891',
    name: 'Bombillo LED Bulbo Alta Potencia 15W Luz Blanca Fría 6500K E27',
    brand: 'LuminaTech',
    category: 'electricidad',
    categoryLabel: 'Iluminación LED',
    tone: 'teal',
    price: 1.85,
    oldPrice: 2.50,
    isOffer: true,
    offerLabel: 'Multivoltaje',
    rating: 4.7,
    reviews: 420,
    stockStatus: 'Disponible en tienda',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=640&q=80',
    specs: ['Rango 85V-265V contra fluctuaciones', 'Ahorro energético del 85%', '25.000 horas de vida útil'],
  },
  {
    id: 'prod-5',
    sku: 'MC-AGR-4412',
    name: 'Bomba de Agua Periférica 1/2 HP Embobinado 100% Cobre 110V',
    brand: 'AquaForce Pro',
    category: 'agro',
    categoryLabel: 'Agro y Jardinería',
    tone: 'teal',
    price: 29.90,
    oldPrice: 38.00,
    isOffer: true,
    offerLabel: '-21%',
    rating: 4.8,
    reviews: 97,
    stockStatus: 'Disponible en las 9 sedes',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=640&q=80',
    specs: ['Altura máx.: 35 metros', 'Caudal máx.: 36 L/min', 'Impulsor de bronce anticorrosivo'],
  },
  {
    id: 'prod-6',
    sku: 'MC-HOG-7720',
    name: 'Grifería Monomando Alta para Lavaplatos Acero Inoxidable 304',
    brand: 'Venzia Home',
    category: 'hogar',
    categoryLabel: 'Hogar y Baños',
    tone: 'red',
    price: 24.50,
    oldPrice: 32.00,
    isOffer: true,
    offerLabel: 'Línea Hogar',
    rating: 4.9,
    reviews: 184,
    stockStatus: 'En stock',
    unit: 'Set Completo',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=640&q=80',
    specs: ['Cuello flexible y rociador dual', 'Acabado cepillado antihuellas', 'Incluye mangueras malladas'],
  },
  {
    id: 'prod-7',
    sku: 'MC-TEC-9015',
    name: 'Cámara de Seguridad Smart WiFi 360° Exterior Full HD 1080p Visión Nocturna',
    brand: 'SmartGuard',
    category: 'tecnologia',
    categoryLabel: 'Tecnología',
    tone: 'blue',
    price: 34.99,
    oldPrice: 45.00,
    isOffer: true,
    offerLabel: 'Seguridad IP66',
    rating: 4.8,
    reviews: 129,
    stockStatus: 'Disponible en tienda',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=640&q=80',
    specs: ['Protección exterior IP66 contra lluvia', 'Audio bidireccional + sirena', 'App móvil iOS / Android'],
  },
  {
    id: 'prod-8',
    sku: 'MC-FER-5102',
    name: 'Juego de Herramientas Mecánicas 108 Piezas Cromo Vanadio Dados y Ratchet',
    brand: 'Total Tools Pro',
    category: 'ferreteria',
    categoryLabel: 'Ferretería',
    tone: 'blue',
    price: 68.00,
    oldPrice: 85.00,
    isOffer: true,
    offerLabel: 'Ahorra $17.00',
    rating: 5.0,
    reviews: 276,
    stockStatus: 'En stock',
    unit: 'Maletín 108 Pzs',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=640&q=80',
    specs: ['Acero Cr-V alta torsión', 'Ratchets de 1/2" y 1/4"', 'Maletín rígido organizador'],
  },
  {
    id: 'prod-9',
    sku: 'MC-CON-6044',
    name: 'Manto Líquido Impermeabilizante Elastomérico Fibrado Galón (Blanco/Rojo)',
    brand: 'ImperMax',
    category: 'construccion',
    categoryLabel: 'Construcción',
    tone: 'red',
    price: 16.75,
    isOffer: false,
    rating: 4.7,
    reviews: 88,
    stockStatus: 'En stock',
    unit: 'Galón 3.78L',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=640&q=80',
    specs: ['Fibras sintéticas integradas', 'No requiere malla de refuerzo', 'Puenteo elástico de fisuras'],
  },
  {
    id: 'prod-10',
    sku: 'MC-AGR-8821',
    name: 'Desmalezadora a Gasolina 52cc 2 Tiempos + Cuchilla y Yoyo de Nylon',
    brand: 'AgroMaster',
    category: 'agro',
    categoryLabel: 'Agro y Jardinería',
    tone: 'teal',
    price: 118.00,
    oldPrice: 142.00,
    isOffer: true,
    offerLabel: 'Especial Agro',
    rating: 4.9,
    reviews: 64,
    stockStatus: 'Retiro en tienda',
    unit: 'Equipo Completo',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d691a4bf5?auto=format&fit=crop&w=640&q=80',
    specs: ['Motor 2.2 HP alto torque', 'Arnés ergonómico doble hombro', 'Incluye cuchilla 3 puntas y mezclador'],
  },
  {
    id: 'prod-11',
    sku: 'MC-ELE-7120',
    name: 'Reflector LED Exterior Slim 100W IP65 Protección Sobretensión',
    brand: 'LuminaTech',
    category: 'electricidad',
    categoryLabel: 'Iluminación LED',
    tone: 'teal',
    price: 14.25,
    oldPrice: 18.50,
    isOffer: true,
    offerLabel: '-23%',
    rating: 4.8,
    reviews: 152,
    stockStatus: 'En stock',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=640&q=80',
    specs: ['Chasis de aluminio disipador', 'Sellado hermético intemperie IP65', '9.000 lúmenes reales'],
  },
  {
    id: 'prod-12',
    sku: 'MC-HOG-9940',
    name: 'Estante Organizador Multiuso Metálico 5 Niveles Carga Pesada 180x90x40cm',
    brand: 'MangoHome',
    category: 'hogar',
    categoryLabel: 'Hogar y Baños',
    tone: 'red',
    price: 49.90,
    isOffer: false,
    rating: 4.9,
    reviews: 112,
    stockStatus: 'En stock',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=640&q=80',
    specs: ['Capacidad de 175 kg por nivel', 'Ensamble rápido sin tornillos', 'Pintura electrostática anticorrosión'],
  },
];

/**
 * LAS 9 SEDES REALES DE MANGOCENTER EN VENEZUELA
 * Con enlaces directos verificados a Google Maps y coordenadas exactas.
 */
export const STORES: StoreBranch[] = [
  {
    id: 'maracaibo',
    city: 'Maracaibo',
    stateFilter: 'Zulia',
    name: 'MangoCenter C.A. Maracaibo',
    state: 'Estado Zulia',
    tone: 'blue',
    address: 'Corredor Vial Oeste, Maracaibo, Estado Zulia.',
    reference: 'Supertienda en el eje oeste de Maracaibo con estacionamiento amplio y los 5 departamentos integrados.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 8:00 PM',
    hoursSunday: 'Domingos: 9:00 AM - 5:00 PM',
    openHour: 8,
    closeHour: 20,
    sundayOpenHour: 9,
    sundayCloseHour: 17,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsQuery: 'MangoCenter C.A. Maracaibo, Zulia, Venezuela',
    mapsUrl: 'https://maps.app.goo.gl/yFPtecM3tcZkVfEH6',
    lat: 10.65273,
    lng: -71.658261,
    image: './Banner Tiendas actualizado.jpg',
    services: ['5 Departamentos', 'Ferretería y Hogar', 'Atención Familiar', 'Estacionamiento'],
    highlightBadge: 'SEDE ZULIA',
  },
  {
    id: 'maracay',
    city: 'Maracay',
    stateFilter: 'Aragua',
    name: 'MangoCenter Maracay (Av. Las Delicias)',
    state: 'Estado Aragua',
    tone: 'blue',
    address: 'Av. Las Delicias con Calle Vicente Lecuna, Maracay, Edo. Aragua.',
    reference: 'Pasando el Polideportivo Las Delicias, al lado de Farmatodo, Ciudad Jardín.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 8:00 PM',
    hoursSunday: 'Domingos: 9:00 AM - 5:00 PM',
    openHour: 8,
    closeHour: 20,
    sundayOpenHour: 9,
    sundayCloseHour: 17,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsQuery: 'Av. Las Delicias con Calle Vicente Lecuna, Maracay, Aragua, Venezuela',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av+Las+Delicias+con+Calle+Vicente+Lecuna+Maracay+Aragua',
    lat: 10.2762,
    lng: -67.5786,
    image: './Maracay apertura.jpg',
    services: ['Hogar y Tecnología', 'Ferretería y Construcción', 'Estacionamiento', 'WhatsApp Directo'],
    highlightBadge: 'SEDE ARAGUA',
  },
  {
    id: 'barinas-cuatricentenaria',
    city: 'Barinas (Cuatricentenaria)',
    stateFilter: 'Barinas',
    name: 'MangoCenter C.A. Cuatricentenaria',
    state: 'Estado Barinas',
    tone: 'teal',
    address: 'Av. Cuatricentenaria, Sector El Cambio, Barinas, Edo. Barinas.',
    reference: 'A 100 metros del Terminal de Pasajeros de Barinas.',
    hoursWeek: 'Lun a Sáb: 7:30 AM - 7:30 PM',
    hoursSunday: 'Domingos: 8:30 AM - 4:30 PM',
    openHour: 7.5,
    closeHour: 19.5,
    sundayOpenHour: 8.5,
    sundayCloseHour: 16.5,
    phone: '0424-5956627',
    whatsappNumber: '584245956627',
    mapsQuery: 'MangoCenter C.A. Cuatricentenaria, Barinas, Venezuela',
    mapsUrl: 'https://maps.app.goo.gl/cM4oP9PwJXthXmjZ7',
    lat: 8.6310275,
    lng: -70.2298427,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
    services: ['Sede Principal Barinas', 'Construcción y Agro', 'Ferretería', 'Estacionamiento'],
    highlightBadge: 'SEDE CUATRICENTENARIA',
  },
  {
    id: 'alto-barinas',
    city: 'Alto Barinas',
    stateFilter: 'Barinas',
    name: 'MangoCenter C.A. Alto Barinas',
    state: 'Estado Barinas',
    tone: 'blue',
    address: 'Av. Alberto Arvelo Torrealba, Sector Alto Barinas Norte, Barinas.',
    reference: 'Corredor comercial de Alto Barinas Norte.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 8:00 PM',
    hoursSunday: 'Domingos: 9:00 AM - 5:00 PM',
    openHour: 8,
    closeHour: 20,
    sundayOpenHour: 9,
    sundayCloseHour: 17,
    phone: '0424-5956627',
    whatsappNumber: '584245956627',
    mapsQuery: 'MangoCenter C. A. Alto Barinas, Barinas, Venezuela',
    mapsUrl: 'https://maps.app.goo.gl/Zp9khx4XNHgoyLez9',
    lat: 8.6155819,
    lng: -70.253761,
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    services: ['Hogar y Remodelación', 'Tecnología', 'Iluminación LED', 'Estacionamiento'],
    highlightBadge: 'SEDE ALTO BARINAS',
  },
  {
    id: 'barinas-centro',
    city: 'Barinas Centro',
    stateFilter: 'Barinas',
    name: 'MangoCenter C.A. Centro',
    state: 'Estado Barinas',
    tone: 'red',
    address: 'Av. Cruz Paredes, Sector Centro, Barinas, Edo. Barinas.',
    reference: 'Pleno casco central comercial de la ciudad de Barinas.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 7:00 PM',
    hoursSunday: 'Domingos: 8:30 AM - 3:30 PM',
    openHour: 8,
    closeHour: 19,
    sundayOpenHour: 8.5,
    sundayCloseHour: 15.5,
    phone: '0424-5956627',
    whatsappNumber: '584245956627',
    mapsQuery: 'MangoCenter C.A. Centro, Barinas, Venezuela',
    mapsUrl: 'https://maps.app.goo.gl/kQ6Tagpf63B7XsPu7',
    lat: 8.6272057,
    lng: -70.2127037,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    services: ['Formato Express Centro', 'Ferretería y Eléctricos', 'Hogar', 'Compra Rápida'],
    highlightBadge: 'SEDE BARINAS CENTRO',
  },
  {
    id: 'guanare',
    city: 'Guanare',
    stateFilter: 'Portuguesa',
    name: 'MangoCenter C.A. Guanare',
    state: 'Estado Portuguesa',
    tone: 'teal',
    address: 'Carrera 5ta con Calle 11, Guanare, Edo. Portuguesa.',
    reference: 'Zona central y comercial de Guanare.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 7:30 PM',
    hoursSunday: 'Domingos: 9:00 AM - 4:00 PM',
    openHour: 8,
    closeHour: 19.5,
    sundayOpenHour: 9,
    sundayCloseHour: 16,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsQuery: 'MangoCenter C.A. Guanare, Portuguesa, Venezuela',
    mapsUrl: 'https://maps.app.goo.gl/Eg8FoHsmPvMbx8ut7',
    lat: 9.0460762,
    lng: -69.7474339,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
    services: ['Agro y Jardinería', 'Ferretería General', 'Hogar', 'Asesoría Técnica'],
    highlightBadge: 'SEDE GUANARE',
  },
  {
    id: 'araure',
    city: 'Araure',
    stateFilter: 'Portuguesa',
    name: 'MangoCenter C.A. Araure',
    state: 'Estado Portuguesa',
    tone: 'blue',
    address: 'Av. Trino Meleán con Calle 5, Zona Industrial, Araure, Edo. Portuguesa.',
    reference: 'Eje comercial e industrial Araure - Acarigua con amplio estacionamiento.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 7:30 PM',
    hoursSunday: 'Domingos: 9:00 AM - 4:00 PM',
    openHour: 8,
    closeHour: 19.5,
    sundayOpenHour: 9,
    sundayCloseHour: 16,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsQuery: 'MangoCenter C. A. Araure, Portuguesa, Venezuela',
    mapsUrl: 'https://maps.app.goo.gl/SYZt1WCHiKhdyLWRA',
    lat: 9.5805367,
    lng: -69.2163653,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
    services: ['Construcción y Agro', 'Amplio Estacionamiento', 'Hogar y Tecnología', 'Retiro en Tienda'],
    highlightBadge: 'SEDE ARAURE',
  },
  {
    id: 'cabudare',
    city: 'Cabudare',
    stateFilter: 'Lara',
    name: 'MangoCenter Cabudare',
    state: 'Estado Lara',
    tone: 'teal',
    address: 'Av. El Placer, C.C. Hipermercado Multimall, Cabudare, Edo. Lara.',
    reference: 'Sector El Placer, Centro Comercial Multimall en Cabudare.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 8:00 PM',
    hoursSunday: 'Domingos: 9:00 AM - 5:00 PM',
    openHour: 8,
    closeHour: 20,
    sundayOpenHour: 9,
    sundayCloseHour: 17,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsQuery: 'MangoCenter Cabudare, Lara, Venezuela',
    mapsUrl: 'https://maps.app.goo.gl/wfhJTCfLqLRDMcKB6',
    lat: 10.0379599,
    lng: -69.2766949,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
    services: ['Hogar y Baños', 'Jardinería', 'Pinturas y Ferretería', 'Estacionamiento'],
    highlightBadge: 'SEDE CABUDARE',
  },
  {
    id: 'barquisimeto',
    city: 'Barquisimeto',
    stateFilter: 'Lara',
    name: 'MangoCenter C.A. Barquisimeto',
    state: 'Estado Lara',
    tone: 'red',
    address: 'Av. Venezuela con Av. Morán, Barquisimeto, Edo. Lara.',
    reference: 'Intersección estratégica de la Av. Venezuela con Av. Morán.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 8:00 PM',
    hoursSunday: 'Domingos: 9:00 AM - 5:00 PM',
    openHour: 8,
    closeHour: 20,
    sundayOpenHour: 9,
    sundayCloseHour: 17,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsQuery: 'MangoCenter C.A. Barquisimeto, Lara, Venezuela',
    mapsUrl: 'https://maps.app.goo.gl/13PLtwYmgGLiE6gr7',
    lat: 10.0735519,
    lng: -69.2975427,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=900&q=80',
    services: ['Ferretería y Herramientas', 'Tecnología', 'Hogar', 'Estacionamiento'],
    highlightBadge: 'SEDE BARQUISIMETO',
  },
];

export const EVENTS: StoreEvent[] = [
  {
    id: 'evt-1',
    title: 'Feria Técnica y Encuentros ¡Para Toda la Familia!',
    category: 'Familiar',
    tone: 'red',
    date: 'Fines de Semana en Tienda',
    time: '9:30 AM - 6:00 PM',
    branch: 'Red Nacional MangoCenter',
    instructorOrHost: 'Equipo MangoCenter y Marcas Aliadas',
    spotsAvailable: 'Entrada Libre Familiar',
    isFree: true,
    description: 'Demostraciones en vivo de maquinaria y herramientas eléctricas, exhibiciones gastronómicas de cocina, rodadas comunitarias y actividades recreativas para toda la familia.',
    image: './Banner Eventos 2.jpg',
  },
  {
    id: 'evt-2',
    title: 'Taller Práctico: Impermeabilización y Soluciones para Techos',
    category: 'Taller Técnico',
    tone: 'blue',
    date: 'Sábados de Capacitación',
    time: '10:00 AM - 12:30 PM',
    branch: 'Sedes Maracay, Barquisimeto y Araure',
    instructorOrHost: 'Especialistas Técnicos Aliados',
    spotsAvailable: 'Cupos con Certificado Digital',
    isFree: true,
    description: 'Preparación de losas, sellado de fisuras y aplicación correcta de mantos líquidos elastoméricos fibrados para proteger viviendas y galpones antes de la temporada de lluvias.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'evt-3',
    title: 'Escuela de Pequeños Constructores: Bricolaje en Familia',
    category: 'Familiar',
    tone: 'teal',
    date: 'Domingos Familiares',
    time: '2:00 PM - 5:00 PM',
    branch: 'Todas las Sedes MangoCenter',
    instructorOrHost: 'Equipo Anfitrión MangoCenter',
    spotsAvailable: 'Actividad Gratuita Infantil',
    isFree: true,
    description: 'Jornada guiada donde niños y padres arman y pintan su primer proyecto en madera con herramientas adaptadas y supervisión de seguridad en tienda.',
    image: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'evt-4',
    title: 'Clínica de Herramientas Eléctricas y Seguridad en Obra',
    category: 'Cursos E-Learning',
    tone: 'blue',
    date: 'Formación Continua',
    time: 'Sesiones Presenciales y Digitales',
    branch: 'Sedes Barinas y Plataforma Formativa',
    instructorOrHost: 'Academia Técnica MangoCenter',
    spotsAvailable: 'Inscripciones Abiertas',
    isFree: true,
    description: 'Uso seguro de esmeriles, selección de discos abrasivos por RPM, mantenimiento preventivo y equipos de protección personal para contratistas y técnicos.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80',
  },
];

export const FAQS: FaqItem[] = [
  {
    id: 'faq-bcv',
    question: '¿Cómo se calculan los precios en bolívares y qué métodos de pago aceptan en tienda?',
    answer: 'Todos los precios expresados en divisas se cobran en bolívares exactamente a la tasa oficial vigente del Banco Central de Venezuela (BCV) del día de la operación. En las 9 supertiendas aceptamos Pago Móvil, tarjeta de débito y punto de venta nacional, transferencias bancarias y efectivo.',
  },
  {
    id: 'faq-cotizacion',
    question: '¿Cómo funciona la Lista de Cotización por WhatsApp y el retiro en supertienda?',
    answer: 'Agrega los artículos y cantidades requeridas desde nuestro Catálogo Referencial BCV, selecciona tu sede más cercana (por ejemplo Maracay, Barquisimeto, Maracaibo o cualquiera de las 3 sedes en Barinas) y envía la solicitud en un clic. Nuestro mostrador confirma existencia física en esa sede y deja tu pedido listo para facturar y retirar sin filas.',
  },
  {
    id: 'faq-domingos',
    question: '¿Las supertiendas MangoCenter abren los domingos?',
    answer: 'Sí. Todas nuestras 9 sedes abren de lunes a domingo. Los domingos operamos en horario continuo familiar (generalmente de 9:00 AM a 5:00 PM en Maracaibo, Maracay, Alto Barinas, Cabudare y Barquisimeto; desde las 8:30 AM en Barinas Cuatricentenaria y Centro; y hasta las 4:00 PM en Guanare y Araure). Revisa la ficha de cada sede en el localizador para ver su estado en vivo.',
  },
  {
    id: 'faq-barinas-contacto',
    question: '¿Las sedes de Barinas tienen línea directa independiente de WhatsApp?',
    answer: 'Sí. Para agilizar la atención regional, las sedes Cuatricentenaria, Alto Barinas y Barinas Centro cuentan con la línea directa +58 424-5956627, mientras que Maracaibo, Maracay, Guanare, Araure, Cabudare y Barquisimeto son atendidas desde la central nacional 0422-MANGOCE (+58 422-6264623). Nuestro cotizador enruta tu mensaje automáticamente según la sede elegida.',
  },
];

export const ODOO_COURSES: OdooCourse[] = [
  {
    id: 'course-contabilidad',
    title: 'Módulo de Contabilidad ERP',
    category: 'Administración y Finanzas',
    level: 'Básico',
    duration: '20 minutos',
    steps: '43 pasos',
    isPopular: true,
    isRecent: false,
    tone: 'red',
    iconType: 'accounting',
    description: 'Gestión de libros contables, asientos automáticos y conciliación bancaria multi-sede en Odoo ERP para MangoCenter.',
  },
  {
    id: 'course-marketing',
    title: 'Módulo de Marketing Omnicanal',
    category: 'Mercadeo y Promoción',
    level: 'Básico',
    duration: '15 minutos',
    steps: '2 pasos',
    isPopular: true,
    isRecent: false,
    tone: 'blue',
    iconType: 'marketing',
    description: 'Campañas regionales, señalética de precios en piso de venta y difusión coordinada de ofertas en las 9 sedes.',
  },
  {
    id: 'course-reclutamiento',
    title: 'Módulo de Reclutamiento y Talento',
    category: 'Gestión Humana',
    level: 'Básico',
    duration: '12 minutos',
    steps: '2 pasos',
    isPopular: true,
    isRecent: true,
    tone: 'teal',
    iconType: 'recruitment',
    description: 'Flujo de postulaciones, entrevistas por competencia e incorporación de asesores de tienda en Odoo.',
  },
  {
    id: 'course-seguridad',
    title: 'Seguridad y Salud Ocupacional',
    category: 'Operaciones y Almacén',
    level: 'Básico',
    duration: '18 minutos',
    steps: '1 paso',
    isPopular: false,
    isRecent: true,
    tone: 'red',
    iconType: 'safety',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80',
    description: 'Protocolos de equipos de protección personal, izaje, estantería de carga pesada y prevención de riesgos en piso y patio.',
  },
  {
    id: 'course-facturacion',
    title: 'Módulo de Facturación a Tasa BCV',
    category: 'Caja y Facturación',
    level: 'Básico',
    duration: '25 minutos',
    steps: '12 pasos',
    isPopular: false,
    isRecent: true,
    tone: 'teal',
    iconType: 'billing',
    description: 'Emisión fiscal sincronizada a tasa oficial BCV, notas de entrega, IGTF aplicable y cierre de caja en tienda.',
  },
  {
    id: 'course-atencion',
    title: 'Asesoría Ferretera y Atención Consultiva',
    category: 'Ventas y Mostrador',
    level: 'Intermedio',
    duration: '35 minutos',
    steps: '18 pasos',
    isPopular: true,
    isRecent: true,
    tone: 'blue',
    iconType: 'service',
    description: 'Diagnóstico técnico del requerimiento del cliente en construcción, plomería, electricidad, agro y hogar.',
  },
];

export const ODOO_USER_PROFILE: OdooUserProfile = {
  fullName: 'Colaborador Demo MangoCenter',
  initials: 'MC',
  email: 'colaborador.demo@mangocenter.com.ve',
  role: 'Campus Interno • Entorno Demostrativo Odoo 17 ERP',
  nextRank: 'Nivel Especialista de Sala',
  currentXp: 1,
  targetXp: 4,
  odooPortalUrl: 'https://odoo.mangocenter.com.ve/slides',
  unverifiedWarning: 'Vista demostrativa local del Campus Colaboradores. Para registrar avance curricular real, inicia sesión directamente en el servidor corporativo Odoo.',
  badges: [
    {
      id: 'b-1',
      title: 'Inducción Corporativa',
      description: 'Ingreso inicial al entorno de capacitación interna de MangoCenter',
      unlocked: true,
    },
    {
      id: 'b-2',
      title: 'Ficha de Sede Activa',
      description: 'Asignación verificada a una de las 9 supertiendas nacionales',
      unlocked: false,
    },
    {
      id: 'b-3',
      title: 'Operador Certificado Odoo',
      description: 'Aprobación del primer módulo operativo de caja o inventario',
      unlocked: false,
    },
    {
      id: 'b-4',
      title: 'Asesor Integral 5 Mundos',
      description: 'Certificación técnica avalada por Academia MangoCenter',
      unlocked: false,
    },
  ],
};
