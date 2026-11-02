# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Familias y propietarios de hogar en Venezuela**: Buscan equipamiento confiable para remodelación, baños, cocina, iluminación, jardín y tecnología doméstica con precios claros tanto en dólares referenciales (`USD`) como en bolívares a tasa oficial del Banco Central de Venezuela (`BCV`), y desean ubicar rápidamente la supertienda abierta más cercana o cotizar por WhatsApp antes de trasladarse.
- **Maestros de obra, contratistas, técnicos y productores agropecuarios**: Necesitan verificar especificaciones técnicas reales (potencia, caudal, rendimiento, calibres), armar listas de materiales multi-ítem con cálculo inmediato a tasa BCV y enviar su pedido directo al WhatsApp de la sede regional donde retirarán la mercancía.
- **Colaboradores internos de MangoCenter (secundario / interno)**: Empleados que acceden al campus corporativo de formación continua en Odoo eLearning (`Cursos`), separado del flujo comercial de clientes.

## Product Purpose

Ser el escaparate digital, catálogo referencial cotizable y localizador omnicanal de **MangoCenter Hiperferretería C.A.**, conectando la experiencia digital con la red física de 9 supertiendas en 5 estados de Venezuela (Barinas, Portuguesa, Lara, Aragua y Zulia). El éxito ocurre cuando el visitante consulta precios transparentes convertidos a tasa oficial BCV del día, arma su lista de cotización o consulta técnica y concreta la atención o retiro en sede a través de WhatsApp o visita presencial sin fricción.

## Positioning

Hiperferretería venezolana de gran formato (*"¡Para toda la Familia!"*) que reúne **5 mundos bajo un mismo techo** — Ferretería, Construcción, Hogar, Tecnología y Agro/Jardinería — combinando escala arquitectónica de supertienda regional, precios transparentes anclados estrictamente a la tasa oficial BCV y atención humana directa por sede vía WhatsApp.

## Operating Context

- **Doble referencia monetaria cotidiana**: Los compradores evalúan precios simultáneamente en `USD` y `Bs.` calculados a la tasa oficial BCV vigente (`https://ve.dolarapi.com/v1/dolares/oficial`). Mostrar una tasa desactualizada como si fuera en vivo genera desconfianza en caja, por lo que el estado de actualización o contingencia offline debe ser explícito y honesto.
- **Cierre comercial conversacional y presencial**: Las cotizaciones y pedidos se cierran mediante listas estructuradas enviadas a WhatsApp oficial (`0422-MANGOCE` / `+58 422-6264623` y línea regional de Barinas `+58 424-5956627`) o visitando físicamente cualquiera de las 9 supertiendas guiados por puntos de referencia viales locales.
- **Uso móvil en calle y obra**: Alta proporción de consultas desde teléfonos móviles bajo luz solar intensa y redes móviles variables, exigiendo alto contraste, carga ágil y controles táctiles amplios.

## Capabilities and Constraints

- **Catálogo Referencial a Tasa BCV + Lista de Cotización WhatsApp**: Exhibición interactiva de los 12 productos representativos de `src/data.ts` filtrables por departamento y búsqueda, con conversión automática `USD ↔ Bs. (BCV)` y un cajón de **Lista de Cotización** que compila productos, cantidades, subtotales y sede de retiro en un mensaje listo para WhatsApp.
- **Localizador interactivo de las 9 sedes reales**: Integración híbrida con Google Maps JS API (`@googlemaps/js-api-loader` cuando existe `VITE_GOOGLE_MAPS_API_KEY`) y respaldo garantizado por `<iframe>` de coordenadas verificadas, horarios diferenciados lunes-sábado y domingos, estado real abierto/cerrado según hora de Venezuela (`America/Caracas`, UTC-4) y enlaces directos a Google Maps y WhatsApp de cada sede.
- **Agenda de Eventos, Talleres y Comunidad**: Difusión de talleres técnicos gratuitos, demostraciones de marcas aliadas y actividades familiares con inscripción vía WhatsApp.
- **Portal Colaboradores (Odoo eLearning)**: Acceso interactivo de demostración exclusivo para empleados hacia el módulo `Cursos` (`odoo.mangocenter.com.ve/slides`), ubicado discretamente como utilidad corporativa para no confundirse con cuentas de compradores.
- **Decisiones de producto explícitamente abiertas (no inventar)**:
  - **Cuentas / login de clientes**: Aún no existe ni se ha definido un sistema de registro o inicio de sesión para compradores; únicamente existe acceso corporativo para empleados.
  - **Pasarela de pago transaccional en línea**: La compra directa con tarjeta/Pago Móvil dentro de la web no está activa todavía; el flujo vigente es cotización digital y cierre por WhatsApp o en tienda física.

