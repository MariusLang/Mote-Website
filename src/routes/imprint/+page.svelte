<script lang="ts">
	import Shapes from '#lib/components/Shapes.svelte';
	import { legal, site } from '#lib/site.ts';
</script>

<svelte:head>
	<title>Imprint · Mote</title>
	<meta name="description" content="Legal notice for the Mote website and app." />
	<link rel="canonical" href="{site.url}/imprint" />
</svelte:head>

<Shapes count={10} opacity={0.3} />

<article class="doc" lang="en">
	<div class="sheet">
		<h1 class="headline">Imprint</h1>
		<p class="meta">Legal notice (Impressum) under § 5 DDG</p>

		<h2>Provider</h2>
		<address>
			{legal.name}<br />
			{legal.street}<br />
			{legal.city}<br />
			{legal.country}
		</address>

		<h2>Contact</h2>
		<p>
			Email: {legal.email}{#if legal.phone}<br />Phone: {legal.phone}{/if}
		</p>

		<h2>Responsible for content</h2>
		<p>Responsible for the content under § 18(2) MStV: {legal.name}, address as above.</p>

		<h2>Consumer dispute resolution</h2>
		<p>
			We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.
		</p>

		<h2>Liability for content and links</h2>
		<p>
			We write the content of these pages with care but cannot guarantee that it is complete, correct and up to date. As a service provider we
			are responsible for our own content under the general laws (§ 7(1) DDG). We are not obliged to monitor third-party information that is
			transmitted or stored (§§ 8 to 10 DDG). This website links to external websites, such as Apple's App Store, whose content we do not
			control. The respective provider is responsible for linked pages. If we become aware of any infringement, we will remove the link.
		</p>

		<h2>Copyright</h2>
		<p>
			Texts, graphics and screenshots on this website are subject to German copyright law. On devices other than Apple’s, the font Bricolage Grotesque is used
			under the SIL Open Font License. Apple, the Apple logo, iPhone, iPad, Mac, iCloud and Apple Intelligence are trademarks of Apple Inc.
		</p>
	</div>
</article>
