import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
const host=document.querySelector('.heroart');
if(host && !matchMedia('(prefers-reduced-motion: reduce)').matches){
 try{
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,0,8.2);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.domElement.id='prism-scene';renderer.domElement.setAttribute('aria-label','Animated three-dimensional prism');host.prepend(renderer.domElement);host.classList.add('webgl-ready');
  scene.add(new THREE.AmbientLight(0xffffff,.65));
  const warm=new THREE.PointLight(0xffb66f,28,18);warm.position.set(-3,2.8,4);scene.add(warm);
  const cool=new THREE.PointLight(0x658fff,34,18);cool.position.set(3,-1,3);scene.add(cool);
  const violet=new THREE.PointLight(0x7564ff,22,15);violet.position.set(0,3,-2);scene.add(violet);
  const group=new THREE.Group();scene.add(group);
  // Faceted triangular prism, bevelled for a glass-like edge highlight.
  const shape=new THREE.Shape();shape.moveTo(0,1.9);shape.lineTo(-1.65,-1.25);shape.lineTo(1.65,-1.25);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.62,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.12,bevelThickness:.12,curveSegments:8});geometry.center();
  const glass=new THREE.MeshPhysicalMaterial({color:0xf1d7ac,metalness:.36,roughness:.16,transmission:.32,thickness:1.15,ior:1.48,clearcoat:1,clearcoatRoughness:.08,transparent:true,opacity:.94,side:THREE.DoubleSide});
  const prism=new THREE.Mesh(geometry,glass);prism.rotation.set(.12,-.2,.08);group.add(prism);
  // Fine luminous edge geometry keeps the prism legible against black.
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,18),new THREE.LineBasicMaterial({color:0xf1d7ac,transparent:true,opacity:.78}));edges.scale.set(1.006,1.006,1.006);edges.rotation.copy(prism.rotation);group.add(edges);
  const innerShape=new THREE.Shape();innerShape.moveTo(0,1.05);innerShape.lineTo(-.92,-.78);innerShape.lineTo(.92,-.78);innerShape.closePath();
  const innerGeo=new THREE.ExtrudeGeometry(innerShape,{depth:.12,bevelEnabled:true,bevelSegments:2,bevelSize:.045,bevelThickness:.04});innerGeo.center();
  const inner=new THREE.Mesh(innerGeo,new THREE.MeshPhysicalMaterial({color:0x6c9ee4,metalness:.58,roughness:.2,emissive:0x171d5c,emissiveIntensity:.42,clearcoat:1}));inner.position.set(.02,.02,.38);group.add(inner);
  const ringMat=new THREE.MeshBasicMaterial({color:0x6c9ee4,transparent:true,opacity:.38});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.28,.004,8,180),ringMat);ring.rotation.set(.95,.25,.18);group.add(ring);
  const ring2=new THREE.Mesh(new THREE.TorusGeometry(2.52,.003,8,180),new THREE.MeshBasicMaterial({color:0xf1d7ac,transparent:true,opacity:.2}));ring2.rotation.set(1.2,-.3,-.25);group.add(ring2);
  // Sparse points of light add depth without turning the scene into a particle effect.
  const count=190,positions=new Float32Array(count*3);for(let i=0;i<count;i++){const radius=2.8+Math.random()*2.8,a=Math.random()*Math.PI*2;positions[i*3]=Math.cos(a)*radius;positions[i*3+1]=(Math.random()-.5)*5.4;positions[i*3+2]=(Math.random()-.5)*3.2;}
  const starsGeo=new THREE.BufferGeometry();starsGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xc7c9e8,size:.018,transparent:true,opacity:.7,sizeAttenuation:true}));scene.add(stars);
  let pointerX=0,pointerY=0,targetX=0,targetY=0;host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*.42;targetY=((e.clientY-r.top)/r.height-.5)*.3;},{passive:true});host.addEventListener('pointerleave',()=>{targetX=0;targetY=0;},{passive:true});
  const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};new ResizeObserver(resize).observe(host);
  const clock=new THREE.Clock();let frame=0;const animate=()=>{frame=requestAnimationFrame(animate);const t=clock.getElapsedTime();pointerX+=(targetX-pointerX)*.035;pointerY+=(targetY-pointerY)*.035;group.rotation.y=-.18+Math.sin(t*.22)*.12+pointerX;group.rotation.x=.08+Math.cos(t*.19)*.08+pointerY;group.rotation.z=Math.sin(t*.15)*.035;ring.rotation.z=.18+Math.sin(t*.12)*.08;ring2.rotation.y=-.3+t*.035;stars.rotation.y=t*.012;warm.intensity=25+Math.sin(t*.8)*4;renderer.render(scene,camera);};animate();
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);renderer.dispose();geometry.dispose();glass.dispose();},{once:true});
 }catch(e){console.warn('3D scene unavailable; using static brand mark.',e);}
}
