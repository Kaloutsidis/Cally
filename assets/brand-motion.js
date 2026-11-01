/* Small decorative offsets follow scroll input; there is no autonomous animation. */
(() => {
  'use strict';
  if (!document.body.classList.contains('brand-refresh')) return;
  const layers = [
    ...Array.from(document.querySelectorAll('.scene-environment'), element => ({ element, area: element.closest('[data-brand-scene]'), distance: 12 })),
    ...Array.from(document.querySelectorAll('.hero-phone-main'), element => ({ element, area: element.closest('.hero-stage'), distance: 8 })),
    ...Array.from(document.querySelectorAll('.hero-phone-side'), element => ({ element, area: element.closest('.hero-stage'), distance: -6 }))
  ].filter(layer => layer.area);
  if (!layers.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const cancelPending = () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  };
  function render() {
    frame = 0;
    if (document.hidden || reduced.matches) return;
    const viewport = window.innerHeight;
    const bounds = new Map();
    // Read each area before writing any styles, including the two shared phone layers.
    layers.forEach(layer => {
      if (!bounds.has(layer.area)) bounds.set(layer.area, layer.area.getBoundingClientRect());
    });
    layers.forEach(({ element, area, distance }) => {
      const box = bounds.get(area);
      if (box.bottom < 0 || box.top > viewport) return;
      const progress = Math.max(-1, Math.min(1, (viewport - box.top * 2 - box.height) / (viewport + box.height)));
      element.style.setProperty('--scroll-shift', `${(progress * distance).toFixed(2)}px`);
    });
  }
  function schedule() {
    if (!frame && !document.hidden && !reduced.matches) frame = window.requestAnimationFrame(render);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', () => {
    cancelPending();
    if (reduced.matches) layers.forEach(({ element }) => element.style.removeProperty('--scroll-shift'));
    else schedule();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelPending();
    else schedule();
  });
  window.addEventListener('pagehide', cancelPending);
  schedule();
})();
