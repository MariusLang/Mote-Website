<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { scrollToTarget } from '#lib/motion.ts';

	let hidden = $state(false);
	const solid = true;
	const home = $derived(page.url.pathname === '/');

	onMount(() => {
		let last = scrollY;
		const onScroll = () => {
			const y = scrollY;
			hidden = y > 240 && y > last;
			last = y;
		};
		addEventListener('scroll', onScroll, { passive: true });
		return () => removeEventListener('scroll', onScroll);
	});

	const jump = (e: MouseEvent, id: string) => {
		if (!home) return;
		e.preventDefault();
		scrollToTarget(id);
	};
</script>

<header class:hidden class:solid>
	<a class="brand" href="/" aria-label="Mote home">
		<img src="/favicon.svg" alt="" width="40" height="40" />
		<span>Mote</span>
	</a>
	<nav aria-label="Main">
		<a class="link" href="/#capture" onclick={(e) => jump(e, '#capture')}>Features</a>
		<a class="link" href="/#screens" onclick={(e) => jump(e, '#screens')}>Screenshots</a>
		<a class="link" href="/privacy">Privacy</a>
		<a class="cta" href="/#download" onclick={(e) => jump(e, '#download')}>Download</a>
	</nav>
</header>

<style>
	header {
		position: fixed;
		z-index: 20;
		top: 14px;
		left: var(--gutter);
		right: var(--gutter);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 8px 8px 8px 10px;
		border-radius: 999px;
		transition:
			translate 0.45s cubic-bezier(0.3, 1.3, 0.5, 1),
			background 0.3s ease,
			box-shadow 0.3s ease,
			border-color 0.3s ease;
		border: 1px solid transparent;
	}
	.solid {
		background: rgb(255 248 236 / 0.85);
		-webkit-backdrop-filter: blur(14px);
		backdrop-filter: blur(14px);
		border-color: rgb(19 53 36 / 0.08);
		box-shadow: 0 12px 30px -14px rgb(14 58 38 / 0.35);
	}
	.hidden {
		translate: 0 -140%;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		font-family: var(--display);
		font-weight: 800;
		letter-spacing: -0.03em;
		font-size: 25px;
		color: var(--paper);
	}
	.solid .brand {
		color: var(--ink);
	}
	.brand img {
		border-radius: 11px;
		transition: rotate 0.4s cubic-bezier(0.2, 2, 0.4, 1);
	}
	.brand:hover img {
		rotate: -12deg;
	}
	nav {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	.link {
		font-weight: 800;
		text-decoration: none;
		padding: 8px 14px;
		border-radius: 999px;
		color: var(--paper);
		transition: background 0.2s ease, color 0.2s ease;
	}
	.solid .link {
		color: var(--ink);
	}
	.link:hover {
		background: rgb(255 255 255 / 0.18);
	}
	.solid .link:hover {
		background: rgb(19 53 36 / 0.07);
	}
	.cta {
		font-weight: 800;
		text-decoration: none;
		padding: 9px 20px;
		border-radius: 999px;
		background: var(--ink);
		color: var(--paper);
		margin-left: 6px;
		transition: scale 0.25s cubic-bezier(0.2, 2, 0.4, 1);
	}
	.cta:hover {
		scale: 1.06;
	}
	@media (max-width: 820px) {
		.link {
			display: none;
		}
		.brand {
			font-size: 22px;
		}
		.brand img {
			width: 34px;
			height: 34px;
		}
	}
</style>
