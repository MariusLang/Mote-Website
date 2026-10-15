<script lang="ts">
	// App Store screenshots. On desktop the section pins and the strip scrolls sideways with the page,
	// each frame tilting towards the pointer; on phones it is a plain swipeable strip.
	import { onMount } from 'svelte';
	import { gsap, ScrollTrigger, readMotion } from '#lib/motion.ts';
	import { tilt } from '#lib/actions.ts';

	type Shot = { src: string; alt: string; kind: 'iphone' | 'ipad' | 'mac' };
	const shots: Shot[] = [
		{ src: 'iphone-01-capture', alt: 'Capture screen on iPhone: notes written like messages, with topic suggestions', kind: 'iphone' },
		{ src: 'mac-02-timeline', alt: 'Timeline on Mac: notes grouped by day, filed under topics', kind: 'mac' },
		{ src: 'iphone-02-timeline', alt: 'Timeline on iPhone with topic filters', kind: 'iphone' },
		{ src: 'ipad-04-calendar', alt: 'Calendar on iPad: notes next to the events they belong to', kind: 'ipad' },
		{ src: 'iphone-03-ask', alt: 'Ask on iPhone: an answer from your notes with its sources', kind: 'iphone' },
		{ src: 'mac-03-ask', alt: 'Ask on Mac: search across notes and attachments', kind: 'mac' },
		{ src: 'iphone-04-calendar', alt: 'Calendar on iPhone', kind: 'iphone' },
		{ src: 'ipad-01-capture', alt: 'Capture on iPad', kind: 'ipad' },
		{ src: 'mac-04-review', alt: 'Review on Mac: confirm or reject suggestions with the keyboard', kind: 'mac' },
		{ src: 'iphone-05-detail', alt: 'Note detail on iPhone with attachments and topics', kind: 'iphone' },
		{ src: 'mac-01-capture', alt: 'Capturing from the Mac menu bar', kind: 'mac' },
		{ src: 'ipad-05-detail', alt: 'Note detail on iPad', kind: 'ipad' },
	];

	let section: HTMLElement;
	let track: HTMLDivElement;
	let filter = $state<'all' | Shot['kind']>('all');
	const visible = $derived(filter === 'all' ? shots : shots.filter((s) => s.kind === filter));

	onMount(() => {
		const motion = readMotion();
		if (!motion.full) return;
		const ctx = gsap.context(() => {
			const distance = () => Math.max(0, track.scrollWidth - innerWidth + 80);
			gsap.to(track, {
				x: () => -distance(),
				ease: 'none',
				scrollTrigger: {
					trigger: section,
					start: 'top top',
					end: () => `+=${distance()}`,
					pin: true,
					scrub: 0.8,
					invalidateOnRefresh: true,
				},
			});
			// frames rise in one after another
			gsap.utils.toArray<HTMLElement>(track.children).forEach((frame, i) => {
				gsap.from(frame, { y: 70, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 70%' }, delay: i * 0.05 });
			});
		}, section);
		return () => ctx.revert();
	});

	$effect(() => {
		visible;
		requestAnimationFrame(() => ScrollTrigger.refresh());
	});
</script>

<section class="gallery" id="screens" bind:this={section} data-chapter="7" aria-labelledby="screens-title">
	<div class="head">
		<h2 id="screens-title" class="headline">Take a <span class="hi">look.</span></h2>
		<div class="filters" role="group" aria-label="Filter screenshots by device">
			{#each [['all', 'All'], ['iphone', 'iPhone'], ['ipad', 'iPad'], ['mac', 'Mac']] as [key, name] (key)}
				<button class:on={filter === key} aria-pressed={filter === key} onclick={() => (filter = key as typeof filter)}>{name}</button>
			{/each}
		</div>
	</div>
	<div class="viewport">
		<div class="track" bind:this={track}>
			{#each visible as shot (shot.src)}
				<figure class="frame {shot.kind}" use:tilt={8}>
					<img
						src="/shots/store/{shot.src}.webp"
						alt={shot.alt}
						loading="lazy"
						decoding="async"
						width={shot.kind === 'iphone' ? 640 : shot.kind === 'ipad' ? 900 : 1440}
						height={shot.kind === 'iphone' ? 1391 : shot.kind === 'ipad' ? 1200 : 900}
					/>
					<span class="glare"></span>
				</figure>
			{/each}
		</div>
	</div>
</section>

<style>
	.gallery {
		position: relative;
		z-index: 2;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 28px;
		padding: 110px 0 40px;
		overflow: hidden;
	}
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		justify-content: space-between;
		gap: 18px;
		padding: 0 var(--gutter);
	}
	h2 {
		font-size: clamp(46px, 6.5vw, 96px);
	}
	.filters {
		display: flex;
		gap: 6px;
		background: rgb(255 248 236 / 0.85);
		-webkit-backdrop-filter: blur(12px);
		backdrop-filter: blur(12px);
		box-shadow: 0 12px 30px -14px rgb(14 58 38 / 0.35);
		border-radius: 999px;
		padding: 5px;
	}
	.filters button {
		font: 800 16px var(--body);
		color: var(--ink);
		border: 0;
		background: transparent;
		border-radius: 999px;
		padding: 8px 16px;
		cursor: pointer;
		transition: background 0.2s ease;
	}
	.filters button:hover {
		background: var(--mint);
	}
	.filters button.on {
		background: var(--ink);
		color: var(--paper);
	}
	.viewport {
		overflow: visible;
	}
	.track {
		display: flex;
		align-items: center;
		gap: clamp(18px, 2.4vw, 36px);
		padding: 10px var(--gutter) 30px;
		width: max-content;
		will-change: transform;
	}
	.frame {
		position: relative;
		margin: 0;
		height: min(64vh, 640px);
		border-radius: 26px;
		overflow: hidden;
		box-shadow: 0 40px 70px -30px rgb(14 58 38 / 0.55);
		background: var(--green);
		transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
		transition: transform 0.25s ease-out;
		flex: none;
	}
	.frame img {
		height: 100%;
		width: auto;
	}
	.glare {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(circle at var(--gx, 50%) var(--gy, 0%), rgb(255 255 255 / 0.22), transparent 55%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	.frame:hover .glare {
		opacity: 1;
	}

	@media (max-width: 820px), (pointer: coarse) {
		.gallery {
			min-height: 0;
			padding: 90px 0 30px;
		}
		.viewport {
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			scrollbar-width: none;
			-webkit-overflow-scrolling: touch;
		}
		.viewport::-webkit-scrollbar {
			display: none;
		}
		.frame {
			scroll-snap-align: center;
			height: min(62svh, 560px);
			max-width: 86vw;
		}
		.frame.mac,
		.frame.ipad {
			height: auto;
			width: 86vw;
		}
		.frame.mac img,
		.frame.ipad img {
			width: 100%;
			height: auto;
		}
	}
</style>
