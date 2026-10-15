<script lang="ts">
	import { onMount } from 'svelte';
	import Stage from '#lib/components/Stage.svelte';
	import Shapes from '#lib/components/Shapes.svelte';
	import Sticker from '#lib/components/Headline.svelte';
	import Badges from '#lib/components/Badges.svelte';
	import Gallery from '#lib/components/Gallery.svelte';
	import { readMotion, useMotion, scrollToTarget, type Motion } from '#lib/motion.ts';
	import { reveal, words } from '#lib/actions.ts';
	import { site } from '#lib/site.ts';

	type Chapter = { id: string; n: number; name: string; lines: string[]; body: string; chips: string[]; side: 'left' | 'right'; note?: string; link?: [string, string] };

	// `side` is where the text sits; the island fills the other half.
	const chapters: Chapter[] = [
		{
			id: 'capture', n: 1, name: 'Capture', side: 'right',
			lines: ['One field.', '*No decisions.*'],
			body: 'Open Mote, type, hit Enter. The field has focus before you finish the thought. Add a photo, a PDF or your voice. Markdown when you want it, plain text when you don’t.',
			chips: ['Under two seconds', 'Photos, PDFs, documents', 'Voice input', 'Markdown & checklists'],
		},
		{
			id: 'everywhere', n: 2, name: 'Everywhere', side: 'left',
			lines: ['On every', '*device.*'],
			body: 'Jot it down on your iPhone, find it on your Mac. A field in the Mac menu bar (⌥⌘N), the Share Sheet, a widget and the Action Button on iPhone. Notes sync through your own iCloud.',
			chips: ['iPhone, iPad & Mac', 'Menu bar on Mac', 'Share Extension', 'Widget & Action Button'],
		},
		{
			id: 'sorted', n: 3, name: 'Sorted', side: 'right',
			lines: ['Sorted', '*for you.*'],
			body: 'Apple Intelligence reads every note on your device and files it under the right topic. When it isn’t sure, it suggests: one tap confirms, a swipe says no, and Mote remembers.',
			chips: ['On-device Apple Intelligence', 'Topic suggestions', 'Review in seconds'],
			note: 'Sorting, calendar matching and answers need a device with Apple Intelligence. An iPhone without it captures and searches, and your Mac does the sorting.',
		},
		{
			id: 'calendar', n: 4, name: 'Calendar', side: 'left',
			lines: ['Linked to', 'the *moment.*'],
			body: 'Mote matches each note with the event happening around it, so your seminar notes sit next to the seminar. Google calendars work too, once they are added to Apple Calendar.',
			chips: ['Timeline & calendar', 'A score for every match', 'Google Calendar via Apple Calendar'],
		},
		{
			id: 'ask', n: 5, name: 'Ask', side: 'right',
			lines: ['Ask your', '*notes.*'],
			body: '“What do I need for the viewing?” Mote answers from your own notes and shows where the answer came from. Search finds words and meaning, even inside PDFs and photos.',
			chips: ['Answers with sources', 'Semantic search', 'Text in PDFs & images'],
		},
		{
			id: 'private', n: 6, name: 'Private', side: 'left',
			lines: ['Private', 'by *design.*'],
			body: 'No cloud AI, no account, no analytics, no tracking. Your notes live on your devices and in your own iCloud. Nobody else can read them, us included.',
			chips: ['Processed on device', 'Your iCloud only', 'No tracking'],
			link: ['/privacy', 'Read the privacy policy'],
		},
	];

	const marquee = ['Capture', 'Markdown', 'Photos & PDFs', 'Voice', 'Topics', 'Calendar', 'Search', 'Ask', 'Widgets', 'Share Sheet', 'Menu bar', 'iCloud sync'];

	let motion = $state<Motion>({ mobile: true, reduced: false, full: false });
	let mounted = $state(false);
	let chapter = $state(0);

	const current = $derived(chapters.find((c) => c.n === chapter));

	function onchapter(next: number) {
		chapter = next;
	}

	onMount(() => {
		// the stage and the scrubbed scenes are built for a fresh start at the top
		if (!location.hash) {
			history.scrollRestoration = 'manual';
			scrollTo(0, 0);
		}
		motion = readMotion();
		mounted = true;
		return useMotion(motion);
	});
