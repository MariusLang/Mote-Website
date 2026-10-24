<script lang="ts">
	// Apple's official "Download on the App Store" badges, unmodified, as Apple's guidelines require.
	import { site } from '#lib/site.ts';

	let { height = 48, center = false }: { height?: number; center?: boolean } = $props();
</script>

<div class="badges" class:center>
	<a href={site.appStore} rel="noopener" target="_blank" aria-label="Download Mote on the App Store for iPhone and iPad">
		<img src="/badges/app-store.svg" alt="Download on the App Store" style:height="{height}px" width={Math.round(height * 2.99)} {height} />
	</a>
	<a href={site.macAppStore} rel="noopener" target="_blank" aria-label="Download Mote on the Mac App Store">
		<img src="/badges/mac-app-store.svg" alt="Download on the Mac App Store" style:height="{height}px" width={Math.round(height * 3.9)} {height} />
	</a>
</div>

<style>
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
	}
	.center {
		justify-content: center;
	}
	a {
		display: block;
		border-radius: 10px;
		transition: opacity 0.2s ease;
	}
	a:hover {
		opacity: 0.8;
	}
	img {
		width: auto;
	}
</style>
