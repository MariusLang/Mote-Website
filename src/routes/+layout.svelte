<script lang="ts">
	import '../app.css';
	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import { site } from '#lib/site.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<meta property="og:site_name" content={site.name} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="{site.url}/og.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<a class="skip" href="#main">Skip to content</a>
<Header />
<main id="main">
	{@render children()}
</main>
<Footer />

<style>
	.skip {
		position: fixed;
		z-index: 50;
		top: -60px;
		left: 16px;
		background: var(--paper);
		padding: 10px 16px;
		border-radius: 12px;
		font-weight: 800;
	}
	.skip:focus {
		top: 16px;
	}
	main {
		position: relative;
		z-index: 1;
	}
</style>
