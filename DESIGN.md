---
name: MangoCenter — De la idea al proyecto
description: Landing comercial venezolana con tipografía de rótulo, fotografía propia y acciones claras.
colors:
  primary: '#09569A'
  primary-deep: '#053563'
  action: '#BD1E1E'
  positive: '#216E63'
  canvas: '#F7F9FA'
  atmosphere: '#E8F0F6'
  ink: '#111924'
  secondary: '#435060'
  muted: '#5E6B7C'
  white: '#FFFFFF'
  divider: '#C9D5DF'
  on-blue: '#DCEBFA'
  teal: '#3B9B8E'
  amber: '#F5B800'
  whatsapp: '#157F3F'
  whatsapp-hover: '#0F5C2E'
  pending-ink: '#715017'
  pending-surface: '#FFF3D3'
  navigation-glass: 'rgb(255 255 255 / .94)'
  caption-glass: 'rgb(255 255 255 / .72)'
  caption-glass-mobile: 'rgb(255 255 255 / .82)'
  mesh-green: '#8FCFBC'
  mesh-blue: '#72B6D5'
  mesh-warm: '#EBBBAC'
  action-shadow-near: '#671a1917'
  action-shadow-far: '#671a1910'
  tile-surface: 'rgba(3, 30, 58, 0.62)'
  tile-hover: 'rgba(3, 30, 58, 0.88)'
  tile-outline: 'rgba(220, 235, 250, 0.16)'
  tile-outline-hover: 'rgba(245, 184, 0, 0.45)'
typography:
  display:
    fontFamily: 'Barlow Condensed, sans-serif'
    fontSize: '6rem'
    fontWeight: 700
    lineHeight: 0.99
    letterSpacing: '-0.015em'
  body:
    fontFamily: 'Source Sans 3, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  micro:
    fontSize: '0.75rem'
  secondary:
    fontSize: '0.875rem'
  lead:
    fontSize: '1.125rem'
  lead-large:
    fontSize: '1.25rem'
  title-small:
    fontSize: '1.5rem'
  title:
    fontSize: '1.75rem'
  section-small:
    fontSize: '2rem'
  section:
    fontSize: '2.5rem'
  headline-small:
    fontSize: '3rem'
  headline:
    fontSize: '3.5rem'
  headline-large:
    fontSize: '4.5rem'
rounded:
  label: '4px'
  compact: '6px'
  control: '8px'
  panel: '12px'
  large-panel: '16px'
  inset-panel: '20px'
  pill: '9999px'
spacing:
  group: '12px'
  component: '24px'
  section: '88px'
components:
  button-primary:
    backgroundColor: '{colors.action}'
    textColor: '#FFFFFF'
    rounded: '{rounded.control}'
    height: '48px'
---

## Overview

El sistema anterior utilizaba Archivo, fondos de plano técnico, mosaicos fotográficos y animación distribuida en numerosos elementos. El rediseño conserva la tríada de marca y las funciones, y concentra la expresión en el primer bloque. Fuente normativa: src/editorial.css para la nueva capa y src/style.css para los componentes existentes.

## Colors

Cobalto para identidad y navegación. Rojo oscuro para la acción principal y énfasis del titular. Esmeralda para información de tasa y estado. Fondo frío, luminoso para lectura móvil en la calle. Los estados siempre incluyen texto, no solo color. Los neutros cálidos heredados se unificaron con canvas/atmosphere/divider; los grises de controles usan muted. Las transparencias de mesh, navegación, fotografía, sombras de CTA y fichas de estados se documentan por su función y permanecen limitadas a esas superficies.

## Typography

Barlow Condensed: titular y encabezados; Source Sans 3: lectura, controles y catálogo. Fuentes locales WOFF2 con font-display swap y licencias OFL incluidas. Números de precios y cantidades tabulares. Escala en píxeles: 12 para etiquetas auxiliares, 14 secundario, 16 cuerpo/controles, 18–20 introducciones, 24–28 títulos, 32–40 secciones y 48–56–72–96 titulares. Los titulares interpolan con clamp entre escalones. Se eliminaron tamaños aislados de 15, 19, 22, 26, 27, 30 y 100px. Líneas cortas en hero y medida máxima de lectura en documentos.

## Layout

Hero de dos columnas con CTA visible en el primer viewport; apilado a 600px. Departamentos: tres columnas, dos a 900px; nombres y descripciones breves en teléfono. Secciones con intervalos generosos y grupos densos. Catálogo y sedes conservan sus controles y estructura operativa. Navegación móvil fija y espacio para safe-area. Rutas con breadcrumbs y retorno al inicio.

