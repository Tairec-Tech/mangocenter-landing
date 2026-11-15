# Suites oficiales

Instalación local en `.agents/skills/`, excluida de Git para no redistribuir las bibliotecas de skills. Lectura directa de sus SKILL.md. Impeccable usa la alternativa de copia manual documentada en su README; detector 0.1.24 instalado con comprobación del launcher en `/workspace/.cache/impeccable`. No se activaron hooks ni agentes con permisos deshabilitados.

| Suite | Repositorio oficial | Commit consultado |
| --- | --- | --- |
| impeccable | https://github.com/pbakaus/impeccable | `2b86d9c07b97d4bed7de23583e1bd1e58dd2baae` |
| transitions | https://github.com/Jakubantalik/transitions.dev | `20d70c1262bf721c0300c2946cbe1fc7605a555c` |
| gsap | https://github.com/greensock/gsap-skills | `aed9cfd3277740755f6bfc1155c7aa645403b760` |
| feel | https://github.com/jakubkrehel/make-interfaces-feel-better | `35545ea1512ad59fa463e6b1f95ca9c052981fe6` |

Restauración en otro equipo: `npx impeccable install` y `npx skills add` con cada uno de los otros tres repositorios oficiales anteriores. En este entorno se conservaron copias locales verificadas de nueve SKILL.md: Impeccable, GSAP core/timeline/scrolltrigger/performance/frameworks, Transitions dev/polish y Make Interfaces Feel Better. El skills-lock.json heredado no acredita por sí solo la presencia de archivos.

El usuario autorizó la revisión dual: /root/review_design y /root/review_evidence completaron sus evaluaciones por separado. Síntesis y correcciones en docs/CRITIQUE.md; el historial se conserva en .impeccable/critique/. No se requieren más autorizaciones para las correcciones locales solicitadas.
