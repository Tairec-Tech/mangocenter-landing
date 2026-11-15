Method: dual-agent (A: /root/review_design · B: /root/review_evidence)

# Revisión independiente y correcciones

## Alcance

Evaluación de la versión anterior a esta pasada de correcciones, sobre `index.html`, catálogo, contacto y sedes en escritorio y móvil. A revisó diseño y recorridos sin leer el detector; B obtuvo evidencia automática y de navegador sin leer A. El resultado inicial fue **28/40 — Bueno**. Esta puntuación describe la versión evaluada, no una nueva puntuación inventada después de corregirla.

## Especificidad y primera impresión

La tipografía de rótulo, el azul/rojo/verde, la campaña propia de Maracay, la moneda y el enrutamiento regional hacen que la web pertenezca a MangoCenter. La portada tiene más personalidad que las tarjetas de catálogo heredadas. La oportunidad principal era llevar la claridad inicial hasta el cierre de la consulta y la selección de sede.

## Heurísticas de Nielsen

| Heurística | Inicial /4 | Evidencia inicial |
| --- | ---: | --- |
| Visibilidad del estado | 2 | Continuación y sede seleccionada podían quedar fuera de pantalla |
| Lenguaje del usuario | 3 | USD/Bs. y WhatsApp pertinentes; algunos términos técnicos |
| Control y libertad | 3 | Escape e historial funcionan; vaciado sin deshacer |
| Consistencia | 3 | Etiqueta de WhatsApp y estado BCV contradictorios |
| Prevención de errores | 2 | Validación presente; pérdida accidental de lista |
| Reconocimiento | 3 | Filtros y cantidades claros; detalle de sede oculto debajo |
| Eficiencia | 3 | Búsqueda, orden, filtros y persistencia adecuados a 12 productos |
| Diseño y economía visual | 3 | Portada clara; recorrido móvil largo |
| Recuperación de errores | 3 | Mensajes específicos que desaparecían solos |
| Ayuda | 3 | FAQ, privacidad e instrucciones útiles |
| **Total** | **28/40** | **Bueno; las diez heurísticas aplican** |

## Lo que funciona

- La portada distingue cotizar y encontrar una sede; el CTA cabe en el primer viewport móvil.
- La lista calcula cantidades, sobrevive a recargas y permite salir con Escape.
- Direcciones, horarios dominicales, línea regional, consentimiento del mapa y mensajes honestos de preparación refuerzan la confianza.

## Hallazgos priorizados y resolución

1. **P1 — Contacto terminaba visualmente en el pie de página.** En 390×844 se reprodujo scrollY=1061 con el titular de `/gracias` fuera de vista. Se cambió la navegación a desplazamiento instantáneo y el primer botón a “Preparar consulta para WhatsApp”. La prueba con movimiento normal comprueba titular visible y scrollY=0. Criterios: harden/clarify.
2. **P1 — La tasa de respaldo parecía actual en el momento de cotizar.** A y B encontraron el mismo problema: cabecera advertida, pero tarjetas/totales/mensaje externo sin aclaración. Se eliminaron promesas estáticas de tiempo real; sin tasa vigente, productos, total y mensaje indican importe por confirmar. Criterios: harden/clarify.
3. **P1 — Elegir sede en móvil no mostraba su detalle.** El panel seleccionado quedaba a más de una pantalla. Se acotó el listado desplazable y la selección lleva foco y vista al detalle; se mantiene el acceso al resto de sedes. Criterio: adapt.
4. **P2 — Vaciar la lista no permitía recuperar el trabajo.** Se añadió “Deshacer vaciado de lista”, accesible con teclado y sin temporizador, que restaura productos y cantidades. Se mantiene hasta deshacer o modificar la lista, durante la sesión actual. Criterio: harden.
5. **P3 — Diferencias entre estilos y documentación.** B encontró 93 avisos (41 color, 39 tipografía, 13 radios), ninguno principal. Había valores sin documentar y declaraciones sobrescritas sin uso. Se normalizaron neutros, rojo de acción y tamaños, se eliminaron radios muertos y se documentaron transparencias y escalas efectivamente usadas. No se silenciaron reglas. Criterios: document/polish.

## Personas y carga cognitiva

Jordan, visitante nuevo, encontraba ambigua la preparación de WhatsApp; Casey, en móvil y con distracciones, perdía de vista sedes y continuación; Riley, orientado a recuperarse de errores, no podía deshacer. El contratista Luis necesitaba conservar cantidades y advertencia monetaria; Ana necesitaba llegar a la ruta/horario de su tienda. Las correcciones atienden esos recorridos concretos.

Carga inicial moderada: 2 de 8 criterios incumplidos, agrupación y número de opciones en seis departamentos, siete filtros de catálogo y nueve sedes. Son taxonomías útiles y conocidas; se conserva su búsqueda directa y se reduce la distancia al detalle móvil. El recorrido emocional tenía una apertura segura y un cierre confuso: la continuación visible y el destino explícito corrigen ese valle.

## Observaciones menores atendidas

- Cierre del cajón: mínimo de 48×48px y sin contracción flex.
- El aviso de producto añadido se retira al abrir la lista para no cubrir importes.
- Los errores de campos ya no desaparecen por un temporizador sin corregir el valor.
- El foco se conserva al reconstruir controles de cantidades y se eliminó el foco diferido que podía robarlo.
- Se corrigió además que un filtro de mapa anterior reemplazara el destinatario elegido en contacto/cotización.
- Horario confirmado: todos los días 8:00 a. m.–9:00 p. m., Venezuela; hasta 3 horas dentro de horario. Se distingue de los horarios de visita a las tiendas.

## Evidencia y límites

B ejecutó el detector de fuente y una inyección temporal verificada en cinco rutas (`/`, `/tienda`, `/contacto`, `/nosotros`, `/cursos`): cero antipatrones principales en navegador. Axe móvil no encontró infracciones en inicio, catálogo y contacto. Eran navegadores headless, no overlays visibles en el navegador del usuario. La validación TLS se mantuvo y no se enviaron mensajes reales. El servicio auxiliar de B se detuvo con `--keep-inject`, sin editar el HTML del proyecto.

La fuente corregida devuelve cero hallazgos y cero avisos. La revisión renderizada final cubre inicio, catálogo, contacto y privacidad; el nuevo texto de horario produjo un aviso de líneas demasiado largas, corregido limitando su anchura. La compilación y 19 pruebas automatizadas comprueban los flujos corregidos. No equivalen a validación externa de BCV, Google Maps ni envío de WhatsApp desde este entorno.

## Decisiones aceptadas

El usuario autorizó ambos agentes y resolver todos los problemas, confirmó horario y plazo de WhatsApp, y aceptó privacidad, fotografías y espacios de contenido actuales para esta landing de presentación. No se inventan reseñas, métricas ni dominio público. No se realizó push ni despliegue.

Questions skipped: el usuario ya indicó resolver todos los hallazgos y conservar los contenidos actuales; no se repite una decisión ya autorizada.
