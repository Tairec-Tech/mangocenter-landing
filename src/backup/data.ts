export type BrandTone = 'red' | 'blue' | 'teal';

export interface Category {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  itemCount: string;
  badge?: string;
  image: string;
  tone: BrandTone;
  accentColor: string;
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
  price: number; // Strictly 2 decimals ($1.15, $38.00)
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
  branchNumber: number;
  city: string;
  stateFilter: 'Zulia' | 'Aragua' | 'Barinas' | 'Portuguesa' | 'Lara';
  name: string;
  state: string;
  isNewFlagship?: boolean;
  tone: BrandTone;
  areaM2: string;
  address: string;
  reference: string;
  hoursWeek: string;
  hoursSunday: string;
  isOpenNow: boolean;
  phone: string;
  whatsappNumber: string;
  mapsUrl: string;
  image: string;
  services: string[];
  highlightBadge: string;
}

export interface StoreEvent {
  id: string;
  title: string;
  category: 'Taller Técnico' | 'Inauguración' | 'Familiar' | 'Cursos E-Learning';
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

export const WHATSAPP_MAIN = '584226264623';
export const WHATSAPP_DISPLAY = '(0422-MANGOCE) +58 422-6264623';
export const CORPORATE_EMAIL = 'mercadeo@mangocenter.com.ve';
export const DEFAULT_BCV_RATE = 46.85; // Bs./USD Tasa Oficial BCV del día

export const CATEGORIES: Category[] = [
  {
    id: 'ferreteria',
    name: 'Ferretería',
    slug: 'ferreteria',
    subtitle: 'Herramientas eléctricas, manuales y cerrajería',
    itemCount: '+4,200 productos',
    badge: 'Azul Experto',
    tone: 'blue',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=700&q=80',
    accentColor: 'from-[#09569A]/95 via-[#09569A]/60 to-transparent',
    pillColor: 'bg-[#09569A] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
  },
  {
    id: 'construccion',
    name: 'Construcción',
    slug: 'construccion',
    subtitle: 'Pinturas, impermeabilizantes, plomería y obra gris',
    itemCount: '+3,150 productos',
    badge: 'Fuerza en Obra',
    tone: 'red',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=80',
    accentColor: 'from-[#E62E2D]/95 via-[#E62E2D]/55 to-transparent',
    pillColor: 'bg-[#E62E2D] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`
  },
  {
    id: 'agro',
    name: 'Agro y Jardinería',
    slug: 'agro',
    subtitle: 'Desmalezadoras, riego, bombas de agua y campo',
    itemCount: '+1,900 productos',
    badge: 'Verde Vida',
    tone: 'teal',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=700&q=80',
    accentColor: 'from-[#2A786D]/95 via-[#3B9B8E]/60 to-transparent',
    pillColor: 'bg-[#3B9B8E] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`
  },
  {
    id: 'hogar',
    name: 'Hogar y Baños',
    slug: 'hogar',
    subtitle: 'Grifería, organizadores, muebles, cocina y confort',
    itemCount: '+3,800 productos',
    badge: 'Calidez Familiar',
    tone: 'red',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=700&q=80',
    accentColor: 'from-[#C81E23]/95 via-[#E62E2D]/55 to-transparent',
    pillColor: 'bg-[#E62E2D] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    slug: 'tecnologia',
    subtitle: 'Domótica, seguridad CCTV, audio, TV y respaldo UPS',
    itemCount: '+1,450 productos',
    badge: 'Innovación',
    tone: 'blue',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=700&q=80',
    accentColor: 'from-[#063B6B]/95 via-[#09569A]/60 to-transparent',
    pillColor: 'bg-[#09569A] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`
  },
  {
    id: 'electricidad',
    name: 'Iluminación LED',
    slug: 'electricidad',
    subtitle: 'Reflectores LED, cableado, breakers y energía',
    itemCount: '+2,100 productos',
    badge: 'Eco Ahorro',
    tone: 'teal',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=700&q=80',
    accentColor: 'from-[#2A786D]/95 via-[#3B9B8E]/60 to-transparent',
    pillColor: 'bg-[#3B9B8E] text-white',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`
  }
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
    offerLabel: 'Oferta -30%',
    rating: 4.9,
    reviews: 214,
    stockStatus: 'Disponible en las 9 sedes',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
    specs: ['Medida: 115mm (4-1/2")', 'Corte ultra limpio sin rebaba', 'Máx. 13,300 RPM']
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
    stockStatus: 'Retiro Express 30 min',
    unit: 'Kit Completo',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
    specs: ['Potencia: 750W Cobre Puro', 'Mandril metálico 13mm (1/2")', 'Incluye 5 mechas + mango auxiliar']
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
    stockStatus: 'Alta Disponibilidad',
    unit: 'Cuñete 4 Gal',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
    specs: ['Rendimiento: 160 m² por mano', 'Interior / Exterior alta cobertura', 'Secado al tacto: 30 min']
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
    offerLabel: 'Eco Precio',
    rating: 4.7,
    reviews: 420,
    stockStatus: 'En Stock (+500 unds)',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=600&q=80',
    specs: ['Multivoltaje 85V-265V', 'Ahorro energético del 85%', '25,000 horas de vida útil']
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
    offerLabel: 'Oferta -21%',
    rating: 4.8,
    reviews: 97,
    stockStatus: 'En Stock (9 Sedes)',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    specs: ['Altura máx: 35 metros', 'Caudal máx: 36 L/min', 'Impulsor de bronce anticorrosivo']
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
    offerLabel: 'Favorito Hogar',
    rating: 4.9,
    reviews: 184,
    stockStatus: 'En Stock',
    unit: 'Set Completo',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    specs: ['Cuello flexible y rociador dual', 'Acabado cepillado antihuellas', 'Incluye mangueras de acero']
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
    offerLabel: 'Oferta Smart',
    rating: 4.8,
    reviews: 129,
    stockStatus: 'En Stock • Maracaibo / Maracay',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
    specs: ['Certificación IP66 contra lluvia', 'Audio bidireccional + Alarma', 'Control desde App iOS / Android']
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
    offerLabel: 'Combo -$17.00',
    rating: 5.0,
    reviews: 276,
    stockStatus: 'En Stock',
    unit: 'Maletín 108 Pzs',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=600&q=80',
    specs: ['Acero Cr-V alta resistencia', 'Ratchets de 1/2" y 1/4"', 'Estuche rígido organizador']
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
    stockStatus: 'En Stock',
    unit: 'Galón 3.78L',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
    specs: ['Fibras sintéticas integradas', 'No requiere tela de refuerzo', 'Garantía de sellado por 5 años']
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
    stockStatus: 'En Stock (Retiro en Tienda)',
    unit: 'Equipo Completo',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d691a4bf5?auto=format&fit=crop&w=600&q=80',
    specs: ['Motor 2.2 HP alto torque', 'Arnés ergonómico doble hombro', 'Kit de herramientas y mezclador']
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
    offerLabel: 'Oferta -23%',
    rating: 4.8,
    reviews: 152,
    stockStatus: 'En Stock',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=600&q=80',
    specs: ['Chasis aluminio disipador', 'Resiste lluvia e intemperie IP65', '9,000 Lúmenes reales']
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
    stockStatus: 'En Stock',
    unit: 'Unidad',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80',
    specs: ['Soporta hasta 175 kg por nivel', 'Armado fácil sin tornillos', 'Pintura electrostática anticorrosión']
  }
];

/**
 * LAS 9 SEDES DE MANGOCENTER (Maracaibo es la 9na y Nueva Sede de 2,000 m²)
 */
export const STORES: StoreBranch[] = [
  {
    id: 'maracaibo',
    branchNumber: 9,
    city: 'Maracaibo',
    stateFilter: 'Zulia',
    name: 'Sede #9: Nueva Supertienda Maracaibo',
    state: 'Estado Zulia',
    isNewFlagship: true,
    tone: 'red',
    areaM2: '2,000 m²',
    address: 'Av. Circunvalación 2 con Av. La Limpia, Zona Comercial Maracaibo, Edo. Zulia.',
    reference: '¡Nuestra 9na y más grande supertienda! 2,000 m² de exhibición, estacionamiento privado y retiro express.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 8:00 PM',
    hoursSunday: 'Domingos: 9:00 AM - 6:00 PM',
    isOpenNow: true,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MangoCenter+Maracaibo+Zulia',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=900&q=80',
    services: ['9na Sede Flagship', '2,000 m² de Exhibición', 'Pick-Up 30 min', 'Estacionamiento Privado'],
    highlightBadge: '¡9na Y NUEVA SEDE • 2,000 m²!'
  },
  {
    id: 'maracay',
    branchNumber: 8,
    city: 'Maracay',
    stateFilter: 'Aragua',
    name: 'Sede #8: MangoCenter Maracay (Ciudad Jardín)',
    state: 'Estado Aragua',
    tone: 'blue',
    areaM2: '1,650 m²',
    address: 'Av. Las Delicias, con Calle Vicente Lecuna, Maracay, Edo. Aragua.',
    reference: 'Ubicada estratégicamente en Av. Las Delicias, corazón comercial de Maracay.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 8:00 PM',
    hoursSunday: 'Domingos: 9:00 AM - 5:00 PM',
    isOpenNow: true,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Av+Las+Delicias+con+Calle+Vicente+Lecuna+Maracay+Aragua',
    image: './Maracay apertura.jpg',
    services: ['Showroom Hogar y Tec.', 'Estacionamiento', 'Asesoría de Proyectos', 'Retiro en Tienda'],
    highlightBadge: 'SEDE #8 • CIUDAD JARDÍN'
  },
  {
    id: 'barinas-principal',
    branchNumber: 1,
    city: 'Barinas',
    stateFilter: 'Barinas',
    name: 'Sede #1: MangoCenter Barinas (Av. Industrial)',
    state: 'Estado Barinas',
    tone: 'teal',
    areaM2: '1,800 m²',
    address: 'Av. Industrial con intersección Comercial, Barinas, Edo. Barinas.',
    reference: 'Nuestra casa matriz en los Llanos con amplio patio de carga y ferretería pesada.',
    hoursWeek: 'Lun a Sáb: 7:30 AM - 7:30 PM',
    hoursSunday: 'Domingos: 8:30 AM - 4:30 PM',
    isOpenNow: true,
    phone: '0424-5956627',
    whatsappNumber: '584245956627',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MangoCenter+Barinas+Venezuela',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
    services: ['Sede Fundadora', 'Patio Constructor', 'Agro y Maquinaria', 'Estacionamiento'],
    highlightBadge: 'SEDE #1 • BARINAS'
  },
  {
    id: 'alto-barinas',
    branchNumber: 2,
    city: 'Alto Barinas',
    stateFilter: 'Barinas',
    name: 'Sede #2: MangoCenter Alto Barinas',
    state: 'Estado Barinas',
    tone: 'blue',
    areaM2: '1,500 m²',
    address: 'Av. Andrés Varela, Sector Alto Barinas Norte, Barinas, Edo. Barinas.',
    reference: 'Zona residencial y comercial de Alto Barinas, ideal para hogar, remodelación y tecnología.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 8:00 PM',
    hoursSunday: 'Domingos: 9:00 AM - 5:00 PM',
    isOpenNow: true,
    phone: '0424-5956627',
    whatsappNumber: '584245956627',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MangoCenter+Alto+Barinas',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    services: ['Hogar y Decoración', 'Tanques y Bombas', 'Iluminación LED', 'Estacionamiento'],
    highlightBadge: 'SEDE #2 • ALTO BARINAS'
  },
  {
    id: 'barinas-centro',
    branchNumber: 3,
    city: 'Barinas Centro',
    stateFilter: 'Barinas',
    name: 'Sede #3: MangoCenter Barinas Centro',
    state: 'Estado Barinas',
    tone: 'red',
    areaM2: '1,250 m²',
    address: 'Casco Central Comercial, Av. Marqués del Pumar, Barinas, Edo. Barinas.',
    reference: 'Acceso peatonal y vehicular rápido en pleno centro de la ciudad de Barinas.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 7:00 PM',
    hoursSunday: 'Domingos: 8:30 AM - 3:30 PM',
    isOpenNow: true,
    phone: '0424-5956627',
    whatsappNumber: '584245956627',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MangoCenter+Centro+Barinas',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    services: ['Compra Rápida', 'Herramientas y Eléctricos', 'Hogar', 'Atención Express'],
    highlightBadge: 'SEDE #3 • BARINAS CENTRO'
  },
  {
    id: 'guanare',
    branchNumber: 4,
    city: 'Guanare',
    stateFilter: 'Portuguesa',
    name: 'Sede #4: MangoCenter Guanare',
    state: 'Estado Portuguesa',
    tone: 'teal',
    areaM2: '1,450 m²',
    address: 'Av. Unda con Corredor Vial, Sector Comercial Guanare, Edo. Portuguesa.',
    reference: 'Centro de soluciones agropecuarias, eléctricas y de construcción en la capital de Portuguesa.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 7:30 PM',
    hoursSunday: 'Domingos: 9:00 AM - 4:00 PM',
    isOpenNow: true,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MangoCenter+Guanare+Portuguesa',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80',
    services: ['Especialistas en Agro', 'Ferretería General', 'Hogar', 'Estacionamiento'],
    highlightBadge: 'SEDE #4 • GUANARE'
  },
  {
    id: 'araure',
    branchNumber: 5,
    city: 'Araure',
    stateFilter: 'Portuguesa',
    name: 'Sede #5: MangoCenter Araure - Acarigua',
    state: 'Estado Portuguesa',
    tone: 'blue',
    areaM2: '1,750 m²',
    address: 'Av. Los Agricultores, Eje Vial Araure - Acarigua, Edo. Portuguesa.',
    reference: 'Supertienda con mega estacionamiento para vehículos familiares y transporte de carga.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 7:30 PM',
    hoursSunday: 'Domingos: 9:00 AM - 4:30 PM',
    isOpenNow: true,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MangoCenter+Araure+Portuguesa',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
    services: ['Agroindustrial', 'Construcción y Pinturas', 'Mega Estacionamiento', 'Despacho'],
    highlightBadge: 'SEDE #5 • ARAURE'
  },
  {
    id: 'cabudare',
    branchNumber: 6,
    city: 'Cabudare',
    stateFilter: 'Lara',
    name: 'Sede #6: MangoCenter Cabudare',
    state: 'Estado Lara',
    tone: 'teal',
    areaM2: '1,550 m²',
    address: 'Av. Intercomunal Barquisimeto - Cabudare, Sector La Mora, Edo. Lara.',
    reference: 'Conecta directamente con las urbanizaciones de Cabudare y el este de Barquisimeto.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 8:00 PM',
    hoursSunday: 'Domingos: 9:00 AM - 5:00 PM',
    isOpenNow: true,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MangoCenter+Cabudare+Lara',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80',
    services: ['Remodelación y Baños', 'Jardinería', 'Pinturas Preparadas', 'Estacionamiento'],
    highlightBadge: 'SEDE #6 • CABUDARE'
  },
  {
    id: 'barquisimeto',
    branchNumber: 7,
    city: 'Barquisimeto',
    stateFilter: 'Lara',
    name: 'Sede #7: MangoCenter Barquisimeto',
    state: 'Estado Lara',
    tone: 'red',
    areaM2: '1,700 m²',
    address: 'Av. Venezuela con Av. Bracamonte, Barquisimeto, Edo. Lara.',
    reference: 'Sede moderna con los 5 departamentos completos para toda la familia larense.',
    hoursWeek: 'Lun a Sáb: 8:00 AM - 8:00 PM',
    hoursSunday: 'Domingos: 9:00 AM - 5:00 PM',
    isOpenNow: true,
    phone: '0422-6264623',
    whatsappNumber: '584226264623',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MangoCenter+Barquisimeto+Lara',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=900&q=80',
    services: ['Showroom Tecnológico', 'Centro de Herramientas', 'Hogar', 'Estacionamiento'],
    highlightBadge: 'SEDE #7 • BARQUISIMETO'
  }
];

export const EVENTS: StoreEvent[] = [
  {
    id: 'evt-1',
    title: 'Gran Inauguración 9na Sede: Supertienda Maracaibo 2,000 m²',
    category: 'Inauguración',
    tone: 'red',
    date: 'Sábado 24 de Octubre, 2026',
    time: '9:00 AM - 7:00 PM',
    branch: 'Sede #9 Maracaibo (Zulia)',
    instructorOrHost: 'Equipo MangoCenter & Marcas Aliadas',
    spotsAvailable: 'Entrada Libre Familiar',
    isFree: true,
    description: 'Celebra con nosotros la apertura de nuestra novena supertienda con 2,000 m². Música en vivo, premios instantáneos, degustaciones y ofertas de inauguración.',
    image: './Banner Eventos 2.jpg'
  },
  {
    id: 'evt-2',
    title: 'Taller Práctico: Impermeabilización y Soluciones para Techos',
    category: 'Taller Técnico',
    tone: 'blue',
    date: 'Sábado 31 de Octubre, 2026',
    time: '10:00 AM - 12:30 PM',
    branch: 'Sedes Maracaibo, Maracay y Barquisimeto',
    instructorOrHost: 'Ing. Carlos Méndez (Especialista en Obra)',
    spotsAvailable: '25 cupos por sede (Con Certificado)',
    isFree: true,
    description: 'Aprende a preparar superficies, sellar grietas y aplicar mantos líquidos fibrados como un profesional para proteger tu hogar.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'evt-3',
    title: 'Escuela de Pequeños Constructores: Bricolaje en Familia',
    category: 'Familiar',
    tone: 'teal',
    date: 'Domingo 01 de Noviembre, 2026',
    time: '2:00 PM - 5:00 PM',
    branch: 'Todas las 9 Sedes MangoCenter',
    instructorOrHost: 'Team Recreativo MangoCenter',
    spotsAvailable: '30 niños por sede (Incluye casco y kit)',
    isFree: true,
    description: '¡Somos para toda la familia! Los niños aprenden a armar y pintar su primer proyecto en madera junto a sus padres de forma 100% segura.',
    image: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'evt-4',
    title: 'Academia MangoCenter: Seguridad Industrial, Ventas y Herramientas',
    category: 'Cursos E-Learning',
    tone: 'blue',
    date: 'Disponible 24/7 en Línea y Presencial',
    time: 'Certificación Digital Gratuita',
    branch: 'Plataforma E-Learning & Sedes Barinas / Araure',
    instructorOrHost: 'Academia Corporativa MangoCenter',
    spotsAvailable: 'Inscripciones Abiertas',
    isFree: true,
    description: 'Capacítate en seguridad laboral, manejo de herramientas eléctricas y gestión de proyectos para contratistas, emprendedores y talento humano.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80'
  }
];
