document.getElementById('year').textContent=new Date().getFullYear();
document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>document.getElementById('links').classList.remove('open')));
// Subtle pointer depth on selected work and service panels.
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
 document.querySelectorAll('.service,.workcard').forEach(card=>{
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateX(${-y*3}deg) rotateY(${x*3}deg) translateY(-3px)`});
  card.addEventListener('pointerleave',()=>card.style.transform='');
 });
}
