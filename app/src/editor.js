// Vice City Cover Lab — wires the editor: four photo slots, sample photos,
// layout / grade / size pickers, per-panel crop controls, click-and-drag
// panning on the preview, and the PNG export. A `?shot=` query instead sets
// up a fixed scene for a screenshot (see scenes.js).
import { paintCover, layoutPanels, EXPORT_SIZES } from './render.js';
import { runScene } from './scenes.js';

const canvas = document.getElementById('poster');
const statusLine = document.getElementById('statusLine');
const panelLabel = document.getElementById('panelLabel');

/** Editor state: four photo slots, one crop per panel, caption, look, size. */
export const editorState = {
  photos: [null, null, null, null],
  panels: [
    { photo: 0, zoom: 1, ox: 0, oy: 0 },
    { photo: 1, zoom: 1, ox: 0, oy: 0 },
    { photo: 2, zoom: 1, ox: 0, oy: 0 },
    { photo: 3, zoom: 1, ox: 0, oy: 0 },
  ],
  layout: 'grid',
  grade: 'sunset',
  title: 'VICE CITY',
  subtitle: 'TWO OUTLAWS. ONE SUNSET CITY.',
  pill: 'VICE CITY, USA',
  grain: true,
  size: '1920x1080',
  selected: 0,
};

/** Loads an image from a URL, resolving once it can be drawn on canvas. */
export function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

function repaint() {
  paintCover(canvas, editorState);
}

/** Keeps the panel-crop sliders in sync with the selected panel. */
export function syncCropControls() {
  const crop = editorState.panels[editorState.selected];
  document.getElementById('zoomRange').value = crop.zoom;
  document.getElementById('panXRange').value = crop.ox;
  document.getElementById('panYRange').value = crop.oy;
  panelLabel.textContent = String(editorState.selected + 1);
}

/** Selects panel `i` (clamped to the current layout's panel count). */
export function pickPanel(i) {
  const count = layoutPanels(editorState.layout, canvas.width, canvas.height).length;
  editorState.selected = Math.max(0, Math.min(i, count - 1));
  syncCropControls();
}

/** Applies a new layout, keeping each panel's crop and re-clamping selection. */
export function applyLayout(layout) {
  editorState.layout = layout;
  document.querySelectorAll('#layoutRow button').forEach((b) =>
    b.classList.toggle('on', b.dataset.layout === layout));
  pickPanel(editorState.selected);
  repaint();
}

/** Applies a new colour grade. */
export function applyGrade(grade) {
  editorState.grade = grade;
  document.querySelectorAll('#gradeRow button').forEach((b) =>
    b.classList.toggle('on', b.dataset.grade === grade));
  repaint();
}

/** Resizes the preview canvas to a post size and repaints at full resolution. */
export function applySize(size) {
  editorState.size = size;
  const [w, h] = EXPORT_SIZES[size];
  canvas.width = w;
  canvas.height = h;
  document.querySelectorAll('#sizeRow button').forEach((b) =>
    b.classList.toggle('on', b.dataset.size === size));
  pickPanel(editorState.selected);
  repaint();
}

/** Fills every panel of the current layout with photo slot `slot`. */
export function fillPanelsWith(slot) {
  editorState.panels.forEach((p) => { p.photo = slot; });
  repaint();
}

/** Cycles the selected panel to the next loaded photo slot. */
export function swapSelectedPhoto() {
  const loaded = editorState.photos
    .map((p, i) => (p ? i : -1))
    .filter((i) => i >= 0);
  if (loaded.length < 2) return;
  const current = editorState.panels[editorState.selected].photo;
  const at = loaded.indexOf(current);
  editorState.panels[editorState.selected].photo =
    loaded[(at + 1) % loaded.length];
  repaint();
}

/** Deals the four sample photos across the panels in a shuffled order. */
export function shuffleSamples() {
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  editorState.panels.forEach((p, i) => { p.photo = order[i % order.length]; });
  repaint();
}

/** Puts a sample photo into slot `slot` and repaints. */
export async function loadSamplePhoto(name, slot) {
  editorState.photos[slot] = await fetchImage(`samples/${name}.jpg`);
  repaint();
}

/** Renders the cover at export size and downloads it as a PNG. */
export function downloadCoverPNG() {
  const [w, h] = EXPORT_SIZES[editorState.size];
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  paintCover(off, editorState);
  off.toBlob((blob) => {
    if (!blob) {
      statusLine.textContent = 'Export failed — try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-city-cover-${editorState.size}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    statusLine.textContent = `Saved vice-city-cover-${editorState.size}.png (${w} × ${h}).`;
  }, 'image/png');
}

// Photo slot file inputs: a chosen file replaces that slot's photo.
[0, 1, 2, 3].forEach((slot) => {
  document.getElementById(`slot${slot}`).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    editorState.photos[slot] = await fetchImage(URL.createObjectURL(file));
    repaint();
  });
});

