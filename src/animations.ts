import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
let media: gsap.MatchMedia | undefined;
let context: gsap.Context | undefined;
let stopAmbient: (() => void) | undefined;
export function initGsapAnimations(): void {
  stopAmbient?.(); media?.revert(); context?.revert();
  document.querySelectorAll<HTMLElement>('[data-count-to]').forEach(el => { el.textContent = `${el.dataset.countTo}${el.dataset.countSuffix ?? ''}`; });
  context = gsap.context(() => {
    media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const hero = document.getElementById('hero-blueprint-section');
      const intro = gsap.timeline({ defaults: { ease: 'power3.out', duration: .65 } });
      intro.from('[data-hero-line]', { yPercent: 105, stagger: .08 })
        .from('[data-hero-copy]', { y: 12, opacity: 0 }, .18)
        .from('[data-hero-ctas]', { y: 8, opacity: 0 }, .28)
        .from('[data-hero-photo]', { y: 20, opacity: 0 }, .15);
      const ambient = gsap.timeline({ repeat: -1, yoyo: true });
      ambient.to('[data-liquid]', { attr: { d: 'M450 110C530 160 550 420 410 490S120 460 70 330S190 110 290 80S380 60 450 110Z' }, scaleX: 1.12, scaleY: .9, rotation: 15, transformOrigin: '50% 50%', duration: 9, ease: 'sine.inOut' }, 0)
        .to('.mc-particle', { y: -18, x: 7, opacity: .15, duration: 6, stagger: .4, ease: 'sine.inOut' }, 0);
      let inView = true;
      const update = () => { if (inView && !document.hidden) ambient.play(); else ambient.pause(); };
      const observer = new IntersectionObserver(entries => { inView = entries[0]?.isIntersecting ?? false; update(); });
      if (hero) observer.observe(hero);
      document.addEventListener('visibilitychange', update);
      stopAmbient = () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
      const desktop = window.matchMedia('(min-width: 900px)').matches;
      if (desktop && hero) gsap.to('.mc-mesh svg', { y: 60, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .5 } });
      document.querySelectorAll<HTMLElement>('[data-reveal-section]').forEach(el => {
        gsap.from(el, { y: 18, duration: .55, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
      });
      return () => { stopAmbient?.(); ambient.kill(); };
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
export function refreshScrollAnimations(): void { requestAnimationFrame(() => ScrollTrigger.refresh()); }
if (import.meta.hot) import.meta.hot.dispose(() => { stopAmbient?.(); media?.revert(); context?.revert(); });