Hasta 767px, la cabecera mide 64px y la barra superior se concentra en la tasa BCV; el portal sigue disponible en el menú. Una sola barra inferior muestra las rutas principales y el estado de la cotización, sin otro dock encima. El inicio reduce sus márgenes a 40px entre secciones y conserva los cinco efectos. Catálogo y destacados usan dos columnas, imágenes más contenidas, nombres completos, detalles técnicos desplegables y botones de ancho completo de al menos 44px.

La información secundaria de historias, actividades, canales de contacto y pie de página usa `details` nativos: cerrados inicialmente en teléfono y abiertos en escritorio. No se recortan los datos para simular menor longitud. Los campos mantienen 16px; el selector de sede muestra la ciudad o sucursal que identifica cada opción sin repetir el nombre corporativo.

La lista de cotización ocupa la altura dinámica de la pantalla. En móvil muestra miniaturas, nombres legibles y controles de cantidad en una fila propia. Su cuerpo se desplaza independientemente de la cabecera y del pie de totales/envío. El estado de tasa permanece visible; el horario de atención se consulta en un desplegable dentro del cuerpo. Safe areas, teclado, lista vacía, vaciado/deshacer y orientación horizontal forman parte del recorrido. Evidencia y límites en docs/MOBILE.md.

## Elevation & Depth

Glass limitado a navegación y pie de fotografía. El pie se superpone a la imagen y a la silueta orgánica: blanco al 72% con blur de 18px en escritorio, 82% y 12px en móvil, con reflejo interior y sombra desplazada. El mesh ocupa solo el hero; mezcla azul cielo, verde y un acento cálido más visibles, con un velo claro detrás del texto. La silueta azul-verde se deforma detrás de la fotografía. No se anima el blur.

## Shapes

Controles 8px y paneles 12px. Líneas divisorias en departamentos; no cajas de iconos repetidas. La forma SVG del hero se deforma lentamente; no representa una fotografía ni una promesa comercial.

## Components

CTA principal rojo. Hover 150ms y salida 250ms; press .96. Dropdown/modal abre 250ms y cierra 150ms; acordeón 250ms reversible. GSAP usa timeline de entrada, matchMedia, cleanup y pausa de ambiente fuera de pantalla o en pestaña oculta. Filtros solo reciben un fundido breve. Reduced-motion conserva estado y lectura sin recorridos.

Entrada del hero: líneas escalonadas, énfasis en “idea” y subrayado SVG trazado. Se reproduce al volver a Inicio. Ocho partículas en escritorio y cinco en móvil; el control “Pausar animación” detiene el ambiente. Con movimiento reducido, titular y silueta quedan estáticos y las partículas se ocultan.

Rendimiento del hero: el gradiente se promueve a una capa de composición solo mientras el ambiente está activo. La silueta SVG limita su área de pintura y las partículas ocultas en móvil no reciben tweens. La pausa se conserva al cambiar de breakpoint. La fotografía usa resoluciones adaptativas y las fuentes locales contienen los caracteres latinos necesarios; no se modifican la composición, los colores, el blur ni las duraciones. Mediciones y límites en docs/PERFORMANCE.md.

Calculadora BCV: un único nodo de texto con cifras tabulares y espacio fijo en escritorio; fila propia en móvil. El contador interpola durante 320ms desde el importe visible hasta el nuevo destino, interrumpiendo el tween anterior al seguir escribiendo. Mantiene el tamaño de letra; no anima anchura ni superpone textos. El lector de pantalla recibe el importe final, no cada fotograma. Con movimiento reducido, la actualización es inmediata.

Formulario: validación, límites de longitud, errores asociados y preparación de mensaje; /gracias no afirma recepción. Mapa con carga voluntaria. Lista y sede persisten en localStorage. Breadcrumbs, foco de título e historial nativo conectan las rutas.

## Do's and Don'ts

- Usar datos de src/data.ts y activos de marca; documentar procedencia en docs/ASSETS.md.
- Mantener etiquetas de referencia en fotografías genéricas de producto.
- No inventar reseñas, resultados, fotografía del equipo ni plazos de atención.
- No llamar “actual” a una tasa antigua ni afirmar que WhatsApp recibió un mensaje.
- No añadir React, otro sistema de estilos ni certificados al entorno.
