# Leonida After Dark — GTA VI Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/RockyGoon/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/RockyGoon/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn your own photos into a GTA VI-style poster: the multi-panel Vice City
look, bold Anton lettering, a sunset or neon grade — exported as a PNG ready
to post. No account, no upload, no build step.

**Bounty:** [Make GTA 6 Cover Art — make.fun/bounty/gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01)

## Make a cover in four steps

1. **Run it** — `node serve.ts`, then open http://localhost:8080.
2. **Drop in photos** — six slots, your files or the four built-in samples
   (marina sunset, neon boulevard, Keys bridge, motel skyline). Photos are
   read on your machine and never leave it.
3. **Pick a look** — a layout, a grade, a caption. The preview updates live.
4. **Export** — one click saves the PNG at 1080 × 1080, 1080 × 1350 or
   1920 × 1080.

The preview and the export are drawn by the same code (`app/src/render.js`),
so the PNG you save is exactly the cover you saw.

## The studio

| Piece | What you get |
| --- | --- |
| **Layouts — 7** | Hero, Duo, Grid 2×2, Grid 3×2, Strip ×3, Mosaic, and **Spotlight** — one big hero panel with three stacked moments beside it |
| **Grades — 6** | Sunset, Neon Night, Golden Dusk, Vice Pink, Heatwave, Palm Noir |
| **Caption** | Editable title in Anton, subtitle, and pill badge; three title styles — Gradient, Outline, Neon Script |
| **Per-panel crop** | Zoom and pan each panel's photo until the framing is right |
| **Finish** | Film grain and a white poster frame, both toggleable |

## Why it looks right

- **One grade, every panel.** A colour wash runs over each photo and a sky
  gradient over the whole poster, so six different photos feel like one
  shoot at golden hour on Ocean Drive.
- **Lettering with weight.** The title is set in Anton, fitted to the
  poster width, with a dark scrim behind it so it reads over any photo.
- **Offline by design.** Static files under `app/` — no network request,
  no tracking, no server. It works the same from any static host.

## About the game

GTA VI releases 19 Nov 2026 on PlayStation 5 and Xbox Series X|S, starring
Lucia Caminos and Jason Duval in Vice City, Leonida.

## Originality & license

Everything here is original work: no Rockstar Games logo, wordmark, artwork
or font. The title font is Anton under the SIL Open Font License
(`app/fonts/OFL.txt`); the sample photos were generated with an image model
for this entry.

MIT — see [LICENSE](LICENSE).

---

Built for [make.fun](https://make.fun/bounty/gta6-cover-art-01) — enter with referral code `qh87q9q5`: https://make.fun/r/qh87q9q5
