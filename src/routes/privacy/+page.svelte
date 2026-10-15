<script lang="ts">
	import Shapes from '#lib/components/Shapes.svelte';
	import { legal, site } from '#lib/site.ts';
</script>

<svelte:head>
	<title>Privacy Policy · Mote</title>
	<meta name="description" content="What data the Mote app and this website process, and why." />
	<link rel="canonical" href="{site.url}/privacy" />
</svelte:head>

<Shapes count={10} opacity={0.3} />

<article class="doc">
	<div class="sheet">
		<h1 class="headline">Privacy <span class="hi">Policy</span></h1>
		<p class="meta">Last updated: {site.updated}</p>

		<div class="summary">
			<strong>In short</strong>
			<ul>
				<li>The Mote app collects no personal data. We have no servers that receive your notes and no account system.</li>
				<li>Your notes, attachments and topics are stored on your devices and, if you use iCloud, in your private iCloud database. We cannot read them.</li>
				<li>Topic sorting, calendar matching and answers run on your device with Apple Intelligence. No note is sent to an AI service in the cloud.</li>
				<li>The app contains no analytics, no advertising and no tracking. This website sets no cookies and uses no analytics.</li>
			</ul>
		</div>

		<h2>1. Who is responsible</h2>
		<p>
			The controller within the meaning of the EU General Data Protection Regulation (GDPR) for this website and the Mote app is:
		</p>
		<address>
			{legal.name}<br />
			{legal.street}<br />
			{legal.city}<br />
			{legal.country}<br />
			Email: {legal.email}
		</address>

		<h2>2. The Mote app</h2>
		<h3>2.1 What the app stores</h3>
		<p>
			Mote stores what you put into it: the text of your notes, attachments (images, PDFs and documents), topics, links between notes and
			calendar events, and the text Mote extracts from attachments so you can search it. Mote also stores a mathematical summary of each note
			(an embedding) for semantic search and topic suggestions. All of this is kept in the app's storage on your device.
		</p>
		<p>
			We, the developer, never receive this data. Mote has no account, no sign-in and no server of its own.
		</p>

		<h3>2.2 Sync with iCloud</h3>
		<p>
			If you are signed in to iCloud and iCloud is enabled for Mote, your notes, attachments, topics, embeddings and the processing results
			are synced between your devices through Apple's CloudKit, in the <em>private</em> database of your own iCloud account. This data is stored
			by Apple under Apple's terms and the <a href="https://www.apple.com/legal/privacy/" rel="noopener">Apple Privacy Policy</a>. We have no
			access to your private iCloud database. If you turn iCloud off for Mote, your notes stay on the device only.
		</p>

		<h3>2.3 Processing with Apple Intelligence</h3>
		<p>
			On devices with Apple Intelligence, Mote uses Apple's on-device language model (the Foundation Models framework) to suggest topics, to
			score calendar matches and to answer questions about your notes. Text recognition in images and PDFs uses Apple's Vision and PDFKit
			frameworks. This processing happens locally on your device. Mote does not send notes to cloud-based AI services.
		</p>

		<h3>2.4 Permissions</h3>
		<p>Mote asks for the following permissions only when you use the related feature. You can withdraw each of them at any time in the system settings.</p>
		<div class="table">
			<table>
				<thead>
					<tr><th>Permission</th><th>What Mote does with it</th></tr>
				</thead>
				<tbody>
					<tr>
						<td>Calendars</td>
						<td>
							Reads events around the time a note was written, to suggest which event the note belongs to. For a linked event, Mote keeps the event's
							identifier, title and start and end time with the note (and syncs them via your iCloud), so the link stays readable on your other
							devices. Mote does not change or create calendar events.
						</td>
					</tr>
					<tr>
						<td>Camera</td>
						<td>Takes a photo you choose to attach to a note. The photo is stored like any other attachment.</td>
					</tr>
					<tr>
						<td>Microphone and speech recognition</td>
						<td>
							Turns your dictation into text. Mote asks the system to recognise speech on the device. Where a device or language does not support
							on-device recognition, Apple's speech recognition service may process the audio under Apple's privacy policy. Mote does not store
							audio recordings.
						</td>
					</tr>
					<tr>
						<td>Photos and files</td>
						<td>Mote uses the system photo picker and file picker, so it only receives the items you select.</td>
					</tr>
				</tbody>
			</table>
		</div>

		<h3>2.5 Widget, Share Extension and shortcuts</h3>
		<p>
			The widget, the Share Extension and the App Intents (for example on the Action Button) exchange data with the app through a shared
			container on your device. Nothing leaves the device through them.
		</p>

		<h3>2.6 No analytics, no tracking</h3>
		<p>
			The app contains no analytics or advertising SDKs, does not track you across apps or websites and does not share data with third
			parties. If you have chosen to share analytics with app developers in your device settings, Apple may provide us with anonymised crash
			reports and usage statistics. These do not contain the content of your notes.
		</p>

		<h3>2.7 Deleting your data</h3>
		<p>
			Deleting a note in Mote removes it from all your devices (after the 30-day trash). Deleting the app removes its local data. To remove
			synced data from iCloud, go to Settings › [your name] › iCloud › Manage Account Storage on iPhone, or System Settings › [your name] ›
			iCloud on the Mac, and delete Mote's data there.
		</p>

		<h3>2.8 App Store</h3>
		<p>
			Mote is distributed through Apple's App Store. Downloads, purchases and reviews are handled by Apple; we only receive aggregated,
			anonymous sales reports. See the <a href="https://www.apple.com/legal/privacy/" rel="noopener">Apple Privacy Policy</a>.
		</p>

		<h2>3. This website</h2>
		<h3>3.1 Hosting and server logs</h3>
		<p>
			This website is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. When you open a page, your browser sends
			technical data that the server processes to deliver the page and to protect it against abuse: IP address, date and time, the page
			requested, referrer, browser and operating system. Vercel stores these logs for a limited time. The legal basis is our legitimate
			interest in delivering a secure website (Art. 6(1)(f) GDPR). We have a data processing agreement with Vercel. Vercel is certified under
			the EU–US Data Privacy Framework, which provides the safeguard for transfers to the USA (Art. 45 GDPR). See the
			<a href="https://vercel.com/legal/privacy-policy" rel="noopener">Vercel Privacy Policy</a>.
		</p>
		<h3>3.2 No cookies, no analytics, no external content</h3>
		<p>
			This website sets no cookies, uses no analytics or tracking, and loads no content from other servers: fonts, images and scripts are
			served from this website itself. The App Store badges link to Apple; once you follow such a link, Apple's privacy policy applies.
		</p>

		<h2>4. Your rights</h2>
		<p>Under the GDPR you have the right to</p>
		<ul>
			<li>access the personal data we hold about you (Art. 15),</li>
			<li>have it corrected (Art. 16) or erased (Art. 17),</li>
			<li>restrict its processing (Art. 18),</li>
			<li>receive it in a portable format (Art. 20),</li>
			<li>object to processing based on legitimate interests (Art. 21),</li>
			<li>lodge a complaint with a supervisory authority (Art. 77), for example the authority of the German state where you live.</li>
		</ul>
		<p>
			As we do not receive the content of the app, most requests concern only the website's server logs. Write to {legal.email} for any
			request.
		</p>

		<h2>5. Changes</h2>
		<p>
			We update this policy when the app or the website changes how it handles data. The date at the top shows the latest version.
		</p>
	</div>
</article>
