// Vice City Cover Lab — the cover renderer. paintCover() turns the editor
// state (four photo slots, one crop per panel, layout, grade, caption) into
// poster art on a canvas: a multi-panel GTA-style poster grid, a Vice City
// sunset or neon grade, bold Anton lettering with a hard outline, a white
// poster frame, and a seeded film-grain finish.

export const EXPORT_SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

/** Layouts: each maps a canvas size to panel rects {x, y, w, h}. */
export const PANEL_LAYOUTS = {
  hero: (w, h) => [{ x: 0, y: 0, w, h }],
  duo: (w, h) => [
    { x: 0, y: 0, w: w * 0.52, h },
    { x: w * 0.52, y: 0, w: w * 0.48, h },
  ],
  grid: (w, h) => [
    { x: 0, y: 0, w: w / 2, h: h / 2 },
    { x: w / 2, y: 0, w: w / 2, h: h / 2 },
    { x: 0, y: h / 2, w: w / 2, h: h / 2 },
    { x: w / 2, y: h / 2, w: w / 2, h: h / 2 },
  ],
  strip: (w, h) => [
    { x: 0, y: 0, w: w / 3, h },
    { x: w / 3, y: 0, w: w / 3, h },
    { x: (w / 3) * 2, y: 0, w: w / 3, h },
  ],
};

/** Colour grades: bottom wash, panel tint, accent ink, title scrim, sun glow. */
export const COLOUR_GRADES = {
  sunset: {
    wash: ['rgba(255,122,61,0)', 'rgba(255,46,136,0.34)'],
    tint: 'rgba(255,122,61,0.16)',
    accent: '#ff2e88',
    scrim: 'rgba(24,4,32,0.78)',
    glow: 'rgba(255,150,70,0.20)',
  },
  neon: {
    wash: ['rgba(45,226,197,0)', 'rgba(255,46,136,0.38)'],
    tint: 'rgba(123,47,247,0.20)',
    accent: '#2de2c5',
    scrim: 'rgba(8,2,24,0.80)',
    glow: 'rgba(255,46,136,0.22)',
  },
  dusk: {
    wash: ['rgba(255,190,80,0)', 'rgba(255,122,61,0.30)'],
    tint: 'rgba(255,190,80,0.14)',
    accent: '#ffbe50',
    scrim: 'rgba(20,6,26,0.78)',
    glow: 'rgba(255,190,80,0.24)',
  },
  vice: {
    wash: ['rgba(255,93,162,0)', 'rgba(255,46,136,0.40)'],
    tint: 'rgba(255,93,162,0.22)',
    accent: '#ff5da2',
    scrim: 'rgba(30,2,28,0.80)',
    glow: 'rgba(255,93,162,0.26)',
  },
};

/** Panel rects for a layout, shrunk by the white gutter between panels. */
export function layoutPanels(layout, w, h) {
  const gutter = Math.max(6, Math.round(w * 0.007));
  return PANEL_LAYOUTS[layout](w, h).map((r) => ({
    x: r.x + gutter / 2,
    y: r.y + gutter / 2,
    w: r.w - gutter,
    h: r.h - gutter,
  }));
}

/** Cover-fits one photo into a panel rect, honouring zoom and pan offsets. */
export function paintPanelPhoto(ctx, photo, rect, crop) {
  const { zoom, ox, oy } = crop;
  const scale = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight) * zoom;
  const pw = photo.naturalWidth * scale;
  const ph = photo.naturalHeight * scale;
  const dx = rect.x + (rect.w - pw) / 2 + ox * rect.w;
  const dy = rect.y + (rect.h - ph) / 2 + oy * rect.h;
  ctx.drawImage(photo, dx, dy, pw, ph);
}

/** An empty panel: deep violet gradient plus a "your photo here" invitation. */
export function paintEmptyPanel(ctx, rect) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, '#3a1552');
  g.addColorStop(1, '#12041f');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `${Math.max(18, rect.w * 0.05)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('YOUR PHOTO HERE', rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.textBaseline = 'alphabetic';
}

/** The grade: a warm sun glow, a wash rising from the bottom, tint, vignette. */
export function paintGrade(ctx, w, h, grade) {
  const glow = ctx.createRadialGradient(
    w * 0.72, h * 0.16, 0,
    w * 0.72, h * 0.16, Math.max(w, h) * 0.55,
  );
  glow.addColorStop(0, grade.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const wash = ctx.createLinearGradient(0, h * 0.3, 0, h);
  wash.addColorStop(0, grade.wash[0]);
  wash.addColorStop(1, grade.wash[1]);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, w, h);

  const vig = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,2,20,0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

/** A fixed-seed speckle pattern, so the grain is identical on every paint. */
let grainPattern = null;
function specklePattern(ctx) {
  if (grainPattern) return grainPattern;
  const tile = document.createElement('canvas');
  tile.width = 140;
  tile.height = 140;
  const tctx = tile.getContext('2d');
  let seed = 20261119;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const img = tctx.createImageData(140, 140);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(next() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  grainPattern = ctx.createPattern(tile, 'repeat');
  return grainPattern;
}

/** Film grain: the seeded speckle tiled over the cover at low opacity. */
export function paintGrain(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = specklePattern(ctx);
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Largest Anton size that fits `text` inside maxWidth, starting from `start`. */
export function fitCaptionSize(ctx, text, maxWidth, start) {
  let size = start;
  ctx.font = `${size}px Anton, sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > 16) {
    size -= 2;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  return size;
}

