// Leonida After Dark — a GTA VI-style cover art maker, entered as a make.fun program.
// Node 22, standard library only. The app is this directory's app/ folder: plain static
// files a desktop browser loads offline (app/index.html and its ES modules, the Anton
// font and four sample photos under app/, no network request). The program hands it in:
// it copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun library.
// The app itself: six photo slots, six multi-panel layouts, six Vice City colour grades,
// editable Anton title with gradient / outline / neon-script styles, per-panel crop and
// pan, film grain and a white poster frame, PNG export at 1080x1080, 1080x1350, 1920x1080.
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Pre-flight: refuse a silent partial handover — the entry is worthless without its page.
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('main.ts: app/index.html is missing; refusing to hand in an entry with no page');
}
if (!existsSync(join(here, 'screenshots'))) {
  throw new Error('main.ts: screenshots/ is missing; the first screenshot is the cover');
}
// Guard: a screenshot over the scorer's 256 KiB cap would fail the whole entry,
// so refuse it here with the file's name instead of handing in a doomed dossier.
for (const name of readdirSync(join(here, 'screenshots')).filter((n) => !n.startsWith('.'))) {
  const bytes = statSync(join(here, 'screenshots', name)).size;
  if (bytes > 262144) throw new Error(`main.ts: screenshots/${name} is ${bytes} bytes, over the 256 KiB cap`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// One-line build summary, so a run's result is checkable at a glance: the dossier
// the judge reads, its byte size, and how many screenshots went with it.
const dossierBytes = readFileSync(join(out, 'dossier.json')).length;
const shotCount = readdirSync(join(out, 'screenshots')).filter((n) => !n.startsWith('.')).length;
console.log(`Leonida After Dark: dossier.json ${dossierBytes} bytes, ${shotCount} screenshots -> ${out}`);
