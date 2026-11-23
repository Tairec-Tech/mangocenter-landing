import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
let media: gsap.MatchMedia | undefined;
let context: gsap.Context | undefined;
let stopAmbient: (() => void) | undefined;
let heroIntro: gsap.core.Timeline | undefined;
let motionPaused = false;
let refreshFrame: number | undefined;
export function replayHeroIntro(): void {
  if (!motionPaused) heroIntro?.restart();
}
export function initGsapAnimations(): void {
  stopAmbient?.(); media?.revert(); context?.revert();
  document.querySelectorAll<HTMLElement>('[data-count-to]').forEach(el => { el.textContent = `${el.dataset.countTo}${el.dataset.countSuffix ?? ''}`; });
  context = gsap.context(() => {
    media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 901px)', mobile: '(max-width: 600px)' }, match => {
      if (!match.conditions?.motion) return;
      const hero = document.getElementById('hero-blueprint-section');
      heroIntro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', duration: 1.05 } });
      heroIntro.from('[data-hero-line]', { yPercent: 115, rotation: 2, transformOrigin: '0% 100%', stagger: .14 })
        .from('[data-hero-keyword]', { y: 14, rotation: -5, duration: .8 }, .4)
        .fromTo('[data-hero-underline]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .7 }, .85)
        .from('[data-hero-copy]', { y: 16, opacity: 0, duration: .65 }, .38)
        .from('[data-hero-ctas]', { y: 10, opacity: 0, duration: .65 }, .5)
        .from('[data-hero-photo]', { y: 24, opacity: 0, duration: 1 }, .25);
      if (motionPaused) heroIntro.progress(1);
      else if (hero?.getClientRects().length) replayHeroIntro();
      const particles = Array.from(document.querySelectorAll<HTMLElement>('.mc-particle')).filter(particle => getComputedStyle(particle).display !== 'none');
      const ambient = gsap.timeline({ repeat: -1, yoyo: true, paused: true });
      ambient.to('[data-liquid]', { attr: { d: 'M420 70C560 80 600 310 470 440S180 570 80 410S20 180 170 90S320 20 420 70Z' }, rotation: 12, transformOrigin: '50% 50%', duration: 5, ease: 'sine.inOut' }, 0)
        .to('.mc-mesh-colors', { xPercent: 4, yPercent: -3, scale: 1.06, duration: 8, ease: 'sine.inOut' }, 0)
        .to(particles, { y: (i) => i % 2 ? -32 : 28, x: (i) => i % 2 ? 16 : -12, opacity: .85, duration: 4, stagger: .25, ease: 'sine.inOut' }, 0);
      let inView = false;
      const toggle = document.getElementById('hero-motion-toggle');
      const update = () => {
        const running = inView && !document.hidden && !motionPaused;
        if (hero) hero.dataset.motionState = running ? 'running' : 'paused';
        if (running) ambient.play(); else ambient.pause();
      };
      const updateToggle = () => {
        toggle?.setAttribute('aria-pressed', String(motionPaused));
        if (toggle) toggle.textContent = motionPaused ? 'Activar animación' : 'Pausar animación';
      };
      const onToggle = () => { motionPaused = !motionPaused; updateToggle(); update(); if (motionPaused) heroIntro?.progress(1).pause(); };
      if (toggle) toggle.hidden = false;
      updateToggle(); update();
      toggle?.addEventListener('click', onToggle);
      const observer = new IntersectionObserver(entries => { inView = entries[0]?.isIntersecting ?? false; update(); });
      if (hero) observer.observe(hero);
      document.addEventListener('visibilitychange', update);
      const cleanup = () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); toggle?.removeEventListener('click', onToggle); if (toggle) toggle.hidden = true; if (hero) delete hero.dataset.motionState; heroIntro = undefined; };
      stopAmbient = cleanup;
      if (match.conditions.desktop && hero) gsap.to('.mc-liquid', { y: 55, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .5 } });
      document.querySelectorAll<HTMLElement>('[data-reveal-section]').forEach(el => {
        gsap.from(el, { y: 18, duration: .55, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
      });
      return () => { cleanup(); ambient.kill(); };
    });
  }, document.body);
}
export function animateFilteredItems(container: HTMLElement | null): void {
  if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.fromTo(Array.from(container.children), { opacity: .65 }, { opacity: 1, duration: .15, overwrite: true, clearProps: 'opacity' });
}
export function pulseElement(el: HTMLElement | null): void {
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.fromTo(el, { scale: .96 }, { scale: 1, duration: .15, overwrite: true, clearProps: 'transform' });
}
export function refreshScrollAnimations(): void {
  if (refreshFrame !== undefined) return;
  refreshFrame = requestAnimationFrame(() => { refreshFrame = undefined; ScrollTrigger.refresh(); });
}
if (import.meta.hot) import.meta.hot.dispose(() => { if (refreshFrame !== undefined) cancelAnimationFrame(refreshFrame); stopAmbient?.(); media?.revert(); context?.revert(); });