</script>

<svelte:head>
	<title>Mote · Just write it down</title>
	<meta name="description" content={site.description} />
	<meta property="og:title" content="Mote · Just write it down" />
	<meta property="og:description" content={site.description} />
	<link rel="canonical" href={site.url} />
</svelte:head>

{#if mounted}
	<Shapes count={motion.mobile ? 6 : 10} parallax={motion.full} opacity={motion.mobile ? 0.16 : 0.22} />
	<Stage {motion} {onchapter} />
{/if}

<div class="chip" class:on={!!current} aria-hidden="true">
	{#if current}
		{#key current.n}
			<span class="pill"><b>0{current.n}</b>{current.name}</span>
		{/key}
	{/if}
</div>

<section class="hero" data-chapter="0" aria-labelledby="hero-title">
	<div class="hero-copy" style:--head="var(--paper)" style:--head-hi="#BDE5C8">
		<span class="pill" use:reveal={100}><b>New</b>For iPhone, iPad &amp; Mac</span>
		<div id="hero-title">
			<Sticker level={1} lines={['Just write', 'it *down.*']} size="clamp(58px, 9vw, 150px)" delay={250} />
		</div>
		<p class="lede" use:words>
			Mote catches a thought in seconds. Apple Intelligence sorts it into topics and links it to your calendar later, right on your device.
		</p>
		<div use:reveal={500}>
			<Badges />
		</div>
	</div>
	<button class="scroll-hint" onclick={() => scrollToTarget('#capture')} aria-label="Scroll to features">
		<span>Scroll</span>
		<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 4v15m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
	</button>
</section>

<div class="marquee" aria-hidden="true">
	<div class="marquee-track">
		{#each [0, 1] as copy (copy)}
			{#each marquee as word (word + copy)}
				<span>{word}</span><img src="/favicon.svg" alt="" width="34" height="34" />
			{/each}
		{/each}
	</div>
</div>

{#each chapters as c (c.id)}
	<section id={c.id} class="chapter {c.side}" data-chapter={c.n} aria-labelledby="{c.id}-title">
		<div class="card copy" use:reveal>
			<span class="pill"><b>0{c.n}</b>{c.name}</span>
			<div id="{c.id}-title">
				<Sticker lines={c.lines} size="clamp(40px, 4.4vw, 74px)" />
			</div>
			<p use:words>{c.body}</p>
			<ul class="chips">
				{#each c.chips as chip, i (chip)}
					<li use:reveal={200 + i * 90}>{chip}</li>
				{/each}
			</ul>
			{#if c.note}<p class="note">{c.note}</p>{/if}
			{#if c.link}<a class="more" href={c.link[0]}>{c.link[1]} <span aria-hidden="true">→</span></a>{/if}
		</div>
	</section>
{/each}

<Gallery />

<section id="download" class="download" data-chapter="8" aria-labelledby="download-title">
	<div class="download-card card" use:reveal>
		<div id="download-title">
			<Sticker lines={['Get *Mote.*']} size="clamp(56px, 8vw, 128px)" align="center" />
		</div>
		<p use:words>For iPhone, iPad and Mac. Requires iOS 26, iPadOS 26 or macOS 26. Sorting and answers need Apple Intelligence.</p>
		<Badges height={58} center />
	</div>
</section>

<style>
	section {
		position: relative;
		z-index: 2;
	}

	/* fixed chapter pill, like the place pill in the shorts */
	.chip {
		position: fixed;
		z-index: 3;
		left: var(--gutter);
		bottom: 22px;
		pointer-events: none;
		translate: 0 160%;
		transition: translate 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
	}
	.chip.on {
		translate: 0 0;
	}
	.chip .pill {
		font-size: 16px;
		box-shadow: 0 12px 26px -12px rgb(0 0 0 / 0.4);
		animation: chip-in 0.45s cubic-bezier(0.2, 0.9, 0.3, 1);
	}
	@keyframes chip-in {
		from {
			opacity: 0;
			translate: 0 10px;
		}
	}

	/* hero */
	.hero {
		min-height: 112vh;
		display: flex;
		align-items: center;
		padding: 120px var(--gutter) 80px;
	}
	.hero-copy {
		max-width: min(640px, 48vw);
		display: grid;
		gap: 26px;
		justify-items: start;
	}
	.lede {
		margin: 0;
		font-size: clamp(19px, 1.7vw, 24px);
		font-weight: 700;
		line-height: 1.4;
		color: var(--paper);
		max-width: 34ch;
		opacity: 0.92;
	}
	.scroll-hint {
		position: absolute;
		left: 50%;
		bottom: 9vh;
		translate: -50% 0;
		display: flex;
		align-items: center;
		gap: 8px;
		font: 800 15px var(--body);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--paper);
		background: rgb(255 255 255 / 0.14);
		border: 1px solid rgb(255 255 255 / 0.35);
		border-radius: 999px;
		padding: 8px 16px;
		cursor: pointer;
		animation: nudge 1.8s ease-in-out infinite;
	}
	@keyframes nudge {
		50% {
			transform: translateY(8px);
		}
	}

	/* marquee */
	.marquee {
		position: relative;
		z-index: 2;
		overflow: hidden;
		background: var(--ink);
		color: var(--paper);
		padding: 16px 0;
	}
	.marquee-track {
		display: flex;
		align-items: center;
		gap: 28px;
		width: max-content;
		animation: marquee 38s linear infinite;
	}
	.marquee span {
		font-family: var(--display);
		font-weight: 800;
		letter-spacing: -0.02em;
		font-size: clamp(24px, 2.6vw, 34px);
		white-space: nowrap;
	}
	.marquee span:nth-of-type(3n + 1) {
		color: var(--hi);
	}
	.marquee img {
		border-radius: 8px;
		width: 28px;
		height: 28px;
	}
	@keyframes marquee {
		to {
			transform: translateX(-50%);
		}
	}

	/* chapters */
	.chapter {
		min-height: 150vh;
		display: flex;
		align-items: flex-start;
		padding: 18vh var(--gutter) 30vh;
	}
	.chapter.right {
		justify-content: flex-end;
	}
	.copy {
		position: sticky;
		top: 16vh;
		width: min(540px, 42vw);
		display: grid;
		gap: 16px;
	}
	.copy > :global(.pill),
	.copy > .more {
		justify-self: start;
	}
	.copy p {
		margin: 0;
		font-size: 19px;
		font-weight: 600;
		line-height: 1.5;
	}
	.chips {
		list-style: none;
		margin: 2px 0 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chips li {
		font-weight: 800;
		font-size: 15px;
		padding: 6px 14px;
		border-radius: 999px;
		background: rgb(27 94 59 / 0.1);
		color: var(--green);
	}
	.copy .note {
		font-size: 14px;
		font-weight: 600;
		color: var(--ink2);
	}
	.more {
		font-weight: 800;
		text-decoration-thickness: 3px;
		text-underline-offset: 5px;
	}
	.more span {
		display: inline-block;
		transition: translate 0.25s ease;
	}
	.more:hover span {
		translate: 6px 0;
	}

	/* download */
	.download {
		min-height: 120vh;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: 40vh var(--gutter) 6vh;
	}
	.download-card {
		display: grid;
		gap: 18px;
		justify-items: center;
		text-align: center;
		max-width: 680px;
	}
	.download-card p {
		margin: 0;
		font-weight: 700;
		font-size: 19px;
	}

	@media (max-width: 820px), (pointer: coarse) {
		.hero {
			min-height: 100svh;
			align-items: flex-end;
			padding: 52svh var(--gutter) 90px;
		}
		.hero-copy {
			max-width: none;
			gap: 18px;
		}
		.scroll-hint {
			display: none;
		}
		.chapter,
		.chapter.right {
			min-height: 110svh;
			justify-content: stretch;
			padding: 60svh var(--gutter) 12svh;
		}
		.copy {
			position: relative;
			top: 0;
			width: 100%;
		}
		.copy p {
			font-size: 17px;
		}
		.chip {
			display: none;
		}
		.download {
			min-height: 100svh;
			padding: 50svh var(--gutter) 40px;
		}
		.marquee-track {
			animation-duration: 60s;
		}
	}
</style>
