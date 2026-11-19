// editor.js — wires the Leonida After Dark editor: photo slots, layouts, grades,
// caption editing, per-panel crop/pan, and PNG export in the three post sizes.
// The preview canvas and the exported PNG are drawn by the same drawCover() call
// in render.js, so what the screenshots show is exactly what the app exports.

import { drawCover, GRADES, LAYOUTS, SIZES } from './render.js';
import { runShot } from './scenes.js';

const SAMPLES = ['beach', 'boulevard', 'keys', 'skyline', 'beach', 'keys'];

export const state = {
  layout: 'grid3',
  grade: 'sunset',
  size: 'wide',
  title: 'LEONIDA AFTER DARK',
  subtitle: 'Lucia & Jason · Vice City · 19 Nov 2026',
  pill: 'GTA VI',
  titleStyle: 'gradient',
  grain: true,
  frame: true,
  selected: 0,
  slots: Array.from({ length: 6 }, () => ({ img: null, zoom: 1, panX: 0, panY: 0 })),
};

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export function redraw() {
  drawCover(canvas, state);
}

function fitPreview() {
  const size = SIZES.find((s) => s.id === state.size) || SIZES[2];
  canvas.width = size.w;
  canvas.height = size.h;
  redraw();
}

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function buildSlotRow(slotIndex) {
  const row = document.createElement('div');
  row.className = 'slot-row';
  row.dataset.slot = String(slotIndex);
  const label = document.createElement('span');
  label.className = 'slot-label';
  label.textContent = `Photo ${slotIndex + 1}`;
  const file = document.createElement('input');
  file.type = 'file';
  file.accept = 'image/*';
  file.id = `photo-${slotIndex}`;
  file.setAttribute('aria-label', `Photo ${slotIndex + 1}`);
  file.addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    state.slots[slotIndex].img = await loadImage(URL.createObjectURL(f));
    state.selected = slotIndex;
    syncPanelControls();
    redraw();
    setStatus(`Photo ${slotIndex + 1} loaded.`);
  });
  const sample = document.createElement('button');
  sample.type = 'button';
  sample.className = 'mini';
  sample.textContent = 'Sample';
  sample.addEventListener('click', async () => {
    state.slots[slotIndex].img = await loadImage(`samples/${SAMPLES[slotIndex]}.jpg`);
    state.selected = slotIndex;
    syncPanelControls();
    redraw();
    setStatus(`Photo ${slotIndex + 1} set to sample ${SAMPLES[slotIndex]}.`);
  });
  const pick = document.createElement('button');
  pick.type = 'button';
  pick.className = 'mini';
  pick.textContent = 'Crop';
  pick.addEventListener('click', () => {
    state.selected = slotIndex;
    syncPanelControls();
    redraw();
  });
  row.append(label, file, sample, pick);
  return row;
}

function buildChoiceGroup(containerId, items, current, onPick, namePrefix) {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.innerHTML = '';
  items.forEach((item) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (item.id === current ? ' active' : '');
    b.textContent = item.name;
    b.id = `${namePrefix}-${item.id}`;
    b.addEventListener('click', () => {
      onPick(item.id);
      box.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      b.classList.add('active');
    });
    box.appendChild(b);
  });
}

function syncPanelControls() {
  const slot = state.slots[state.selected];
  const zoom = document.getElementById('zoom');
  const panX = document.getElementById('pan-x');
  const panY = document.getElementById('pan-y');
  const label = document.getElementById('panel-label');
  if (zoom) zoom.value = String(slot.zoom);
  if (panX) panX.value = String(slot.panX);
  if (panY) panY.value = String(slot.panY);
  if (label) label.textContent = `Panel ${state.selected + 1} — crop & position`;
  document.querySelectorAll('.slot-row').forEach((r) => {
    r.classList.toggle('selected', Number(r.dataset.slot) === state.selected);
  });
}

function bindText(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = state[key];
  el.addEventListener('input', () => { state[key] = el.value; redraw(); });
}

