<script lang="ts">
	// Headline heading. On desktop every letter bounces in and the lines tilt against each other, like the
	// title cards in the shorts; elsewhere the lines just rise in. `*word*` marks highlighted words.
	import { onMount } from 'svelte';
	import { readMotion } from '#lib/motion.ts';

	let {
		lines,
		level = 2,
		size = 'clamp(48px, 7.4vw, 112px)',
		align = 'left',
		delay = 0,
	}: { lines: string[]; level?: 1 | 2; size?: string; align?: 'left' | 'center'; delay?: number } = $props();

	type Char = { c: string; hi: boolean; i: number };

	const parsed = $derived.by(() => {
		let index = 0;
		return lines.map((line) => {
			let hi = false;
			const chars: Char[] = [];
			for (const c of line) {
				if (c === '*') {
					hi = !hi;
					continue;
				}
				chars.push({ c, hi, i: index++ });
			}
			return chars;
		});
	});
	const plain = $derived(lines.join(' ').replace(/\*/g, ''));

	let node: HTMLElement;
	let full = $state(false);
	let shown = $state(false);

	onMount(() => {
		full = readMotion().full;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					shown = true;
					io.disconnect();
				}
			},
			{ threshold: 0.3 },
		);
		io.observe(node);
		return () => io.disconnect();
	});
</script>

<svelte:element
	this={`h${level}`}
	bind:this={node}
	class="headline title"
	class:full
	class:shown
	style:font-size={size}
	style:text-align={align}
	style:--delay="{delay}ms"
	aria-label={plain}
>
	{#each parsed as chars, l (l)}
		<span class="line" aria-hidden="true" style:--l={l}>
			{#each chars as ch (ch.i)}{#if ch.c === ' '}<span class="space"> </span>{:else}<span class="char" class:hi={ch.hi} style:--i={ch.i}>{ch.c}</span>{/if}{/each}
		</span>
	{/each}
</svelte:element>

<style>
	.title {
		display: block;
	}
	.line {
		display: block;
		white-space: nowrap;
		opacity: 0;
		translate: 0 0.4em;
		transition:
			opacity 0.6s ease calc(var(--delay) + var(--l) * 120ms),
			translate 0.8s cubic-bezier(0.2, 1.5, 0.4, 1) calc(var(--delay) + var(--l) * 120ms);
	}
	.shown .line {
		opacity: 1;
		translate: 0 0;
	}
	.char {
		display: inline-block;
	}
	.space {
		display: inline-block;
		width: 0.28em;
	}

	/* desktop: letters rise in one after another */
	.full .line {
		opacity: 1;
		translate: none;
	}
	.full .char {
		opacity: 0;
		transform: translateY(0.45em);
		filter: blur(6px);
	}
	.full.shown .char {
		animation: rise 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
		animation-delay: calc(var(--delay) + var(--i) * 22ms);
	}
	@keyframes rise {
		to {
			opacity: 1;
			transform: none;
			filter: none;
		}
	}
</style>
