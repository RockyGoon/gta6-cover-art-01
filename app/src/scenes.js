// scenes.js — fixed scenes for screenshots, driven by the ?shot= query string.
// ?shot=cover shows the finished cover alone (body.shot-cover hides the editor).
// ?shot=editor shows the editor with photos loaded. `load` fills the editor state
// from sample photos and a caption, then window.__shotReady is set once painted.
export async function runShot(shot, query, load) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const layout = query.get('layout') || 'grid3';
  const grade = query.get('grade') || 'sunset';
  const size = query.get('size') || 'wide';
  const title = query.get('title') || 'LEONIDA AFTER DARK';
  const subtitle = query.get('subtitle') || 'Lucia & Jason · Vice City · 19 Nov 2026';
  const pill = query.get('pill') || 'GTA VI';
  const photos = (query.get('photos') || 'beach,boulevard,keys,skyline,beach,keys').split(',');
  await load({ layout, grade, size, title, subtitle, pill, photos });
  await document.fonts.ready;
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
