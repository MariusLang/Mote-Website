# Mote website

Marketing site for [Mote](https://github.com/MariusLang/Mote), the notes app for iPhone, iPad and Mac.
SvelteKit with a three.js stage: one cel-shaded diorama per chapter on a ring of floating islands, the camera
flies between them as you scroll. The style follows the Chronicler topic shorts; the devices are built from
Apple's product bezels with the real app screens composited in.

## Develop

Needs Node 24 and pnpm.

```sh
pnpm install
pnpm dev        # http://localhost:5173
pnpm check      # svelte-check
pnpm build      # static pages + Vercel output
```

## Structure

| Path | What |
| --- | --- |
| `src/routes/+page.svelte` | Home: chapters, gallery, download |
| `src/routes/privacy`, `src/routes/imprint` | Privacy policy and imprint |
| `src/lib/site.ts` | Store links and legal details (fill in the `TODO` values) |
| `src/lib/three/world.js` | Stations, camera poses, per-station animation |
| `src/lib/three/kit.js` | Cel material and prefabs (devices, notes, furniture, nature) |
| `src/lib/components/Stage.svelte` | Fixed canvas, scroll to camera mapping, colour worlds |
| `src/lib/motion.ts` | Motion levels, GSAP ScrollTrigger and Lenis |
| `static/shots/device` | iPhone and iPad screens composited into Apple's bezels |
| `static/shots/screen` | Mac screen captures |
| `static/shots/store` | App Store screenshots for the gallery |

Motion levels: desktop gets smooth scrolling, scrubbed scenes, letter animations and pointer parallax; phones and
tablets get the 3D stage at a lower frame rate with time-driven loops and plain fades; `prefers-reduced-motion`
gets still frames.

In development, `window.__scene.overlaps()` lists props of a station whose boxes cut into each other.

## Fonts

SF Pro via the system font stack on Apple devices; Bricolage Grotesque (SIL OFL, `static/fonts`) elsewhere.

## Deploy

Vercel, `@sveltejs/adapter-vercel` on Node 24. Every page is prerendered.
