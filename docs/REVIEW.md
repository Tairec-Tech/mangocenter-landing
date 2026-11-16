# Revisión del rediseño

## Alcance y contexto

Vite + TypeScript + Tailwind + GSAP, sin React. Inicio, catálogo, sedes, contacto, privacidad, gracias, 404 y preservación del portal interno. Los cambios son locales; no se ha hecho push ni despliegue. No se cambió la confianza TLS ni el borrador del entorno.

## Auditoría inicial

| Prioridad | Evidencia | Acción |
| --- | --- | --- |
| P1 | Un título y descripción compartidos, navegación solo por hash, sin 404 ni privacidad | Rutas reales, metadata estática y dinámica, prerender, 404 y privacidad |
| P1 | Tasa etiquetada como vigente sin validar fecha del proveedor | Validación de fecha/valor y referencia sin actualizar en error |
| P1 | Diálogos sin aislamiento de teclado | inert, ciclo de foco, Escape y devolución del foco |
| P2 | Hero con texto extenso, carrusel, calculadora y métricas compitiendo | Un CTA principal, campaña propia, calculadora en franja separada |
| P2 | Cuatro FAQs y ausencia de cierre de contacto | Seis FAQs; ruta gracias con continuidad honesta a WhatsApp |
| P2 | Fotografía externa 404 y fuentes externas no cargables en el navegador de este entorno | Fotografía pendiente visible; fuentes y referencias autoalojadas |
| P2 | Prueba social y fotografía del equipo sin evidencia suministrada | Espacios marcados como pendientes; ninguna métrica o reseña ficticia |
| P3 | Mosaicos repetitivos, efecto magnético y varios movimientos simultáneos | Departamentos en filas; movimiento concentrado en hero y scroll suave |

Las cualidades iniciales conservadas son el catálogo estructurado, la selección regional, los enlaces reales de mapa/WhatsApp, la paleta corporativa y la persistencia de cotización.

## Diseño y microdetalles

Revisión completa local según Make Interfaces Feel Better: tipografía condensada autoalojada y texto de lectura, jerarquía, ajuste de líneas, sombras suaves, radios consistentes, iconos heredados de trazo, controles de 44–48px, foco visible y números tabulares. Las transiciones usan los tokens existentes; entrada de modal 250ms/cierre 150ms, panel 400/350ms, filtros con fundido de 150ms. Se eliminó la promoción incorrecta de width con will-change.

Se mantuvo la barra móvil por su utilidad; no se añadió pinning porque bloquearía una landing orientada a consultar y cotizar. No se añadieron testimonios simulados. El usuario confirmó atención por WhatsApp diaria de 8:00 a. m. a 9:00 p. m. y respuesta en un máximo de 3 horas dentro de ese horario.

## Verificación

- `npm ci`: instalación reproducible con lockfile.
- `npm run build`: TypeScript, Vite y ocho páginas HTML estáticas, resultado correcto.
- `npm test`: 19 pruebas aprobadas (15 funcionales y 4 de accesibilidad con axe WCAG 2 A/AA y 2.1 AA). Incluye búsqueda, categorías, cantidades, persistencia, contacto, historial, 404, seis FAQs, carga voluntaria de mapa, tasa inválida/antigua, diálogos y viewports 360/390/768/1440.
- Producción local: inicio desktop/móvil, catálogo con barra final, contacto móvil, gracias y 404. Sin desbordamiento horizontal ni imágenes faltantes en las vistas comprobadas; sin excepciones JavaScript.
- HTML de producción: exactamente una vista visible por ruta, metadescripciones, Open Graph/Twitter, imagen social existente y JSON-LD de nueve sedes HardwareStore (subtipo LocalBusiness).
- Impeccable engine 0.1.24: revisión independiente inicial, 0 hallazgos principales y 93 avisos de documentación. Tras normalizar tamaños/neutros, eliminar declaraciones muertas y documentar valores vigentes: 0 hallazgos y 0 avisos de fuente. Navegador final en inicio, catálogo, contacto y privacidad: 0 hallazgos tras corregir la anchura del nuevo texto de horario. Sin desactivar reglas.
- El arranque directo del navegador del detector falló por el sandbox de Chromium; se resolvió conectándolo por CDP local a Chromium de pruebas. No se modificó la validación de certificados.
- Inspección visual con Chromium headless en escritorio y móvil. Reduced-motion cubierto por las pruebas. No equivale a certificación completa WCAG ni a validación en todos los navegadores o garantía de 60fps en hardware móvil real.

