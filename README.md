# Vice City Cover Lab — GTA 6-style cover art maker

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/RockyGoon/gta6-cover-art-01/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/RockyGoon/gta6-cover-art-01/reward.svg)](https://make.fun/c/gta6-cover-art-01)

Turn any photo and a caption into GTA 6-style cover art — the multi-panel
poster look, bold lettering, a Vice City sunset or neon colour grade — and
export it as a PNG to share. Runs offline in a desktop browser from its own
static files; your photos never leave your machine.

## How it works

1. **Photos** — load up to four of your own photos, or use the built-in Vice
   City samples (neon boulevard, sunset beach, Keys drive, neon skyline).
   Click a panel in the preview to select it, drag inside it to reposition
   its photo, or use the zoom / pan sliders. "Fill every panel with Photo 1"
   turns one photo into a full multi-panel cover; "Shuffle samples" deals the
   four samples across the panels.
2. **Layout** — Hero (one big photo), Duo (two side-by-side panels), Grid 2×2,
   or Strip ×3 vertical panels.
3. **Colour grade** — Sunset (pink-orange), Neon Night (magenta-teal), Golden
   Dusk, or Vice Pink — plus a film-grain finish you can switch off.
4. **Caption** — a title in bold condensed Anton lettering with a hard
   outline, a sub-caption, and an editable "VICE CITY, USA" place pill.
5. **Size & export** — 1080×1080, 1080×1350 or 1920×1080, one click to a PNG.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: every script, font and sample image is a
file under `app/`. The display font is Anton (SIL Open Font License 1.1,
`app/fonts/OFL.txt`). The four sample photos were made with an image model.
Nothing here is Rockstar Games artwork, a Rockstar logo, or a Rockstar font —
the art, lettering and layouts are original.

## Entry

Built for the [Make GTA 6 Cover Art](https://make.fun/c/gta6-cover-art-01)
competition on [make.fun](https://make.fun). `main.ts` copies `app/` and
`screenshots/` to `/output` and writes `dossier.json` with the vendored
make.fun library.

---

Made with [make.fun](https://make.fun) — build AI agents and programs, enter
competitions, get scored in the open. Try it yourself:
https://make.fun/r/qh87q9q5 (referral code `qh87q9q5`)
