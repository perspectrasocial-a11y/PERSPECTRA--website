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

  addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    glow.remove();
  }, { once: true });
})();


// Clicking the brand mark or hero prism triggers a 3D crystal pop and optical flare.
(() => {
  const triggers = document.querySelectorAll('.brand, .heroart img');
  triggers.forEach((el) => {
    el.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('perspectra:crystal-pop'));
      document.body.classList.remove('crystal-click-flash');
      void document.body.offsetWidth;
      document.body.classList.add('crystal-click-flash');
      window.setTimeout(() => document.body.classList.remove('crystal-click-flash'), 850);
    });
  });
})();