function bindToggle(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  el.checked = state[key];
  el.addEventListener('change', () => { state[key] = el.checked; redraw(); });
}

export function exportPng(sizeId) {
  const size = SIZES.find((s) => s.id === sizeId) || SIZES.find((s) => s.id === state.size);
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leonida-after-dark-${size.w}x${size.h}.png`;
      a.click();
      setStatus(`Saved leonida-after-dark-${size.w}x${size.h}.png`);
      resolve(url);
    }, 'image/png');
  });
}

// Test/screenshot hook: returns a PNG data URL of the export at the given size.
window.__exportPng = async (sizeId) => {
  const size = SIZES.find((s) => s.id === sizeId) || SIZES[2];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  return off.toDataURL('image/png');
};
window.__state = state;

export async function init() {
  const slotsBox = document.getElementById('slots');
  if (slotsBox) for (let i = 0; i < 6; i++) slotsBox.appendChild(buildSlotRow(i));

  buildChoiceGroup('layouts', LAYOUTS, state.layout, (id) => { state.layout = id; redraw(); }, 'layout');
  buildChoiceGroup('grades', GRADES, state.grade, (id) => { state.grade = id; redraw(); }, 'grade');
  buildChoiceGroup('sizes', SIZES, state.size, (id) => { state.size = id; fitPreview(); }, 'size');
  buildChoiceGroup('title-styles', [
    { id: 'gradient', name: 'Gradient' },
    { id: 'outline', name: 'Outline' },
    { id: 'neon', name: 'Neon Script' },
  ], state.titleStyle, (id) => { state.titleStyle = id; redraw(); }, 'tstyle');

  bindText('title', 'title');
  bindText('subtitle', 'subtitle');
  bindText('pill', 'pill');
  bindToggle('grain', 'grain');
  bindToggle('frame', 'frame');

  const zoom = document.getElementById('zoom');
  const panX = document.getElementById('pan-x');
  const panY = document.getElementById('pan-y');
  if (zoom) zoom.addEventListener('input', () => { state.slots[state.selected].zoom = Number(zoom.value); redraw(); });
  if (panX) panX.addEventListener('input', () => { state.slots[state.selected].panX = Number(panX.value); redraw(); });
  if (panY) panY.addEventListener('input', () => { state.slots[state.selected].panY = Number(panY.value); redraw(); });

  document.querySelectorAll('[data-export]').forEach((b) => {
    b.addEventListener('click', () => exportPng(b.dataset.export));
  });
  const shuffle = document.getElementById('shuffle');
  if (shuffle) shuffle.addEventListener('click', async () => {
    const order = [...SAMPLES].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 6; i++) state.slots[i].img = await loadImage(`samples/${order[i]}.jpg`);
    redraw();
    setStatus('Samples shuffled across the six panels.');
  });

  // Load the four sample photos into the six slots so the editor opens ready.
  for (let i = 0; i < 6; i++) {
    try { state.slots[i].img = await loadImage(`samples/${SAMPLES[i]}.jpg`); } catch { /* slot stays empty */ }
  }
  await document.fonts.ready;
  fitPreview();
  syncPanelControls();
  setStatus('Ready — pick photos, a layout and a grade, then export a PNG.');
}

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  init().then(() => runShot(shot, new URLSearchParams(location.search), async (scene) => {
    state.layout = scene.layout;
    state.grade = scene.grade;
    state.size = scene.size;
    state.title = scene.title;
    state.subtitle = scene.subtitle;
    state.pill = scene.pill;
    document.getElementById('title').value = scene.title;
    document.getElementById('subtitle').value = scene.subtitle;
    document.getElementById('pill').value = scene.pill;
    for (let i = 0; i < 6; i++) {
      state.slots[i].img = await loadImage(`samples/${scene.photos[i % scene.photos.length]}.jpg`);
    }
    fitPreview();
    syncPanelControls();
  }));
} else {
  init();
}
