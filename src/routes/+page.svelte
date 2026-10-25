<script lang="ts">
	import Badges from '#lib/components/Badges.svelte';
	import Device from '#lib/components/Device.svelte';
	import { reveal } from '#lib/actions.ts';
	import { site } from '#lib/site.ts';

	const waysIn = ['Menu bar on the Mac (⌥⌘N)', 'Share Sheet', 'Widget', 'Action Button & Shortcuts', 'Dictation', 'Photos, PDFs & files'];

	const pageFeatures = [
		['Blocks for everything', 'Headings, lists, to-dos, quotes, code, images, video, PDFs and simple tables. Each block can take a colour.'],
		['Links both ways', 'Type [[ to link a page. Every page lists what links to it, and the graph shows how it all hangs together.'],
		['Markdown in and out', 'Shortcuts as you type, Markdown when you paste, and every page exports as a .md file.'],
		['History for every page', 'Mote keeps earlier versions of a page. Look back at any of them and restore it with one tap.'],
		['Tabs on iPad and Mac', 'Keep several pages open side by side and jump between them with ⌃Tab.'],
		['Folders and web links', 'Link a folder on your Mac, a NAS or iCloud Drive, or drop a web link and Mote fetches its title.'],
	];

	const pencil = [
		['Draws in place.', 'Apple Pencil draws, your finger scrolls the page. Turn on finger drawing when you want it.'],
		['An endless board.', 'Open a drawing full screen and keep going in every direction, with the pens, markers and colours you know.'],
		['Handwriting you can search.', 'Mote reads what you write, so a scribbled word turns up in search.'],
		['On iPhone and Mac too.', 'Drawings sync through iCloud. Tap one on iPhone or click it on the Mac to open the same board.'],
	];

	const intelligence = [
		['Suggests where every note belongs', 'Mote reads a note and proposes a page, a section or a table. One tap on File, and it is in place.'],
		['Tidies up while filing', 'A quick list after a colon becomes bullets, “still need to…” becomes a to-do, and a new page gets a title.'],
		['Answers from your notes', 'Ask in the search field. Mote answers from what you wrote and shows the notes it used.'],
		['Writes with you', 'Summarise a page, rephrase a paragraph, continue a draft, pull out the to-dos or turn text into a table.'],
	];

	const privacy = [
		['On-device intelligence', 'Sorting, answers and writing run on Apple’s on-device model. No note goes to a cloud AI.', 'chip'],
		['Your own iCloud', 'Notes sync through the private database of your iCloud account. We run no server at all.', 'cloud'],
		['No account', 'Nothing to sign up for and nothing to log in to. Open the app and write.', 'person'],
		['No tracking', 'No analytics, no ads, no third-party SDKs. This website sets no cookies either.', 'eye'],
	];
</script>

<svelte:head>
	<title>Mote · Just write it down</title>
	<meta name="description" content={site.description} />
	<meta property="og:title" content="Mote · Just write it down" />
	<meta property="og:description" content={site.description} />
	<link rel="canonical" href={site.url} />
</svelte:head>

<!-- Hero -->
<section class="hero" aria-labelledby="hero-title">
	<div class="narrow center">
		<img class="app-icon" src="/icon.webp" alt="" width="128" height="128" />
		<h1 id="hero-title" class="display">Just write it down.</h1>
		<p class="lead">
			Mote is the notes app that tidies up after you. Catch a thought in seconds, and it finds its place in your pages and tables. Privately, on
			your device.
		</p>
		<div class="hero-badges"><Badges center /></div>
		<p class="platforms">For iPhone, iPad and Mac</p>
	</div>
	<div class="hero-stage wrap">
		<Device kind="mac" name="inbox" alt="Mote on a MacBook Air: the inbox as a chat next to the sidebar with pages and tables" eager class="hero-mac" />
		<Device kind="iphone" name="launch" alt="Mote on iPhone: the page “Atlas 2.0 launch” with goals, to-dos and the roadmap table" eager class="hero-iphone" />
	</div>
</section>