// Sample buttons load a sample into the next empty slot, else slot 0.
document.querySelectorAll('[data-sample]').forEach((b) => {
  b.addEventListener('click', async () => {
    const slot = editorState.photos.findIndex((p) => p === null);
    await loadSamplePhoto(b.dataset.sample, slot === -1 ? 0 : slot);
  });
});
document.getElementById('fillOne').addEventListener('click', () => fillPanelsWith(0));
document.getElementById('shuffle').addEventListener('click', shuffleSamples);
document.getElementById('swapPhoto').addEventListener('click', swapSelectedPhoto);

document.querySelectorAll('#layoutRow button').forEach((b) =>
  b.addEventListener('click', () => applyLayout(b.dataset.layout)));
document.querySelectorAll('#gradeRow button').forEach((b) =>
  b.addEventListener('click', () => applyGrade(b.dataset.grade)));
document.querySelectorAll('#sizeRow button').forEach((b) =>
  b.addEventListener('click', () => applySize(b.dataset.size)));

document.getElementById('titleText').addEventListener('input', (e) => {
  editorState.title = e.target.value;
  repaint();
});
document.getElementById('subText').addEventListener('input', (e) => {
  editorState.subtitle = e.target.value;
  repaint();
});
document.getElementById('pillText').addEventListener('input', (e) => {
  editorState.pill = e.target.value;
  repaint();
});
document.getElementById('grain').addEventListener('change', (e) => {
  editorState.grain = e.target.checked;
  repaint();
});
document.getElementById('zoomRange').addEventListener('input', (e) => {
  editorState.panels[editorState.selected].zoom = Number(e.target.value);
  repaint();
});
document.getElementById('panXRange').addEventListener('input', (e) => {
  editorState.panels[editorState.selected].ox = Number(e.target.value);
  repaint();
});
document.getElementById('panYRange').addEventListener('input', (e) => {
  editorState.panels[editorState.selected].oy = Number(e.target.value);
  repaint();
});
document.getElementById('exportBtn').addEventListener('click', downloadCoverPNG);

// Click a panel to select it; drag inside it to pan its photo; double-click
// a panel to swap the photo filling it.
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * canvas.width;
  const y = ((e.clientY - r.top) / r.height) * canvas.height;
  const rects = layoutPanels(editorState.layout, canvas.width, canvas.height);
  const i = rects.findIndex((p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
  if (i === -1) return;
  pickPanel(i);
  drag = { x, y, ox: editorState.panels[i].ox, oy: editorState.panels[i].oy };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * canvas.width;
  const y = ((e.clientY - r.top) / r.height) * canvas.height;
  const rects = layoutPanels(editorState.layout, canvas.width, canvas.height);
  const rect = rects[editorState.selected];
  const crop = editorState.panels[editorState.selected];
  crop.ox = Math.max(-0.4, Math.min(0.4, drag.ox + (x - drag.x) / rect.w));
  crop.oy = Math.max(-0.4, Math.min(0.4, drag.oy + (y - drag.y) / rect.h));
  syncCropControls();
  repaint();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('dblclick', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * canvas.width;
  const y = ((e.clientY - r.top) / r.height) * canvas.height;
  const rects = layoutPanels(editorState.layout, canvas.width, canvas.height);
  const i = rects.findIndex((p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
  if (i === -1) return;
  pickPanel(i);
  swapSelectedPhoto();
});

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  // Screenshot scene: the scene module loads the samples and caption, then
  // paints once and flags window.__shotReady for the screenshot runner.
  runScene(shot, query, editorState, {
    loadSamplePhoto, applyLayout, applyGrade, applySize, repaint,
  });
} else {
  // First paint: the four Vice City samples preloaded, so the app opens
  // with a finished-looking cover before any photo is picked.
  document.fonts.load('80px Anton').finally(async () => {
    try {
      await Promise.all([
        loadSamplePhoto('boulevard', 0),
        loadSamplePhoto('beach', 1),
        loadSamplePhoto('keys', 2),
        loadSamplePhoto('skyline', 3),
      ]);
    } catch {
      statusLine.textContent = 'A sample photo failed to load — pick your own photo to begin.';
    }
    repaint();
  });
  repaint();
}
