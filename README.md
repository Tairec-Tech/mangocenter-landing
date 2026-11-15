# MangoCenter landing

Vite + TypeScript + Tailwind CSS + GSAP. Desarrollo sin React.

```sh
npm ci
npm run dev
npm run build
npm run preview
npm test
```

Node 22.18+ o 24. Las pruebas usan Chromium del sistema si existe; en otro equipo, ejecutar `npx playwright install chromium` antes de `npm test`.

La compilación genera HTML por ruta (`/`, `/tienda`, `/nosotros`, `/contacto`, `/cursos`, `/gracias`, `/privacidad`) y `404.html`. Los enlaces antiguos `#/…` siguen funcionando. Vercel puede servir los directorios estáticos y su 404 nativa; no agregar una reescritura global a index.html que transforme errores 404 en respuestas 200.

## Dominio y SEO

Configurar `VITE_SITE_URL` con el origen HTTPS definitivo antes de compilar. En Vercel se utiliza `VERCEL_PROJECT_PRODUCTION_URL` si está disponible. El script genera canonical, URLs absolutas para redes y sitemap solo con un origen conocido; no se inventa un dominio. `public/robots.txt` y `public/social-card.jpg` están incluidos. Cada ruta tiene título, descripción y Open Graph en su HTML; las nueve sedes forman el JSON-LD HardwareStore, subtipo de LocalBusiness.

Privacidad, gracias, colaboradores y 404 se marcan noindex. La política describe el funcionamiento técnico de la landing de presentación, aceptado por el usuario.

## Integraciones

DolarAPI: consulta pública, sin secretos. Una tasa inválida, futura o de más de 96 horas activa la referencia local sin actualizar. La fecha de la tasa se muestra para evitar confundirla con una cotización del día. Confirmar siempre el importe en tienda.

Google Maps se carga por decisión del visitante. `VITE_GOOGLE_MAPS_API_KEY` es opcional: sin ella se usa el iframe. Una clave VITE es pública; restringirla al dominio y API autorizados en Google Cloud.

El formulario prepara un enlace de WhatsApp. No hay backend de formularios, entrega confirmada ni pago online. /gracias ofrece el paso final y permite volver al borrador. No conserva nombres/teléfonos/mensajes en almacenamiento persistente.

## Diseño y revisión

- PRODUCT.md: contexto y hechos del negocio.
- DESIGN.md: sistema visual implementado.
- docs/REVIEW.md: auditoría, validaciones y límites.
- docs/ASSETS.md: procedencia de activos.
- docs/SKILLS.md: suites oficiales utilizadas e instalación local.

El usuario acepta los espacios de casos, reseñas y equipo identificados como pendientes para esta landing de presentación. No se presentan como prueba social real. WhatsApp: lunes a domingo, 8:00 a. m.–9:00 p. m., hora de Venezuela; respuesta en un máximo de 3 horas de atención.