<!-- Inbox -->
<section id="inbox" class="band alt" aria-labelledby="inbox-title">
	<div class="wrap split">
		<div class="copy" use:reveal>
			<p class="eyebrow">Inbox</p>
			<h2 id="inbox-title" class="title">A chat with yourself.</h2>
			<p class="lead">
				Type, send, done. The inbox looks like a conversation, so <b>there is nothing to decide while you write.</b> Add a photo, a PDF or a voice
				note. Sorting can wait.
			</p>
			<ul class="chips" aria-label="Ways to capture">
				{#each waysIn as way (way)}<li>{way}</li>{/each}
			</ul>
		</div>
		<div class="media" use:reveal={120}>
			<Device kind="iphone" name="inbox" alt="The Mote inbox on iPhone: work and seminar notes, a to-do and filing suggestions" class="phone" />
		</div>
	</div>
</section>

<!-- Pages -->
<section id="pages" class="band" aria-labelledby="pages-title">
	<div class="narrow center" use:reveal>
		<p class="eyebrow">Pages</p>
		<h2 id="pages-title" class="title">Pages within pages.</h2>
		<p class="lead">
			Give every project, client and course a page, and every detail a subpage. Build them from blocks, link them together, and keep them in the sidebar
			you arrange yourself.
		</p>
	</div>
	<div class="duo wrap" use:reveal={100}>
		<Device kind="iphone" name="pages" alt="The page list on iPhone: favourites, pages, tables, the graph and the trash" class="phone" />
		<Device kind="iphone" name="seminar" alt="The page “AI Seminar” on iPhone with deadlines, notes, a quote and links to its subpages" class="phone" />
	</div>
	<ul class="grid wrap">
		{#each pageFeatures as [title, text], i (title)}
			<li class="tile" use:reveal={i * 60}>
				<h3>{title}</h3>
				<p>{text}</p>
			</li>
		{/each}
	</ul>
</section>

<!-- Apple Pencil -->
<section id="pencil" class="band alt" aria-labelledby="pencil-title">
	<div class="wrap split reverse">
		<div class="copy" use:reveal>
			<p class="eyebrow">Apple Pencil</p>
			<h2 id="pencil-title" class="title">Draw right on the page.</h2>
			<p class="lead">
				On iPad, a drawing is just another block. Pick up Apple Pencil and sketch between your notes, <b>no mode to switch, no other app.</b>
			</p>
			<img class="drawing-card" src="/shots/card-drawing.webp" alt="A drawing block: a hand-drawn diagram of how retrieval-augmented generation works, from question to answer with sources" width="1200" height="593" loading="lazy" />
			<ul class="checks">
				{#each pencil as [title, text] (title)}<li><b>{title}</b> {text}</li>{/each}
			</ul>
		</div>
		<div class="media" use:reveal={120}>
			<Device kind="ipad" name="talk" alt="The page “RAG talk” on iPad: an outline and a hand-drawn diagram for a slide" class="tablet" />
		</div>
	</div>
</section>

<!-- Tables -->
<section id="tables" class="band dark" aria-labelledby="tables-title">
	<div class="narrow center" use:reveal>
		<p class="eyebrow">Tables</p>
		<h2 id="tables-title" class="title">Tables, kept simple.</h2>
		<p class="lead">
			A product roadmap, a hiring pipeline, a reading list. A table is a small database of its own: <b>text, numbers, dates, choices, checkboxes,
				links, events and mail.</b> Sort it, filter it, see it as a grid or a list. Every row opens as a page.
		</p>
	</div>
	<div class="tables-stage wrap" use:reveal={100}>
		<Device kind="mac" name="roadmap-dark" alt="The table “Roadmap” on a MacBook Air in dark mode, with owner, status and due date" class="tables-mac" />
		<Device kind="iphone" name="books-dark" alt="The table “Books” on iPhone in dark mode, with author and status" class="tables-iphone" />
	</div>
	<p class="narrow center note" use:reveal>Embed the same table on as many pages as you like. Change it in one place, and it changes everywhere.</p>
</section>

<!-- Apple Intelligence -->
<section id="intelligence" class="band" aria-labelledby="ai-title">
	<div class="wrap split reverse">
		<div class="copy" use:reveal>
			<p class="eyebrow ai">Apple Intelligence</p>
			<h2 id="ai-title" class="title">Filed for you.<br />Quietly.</h2>
			<p class="lead">Mote uses Apple’s on-device model to do the tidying you never get round to. It suggests; you decide.</p>
			<ol class="steps">
				{#each intelligence as [title, text] (title)}
					<li>
						<h3>{title}</h3>
						<p>{text}</p>
					</li>
				{/each}
			</ol>
			<p class="fineprint">
				Search finds words and meaning, even inside PDFs, photos and handwriting. Suggestions, answers and writing need a device with Apple
				Intelligence. An iPhone without it still captures, writes and searches, and your Mac does the sorting for it.
			</p>
		</div>
		<div class="media" use:reveal={120}>
			<Device kind="iphone" name="ask" alt="Search on iPhone: an answer to “What do I need for the kickoff?” with the notes it came from" class="phone" />
		</div>
	</div>
</section>

<!-- Calendar & Reminders -->
<section id="calendar" class="band alt" aria-labelledby="calendar-title">
	<div class="narrow center" use:reveal>
		<p class="eyebrow">Calendar &amp; Reminders</p>
		<h2 id="calendar-title" class="title">Your notes know what’s on.</h2>
		<p class="lead">Mote works with Apple Calendar and Reminders, so a page can hold the meeting, the notes and what comes next.</p>
	</div>
	<div class="wrap split cal">
		<div class="media" use:reveal>
			<Device kind="iphone" name="kickoff" alt="The page “Kickoff with Northwind” with tomorrow’s event, a mail from the client, the agenda and two reminders" class="phone" />
		</div>
		<div class="cards">
			<article class="card" use:reveal>
				<img src="/shots/card-event.webp" alt="An event block: Kickoff with Northwind, tomorrow 10:00 to 11:30 AM, Northwind HQ" width="1136" height="188" loading="lazy" />
				<h3>Notes find their meeting</h3>
				<p>
					Write something during a lecture or a meeting, and Mote links it to that event. Put events on a page as live blocks, or give a table an
					event column and turn any appointment into a new row.
				</p>
			</article>
			<article class="card" use:reveal={80}>
				<img src="/shots/card-reminders.webp" alt="Two reminder blocks: Send the proposal draft, and Book a room for the workshop" width="1136" height="284" loading="lazy" />
				<h3>Reminders on the page</h3>
				<p>
					Pull in a reminder or create one right where you are writing. Check it off on the page or in Reminders, and both stay in step.
				</p>
			</article>
			<p class="fineprint">Google, Exchange and other calendars work too, once they are added to Apple Calendar.</p>
		</div>
	</div>
</section>

<!-- Mail -->
<section id="mail" class="band" aria-labelledby="mail-title">
	<div class="wrap split reverse">
		<div class="copy" use:reveal>
			<p class="eyebrow">Mail</p>
			<h2 id="mail-title" class="title">Mail, right where it belongs.</h2>
			<p class="lead">The client’s reply, the booking confirmation, the invoice. Keep the mails that matter next to the notes they belong to.</p>
			<img class="mail-card" src="/shots/card-mail.webp" alt="A mail card: Kickoff: agenda and project brief, from Sarah Chen, with two attachments" width="1136" height="210" loading="lazy" />
			<ul class="checks">
				<li><b>Drag a mail from Apple Mail</b> into the inbox or onto any page. It becomes a card with sender, subject, a preview and the attachments.</li>
				<li><b>Pick senders once,</b> and on the Mac the Mote extension for Mail drops their mails into your inbox on its own.</li>
				<li><b>Share a mail to Mote</b> on iPhone and iPad.</li>
				<li><b>A Mail column</b> turns any table into a tracker for applications, orders or support tickets.</li>
			</ul>
		</div>
		<div class="media" use:reveal={120}>
			<Device kind="iphone" name="mail" alt="The Mote inbox on iPhone with the client’s mail as a card below the notes" class="phone" />
		</div>
	</div>
</section>

<!-- Privacy -->
<section id="privacy" class="band dark" aria-labelledby="privacy-title">
	<div class="narrow center" use:reveal>
		<p class="eyebrow">Privacy</p>
		<h2 id="privacy-title" class="title">Private by design.</h2>
		<p class="lead">Your notes stay on your devices and in your own iCloud. <b>Nobody else can read them. Not even us.</b></p>
	</div>
	<ul class="grid wrap four">
		{#each privacy as [title, text, icon], i (title)}
			<li class="tile" use:reveal={i * 60}>
				<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
					{#if icon === 'chip'}
						<rect x="6" y="6" width="12" height="12" rx="2.5" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" />
					{:else if icon === 'cloud'}
						<path d="M7 18.5h10.5a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 7.3 9.4 4.5 4.5 0 0 0 7 18.5Z" /><path d="M10 14.5l1.6 1.6 3-3.2" />
					{:else if icon === 'person'}
						<circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /><path d="M4 4l16 16" />
					{:else}
						<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /><path d="M4 4l16 16" />
					{/if}
				</svg>
				<h3>{title}</h3>
				<p>{text}</p>
			</li>
		{/each}
	</ul>
	<p class="center" use:reveal><a class="more" href="/privacy">Read the privacy policy</a></p>
</section>

<!-- Everywhere -->
<section id="everywhere" class="band" aria-labelledby="everywhere-title">
	<div class="narrow center" use:reveal>
		<p class="eyebrow">iPhone, iPad and Mac</p>
		<h2 id="everywhere-title" class="title">One Mote. Every device.</h2>
		<p class="lead">
			Jot it down on your iPhone, file it on your Mac, draw on your iPad. Everything syncs through iCloud, in light and dark.
		</p>
	</div>
	<div class="everywhere-stage wrap" use:reveal={100}>
		<Device kind="ipad" name="kickoff" alt="The page “Kickoff with Northwind” on iPad, next to the sidebar with all pages and tables" class="ev-ipad" />
		<Device kind="iphone" name="kickoff-dark" alt="The same page on iPhone in dark mode" class="ev-iphone" />
	</div>
</section>

<!-- Download -->
<section id="download" class="band alt" aria-labelledby="download-title">
	<div class="narrow center" use:reveal>
		<img class="app-icon" src="/icon.webp" alt="" width="128" height="128" loading="lazy" />
		<h2 id="download-title" class="display">Get Mote.</h2>
		<p class="lead">One purchase for iPhone, iPad and Mac.</p>
		<div class="hero-badges"><Badges center /></div>
		<p class="platforms">
			Requires iOS 26, iPadOS 26 or macOS 26. Suggestions, answers and writing need Apple Intelligence.
		</p>
	</div>
</section>

<style>
	.center {
		text-align: center;
	}

	/* Hero */
	.hero {
		padding: clamp(56px, 9vw, 110px) 0 0;
		overflow: hidden;
	}
	.app-icon {
		width: 128px;
		height: 128px;
		margin: 0 auto 8px;
	}
	.hero-badges {
		margin-top: 30px;
	}
	.platforms {
		margin: 16px 0 0;
		font-size: 14px;
		color: var(--ink2);
	}
	.hero-stage {
		position: relative;
		margin-top: clamp(32px, 5vw, 56px);
		padding-bottom: clamp(32px, 5vw, 64px);
		display: flex;
		justify-content: center;
	}
	.hero-stage :global(.hero-mac) {
		width: min(1000px, 92%);
		translate: -5% 0;
	}
	.hero-stage :global(.hero-iphone) {
		position: absolute;
		width: min(220px, 21%);
		left: 74%;
		bottom: clamp(24px, 4vw, 48px);
	}

	/* Bands */
	.band {
		padding: clamp(80px, 11vw, 140px) 0;
	}
	.alt {
		background: var(--bg-alt);
	}
	.dark {
		background: var(--dark);
		color: #f5f5f7;
	}
	.dark .eyebrow,
	.dark .lead {
		color: var(--dark-ink2);
	}
	.dark .lead :global(b) {
		color: #f5f5f7;
	}
	.dark a {
		color: #2997ff;
	}

	.split {
		display: grid;
		grid-template-columns: 1.05fr 0.95fr;
		align-items: center;
		gap: clamp(32px, 6vw, 96px);
	}
	.split.reverse .media {
		order: -1;
	}
	.media {
		display: flex;
		justify-content: center;
	}
	.media :global(.phone),
	.duo :global(.phone) {
		width: min(330px, 80vw);
	}
	.media :global(.tablet) {
		width: min(500px, 100%);
	}

	/* Inbox */
	.chips {
		list-style: none;
		margin: 28px 0 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chips li {
		font-size: 14px;
		padding: 7px 14px;
		border-radius: 980px;
		background: var(--bg);
		border: 1px solid var(--line);
	}

	/* Pages */
	.duo {
		margin-top: clamp(48px, 6vw, 72px);
		display: flex;
		justify-content: center;
		gap: clamp(20px, 5vw, 64px);
	}
	.grid {
		list-style: none;
		padding: 0;
		margin-top: clamp(56px, 7vw, 88px);
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}
	.grid.four {
		grid-template-columns: repeat(4, 1fr);
	}
	.tile {
		background: var(--bg-alt);
		border-radius: 20px;
		padding: 26px 26px 28px;
	}
	.tile h3 {
		font-size: 19px;
		letter-spacing: -0.02em;
		line-height: 1.25;
	}
	.tile p {
		margin: 8px 0 0;
		font-size: 15px;
		color: var(--ink2);
		line-height: 1.47;
	}
	.dark .tile {
		background: var(--dark-alt);
	}
	.dark .tile p {
		color: var(--dark-ink2);
	}
	.tile svg {
		fill: none;
		stroke: #2997ff;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		margin-bottom: 16px;
	}

	/* Tables */
	.tables-stage {
		position: relative;
		margin-top: clamp(48px, 6vw, 72px);
		display: flex;
		justify-content: center;
	}
	.tables-stage :global(.tables-mac) {
		width: min(940px, 88%);
		translate: -5% 0;
	}
	.tables-stage :global(.tables-iphone) {
		position: absolute;
		width: min(210px, 20%);
		left: 73%;
		bottom: -2%;
	}
	.tables-stage :global(.device),
	.everywhere-stage :global(.ev-iphone) {
		filter: drop-shadow(0 30px 50px rgb(0 0 0 / 0.5));
	}
	.note {
		margin-top: clamp(40px, 5vw, 64px);
		color: var(--dark-ink2);
		font-size: 17px;
	}

	/* Intelligence */
	.eyebrow.ai {
		background: linear-gradient(90deg, #0088ff, #a259ff 45%, #ff5e8a 75%, #ff9f0a);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		width: fit-content;
	}
	.steps {
		list-style: none;
		counter-reset: step;
		margin: 32px 0 0;
		padding: 0;
		display: grid;
		gap: 20px;
	}
	.steps li {
		counter-increment: step;
		position: relative;
		padding-left: 44px;
	}
	.steps li::before {
		content: counter(step);
		position: absolute;
		left: 0;
		top: 0;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--bg-alt);
		font-size: 14px;
		font-weight: 600;
		display: grid;
		place-items: center;
	}
	.steps h3 {
		font-size: 19px;
		letter-spacing: -0.02em;
		line-height: 1.4;
	}
	.steps p {
		margin: 4px 0 0;
		color: var(--ink2);
	}
	.fineprint {
		margin: 28px 0 0;
		font-size: 14px;
		color: var(--ink2);
		line-height: 1.5;
	}

	/* Calendar */
	.cal {
		margin-top: clamp(48px, 6vw, 72px);
		grid-template-columns: 0.8fr 1.2fr;
	}
	.cards {
		display: grid;
		gap: 16px;
	}
	.card {
		background: var(--bg);
		border-radius: 20px;
		padding: 18px 22px 26px;
	}
	.card img {
		border-radius: 12px;
		margin: 0 -8px 14px;
		max-width: calc(100% + 16px);
	}
	.card h3 {
		font-size: 21px;
		letter-spacing: -0.02em;
	}
	.card p {
		margin: 6px 0 0;
		color: var(--ink2);
	}

	/* Apple Pencil */
	.drawing-card {
		margin: 28px 0 0;
		border-radius: 14px;
		border: 1px solid #e5e5ea;
		background: #fff;
	}

	/* Mail */
	.mail-card {
		margin: 28px 0 0;
		border-radius: 14px;
		border: 1px solid #e5e5ea;
	}
	.checks {
		list-style: none;
		margin: 24px 0 0;
		padding: 0;
		display: grid;
		gap: 14px;
	}
	.checks li {
		position: relative;
		padding-left: 30px;
		color: var(--ink2);
	}
	.checks li :global(b) {
		color: var(--ink);
		font-weight: 600;
	}
	.checks li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 3px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--blue-app)
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18'%3E%3Cpath d='M5 9.3l2.6 2.6L13 6.6' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
	}

	/* Privacy */
	#privacy .grid {
		margin-bottom: 48px;
	}

	/* Everywhere */
	.everywhere-stage {
		position: relative;
		margin-top: clamp(48px, 6vw, 72px);
		display: flex;
		justify-content: center;
	}
	.everywhere-stage :global(.ev-ipad) {
		width: min(620px, 74%);
		translate: -10% 0;
	}
	.everywhere-stage :global(.ev-iphone) {
		position: absolute;
		width: min(270px, 30%);
		left: 60%;
		bottom: -4%;
	}

	@media (max-width: 900px) {
		.grid,
		.grid.four {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 760px) {
		.split,
		.cal {
			grid-template-columns: 1fr;
		}
		.split .media,
		.split.reverse .media {
			order: 2;
		}
		.cal .media {
			order: 0;
		}
		.grid,
		.grid.four {
			grid-template-columns: 1fr;
		}
		.duo :global(.phone) {
			width: 46%;
		}
		.hero-stage :global(.hero-mac),
		.tables-stage :global(.tables-mac) {
			width: 100%;
			translate: -6% 0;
		}
		.hero-stage :global(.hero-iphone),
		.tables-stage :global(.tables-iphone) {
			width: 26%;
			left: 72%;
		}
		.everywhere-stage :global(.ev-ipad) {
			width: 84%;
			translate: -8% 0;
		}
		.everywhere-stage :global(.ev-iphone) {
			width: 36%;
			left: 58%;
		}
	}
</style>
