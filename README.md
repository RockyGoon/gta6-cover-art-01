# Leonida After Dark — GTA VI Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/RockyGoon/gta6-cover-art-01-r2/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/RockyGoon/gta6-cover-art-01-r2/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

A web app that turns your own photos and a caption into GTA VI-style cover art —
the multi-panel Vice City poster look with bold Anton lettering and a sunset or
neon colour grade — exported as a PNG to share.

**Bounty:** [Make GTA 6 Cover Art — make.fun/bounty/gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01)

## What it does

- **Six photo slots** — upload your own photos from your machine, or use the four
  built-in sample photos (marina sunset, neon boulevard, Keys bridge, motel skyline).
  Photos are read locally and never uploaded.
- **Six layouts** — Hero, Duo, Grid 2×2, Grid 3×2, Strip ×3, Mosaic.
- **Six grades** — Sunset, Neon Night, Golden Dusk, Vice Pink, Heatwave, Palm Noir.
- **Editable caption** — title in Anton, subtitle, and a pill badge, with three title
  styles: Gradient, Outline, Neon Script.
- **Per-panel crop & pan** — zoom and position each panel's photo.
- **Polish** — film grain and a white poster frame, toggleable.
- **Export PNG** — 1080 × 1080, 1080 × 1350 and 1920 × 1080, offline.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Pick photos, a layout and a grade, edit the caption, then export. The live preview
and the exported PNG are drawn by the same code (`app/src/render.js`), so what you
see is what you share.

## Facts baked in

GTA VI releases 19 Nov 2026 on PlayStation 5 and Xbox Series X|S, starring
Lucia Caminos and Jason Duval in Vice City, Leonida.

## Originality

Everything here is original: no Rockstar Games logo, wordmark, artwork or font.
The title font is Anton under the SIL Open Font License (`app/fonts/OFL.txt`);
the sample photos were generated with an image model for this entry.

## License

MIT — see [LICENSE](LICENSE).

---

Built for [make.fun](https://make.fun/bounty/gta6-cover-art-01) — enter with referral code `qh87q9q5`: https://make.fun/r/qh87q9q5
