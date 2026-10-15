// How much the page may move. Desktop gets the full show (smooth scroll, scrubbed scenes, letter
// animations, wipes); phones and tablets get the 3D stage with calmer, time-driven loops and plain
// fades; reduced motion gets still frames.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export type Motion = { mobile: boolean; reduced: boolean; full: boolean };

export function readMotion(): Motion {
	const mobile = matchMedia('(max-width: 820px), (pointer: coarse)').matches;
	const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
	return { mobile, reduced, full: !mobile && !reduced };
}

let lenis: Lenis | null = null;
let users = 0;

/** Sets up GSAP and, on desktop, Lenis smooth scrolling driven by GSAP's ticker. Returns a release function. */
export function useMotion(motion: Motion) {
	users++;
	if (motion.full && !lenis) {
		lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
		lenis.on('scroll', ScrollTrigger.update);
		gsap.ticker.add(raf);
		gsap.ticker.lagSmoothing(0);
	}
	return () => {
		users--;
		if (users === 0 && lenis) {
			gsap.ticker.remove(raf);
			lenis.destroy();
			lenis = null;
		}
	};
}

function raf(time: number) {
	lenis?.raf(time * 1000);
}

export function scrollToTarget(target: string | HTMLElement) {
	if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
	else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView({ behavior: 'smooth' });
}

export { gsap, ScrollTrigger };
