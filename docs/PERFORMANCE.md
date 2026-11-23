# Optimización del inicio

Comparación local con la versión 86daa70, manteniendo Gradient Mesh, Glassmorphism, Liquid Morph, Kinetic Type y partículas.

Estas cifras corresponden a la fase de optimización del hero anterior a la adaptación móvil. El recorrido móvil posterior y sus mediciones se documentan en [MOBILE.md](MOBILE.md).

## Recursos iniciales

| Medida | Antes | Después | Reducción |
| --- | ---: | ---: | ---: |
| Recursos iniciales, escritorio 1905 × 900 | 3.577.092 B | 529.559 B | 85,2 % |
| Recursos iniciales, móvil 390 × 900 | 3.450.520 B | 351.683 B | 89,8 % |
| Seis fuentes WOFF2 | 323.832 B | 179.192 B | 44,7 % |
| Imagen del hero, escritorio a DPR 1 | 207.642 B | 92.822 B | 55,3 % |
| Imagen del hero, móvil a DPR 1 | 207.642 B | 41.518 B | 80,0 % |

Se evitó descargar al entrar un JPG de 2.788.237 B perteneciente a la vista Nosotros, entonces oculta. Esa vista carga ahora la misma campaña en WebP cuando se necesita. La imagen del hero ofrece variantes de 480, 800, 1200 y 1600 píxeles. Las fuentes conservan los caracteres latinos, sus métricas, familias y pesos; se precargan las dos variantes críticas del primer bloque.

Los totales son la suma de `PerformanceResourceTiming.encodedBodySize` con caché fría en Chromium headless, servidor local de producción y DPR 1. Excluyen el documento HTML, las cabeceras y la respuesta BCV simulada. Son bytes de recursos observados, no una medición de tiempo de carga en Vercel. La densidad de pantalla y la proximidad de las imágenes diferidas al viewport pueden cambiar los totales.

## Coste de la animación

El principal cuello de botella observado fue la rasterización del gradiente grande al escalarse. Una capa `will-change: transform` activa únicamente durante el movimiento permite reutilizarlo. El SVG limita su pintura, los tweens excluyen las partículas ocultas y las solicitudes de actualización de ScrollTrigger se agrupan por fotograma. Se mantiene la pausa fuera de pantalla, en pestañas ocultas y por petición del usuario; se libera la promoción de la capa en esos estados.

En tres ventanas nominales de dos segundos, la mediana del intervalo entre fotogramas en escritorio pasó de 450,1 ms a 33,3 ms; en móvil se mantuvo en 16,7 ms. Es evidencia de mejora en este navegador de laboratorio, con renderizado por software. Las tareas largas pueden alargar las ventanas de muestreo. No representa una garantía de FPS en dispositivos reales ni una medición universal del consumo de CPU.

Se conservan el morph SVG, el gradiente y su recorrido, las transparencias y blur, la entrada tipográfica, las partículas visibles y las duraciones originales. El módulo del cargador de Google Maps se importa al solicitar el mapa; con la configuración local sin clave no se atribuye a ese cambio ningún ahorro medido del bundle.

## Verificación

- Compilación TypeScript, Vite y prerender de ocho rutas correctos.
- 27 pruebas funcionales y de accesibilidad aprobadas: 26 en la ejecución completa y la restante tras corregir su selector para abrir el menú móvil. No fue necesario modificar la aplicación por ese fallo del test.
- Cobertura añadida: selección de imagen según viewport, ausencia de descarga del JPG oculto, carga de la imagen al entrar en Nosotros, pausa fuera de pantalla y en otras rutas, liberación de la capa y cambio de tamaño con la animación pausada.
- Comparación visual del hero en escritorio y móvil, manteniendo geometría y tipografía; los tests de movimiento verifican pausa, reanudación y contenido visible.
- Detector de fuente Impeccable sin hallazgos; `git diff --check` sin errores.

La prueba del mapa cubre la carga voluntaria y su alternativa sin clave; no valida Google Maps con una clave de producción.
