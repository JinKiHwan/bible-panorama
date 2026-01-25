import { gsap } from 'gsap';

export function useGsap() {
  const pageTransition = (el, done) => {
    gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, onComplete: done });
  };

  const revealLogo = (el) => {
    gsap.from(el, { scale: 0, rotation: 180, duration: 1, ease: 'back.out(1.7)' });
  };

  return { pageTransition, revealLogo };
}