/** The caption block: letter-spaced sub-caption, big outlined title, accent bar. */
export function paintCaption(ctx, w, h, title, subtitle, grade) {
  const scrim = ctx.createLinearGradient(0, h * 0.62, 0, h);
  scrim.addColorStop(0, 'rgba(10,2,20,0)');
  scrim.addColorStop(1, grade.scrim);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);

  const text = title.trim().toUpperCase();
  const sub = subtitle.trim().toUpperCase();
  const cx = w / 2;
  let titleBaseline = h - h * 0.055;

  if (sub) {
    const subSize = Math.max(16, h * 0.024);
    ctx.font = `700 ${subSize}px system-ui, sans-serif`;
    const spaced = sub.split('').join(' ');
    ctx.textAlign = 'center';
    ctx.fillStyle = grade.accent;
    ctx.fillText(spaced, cx, h - h * 0.185);
    titleBaseline = h - h * 0.045;
  }
  if (!text) return;

  const size = fitCaptionSize(ctx, text, w * 0.92, h * 0.115);
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(8,2,16,0.9)';
  ctx.lineWidth = Math.max(4, size * 0.09);
  ctx.strokeText(text, cx, titleBaseline);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, cx, titleBaseline);

  const barW = Math.min(ctx.measureText(text).width * 0.55, w * 0.5);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(cx - barW / 2, titleBaseline + size * 0.16, barW, Math.max(5, size * 0.07));
}

/** The place pill in the top-left corner, with the editor's own label text. */
export function paintPill(ctx, w, h, label, grade) {
  const text = (label.trim() || 'VICE CITY, USA').toUpperCase();
  const size = Math.max(15, h * 0.02);
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  const padX = size * 0.9;
  const pillW = ctx.measureText(text).width + padX * 2;
  const pillH = size * 2.1;
  const x = w * 0.028;
  const y = h * 0.028;
  ctx.fillStyle = 'rgba(8,2,16,0.82)';
  ctx.beginPath();
  ctx.roundRect(x, y, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = grade.accent;
  ctx.beginPath();
  ctx.arc(x + padX * 0.55, y + pillH / 2, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX * 1.15, y + pillH / 2 + 1);
  ctx.textBaseline = 'alphabetic';
}

/**
 * Paints the whole cover onto `canvas` at its own size.
 * state: { photos, panels, layout, grade, title, subtitle, pill, grain }
 *   photos: array of HTMLImageElement | null (slots 0..3)
 *   panels: array per layout panel of { photo, zoom, ox, oy }
 *   grade: a COLOUR_GRADES key; title/subtitle/pill: caption strings.
 */
export function paintCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const grade = COLOUR_GRADES[state.grade] ?? COLOUR_GRADES.sunset;
  ctx.fillStyle = '#14041f';
  ctx.fillRect(0, 0, w, h);

  const rects = layoutPanels(state.layout, w, h);
  rects.forEach((rect, i) => {
    const crop = state.panels[i] ?? { photo: 0, zoom: 1, ox: 0, oy: 0 };
    const photo = state.photos[crop.photo] ?? null;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (photo) paintPanelPhoto(ctx, photo, rect, crop);
    else paintEmptyPanel(ctx, rect);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = Math.max(2, w * 0.002);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });

  paintGrade(ctx, w, h, grade);
  if (state.grain) paintGrain(ctx, w, h);

  // White poster frame with a black keyline inside it.
  const frame = Math.max(8, Math.round(w * 0.008));
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, frame);
  ctx.fillRect(0, h - frame, w, frame);
  ctx.fillRect(0, 0, frame, h);
  ctx.fillRect(w - frame, 0, frame, h);
  ctx.strokeStyle = 'rgba(8,2,16,0.85)';
  ctx.lineWidth = Math.max(2, w * 0.0015);
  ctx.strokeRect(frame * 1.6, frame * 1.6, w - frame * 3.2, h - frame * 3.2);

  paintPill(ctx, w, h, state.pill, grade);
  paintCaption(ctx, w, h, state.title, state.subtitle, grade);
}
