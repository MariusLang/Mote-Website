<script lang="ts">
	// A real app screenshot inside Apple's product bezel, flattened into one image by scripts/shots.sh.
	type Kind = 'iphone' | 'ipad' | 'mac';
	const sizes: Record<Kind, [number, number]> = { iphone: [720, 1470], ipad: [1200, 1566], mac: [2000, 1318] };

	let {
		kind,
		name,
		alt,
		eager = false,
		class: cls = '',
	}: { kind: Kind; name: string; alt: string; eager?: boolean; class?: string } = $props();
</script>

<img
	class="device {kind} {cls}"
	src="/shots/{kind}-{name}.webp"
	{alt}
	width={sizes[kind][0]}
	height={sizes[kind][1]}
	loading={eager ? 'eager' : 'lazy'}
	decoding="async"
	fetchpriority={eager ? 'high' : 'auto'}
/>

<style>
	.device {
		filter: drop-shadow(0 30px 40px rgb(0 0 0 / 0.14)) drop-shadow(0 6px 12px rgb(0 0 0 / 0.08));
	}
</style>
