// render.js — draws a Leonida After Dark cover onto any canvas.
// Pure canvas 2D, no network, no dependencies. The editor owns the state object;
// this module only turns state + loaded images into pixels, so the same code draws
// the live preview, the exported PNG and the screenshot scenes.

export const GRADES = [
  { id: 'sunset', name: 'Sunset', sky: ['#ff7a3d', '#ff2e88', '#7b2ff7'], wash: 'rgba(255, 94, 60, 0.22)', deep: '#2b0a3d' },
  { id: 'neon', name: 'Neon Night', sky: ['#00e5ff', '#ff2ec4', '#7b2ff7'], wash: 'rgba(0, 229, 255, 0.16)', deep: '#060a2e' },
  { id: 'golden', name: 'Golden Dusk', sky: ['#ffd76a', '#ff8a3d', '#c22e6e'], wash: 'rgba(255, 190, 60, 0.20)', deep: '#33150a' },
  { id: 'vicepink', name: 'Vice Pink', sky: ['#ff9ecf', '#ff2e88', '#5b1a8a'], wash: 'rgba(255, 46, 136, 0.22)', deep: '#2e0a2e' },
  { id: 'heatwave', name: 'Heatwave', sky: ['#ffe259', '#ff7a3d', '#e83e2e'], wash: 'rgba(255, 120, 30, 0.24)', deep: '#3d0d05' },
  { id: 'palmnoir', name: 'Palm Noir', sky: ['#8ef0c8', '#1f8f7a', '#0b2e4d'], wash: 'rgba(20, 180, 140, 0.16)', deep: '#04141f' },
];

export const LAYOUTS = [
  { id: 'hero', name: 'Hero', panels: 1 },
  { id: 'duo', name: 'Duo', panels: 2 },
  { id: 'grid2', name: 'Grid 2x2', panels: 4 },
  { id: 'grid3', name: 'Grid 3x2', panels: 6 },
  { id: 'strip3', name: 'Strip x3', panels: 3 },
  { id: 'mosaic', name: 'Mosaic', panels: 4 },
];

export const SIZES = [
  { id: 'square', name: '1080 x 1080', w: 1080, h: 1080 },
  { id: 'portrait', name: '1080 x 1350', w: 1080, h: 1350 },
  { id: 'wide', name: '1920 x 1080', w: 1920, h: 1080 },
];

/** Panel rectangles for a layout, as fractions of the inner (post-frame) area. */
export function layoutRects(layoutId) {
  switch (layoutId) {
    case 'hero': return [{ x: 0, y: 0, w: 1, h: 1 }];
    case 'duo': return [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }];
    case 'grid2': return [
      { x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ];
    case 'grid3': {
      const out = [];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) out.push({ x: c / 3, y: r / 2, w: 1 / 3, h: 0.5 });
      return out;
    }
    case 'strip3': return [
      { x: 0, y: 0, w: 1, h: 0.34 }, { x: 0, y: 0.34, w: 1, h: 0.33 }, { x: 0, y: 0.67, w: 1, h: 0.33 },
    ];
    case 'mosaic': return [
      { x: 0, y: 0, w: 1, h: 0.58 },
      { x: 0, y: 0.58, w: 1 / 3, h: 0.42 }, { x: 1 / 3, y: 0.58, w: 1 / 3, h: 0.42 }, { x: 2 / 3, y: 0.58, w: 1 / 3, h: 0.42 },
    ];
    default: return [{ x: 0, y: 0, w: 1, h: 1 }];
  }
}

