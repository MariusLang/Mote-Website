<script lang="ts">
	// Fixed 3D stage behind the home page. Reads the page's `[data-chapter]` sections, turns the scroll
	// position into a camera position along the island ring, and moves the page's colour world with it.
	import { onMount } from 'svelte';
	import type { Motion } from '#lib/motion.ts';

	let { motion, onchapter }: { motion: Motion; onchapter?: (chapter: number) => void } = $props();

	let canvas: HTMLCanvasElement;
	let failed = $state(false);
	let ready = $state(false);

	// Background gradient per chapter: [top, bottom]
	const WORLDS = [
		['#2E8556', '#1B5E3B'],
		['#DDF0E1', '#9FD0B0'],
		['#D4EBF7', '#8EC3E6'],
		['#FDEBBE', '#F2C46A'],
		['#FBE0E6', '#E9A3B4'],
		['#EADFF3', '#BB9CD6'],
		['#3A8F86', '#1F5D57'],
		['#FFF3DE', '#F1D9AE'],
		['#2E8556', '#1B5E3B'],
	];

	const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
	const mix = (a: string, b: string, u: number) => {
		const [x, y] = [rgb(a), rgb(b)];
		return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * u)).join(' ')})`;
	};
	const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
	const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

	onMount(() => {
		let world: Awaited<ReturnType<typeof import('#lib/three/world.js').createWorld>> | null = null;
		let frameId = 0;
		let disposed = false;
		let anchors: { chapter: number; top: number; height: number }[] = [];
		let fSmooth = 0;
		let lastChapter = -1;
		let last = 0;
		const start = performance.now();
		const root = document.documentElement;

		const measure = () => {
			anchors = [...document.querySelectorAll<HTMLElement>('[data-chapter]')].map((node) => {
				const rect = node.getBoundingClientRect();
				return { chapter: Number(node.dataset.chapter), top: rect.top + scrollY, height: rect.height };
			});
		};

		const scrollState = () => {
			const y = scrollY;
			const vh = innerHeight;
			const locals: number[] = [];
			for (const a of anchors) locals[a.chapter] = clamp((y + vh - a.top) / (a.height + vh));
			if (!anchors.length) return { f: 0, locals };
			const centres = anchors.map((a) => a.top + a.height / 2 - vh / 2);
			if (y <= centres[0]) return { f: anchors[0].chapter, locals };
			for (let i = 0; i < anchors.length - 1; i++) {
				if (y < centres[i + 1]) {
					// hold on the station while its text is read, then fly
					const u = seg((y - centres[i]) / (centres[i + 1] - centres[i]), 0.3, 0.92);
					return { f: anchors[i].chapter + u * (anchors[i + 1].chapter - anchors[i].chapter), locals };
				}
			}
			return { f: anchors[anchors.length - 1].chapter, locals };
		};

		const resize = () => {
			world?.resize(innerWidth, innerHeight);
			measure();
		};

		const onPointer = (e: PointerEvent) => {
			if (!world || !motion.full) return;
			world.pointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
			const target = e.target as HTMLElement;
			const free = !target.closest('a, button, .card, .gallery, nav, footer');
			document.body.style.cursor = free && world.hover(e.clientX, e.clientY) ? 'pointer' : '';
		};
		const onClick = (e: MouseEvent) => {
			if (!world || (e.target as HTMLElement).closest('a, button, .card, .gallery, nav, footer')) return;
			world.poke(e.clientX, e.clientY);
		};

		const tick = (now: number) => {
			frameId = requestAnimationFrame(tick);
			if (!world || document.hidden) return;
			// phones get a calmer frame rate
			if (motion.mobile && now - last < 1000 / 40) return;
			last = now;
			const t = motion.reduced ? 2 : (now - start) / 1000;
			const { f, locals } = scrollState();
			fSmooth = motion.reduced ? f : fSmooth + (f - fSmooth) * (motion.mobile ? 0.14 : 0.1);
			if (Math.abs(f - fSmooth) < 0.0005) fSmooth = f;

			const i = Math.floor(fSmooth);
			const u = fSmooth - i;
			const a = WORLDS[Math.min(i, WORLDS.length - 1)];
			const b = WORLDS[Math.min(i + 1, WORLDS.length - 1)];
			root.style.setProperty('--bgA', mix(a[0], b[0], u));
			root.style.setProperty('--bgB', mix(a[1], b[1], u));

			const chapter = Math.round(fSmooth);
			if (chapter !== lastChapter) {
				lastChapter = chapter;
				onchapter?.(chapter);
			}
			world.frame(t, fSmooth, locals, motion.reduced ? 10 : t);
		};

		(async () => {
			try {
				// labels in the scene are painted on canvases: the fallback font has to be ready first
				if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) await document.fonts.load("800 40px 'Bricolage Grotesque'");
				const { createWorld } = await import('#lib/three/world.js');
				if (disposed) return;
				world = createWorld(canvas, { mobile: motion.mobile, reduced: motion.reduced });
				resize();
				fSmooth = scrollState().f;
				ready = true;
				frameId = requestAnimationFrame(tick);
			} catch (error) {
				console.warn('3D stage unavailable', error);
				failed = true;
			}
		})();

		const observer = new ResizeObserver(measure);
		observer.observe(document.body);
		addEventListener('resize', resize);
		addEventListener('pointermove', onPointer, { passive: true });
		addEventListener('click', onClick);

		return () => {
			disposed = true;
			cancelAnimationFrame(frameId);
			observer.disconnect();
			removeEventListener('resize', resize);
			removeEventListener('pointermove', onPointer);
			removeEventListener('click', onClick);
			document.body.style.cursor = '';
			root.style.removeProperty('--bgA');
			root.style.removeProperty('--bgB');
			world?.dispose();
		};
	});
</script>

<canvas bind:this={canvas} class="stage" class:ready class:failed aria-hidden="true"></canvas>

<style>
	.stage {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100lvh;
		z-index: 0;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.9s ease;
	}
	.stage.ready {
		opacity: 1;
	}
	.stage.failed {
		display: none;
	}
</style>
