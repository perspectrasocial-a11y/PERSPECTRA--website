document.getElementById('year').textContent=new Date().getFullYear();
document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>document.getElementById('links').classList.remove('open')));
// Subtle pointer depth on selected work and service panels.
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 document.querySelectorAll('.service,.workcard').forEach(card=>{
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${-y*3}deg) rotateY(${x*3}deg) translateY(-3px)`});
  card.addEventListener('pointerleave',()=>card.style.transform='');
 });
}


// Reliable desktop pointer tracking for the matte-glass light.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none)').matches) return;
  const glow=document.createElement('div');
  glow.id='perspectra-cursor-glow';
  glow.setAttribute('aria-hidden','true');
  document.body.appendChild(glow);
  let x=innerWidth*.5,y=innerHeight*.4,tx=x,ty=y,visible=false;
  const move=e=>{tx=e.clientX;ty=e.clientY;visible=true;glow.classList.add('is-active');};
  const leave=()=>{visible=false;glow.classList.remove('is-active');};
  window.addEventListener('pointermove',move,{passive:true});
  window.addEventListener('blur',leave);
  document.addEventListener('mouseleave',leave);
  document.addEventListener('mouseenter',()=>{if(visible)glow.classList.add('is-active');});
  const tick=()=>{
    x+=(tx-x)*.14;y+=(ty-y)*.14;
    glow.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  };
  tick();
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
