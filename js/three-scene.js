import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

// Scroll-reactive transparent glass prism and neural light field.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && !document.querySelector('#perspectra-lightfield')) {
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .1, 100);
    camera.position.set(0, 0, 9);
    const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.id = 'perspectra-lightfield';
    renderer.domElement.setAttribute('aria-hidden','true');
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff,.55));
    const warm = new THREE.PointLight(0xffc98e,42,22); warm.position.set(-3,3,5); scene.add(warm);
    const blue = new THREE.PointLight(0x659cff,48,22); blue.position.set(3,-2,4); scene.add(blue);
    const violet = new THREE.PointLight(0x7564ff,30,18); violet.position.set(0,3,-3); scene.add(violet);

    const rig = new THREE.Group(); scene.add(rig);
    const shape = new THREE.Shape();
    shape.moveTo(0,1.75); shape.lineTo(-1.48,-1.15); shape.lineTo(1.48,-1.15); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape,{depth:.72,bevelEnabled:true,bevelSegments:6,steps:1,bevelSize:.14,bevelThickness:.13});
    geo.center();
    const glass = new THREE.MeshPhysicalMaterial({
      color:0xe9f1ff, metalness:.08, roughness:.055, transmission:.96,
      thickness:2.2, ior:1.48, clearcoat:1, clearcoatRoughness:.025,
      attenuationColor:new THREE.Color('#9bbdff'), attenuationDistance:2.4,
      transparent:true, opacity:.96, side:THREE.DoubleSide
    });
    rig.add(new THREE.Mesh(geo,glass));
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo,12),
      new THREE.LineBasicMaterial({color:0xf4d8ad,transparent:true,opacity:.9}));
    edges.scale.setScalar(1.008); rig.add(edges);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(.62,0),
      new THREE.MeshPhysicalMaterial({color:0x789fff,metalness:.35,roughness:.1,transmission:.35,thickness:1.5,ior:1.6,emissive:0x1d2c80,emissiveIntensity:.45,clearcoat:1}));
    core.position.z=.42; rig.add(core);
    const halo = new THREE.Mesh(new THREE.RingGeometry(1.65,1.69,128),
      new THREE.MeshBasicMaterial({color:0x7da9ff,transparent:true,opacity:.22,side:THREE.DoubleSide}));
    halo.rotation.x=.4; rig.add(halo);

    // Spectral light rays refract out from the prism.
    const rays = new THREE.Group(); scene.add(rays);
    [0xf1d7ac,0xfaa056,0x6c9ee4,0x685be6].forEach((c,i)=>{
      const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(2.1+i*.34,.24-i*.17,-.1)]);
      rays.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:c,transparent:true,opacity:.34})));
    });

    // Neural network: connected nodes with a subtle, drifting signal field.
    const nodes=[];
    for(let i=0;i<54;i++) nodes.push(new THREE.Vector3((Math.random()-.5)*7.2,(Math.random()-.5)*5.2,(Math.random()-.5)*2.5-1));
    const nodeGeo=new THREE.BufferGeometry().setFromPoints(nodes);
    const nodeCloud=new THREE.Points(nodeGeo,new THREE.PointsMaterial({color:0xb6c9ff,size:.035,transparent:true,opacity:.68}));
    scene.add(nodeCloud);
    const links=[];
    nodes.forEach((a,i)=>nodes.forEach((b,j)=>{if(j>i&&a.distanceTo(b)<1.45)links.push(a.x,a.y,a.z,b.x,b.y,b.z)}));
    const linkGeo=new THREE.BufferGeometry(); linkGeo.setAttribute('position',new THREE.Float32BufferAttribute(links,3));
    const network=new THREE.LineSegments(linkGeo,new THREE.LineBasicMaterial({color:0x7895db,transparent:true,opacity:.12}));
    scene.add(network);

    let scrollTarget=0,scrollSmooth=0,px=0,py=0;
    const updateScroll=()=>scrollTarget=Math.min(1,Math.max(0,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));
    addEventListener('scroll',updateScroll,{passive:true}); updateScroll();
    addEventListener('pointermove',e=>{px=(e.clientX/innerWidth-.5)*.35;py=(e.clientY/innerHeight-.5)*.25},{passive:true});
    addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
    const clock=new THREE.Clock(); let raf;
    const animate=()=>{
      raf=requestAnimationFrame(animate); const t=clock.getElapsedTime();
      scrollSmooth+=(scrollTarget-scrollSmooth)*.045;
      rig.position.set(THREE.MathUtils.lerp(2.45,-2.35,scrollSmooth)+Math.sin(scrollSmooth*Math.PI*3)*.32+px,
                       THREE.MathUtils.lerp(1.45,-1.35,scrollSmooth)-py,0);
      rig.scale.setScalar(THREE.MathUtils.lerp(.82,.62,scrollSmooth));
      rig.rotation.set(.1+Math.cos(t*.26)*.1+py*.5,-.22+Math.sin(t*.32)*.13+px*.5,Math.sin(t*.18)*.04);
      core.rotation.set(t*.22,-t*.31,0); halo.rotation.z=t*.12;
      rays.position.copy(rig.position); rays.rotation.copy(rig.rotation); rays.scale.copy(rig.scale);
      nodeCloud.rotation.y=network.rotation.y=Math.sin(t*.08)*.07;
      warm.intensity=38+Math.sin(t*.9)*8; blue.intensity=44+Math.cos(t*.7)*9;
      renderer.render(scene,camera);
    };
    animate();
    addEventListener('pagehide',()=>{cancelAnimationFrame(raf);renderer.dispose();geo.dispose();glass.dispose();nodeGeo.dispose();linkGeo.dispose()},{once:true});
  } catch(err) { console.warn('PERSPECTRA 3D light field unavailable.',err); }
}
