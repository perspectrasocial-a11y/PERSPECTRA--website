document.getElementById('year').textContent=new Date().getFullYear();
document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>document.getElementById('links').classList.remove('open')));
// Subtle pointer depth on selected work and service panels.
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 document.querySelectorAll('.service,.workcard').forEach(card=>{
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${-y*3}deg) rotateY(${x*3}deg) translateY(-3px)`});
  card.addEventListener('pointerleave',()=>card.style.transform='');
 });
}


// Soft matte-glass cursor light: a broad diffused glow that gently catches up with the pointer.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const glow = document.createElement('div');
  glow.id = 'perspectra-cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);

  let targetX = innerWidth * .5, targetY = innerHeight * .38;
  let currentX = targetX, currentY = targetY;
  let active = false, raf = 0;

  const move = (event) => {
    if(event.pointerType === 'touch') return;
    targetX = event.clientX;
    targetY = event.clientY;
    active = true;
    glow.classList.add('is-active');
  };
  const leave = () => {
    active = false;
    glow.classList.remove('is-active');
  };
  addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('pointerleave', leave);
  document.documentElement.addEventListener('pointerenter', () => {
    if (active) glow.classList.add('is-active');
  });

  const animate = () => {
    currentX += (targetX - currentX) * .095;
    currentY += (targetY - currentY) * .095;
    glow.style.setProperty('--glow-x', `${currentX}px`);
    glow.style.setProperty('--glow-y', `${currentY}px`);
    raf = requestAnimationFrame(animate);
  };
  animate();

  addEventListener('blur', leave);
})();


// Hover stays active until both pointer and keyboard focus leave the triggers.
(() => {
  const triggers = [...document.querySelectorAll('.brand, .heroart')];
  const hovered = new Set();
  function update() {
    const active = hovered.size > 0 || triggers.some(el => el.contains(document.activeElement));
    window.perspectraHover = active;
    document.body.classList.toggle('crystal-hover', active);
    window.dispatchEvent(new CustomEvent('perspectra:crystal-hover', {detail: {active}}));
  }
  triggers.forEach(el => {
    el.addEventListener('pointerenter', e => {if(e.pointerType !== 'touch'){hovered.add(el);update();}});
    el.addEventListener('pointerleave', () => {hovered.delete(el);update();});
    el.addEventListener('pointercancel', () => {hovered.delete(el);update();});
    el.addEventListener('focusin', update);
    el.addEventListener('focusout', () => queueMicrotask(update));
  });
  window.addEventListener('blur', () => {hovered.clear();window.perspectraHover=false;document.body.classList.remove('crystal-hover');window.dispatchEvent(new CustomEvent('perspectra:crystal-hover',{detail:{active:false}}));});
})();
