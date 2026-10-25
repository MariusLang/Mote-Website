# Mote website

Marketing site for [Mote](https://github.com/MariusLang/Mote), the notes app for iPhone, iPad and Mac.
SvelteKit, no client libraries: plain sections in the style of Apple's product pages, real app screenshots in
Apple's product bezels, a short fade as the only motion.

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
| `src/routes/+page.svelte` | Home: inbox, pages, Apple Pencil, tables, Apple Intelligence, calendar & reminders, mail, privacy, download |
| `src/routes/privacy`, `src/routes/imprint` | Privacy policy and imprint |
| `src/lib/site.ts` | Store links and legal details |
| `src/lib/components/Device.svelte` | One framed screenshot from `static/shots` |
| `scripts/shots.sh`, `scripts/frame.swift` | Build `static/shots` from raw screenshots and Apple's bezels |
| `static/shots` | Framed device shots (`iphone-*`, `ipad-*`, `mac-*`) and cropped blocks (`card-*`) |

## Screenshots

The shots are the real app with the UI-test seed data (`-uitest -seed showcase-en`, see `docs/BUILDING.md` and
`Design/AppStore/README.md` in the app repo): iPhone 17 Pro Max and iPad Pro 13" (M5) simulators, and the Mac app
with `-windowSize 1280x795` so the window fills the MacBook Air screen below the menu bar.

```sh
scripts/shots.sh <raw dir> <bezel dir>
```

`<raw dir>` holds `iphone/`, `iphone-dark/`, `ipad/`, `mac/` and `mac-dark/`; the file names the
script expects are listed in it. `<bezel dir>` holds Apple's product bezel PNGs from
[Apple Design Resources](https://developer.apple.com/design/resources/#product-bezels). The bezels are not in this
repo: each screenshot is composited into its bezel and published only as that one flattened image. Every `mac/*.png`
becomes `static/shots/mac-<name>.webp` for `<Device kind="mac" name="<name>">`.

## Deploy

Vercel, `@sveltejs/adapter-vercel` on Node 24. Every page is prerendered.
