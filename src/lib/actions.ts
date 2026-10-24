// Entrance animation: the action only adds classes and a CSS variable; the motion itself lives in CSS,
// so reduced motion turns it off there.

/** Fades and lifts an element in when it scrolls into view. */
export function reveal(node: HTMLElement, delay = 0) {
	node.classList.add('reveal');
	node.style.setProperty('--delay', `${delay}ms`);
	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries)
				if (entry.isIntersecting) {
					node.classList.add('in');
					io.disconnect();
				}
		},
		{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
	);
	io.observe(node);
	return { destroy: () => io.disconnect() };
}
