<script lang="ts">
	const links: [string, string][] = [
		['/#inbox', 'Inbox'],
		['/#pages', 'Pages'],
		['/#pencil', 'Apple Pencil'],
		['/#intelligence', 'Intelligence'],
		['/#calendar', 'Calendar'],
		['/#mail', 'Mail'],
		['/#privacy', 'Privacy'],
	];
</script>

<header>
	<nav class="wrap" aria-label="Main">
		<a class="brand" href="/" aria-label="Mote home">
			<img src="/icon.webp" alt="" width="28" height="28" />
			<span>Mote</span>
		</a>
		<ul>
			{#each links as [href, label] (href)}
				<li><a {href}>{label}</a></li>
			{/each}
		</ul>
		<a class="cta" href="/#download">Download</a>
	</nav>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgb(255 255 255 / 0.8);
		-webkit-backdrop-filter: saturate(180%) blur(20px);
		backdrop-filter: saturate(180%) blur(20px);
		border-bottom: 1px solid rgb(0 0 0 / 0.08);
	}
	nav {
		height: 52px;
		display: flex;
		align-items: center;
		gap: 24px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--ink);
		font-size: 19px;
		font-weight: 600;
		letter-spacing: -0.02em;
		text-decoration: none;
	}
	.brand img {
		/* the icon file keeps the macOS grid's margin; pull it in so the glyph sits at 28px */
		width: 34px;
		height: 34px;
		margin: -3px -2px -3px -4px;
	}
	ul {
		display: flex;
		gap: 24px;
		list-style: none;
		margin: 0 0 0 auto;
		padding: 0;
	}
	ul a {
		color: var(--ink);
		opacity: 0.8;
		font-size: 13px;
		letter-spacing: -0.01em;
		text-decoration: none;
	}
	ul a:hover {
		opacity: 1;
	}
	.cta {
		background: var(--blue);
		color: #fff;
		font-size: 13px;
		font-weight: 500;
		padding: 5px 13px;
		border-radius: 980px;
		text-decoration: none;
	}
	.cta:hover {
		background: #0077ed;
	}
	@media (max-width: 760px) {
		ul {
			display: none;
		}
		.cta {
			margin-left: auto;
		}
	}
</style>