/** A tiny deterministic PRNG so the film grain looks the same on every export. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawPhotoInto(ctx, img, rect, zoom, panX, panY) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(rect.w / iw, rect.h / ih) * (zoom || 1);
  const dw = iw * base;
  const dh = ih * base;
  const dx = rect.x + (rect.w - dw) / 2 + (panX || 0) * rect.w * 0.4;
  const dy = rect.y + (rect.h - dh) / 2 + (panY || 0) * rect.h * 0.4;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawPlaceholder(ctx, rect, index, grade) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, grade.sky[0]);
  g.addColorStop(0.55, grade.sky[1]);
  g.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `bold ${Math.max(18, rect.h * 0.09)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`PHOTO ${index + 1}`, rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.textBaseline = 'alphabetic';
}

function drawTitle(ctx, w, h, state, grade) {
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  const pill = (state.pill || '').trim();
  const bandH = h * (state.layout === 'hero' ? 0.34 : 0.30);
  const bandY = h - bandH;
  const scrim = ctx.createLinearGradient(0, bandY - h * 0.06, 0, h);
  scrim.addColorStop(0, 'rgba(10,4,24,0)');
  scrim.addColorStop(0.45, 'rgba(10,4,24,0.72)');
  scrim.addColorStop(1, 'rgba(10,4,24,0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY - h * 0.06, w, bandH + h * 0.06);

  const pad = w * 0.055;
  let y = bandY + bandH * 0.42;
  if (title) {
    let size = Math.min(w * 0.16, bandH * 0.52);
    const fit = (s) => { ctx.font = `${s}px Anton, 'Arial Narrow', sans-serif`; return ctx.measureText(title).width; };
    while (fit(size) > w - pad * 2 && size > 16) size -= 4;
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const tx = pad;
    const style = state.titleStyle || 'gradient';
    if (style === 'outline') {
      ctx.lineWidth = Math.max(3, size * 0.09);
      ctx.strokeStyle = '#12041f';
      ctx.lineJoin = 'round';
      ctx.strokeText(title, tx, y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, tx, y);
    } else if (style === 'neon') {
      ctx.font = `italic bold ${size}px Anton, 'Arial Narrow', sans-serif`;
      ctx.shadowColor = '#ff2ec4';
      ctx.shadowBlur = size * 0.35;
      ctx.fillStyle = '#ffe9f7';
      ctx.fillText(title, tx, y);
      ctx.shadowBlur = size * 0.12;
      ctx.shadowColor = '#00e5ff';
      ctx.fillText(title, tx, y);
      ctx.shadowBlur = 0;
    } else {
      const grad = ctx.createLinearGradient(tx, y - size * 0.5, tx, y + size * 0.5);
      grad.addColorStop(0, '#fff7ae');
      grad.addColorStop(0.45, grade.sky[0]);
      grad.addColorStop(1, grade.sky[1]);
      ctx.lineWidth = Math.max(3, size * 0.07);
      ctx.strokeStyle = 'rgba(18,4,31,0.9)';
      ctx.lineJoin = 'round';
      ctx.strokeText(title, tx, y);
      ctx.fillStyle = grad;
      ctx.fillText(title, tx, y);
    }
    y += size * 0.62;
  }
  if (subtitle) {
    const sSize = Math.max(20, w * 0.028);
    ctx.font = `600 ${sSize}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(subtitle, pad, Math.min(y, h - sSize * 1.6));
  }
  if (pill) {
    const pSize = Math.max(18, w * 0.022);
    ctx.font = `700 ${pSize}px system-ui, sans-serif`;
    const pw = ctx.measureText(pill).width + pSize * 2.2;
    const ph = pSize * 2.1;
    // Top-right corner of the inner area, clear of the title band below.
    const px = w - pad - pw;
    const py = pad * 0.7;
    ctx.fillStyle = grade.sky[1];
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, ph / 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pill.toUpperCase(), px + pw / 2, py + ph / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }
}

function drawGrain(ctx, w, h) {
  const rand = mulberry32(20261119);
  const step = Math.max(3, Math.round(w / 360));
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const v = Math.floor(rand() * 255);
      ctx.fillStyle = v > 127 ? '#ffffff' : '#000000';
      ctx.fillRect(x, y, step * 0.6, step * 0.6);
    }
  }
  ctx.restore();
}

/**
 * Draws the full cover. `state` carries layout, grade id, title, subtitle, pill,
 * titleStyle, grain, frame and `slots`: an array of { img, zoom, panX, panY }.
 * `images` is unused here (slots already hold loaded images) and kept for callers
 * that pass photos separately.
 */
export function drawCover(canvas, state, images = null) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES.find((g) => g.id === state.grade) || GRADES[0];
  const gap = Math.max(4, Math.round(Math.min(w, h) * 0.006));
  const frame = state.frame === false ? 0 : Math.round(Math.min(w, h) * 0.028);

  ctx.fillStyle = state.frame === false ? grade.deep : '#f8f4ee';
  ctx.fillRect(0, 0, w, h);
  const ix = frame;
  const iy = frame;
  const iw = w - frame * 2;
  const ih = h - frame * 2;

  const rects = layoutRects(state.layout || 'hero');
  const slots = state.slots || [];
  rects.forEach((r, i) => {
    const rect = {
      x: ix + r.x * iw + (r.x > 0 ? gap / 2 : 0),
      y: iy + r.y * ih + (r.y > 0 ? gap / 2 : 0),
      w: r.w * iw - (r.x > 0 ? gap / 2 : 0) - (r.x + r.w < 1 ? gap / 2 : 0),
      h: r.h * ih - (r.y > 0 ? gap / 2 : 0) - (r.y + r.h < 1 ? gap / 2 : 0),
    };
    const slot = slots[i];
    const img = slot && slot.img ? slot.img : (images && images[i]) || null;
    if (img) drawPhotoInto(ctx, img, rect, slot ? slot.zoom : 1, slot ? slot.panX : 0, slot ? slot.panY : 0);
    else drawPlaceholder(ctx, rect, i, grade);
    // Grade wash over each panel so the photos share one Vice City grade.
    ctx.fillStyle = grade.wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    // Sunset sky wash rising from the bottom of each panel.
    const wash = ctx.createLinearGradient(0, rect.y + rect.h * 0.55, 0, rect.y + rect.h);
    wash.addColorStop(0, 'rgba(255,46,136,0)');
    wash.addColorStop(1, 'rgba(255,46,136,0.20)');
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  });

  // Whole-cover sky gradient at low alpha, so panels feel like one poster.
  const sky = ctx.createLinearGradient(0, 0, w, h);
  sky.addColorStop(0, grade.sky[0] + '00');
  sky.addColorStop(0.5, grade.sky[1] + '14');
  sky.addColorStop(1, grade.sky[2] + '30');
  ctx.fillStyle = sky;
  ctx.fillRect(ix, iy, iw, ih);

  if (state.grain !== false) drawGrain(ctx, w, h);
  drawTitle(ctx, w, h, state, grade);

  if (frame > 0) {
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(frame - 1, frame - 1, iw + 2, ih + 2);
  }
  return canvas;
}