## Brand Commitments

- **Nombre oficial**: MangoCenter Hiperferretería C.A.
- **Lema institucional**: *"¡Para toda la Familia!"*
- **Tríada cromática del isotipo arquitectónico** (`public/MangoCenter.png` y fachadas reales en `public/Banner Tiendas actualizado.jpg`):
  - Azul Cobalto Institucional (`#09569A` / profundo `#053563`) — estructura arquitectónica de las fachadas físicas, solvencia técnica y ferretería.
  - Rojo Ferretero (`#DF2726` / intenso `#BD1E1E`) — energía comercial, acción primaria, hogar y familia.
  - Verde Esmeralda Agro (`#216E63` / luminoso `#3B9B8E`) — campo, jardinería, agua, energía y verificación de tasa oficial.
- **Accesibilidad cromática**: Cumplimiento estricto **WCAG 2.1 AA** (`≥4.5:1` en cuerpo, botones y placeholders, utilizando `#216E63` para texto blanco sobre esmeralda y `#DF2726` para acciones primarias).
- **Activos propios verificados**: Logotipo oficial `public/MangoCenter.png` y material gráfico/fotográfico real de sedes y campañas en `public/` (`Banner Tiendas actualizado.jpg`, `Maracay apertura.jpg`, `Banner Categorias 2.jpg`, `Banner Eventos 2.jpg`, `Banner REDES.jpg`).

## Evidence on Hand

- **9 sedes físicas operativas documentadas en `src/data.ts`**: Maracaibo (Zulia), Maracay (Av. Las Delicias, Aragua), Barinas Cuatricentenaria, Alto Barinas, Barinas Centro, Guanare y Araure (Portuguesa), Cabudare y Barquisimeto (Lara), con coordenadas GPS, enlaces verificados de Google Maps, referencias locales y horarios.
- **12 SKUs reales de referencia en `src/data.ts`**: Herramientas eléctricas/manuales, pinturas e impermeabilizantes, bombas de agua y desmalezadoras, grifería y organización del hogar, cámaras WiFi e iluminación LED.
- **Ausencias que no deben fabricarse**: No inventar testimonios de clientes con nombres ficticios, certificaciones ISO inexistentes, envíos gratuitos nacionales no confirmados ni pasarelas de cobro automático.

## Product Principles

1. **Transparencia BCV sin letra pequeña**: Todo precio referencial muestra con claridad su valor en dólares y su conversión exacta en bolívares, distinguiendo honestamente entre tasa sincronizada en vivo y tasa referencial de respaldo.
2. **De la consulta al mostrador sin callejones sin salida**: Ningún botón primario lleva a una pantalla vacía; cada departamento, producto, evento o sede desemboca en una acción útil de cotización o localización real.
3. **Geografía venezolana real por encima del relleno genérico**: Las direcciones, puntos de referencia, horarios dominicales y teléfonos regionales responden a cómo se orienta realmente un comprador o maestro de obra en cada ciudad.
4. **Separación nítida entre comprador y colaborador**: El cliente encuentra de inmediato catálogo, sedes y WhatsApp; las herramientas internas de Odoo para empleados viven claramente identificadas en su propio carril corporativo.

## Accessibility & Inclusion

- Cumplimiento mínimo **WCAG 2.1 AA** en contraste de texto (`≥4.5:1` en cuerpo, placeholders y etiquetas, corrigiendo el uso de blanco sobre `#3B9B8E` hacia `#216E63` o tinta oscura), navegación completa por teclado con `:focus-visible` nítido, áreas táctiles mínimas de `44×44px` para uso móvil en calle y respeto integral a `prefers-reduced-motion` tanto en GSAP como en transiciones CSS.
