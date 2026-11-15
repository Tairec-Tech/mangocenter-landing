export const PAGES = {
  inicio: { path: '/', title: 'MangoCenter | Todo para tu obra y tu hogar', description: 'Explora ferretería, construcción, hogar, tecnología y agro. Arma tu cotización y encuentra una de las nueve supertiendas MangoCenter en Venezuela.', label: 'Inicio' },
  tienda: { path: '/tienda', title: 'Catálogo y cotizaciones a tasa BCV | MangoCenter', description: 'Consulta productos, filtra por departamento y prepara tu lista de cotización en USD y bolívares para tu sede MangoCenter.', label: 'Catálogo' },
  nosotros: { path: '/nosotros', title: 'Nuestra historia y supertiendas | MangoCenter', description: 'Conoce MangoCenter, hiperferretería para toda la familia con nueve sedes en Zulia, Aragua, Lara, Portuguesa y Barinas.', label: 'Nosotros' },
  contacto: { path: '/contacto', title: 'Contacto y atención por supertienda | MangoCenter', description: 'Selecciona tu supertienda y prepara una consulta por WhatsApp. Direcciones, horarios e indicaciones para visitar MangoCenter.', label: 'Contacto' },
  cursos: { path: '/cursos', title: 'Portal de colaboradores | MangoCenter', description: 'Acceso al campus corporativo de formación MangoCenter.', label: 'Colaboradores', noindex: true },
  gracias: { path: '/gracias', title: 'Tu consulta está preparada | MangoCenter', description: 'Continúa en WhatsApp para revisar y enviar tu consulta a la supertienda seleccionada.', label: 'Tu consulta', noindex: true },
  privacidad: { path: '/privacidad', title: 'Política de privacidad | MangoCenter', description: 'Información sobre los datos del formulario, almacenamiento local y servicios externos utilizados por esta web.', label: 'Privacidad', noindex: true },
  'no-encontrado': { path: '/404', title: 'Página no encontrada | MangoCenter', description: 'Vuelve al inicio, explora el catálogo o contacta a una supertienda MangoCenter.', label: 'Página no encontrada', noindex: true },
} as const;
export type AppView = keyof typeof PAGES;
export function resolveRoute(pathname: string, hash = ''): AppView {
  const route = (hash.startsWith('#/') ? hash.slice(1) : pathname).replace(/\/+$/, '') || '/';
  if (route === '/inicio') return 'inicio';
  return (Object.keys(PAGES) as AppView[]).find(key => PAGES[key].path === route) ?? 'no-encontrado';
}
export function applyPageMetadata(view: AppView): void {
  const page = PAGES[view];
  document.title = page.title;
  const meta = (key: string, content: string, property = false) => {
    const attr = property ? 'property' : 'name';
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.append(el); }
    el.content = content;
  };
  const publishedCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  const base = import.meta.env.VITE_SITE_URL || (publishedCanonical ? new URL(publishedCanonical).origin : location.origin);
  const url = new URL(page.path, base).href;
  meta('description', page.description); meta('robots', 'noindex' in page ? 'noindex,follow' : 'index,follow');
  for (const [key, value] of Object.entries({ title: page.title, description: page.description, type: 'website', locale: 'es_VE', site_name: 'MangoCenter', url, image: new URL('/social-card.jpg', base).href, 'image:alt': 'MangoCenter: todo para tu obra y tu hogar' })) meta(`og:${key}`, value, true);
  meta('twitter:card', 'summary_large_image'); meta('twitter:title', page.title); meta('twitter:description', page.description); meta('twitter:image', new URL('/social-card.jpg', base).href);
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
  canonical.href = url;
  document.querySelectorAll<HTMLElement>('[data-breadcrumb]').forEach(el => { const key = el.dataset.breadcrumb as AppView; el.textContent = PAGES[key].label; });
}
