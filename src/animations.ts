import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let mmInstance: gsap.MatchMedia | null = null;
const cleanupFns: Array<() => void> = [];

/**
 * Inicializa toda la narrativa visual y cinética de MangoCenter:
 * - Barra tricolor de progreso de lectura (ScrollTrigger scrub)
 * - Coreografía de entrada del Pórtico Hero + vigas diagonales del isotipo + subrayado SVG
 * - Parallax reactivo al puntero (gsap.quickTo) en escritorio
 * - Cinta cinética industrial con inercia de velocidad y dirección de scroll
 * - Conducto de proceso sincronizado al scroll (scrub)
 * - Contadores numéricos progresivos, revelado por lotes y botones magnéticos sutiles
 * Todo con soporte estricto para prefers-reduced-motion y 60fps en compositor.
 */
export function initGsapAnimations(): void {
  cleanupFns.forEach((fn) => fn());
  cleanupFns.length = 0;

  if (mmInstance) {
    mmInstance.revert();
  }

  mmInstance = gsap.matchMedia();

  // Rama accesible sin movimiento: visibilidad inmediata y contadores en valor final
  mmInstance.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set(
      '[data-hero-line], [data-hero-copy], [data-hero-ctas], [data-hero-showcase], [data-hero-ledger] > div, [data-truss-beam], [data-truss-arc], [data-reveal-section], [data-stagger-card], [data-process-step]',
      { autoAlpha: 1, clearProps: 'transform' }
    );
    const underline = document.querySelector<SVGPathElement>('#hero-amber-underline');
    if (underline) {
      underline.style.strokeDashoffset = '0';
    }
    document.querySelectorAll<HTMLElement>('[data-count-to]').forEach((el) => {
      const target = Number(el.dataset.countTo ?? '0');
      const suffix = el.dataset.countSuffix ?? '';
      el.textContent = `${target}${suffix}`;
    });
  });

  // Rama cinética completa (60fps compositor-only)
  mmInstance.add('(prefers-reduced-motion: no-preference)', () => {
    // 1. Barra superior tricolor de progreso de scroll
    const progressBeam = document.getElementById('scroll-progress-beam');
    if (progressBeam) {
      gsap.to(progressBeam, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: 'max',
          scrub: 0.15,
        },
      });
    }

    // 2. Coreografía de entrada del Pórtico Hero
    const heroTl = gsap.timeline({
      defaults: {
        ease: 'power4.out',
        duration: 0.72,
        overwrite: 'auto',
      },
    });

    const amberPath = document.querySelector<SVGPathElement>('#hero-amber-underline');
    if (amberPath) {
      const len = Math.ceil(amberPath.getTotalLength?.() || 290);
      amberPath.style.strokeDasharray = `${len}`;
      amberPath.style.strokeDashoffset = `${len}`;
    }

    heroTl
      .addLabel('intro', 0)
      .from(
        '[data-truss-beam]',
        {
          x: 72,
          y: -72,
          autoAlpha: 0,
          duration: 0.85,
          stagger: 0.09,
          ease: 'expo.out',
        },
        'intro'
      )
      .from(
        '[data-truss-arc]',
        {
          scale: 0.9,
          autoAlpha: 0,
          duration: 0.9,
          transformOrigin: 'center center',
        },
        'intro+=0.08'
      )
      .from(
        '[data-hero-line]',
        {
          yPercent: 112,
          autoAlpha: 0,
          duration: 0.74,
          stagger: 0.09,
        },
        'intro+=0.05'
      );

    if (amberPath) {
      heroTl.to(
        amberPath,
        {
          strokeDashoffset: 0,
          duration: 0.65,
          ease: 'power3.out',
        },
        'intro+=0.34'
      );
    }

    heroTl
      .from(
        '[data-hero-copy]',
        { y: 16, autoAlpha: 0, duration: 0.56, ease: 'power3.out' },
        'intro+=0.24'
      )
      .from(
        '[data-hero-ctas]',
        { y: 14, autoAlpha: 0, duration: 0.52, ease: 'power3.out' },
        'intro+=0.32'
      )
      .from(
        '[data-hero-showcase]',
        { y: 26, scale: 0.98, autoAlpha: 0, duration: 0.78, ease: 'expo.out' },
        'intro+=0.14'
      )
      .addLabel('ledger', 'intro+=0.38')
      .from(
        '[data-hero-ledger] > div',
        {
          y: 14,
          autoAlpha: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power3.out',
        },
        'ledger'
      );

    // Parallax al scroll sobre la estructura diagonal del Hero
    const heroStage = document.getElementById('hero-blueprint-section');
    const trussGroup = document.getElementById('hero-truss-parallax');
    if (heroStage && trussGroup) {
      gsap.to(trussGroup, {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: heroStage,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });
    }

    // Respuesta espacial sutil al puntero en el Hero (solo ratón / puntero fino)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && heroStage) {
      const trussMouseLayer = document.getElementById('hero-truss-mouse');
      if (trussMouseLayer) {
        const xTo = gsap.quickTo(trussMouseLayer, 'x', { duration: 0.75, ease: 'power3.out' });
        const yTo = gsap.quickTo(trussMouseLayer, 'y', { duration: 0.75, ease: 'power3.out' });
        const onMove = (e: PointerEvent) => {
          const rect = heroStage.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          xTo(nx * -22);
          yTo(ny * -16);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };
        heroStage.addEventListener('pointermove', onMove);
        heroStage.addEventListener('pointerleave', onLeave);
        cleanupFns.push(() => {
          heroStage.removeEventListener('pointermove', onMove);
          heroStage.removeEventListener('pointerleave', onLeave);
        });
      }
    }

    // 3. Cinta Cinética Industrial con inercia de velocidad y dirección de scroll
    const marqueeTrack = document.getElementById('mc-kinetic-ribbon-track');
    const marqueeWrap = document.getElementById('mc-kinetic-ribbon');
    if (marqueeTrack && marqueeWrap) {
      const marqueeTween = gsap.to(marqueeTrack, {
        xPercent: -50,
        duration: 30,
        ease: 'none',
        repeat: -1,
      });

      ScrollTrigger.create({
        trigger: marqueeWrap,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) marqueeTween.play();
          else marqueeTween.pause();
        },
        onUpdate: (self) => {
          const vel = Math.min(2.6, Math.abs(self.getVelocity()) / 700);
          const dir = self.direction >= 0 ? 1 : -1;
          gsap.to(marqueeTween, {
            timeScale: dir * (1 + vel),
            duration: 0.25,
            overwrite: true,
            onComplete: () => {
              gsap.to(marqueeTween, {
                timeScale: dir,
                duration: 0.55,
                ease: 'power2.out',
              });
            },
          });
        },
      });
    }

    // 4. Encabezados editoriales de sección vinculados al scroll
    const sections = gsap.utils.toArray<HTMLElement>('[data-reveal-section]');
    sections.forEach((sectionEl) => {
      gsap.from(sectionEl, {
        y: 22,
        autoAlpha: 0,
        duration: 0.62,
        ease: 'power3.out',
        overwrite: 'auto',
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top 86%',
          once: true,
        },
      });
    });

    // 5. Revelado progresivo por lotes (ScrollTrigger.batch) para mosaico y fichas
    gsap.set('[data-stagger-card]', { y: 22, scale: 0.985, autoAlpha: 0 });
    ScrollTrigger.batch('[data-stagger-card]', {
      start: 'top 88%',
      interval: 0.08,
      batchMax: 4,
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.56,
          stagger: 0.065,
          ease: 'power3.out',
          overwrite: true,
          clearProps: 'transform',
        });
      },
    });

    // 6. Conducto de Proceso de Compra sincronizado al scroll (scrub)
    const conduitSection = document.getElementById('seccion-proceso-obra');
    const conduitFill = document.getElementById('process-conduit-fill');
    if (conduitSection && conduitFill) {
      gsap.fromTo(
        conduitFill,
        { scaleX: 0.06 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: conduitSection,
            start: 'top 76%',
            end: 'bottom 58%',
            scrub: 0.4,
          },
        }
      );

      gsap.from('[data-process-step]', {
        y: 20,
        autoAlpha: 0,
        duration: 0.58,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: conduitSection,
          start: 'top 80%',
          once: true,
        },
      });
    }

    // 7. Contadores numéricos progresivos al entrar al viewport
    const counters = gsap.utils.toArray<HTMLElement>('[data-count-to]');
    counters.forEach((counterEl) => {
      const target = Number(counterEl.dataset.countTo ?? '0');
      const suffix = counterEl.dataset.countSuffix ?? '';
      if (!Number.isFinite(target) || target <= 0) return;

      const state = { val: 0 };
      gsap.to(state, {
        val: target,
        duration: 1.1,
        ease: 'power3.out',
        snap: { val: 1 },
        onUpdate: () => {
          counterEl.textContent = `${Math.round(state.val)}${suffix}`;
        },
        scrollTrigger: {
          trigger: counterEl,
          start: 'top 90%',
          once: true,
        },
      });
    });

    // 8. Parallax arquitectónico sutil en fotografías panorámicas
    const parallaxImgs = gsap.utils.toArray<HTMLElement>('.js-parallax-img');
    parallaxImgs.forEach((imgEl) => {
      const parentFrame = imgEl.parentElement;
      if (!parentFrame) return;
      gsap.fromTo(
        imgEl,
        { scale: 1.09, yPercent: -4.5 },
        {
          scale: 1.09,
          yPercent: 4.5,
          ease: 'none',
          scrollTrigger: {
            trigger: parentFrame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      );
    });

    // 9. Atracción magnética sutil en CTAs principales (solo escritorio con puntero fino)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
        const xTo = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3.out' });
        const yTo = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3.out' });

        const onMove = (e: PointerEvent) => {
          const rect = btn.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          xTo(dx * 0.16);
          yTo(dy * 0.22);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };

        btn.addEventListener('pointermove', onMove);
        btn.addEventListener('pointerleave', onLeave);
        cleanupFns.push(() => {
          btn.removeEventListener('pointermove', onMove);
          btn.removeEventListener('pointerleave', onLeave);
        });
      });
    }
  });
}

/**
 * Anima suavemente la aparición de un conjunto filtrado de tarjetas
 * manteniendo un desfase total <= 240ms.
 */
export function animateFilteredItems(container: HTMLElement | null): void {
  if (!container) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = Array.from(container.children).slice(0, 8) as HTMLElement[];
  if (!items.length) return;

  gsap.fromTo(
    items,
    { y: 12, scale: 0.985, autoAlpha: 0 },
    {
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: 0.36,
      stagger: 0.035,
      ease: 'power3.out',
      overwrite: true,
      clearProps: 'transform',
    }
  );
}

/**
 * Pulso táctil de confirmación en compositor para contadores y dock de cotización.
 */
export function pulseElement(el: HTMLElement | null): void {
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.fromTo(
    el,
    { scale: 1 },
    {
      scale: 1.14,
      duration: 0.16,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      overwrite: true,
      clearProps: 'transform',
    }
  );
}

/**
 * Recalcula posiciones de ScrollTrigger tras cambios de ruta SPA o aperturas de acordeón.
 */
export function refreshScrollAnimations(): void {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}
