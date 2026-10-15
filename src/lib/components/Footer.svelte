<script lang="ts">
	import { legal } from '#lib/site.ts';
</script>

<footer>
	<div class="row">
		<a class="brand" href="/">
			<img src="/favicon.svg" alt="" width="32" height="32" />
			Mote
		</a>
		<nav aria-label="Legal">
			<a href="/privacy">Privacy Policy</a>
			<a href="/imprint">Imprint</a>
		</nav>
		<span class="copy">© 2026 {legal.name}</span>
	</div>
	<p class="fine">
		Apple, the Apple logo, iPhone, iPad, Mac, iCloud and Apple Intelligence are trademarks of Apple Inc., registered in the
		U.S. and other countries and regions. App Store is a service mark of Apple Inc.
	</p>
</footer>

<style>
	footer {
		position: relative;
		z-index: 2;
		margin: 0 var(--gutter) 24px;
		padding: 22px 26px;
		background: var(--ink);
		color: var(--paper);
		border-radius: 28px;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 14px 28px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--display);
		font-size: 22px;
		text-decoration: none;
	}
	.brand img {
		border-radius: 9px;
	}
	nav {
		display: flex;
		gap: 20px;
		font-weight: 700;
	}
	nav a {
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
	}
	nav a:hover {
		color: var(--hi);
	}
	.copy {
		margin-left: auto;
		opacity: 0.8;
	}
	.fine {
		margin: 14px 0 0;
		font-size: 13px;
		opacity: 0.65;
		max-width: 80ch;
	}
	@media (max-width: 600px) {
		.copy {
			margin-left: 0;
		}
	}
</style>
