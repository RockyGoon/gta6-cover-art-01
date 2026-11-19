// Fixed scenes for screenshots: ?shot=cover shows the cover alone, edge to
// edge; ?shot=editor shows the full editor with a photo loaded. The query
// picks the sample, layout, grade, size and caption. window.__shotReady is
// set once the cover has painted, so the screenshot runner knows the frame
// is final.
const SAMPLE_NAMES = ['boulevard', 'beach', 'keys', 'skyline'];

/** How the four samples spread across the panels of each layout. */
const PANEL_SPREAD = {
  hero: [0],
  duo: [0, 1],
  grid: [0, 1, 2, 3],
  strip: [0, 1, 2],
};

export async function runScene(shot, query, state, hooks) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const photo = query.get('photo') ?? 'skyline';
  const caption = query.get('caption') ?? 'VICE CITY';
  const sub = query.get('sub') ?? 'TWO OUTLAWS. ONE SUNSET CITY.';
  const pill = query.get('pill') ?? 'VICE CITY, USA';
  const size = query.get('size') ?? '1920x1080';
  const layout = query.get('layout') ?? 'grid';
  const grade = query.get('grade') ?? 'sunset';

  document.getElementById('titleText').value = caption;
  document.getElementById('subText').value = sub;
  document.getElementById('pillText').value = pill;
  state.title = caption;
  state.subtitle = sub;
  state.pill = pill;
  hooks.applySize(size);
  hooks.applyLayout(layout);
  hooks.applyGrade(grade);
  // Load all four Vice City samples into the four slots and spread them
  // across the panels, so a multi-panel layout reads as a poster, not the
  // same photo repeated; the queried photo leads in slot 0.
  const order = [photo, ...SAMPLE_NAMES.filter((n) => n !== photo)];
  await Promise.all(order.map((name, slot) => hooks.loadSamplePhoto(name, slot)));
  const spread = PANEL_SPREAD[layout] ?? [0];
  state.panels.forEach((p, i) => { p.photo = spread[i % spread.length]; });
  await document.fonts.load('80px Anton');
  await document.fonts.ready;
  hooks.repaint();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
