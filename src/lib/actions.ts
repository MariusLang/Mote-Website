// Small DOM actions for entrance animations. They only add classes and CSS variables; the motion
// itself lives in CSS, so phones and reduced motion can tone it down there.
import { readMotion } from '#lib/motion.ts';

const observe = (node: Element, onEnter: () => void, threshold = 0.25) => {
	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries)
				if (entry.isIntersecting) {
					onEnter();
					io.disconnect();
				}
		},
		{ threshold, rootMargin: '0px 0px -8% 0px' },
	);
	io.observe(node);
	return io;
};

/** Fades and lifts an element in when it scrolls into view. */
export function reveal(node: HTMLElement, delay = 0) {
	node.classList.add('reveal');
	node.style.setProperty('--delay', `${delay}ms`);
	const io = observe(node, () => node.classList.add('in'), 0.15);
	return { destroy: () => io.disconnect() };
}

/** Lets the words of a paragraph land one by one, like the captions in the shorts (desktop only). */
export function words(node: HTMLElement) {
	const motion = readMotion();
	if (!motion.full) return reveal(node);
	const walk = (el: Node) => {
		for (const child of [...el.childNodes]) {
			if (child.nodeType === Node.TEXT_NODE) {
				const parts = child.textContent!.split(/(\s+)/);
				const frag = document.createDocumentFragment();
				for (const part of parts) {
					if (!part) continue;
					if (/^\s+$/.test(part)) frag.append(part);
					else {
						const span = document.createElement('span');
						span.className = 'word';
						span.textContent = part;
						frag.append(span);
					}
				}
				child.replaceWith(frag);
			} else if (child.nodeType === Node.ELEMENT_NODE && !(child as Element).matches('a, b, strong')) walk(child);
			else if (child.nodeType === Node.ELEMENT_NODE) (child as Element).classList.add('word');
		}
	};
	walk(node);
	node.classList.add('words');
	node.querySelectorAll<HTMLElement>('.word').forEach((w, i) => w.style.setProperty('--i', String(i)));
	const io = observe(node, () => node.classList.add('in'));
	return { destroy: () => io.disconnect() };
}

/** Tilts an element towards the pointer (desktop only). */
export function tilt(node: HTMLElement, strength = 10) {
	const motion = readMotion();
	if (!motion.full) return {};
	const move = (e: PointerEvent) => {
		const r = node.getBoundingClientRect();
		const x = (e.clientX - r.left) / r.width - 0.5;
		const y = (e.clientY - r.top) / r.height - 0.5;
		node.style.setProperty('--rx', `${-y * strength}deg`);
		node.style.setProperty('--ry', `${x * strength}deg`);
		node.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
		node.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
	};
	const leave = () => {
		node.style.setProperty('--rx', '0deg');
		node.style.setProperty('--ry', '0deg');
	};
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);
	return {
		destroy() {
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		},
	};
}

/** Pulls an element a little towards the pointer while it hovers (desktop only). */
export function magnetic(node: HTMLElement, strength = 0.25) {
	const motion = readMotion();
	if (!motion.full) return {};
	const move = (e: PointerEvent) => {
		const r = node.getBoundingClientRect();
		node.style.translate = `${(e.clientX - r.left - r.width / 2) * strength}px ${(e.clientY - r.top - r.height / 2) * strength}px`;
	};
	const leave = () => (node.style.translate = '0 0');
	node.style.transition = 'translate 0.35s cubic-bezier(0.2, 1.6, 0.4, 1)';
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);
	return {
		destroy() {
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		},
	};
}