## Límites y decisiones pendientes

- Crítica dual autorizada y completada: véase CRITIQUE.md. Puntuación inicial 28/40; hallazgos resueltos y comprobados, sin inventar una puntuación posterior.
- URL pública definitiva: configurar VITE_SITE_URL, o utilizar la variable VERCEL_PROJECT_PRODUCTION_URL disponible en Vercel, para URLs absolutas y sitemap. No se inventó dominio.
- WhatsApp: lunes a domingo, 8:00 a. m.–9:00 p. m., hora de Venezuela; máximo 3 horas dentro de horario. Fuera de horario, el plazo continúa al abrir.
- Reseñas, casos y foto del equipo: el usuario acepta los espacios claramente identificados como pendientes para la landing de presentación.
- Privacidad: texto descriptivo del funcionamiento técnico aceptado por el usuario para esta landing.
- Google Maps y BCV reales siguen sujetos a las limitaciones de red/TLS ya diagnosticadas en Codex. Las pruebas funcionales interceptan esas solicitudes con fixtures o errores controlados, sin atribuirles conectividad real ni envío real de WhatsApp.
- Publicación y códigos HTTP de Vercel: no ejecutados. La salida estática incluye 404.html; mantener la respuesta 404 de la plataforma y evitar una reescritura global a index.html.

## Resultado

Implementación local, crítica dual y correcciones terminadas para el alcance de landing de presentación aceptado. URL pública pendiente de existir; no impide la vista previa local. Integraciones externas y respuesta HTTP de Vercel no verificadas en producción; no se ha publicado.

## Continuación: efectos visibles y calculadora BCV

El usuario pidió aumentar la presencia de Gradient Mesh, Glassmorphism, Liquid Morph, Kinetic Type y partículas, y corregir el salto de tamaño/posición mostrado en su grabación de la calculadora. Los cinco archivos de implementación sobrevivieron al cambio de entorno; no se reaplicaron sus cambios al reanudar.

- Mesh con colores más perceptibles, silueta orgánica azul-verde detrás de la fotografía y panel translúcido con blur acotado también en móvil.
- Entrada escalonada del titular, énfasis y subrayado de “idea”, repetida al volver a Inicio. Ocho partículas en escritorio, cinco en móvil; control de pausa y respeto al movimiento reducido.
- El importe BCV es un único texto con cifras tabulares: interpola 320ms desde el valor visible al nuevo destino, sin reemplazos superpuestos ni cambio de tamaño. El campo USD y el resultado conservan su posición. El lector de pantalla recibe solo el resultado final.
- 23 pruebas aprobadas: las 19 anteriores más escritura rápida en dos tamaños de pantalla, pausa/reanudación/regreso al hero y movimiento reducido. La espera de accesibilidad se ajustó a la ruta visible; no se desactivaron comprobaciones de axe.
- Compilación correcta; detector de fuente y hero renderizado sin hallazgos. Inspección final con movimiento normal en escritorio y móvil, sin errores JavaScript observados. La tasa 911,62 usada en las comprobaciones es una respuesta de prueba, no una certificación de la tasa real.
- Los vídeos de diagnóstico obtenidos por screencast tienen pocos fotogramas en este entorno y no sirven para medir fluidez ni acreditar 60fps; la validación funcional muestrea los valores y dimensiones con requestAnimationFrame.

Estos ajustes posteriores al commit 3995842 permanecen locales. No se realizó push ni publicación durante esta continuación, respetando la instrucción más reciente del usuario.
