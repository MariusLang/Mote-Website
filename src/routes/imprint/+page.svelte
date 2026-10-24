<script lang="ts">
	import { legal, site } from '#lib/site.ts';
</script>

<svelte:head>
	<title>Imprint · Mote</title>
	<meta name="description" content="Legal notice for the Mote website and app." />
	<link rel="canonical" href="{site.url}/imprint" />
</svelte:head>

<article class="doc narrow" lang="en">
	<div>
		<h1>Imprint</h1>
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
			Phone: <a href="tel:{legal.phone.replaceAll(' ', '')}">{legal.phone}</a><br />
			Email: <a href="mailto:{legal.email}">{legal.email}</a>
		</p>

		<h2>Responsible for content</h2>
		<p>Responsible for the content under § 18(2) MStV: {legal.name}, address as above.</p>

		<h2>Consumer dispute resolution</h2>
		<p>
			We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.
		</p>

		<h2>Notice</h2>
		<p>
			The content and information on our websites have been created with the greatest care, but we assume no liability for the accuracy,
			completeness or timeliness of the data provided.
		</p>
		<p>
			We assume no liability for the content of third-party websites that are made accessible via links on our websites. The operators or
			owners are solely responsible for the content of the linked pages.
		</p>
		<p>Liability claims against the publisher resulting from damage caused by the use of the website are excluded.</p>
		<p>
			The use of contact details published as part of the information obligation by third parties to send unsolicited advertising and
			information materials is hereby expressly prohibited.
		</p>

		<h2>Copyright</h2>
		<p>
			Texts, graphics and screenshots on this website are subject to German copyright law. The device images are Apple product bezels, used
			under Apple’s terms to show the app. Apple, the Apple logo, iPhone, iPad, Mac, MacBook Air, iCloud and Apple Intelligence are trademarks of
			Apple Inc.
		</p>
	</div>
</article>
