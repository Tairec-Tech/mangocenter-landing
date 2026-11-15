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
  caption-glass: 'rgb(255 255 255 / .9)'
  mesh-green: '#c8e6dfaa'
  mesh-blue: '#c9ddeb99'
  image-outline: '#0000001a'
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

Hero de dos columnas con CTA visible en el primer viewport; apilado a 600px. Departamentos: tres columnas, dos a 900px, una a 600px. Secciones con intervalos generosos y grupos densos. Catálogo y sedes conservan sus controles y estructura operativa. Navegación móvil fija y espacio para safe-area. Rutas con breadcrumbs y retorno al inicio.

## Elevation & Depth

Glass limitado a navegación y pie de fotografía. Dos capas suaves en botones y paneles; divisores para listas. El mesh es de bajo contraste y ocupa solo el hero. En móvil el pie de foto se vuelve opaco para reducir composición.

## Shapes

Controles 8px y paneles 12px. Líneas divisorias en departamentos; no cajas de iconos repetidas. La forma SVG del hero se deforma lentamente; no representa una fotografía ni una promesa comercial.

## Components

CTA principal rojo. Hover 150ms y salida 250ms; press .96. Dropdown/modal abre 250ms y cierra 150ms; acordeón 250ms reversible. GSAP usa timeline de entrada, matchMedia, cleanup y pausa de ambiente fuera de pantalla o en pestaña oculta. Filtros solo reciben un fundido breve. Reduced-motion conserva estado y lectura sin recorridos.

Formulario: validación, límites de longitud, errores asociados y preparación de mensaje; /gracias no afirma recepción. Mapa con carga voluntaria. Lista y sede persisten en localStorage. Breadcrumbs, foco de título e historial nativo conectan las rutas.

## Do's and Don'ts

- Usar datos de src/data.ts y activos de marca; documentar procedencia en docs/ASSETS.md.
- Mantener etiquetas de referencia en fotografías genéricas de producto.
- No inventar reseñas, resultados, fotografía del equipo ni plazos de atención.
- No llamar “actual” a una tasa antigua ni afirmar que WhatsApp recibió un mensaje.
- No añadir React, otro sistema de estilos ni certificados al entorno.
