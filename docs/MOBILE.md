# Adaptación móvil

Se conserva Vite, TypeScript, Tailwind y GSAP. La adaptación mantiene las funciones y los efectos del hero y reutiliza la optimización de imágenes/fuentes anterior.

## Recorrido

- Cabecera de 64px, tasa visible, menú ancho y desplazable; el portal de colaboradores continúa dentro del menú. El botón anuncia abrir/cerrar según su estado.
- Barra inferior única con estado de la lista. El dock flotante adicional se reserva para escritorio para evitar superponer dos controles de cotización al contenido.
- Inicio con menos espacio vertical, departamentos en dos columnas y textos de categoría compactos. Las historias pendientes siguen identificadas y disponibles mediante desplegables.
- Catálogo y destacados en dos columnas, nombres completos, imágenes de referencia identificadas, detalles/SKU desplegables, precios legibles y botones táctiles de ancho completo. La marca de selección se oculta correctamente hasta añadir el producto.
- Carrito con cuerpo desplazable, total y envío siempre disponibles. Miniaturas, cantidades de 44px, nombres sin truncar, selección de sede abreviada, estado de tasa visible y horario desplegable. Se conservan persistencia, vaciado/deshacer y preparación de WhatsApp.
- Formulario más accesible desde el inicio de Contacto, teléfonos y correo desplegables, campos de 16px, validación y destinatario preservados.
- Sedes, mapa voluntario, FAQs, actividades, privacidad y enlaces del pie permanecen accesibles. Las actividades secundarias y grupos de enlaces del pie no alargan el recorrido inicial.

## Longitud observada

Comparación en Chromium con viewport de 390 × 844, movimiento reducido, fuentes cargadas y estado inicial de los desplegables. Es altura de documento, no tiempo de carga ni una puntuación de rendimiento.

| Vista | Antes | Después | Reducción aproximada |
| --- | ---: | ---: | ---: |
| Inicio | 12.979px | 8.360px | 36% |
| Catálogo | 8.519px | 4.271px | 50% |
| Contacto | 3.287px | 2.296px | 30% |

El usuario puede desplegar el contenido secundario; las mediciones corresponden al recorrido inicial. No se ocultaron funciones esenciales ni se redujeron los controles táctiles para conseguir estas cifras.

## Comprobación

Resultado final: `npm test`, 39 pruebas aprobadas; `npm run build`, TypeScript, Vite y ocho rutas prerenderizadas correctas; `git diff --check`, sin errores. El detector de fuente Impeccable no encontró incidencias en la revisión visual de código.

`tests/mobile.spec.ts` añade doce pruebas: cinco combinaciones de viewport (320 × 568, 390 × 844, 430 × 932, 768 × 1024 y 844 × 390), listas extensas en 320 × 568 y 667 × 375, recorrido táctil de compra, gestos sobre filtros y tres auditorías axe WCAG 2 A/AA y 2.1 AA en móvil. La lista extensa utiliza doce productos con 999 unidades por producto para comprobar importes grandes, vaciado y recuperación.

Los gestos horizontales y verticales se sintetizan con CDP en Chromium; las acciones táctiles usan Playwright `tap`. Se verifica que deslizar las categorías no activa una selección y que un gesto vertical sobre ellas permite desplazar la página. Las pruebas existentes cubren la calculadora, los cinco efectos, pausa/reanudación, movimiento reducido, persistencia y navegación. La comparación visual incluye inicio, catálogo, formulario, carrito, menú, sedes y escritorio.

No se ha probado en teléfonos físicos ni en Safari/iOS. La altura dinámica y las áreas seguras están implementadas; el teclado y el navegador de un dispositivo real requieren una comprobación allí. Las pruebas de viewport y accesibilidad automatizada no constituyen una certificación de todos los navegadores.
