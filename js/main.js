document.getElementById('year').textContent = new Date().getFullYear();
document.querySelectorAll('.links a').forEach(a => a.addEventListener('click', () => document.getElementById('links').classList.remove('open')));
// Move light across the unchanged logo; no geometry, scaling or click animation.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.logo-light').forEach(logo => {
  const target = logo.closest('.brand') || logo;
  target.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    const rect = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
    const y = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100));
    logo.style.setProperty('--light-x', `${x}%`);
    logo.style.setProperty('--light-y', `${y}%`);
  }, {passive:true});
});
