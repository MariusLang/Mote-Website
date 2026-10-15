<script lang="ts">
	// Loose geometric shapes drifting behind everything, as on the shorts' backdrops.
	// Desktop also lets them parallax with the scroll position.
	import { onMount } from 'svelte';

	let { count = 16, parallax = false, opacity = 0.42 }: { count?: number; parallax?: boolean; opacity?: number } = $props();

	const COLORS = ['var(--paper)', 'var(--hi)', 'var(--a)', 'var(--b)', 'var(--c)', 'var(--rose)'];
	const SHAPES = [
		(c: string) => `<circle r="60" fill="${c}"/>`,
		(c: string) => `<circle r="52" fill="none" stroke="${c}" stroke-width="22"/>`,
		(c: string) => `<path d="M-70 50 L0 -70 L70 50 Z" fill="${c}"/>`,
		(c: string) => `<path d="M-110 0 q27 -60 55 0 t55 0 t55 0 t55 0" fill="none" stroke="${c}" stroke-width="20" stroke-linecap="round"/>`,
		(c: string) => `<path d="M-50 -14 h36 v-36 h28 v36 h36 v28 h-36 v36 h-28 v-36 h-36 Z" fill="${c}"/>`,
		(c: string) => `<path d="M-90 30 L-45 -30 L0 30 L45 -30 L90 30" fill="none" stroke="${c}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`,
		(c: string) => `<path d="M-70 0 a70 70 0 0 1 140 0 Z" fill="${c}"/>`,
		(c: string) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<circle cx="${(i % 3) * 44 - 44}" cy="${Math.floor(i / 3) * 44 - 44}" r="11" fill="${c}"/>`).join(''),
		(c: string) => `<rect x="-58" y="-58" width="116" height="116" rx="26" fill="${c}"/>`,
	];
	const rnd = (n: number) => {
		const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
		return x - Math.floor(x);
	};

	const items = $derived(Array.from({ length: count }, (_, i) => ({
		svg: SHAPES[i % SHAPES.length](COLORS[(i * 2 + 1) % COLORS.length]),
		x: ((i % 4) + 0.1 + 0.8 * rnd(i * 7)) * 25,
		y: (Math.floor(i / 4) + 0.1 + 0.8 * rnd(i * 13)) * (100 / Math.ceil(count / 4)),
		size: 0.35 + 0.45 * rnd(i * 5),
		spin: (rnd(i * 3) - 0.5) * 80,
		duration: 14 + rnd(i * 17) * 16,
		delay: -rnd(i * 23) * 20,
		depth: 0.15 + rnd(i * 29) * 0.6,
	})));

	let layer: HTMLDivElement;

	onMount(() => {
		if (!parallax) return;
		let frame = 0;
		const nodes = [...layer.children] as HTMLElement[];
		const update = () => {
			frame = 0;
			const y = scrollY;
			nodes.forEach((node, i) => node.style.setProperty('--py', `${-y * items[i].depth * 0.35}px`));
		};
		const onScroll = () => (frame ||= requestAnimationFrame(update));
		addEventListener('scroll', onScroll, { passive: true });
		update();
		return () => removeEventListener('scroll', onScroll);
	});
</script>

<div class="shapes" bind:this={layer} aria-hidden="true" style:opacity>
	{#each items as item, i (i)}
		<div
			class="shape"
			style:left="{item.x}%"
			style:top="{item.y}%"
			style:--s={item.size}
			style:--spin="{item.spin}deg"
			style:animation-duration="{item.duration}s"
			style:animation-delay="{item.delay}s"
		>
			<svg viewBox="-120 -120 240 240" width="240" height="240">{@html item.svg}</svg>
		</div>
	{/each}
</div>

<style>
	.shapes {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.shape {
		position: absolute;
		width: 240px;
		height: 240px;
		margin: -120px 0 0 -120px;
		translate: 0 var(--py, 0);
		animation: drift 20s ease-in-out infinite alternate;
	}
	@keyframes drift {
		from {
			transform: translate(-26px, -34px) rotate(0deg) scale(var(--s));
		}
		to {
			transform: translate(26px, 34px) rotate(var(--spin)) scale(var(--s));
		}
	}
</style>
