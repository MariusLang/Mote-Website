<script lang="ts">
	// Apple's official "Download on the App Store" badges, unmodified, as Apple's guidelines require.
	import { site } from '#lib/site.ts';
	import { magnetic } from '#lib/actions.ts';

	let { height = 54, center = false }: { height?: number; center?: boolean } = $props();
</script>

<div class="badges" class:center>
	<a href={site.appStore} use:magnetic rel="noopener" target="_blank" aria-label="Download Mote on the App Store for iPhone and iPad">
		<img src="/badges/app-store.svg" alt="Download on the App Store" style:height="{height}px" width={Math.round(height * 2.99)} height={height} />
	</a>
	<a href={site.macAppStore} use:magnetic rel="noopener" target="_blank" aria-label="Download Mote on the Mac App Store">
		<img src="/badges/mac-app-store.svg" alt="Download on the Mac App Store" style:height="{height}px" width={Math.round(height * 3.9)} height={height} />
	</a>
</div>

<style>
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		align-items: center;
	}
	.center {
		justify-content: center;
	}
	a {
		display: block;
		border-radius: 12px;
		filter: drop-shadow(0 10px 18px rgb(14 58 38 / 0.28));
		transition: filter 0.25s ease, scale 0.25s ease;
	}
	a:hover {
		filter: drop-shadow(0 14px 24px rgb(14 58 38 / 0.36));
	}
	a:active {
		scale: 0.97;
	}
	img {
		width: auto;
	}
</style>
