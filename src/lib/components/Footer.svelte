<script lang="ts">
	import { legal } from '#lib/site.ts';
</script>

<footer>
	<div class="wrap">
		<p class="fine">
			Apple, the Apple logo, iPhone, iPad, Mac, MacBook Air, iCloud, Apple Intelligence and Apple Pencil are trademarks of Apple Inc.,
			registered in the U.S. and other countries and regions. App Store is a service mark of Apple Inc.
		</p>
		<div class="row">
			<span>Copyright © 2026 {legal.name}. All rights reserved.</span>
			<nav aria-label="Legal">
				<a href="/privacy">Privacy Policy</a>
				<a href="/imprint">Imprint</a>
				<a href="mailto:{legal.email}">Contact</a>
			</nav>
		</div>
	</div>
</footer>

<style>
	footer {
		background: var(--bg-alt);
		color: var(--ink2);
		font-size: 12px;
		line-height: 1.4;
		letter-spacing: -0.01em;
		padding: 20px 0 24px;
	}
	.fine {
		margin: 0 0 14px;
		padding-bottom: 14px;
		border-bottom: 1px solid var(--line);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 8px 24px;
	}
	nav {
		display: flex;
		gap: 0;
	}
	nav a {
		color: var(--ink);
		opacity: 0.8;
		padding: 0 10px;
		border-left: 1px solid var(--line);
	}
	nav a:first-child {
		padding-left: 0;
		border-left: 0;
	}
</style>
