import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/environments/RoomEnvironment.js';

// Premium optical-glass scene: a faceted crystal, spectral dispersion and a restrained neural field.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'perspectra-lightfield';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  let renderer, raf, disposed = false;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, .1, 100);
    camera.position.set(0, 0, 10);

    // An environment map is essential for believable glass reflections.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), .04).texture;
    scene.environment = env;

    scene.add(new THREE.AmbientLight(0xffffff, .28));
    const key = new THREE.DirectionalLight(0xffe2bb, 4.5); key.position.set(-4, 5, 7); scene.add(key);
    const cool = new THREE.PointLight(0x729dff, 34, 24); cool.position.set(4, -1, 4); scene.add(cool);
    const warm = new THREE.PointLight(0xffa34e, 46, 22); warm.position.set(-3, 1, 3); scene.add(warm);
    const rim = new THREE.PointLight(0x9c83ff, 18, 18); rim.position.set(1, 4, -2); scene.add(rim);

    const crystalRig = new THREE.Group(); scene.add(crystalRig);

    // Python-generated spectral caustics texture, softly layered behind the crystal.
    const causticTexture = new THREE.TextureLoader().load('assets/spectral-caustics.png');
    causticTexture.colorSpace = THREE.SRGBColorSpace;
    const causticMaterial = new THREE.MeshBasicMaterial({
      map: causticTexture, transparent: true, opacity: .42,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    const causticSheet = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 5.8), causticMaterial);
    causticSheet.position.set(0, 0, -1.7);
    scene.add(causticSheet);

    // A sharply cut triangular optical crystal, with a deep body and polished bevelled edges.
    const h = 2.05, w = 1.72, d = .92;
    const verts = [
      new THREE.Vector3(0,h,0), new THREE.Vector3(-w,-.95,d), new THREE.Vector3(w,-.95,d),
      new THREE.Vector3(0,h,-d), new THREE.Vector3(-w,-.95,-d), new THREE.Vector3(w,-.95,-d)
    ];
    const faces = [
      [0,1,2],[3,5,4], [0,3,4],[0,4,1], [0,2,5],[0,5,3],
      [1,4,5],[1,5,2]
    ];
    const positions=[];
    faces.forEach(f=>f.forEach(i=>positions.push(verts[i].x,verts[i].y,verts[i].z)));
    const crystalGeo=new THREE.BufferGeometry();
    crystalGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    crystalGeo.computeVertexNormals();
    const crystalMat=new THREE.MeshPhysicalMaterial({
      color:0xeaf1ff, metalness:.02, roughness:.035, transmission:1,
      thickness:2.8, ior:1.52, dispersion:.12, envMapIntensity:1.9,
      clearcoat:1, clearcoatRoughness:.015, attenuationColor:new THREE.Color('#d9e7ff'),
      attenuationDistance:2.2, side:THREE.DoubleSide
    });
    const crystal=new THREE.Mesh(crystalGeo,crystalMat); crystalRig.add(crystal);

    // Fine polished edge glints, not a wireframe cage.
    const edgeGeo=new THREE.EdgesGeometry(crystalGeo, 8);
    const edgeMat=new THREE.LineBasicMaterial({color:0xf4e7d5,transparent:true,opacity:.62});
    const edgeLines=new THREE.LineSegments(edgeGeo,edgeMat); crystalRig.add(edgeLines);

    // Internal cut planes create the multi-faceted gemstone highlight.
    const inner=new THREE.Mesh(new THREE.OctahedronGeometry(.53,0),
      new THREE.MeshPhysicalMaterial({color:0xe6efff,metalness:.1,roughness:.06,transmission:.72,thickness:1.6,ior:1.58,envMapIntensity:1.6,clearcoat:1}));
    inner.position.set(.02,.04,.05); crystalRig.add(inner);

    // Soft spectral beam shader: a narrow white core with a dispersed rainbow fringe.
    const beamMat = new THREE.ShaderMaterial({
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide,
      uniforms:{uTime:{value:0},uStrength:{value:.82}},
      vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`varying vec2 vUv; uniform float uTime; uniform float uStrength;
        vec3 spectrum(float x){
          return clamp(vec3(
            1.5-abs(4.0*x-3.0),
            1.5-abs(4.0*x-2.0),
            1.5-abs(4.0*x-1.0)),0.0,1.0);
        }
        void main(){
          float across=abs(vUv.y-.5)*2.0;
          float core=exp(-pow(across*13.0,2.0));
          float fringe=exp(-pow((across-.24)*8.0,2.0));
          float fade=smoothstep(0.0,.12,vUv.x)*(1.0-smoothstep(.72,1.0,vUv.x));
          float shift=fract(vUv.x*.18+uTime*.012);
          vec3 col=mix(vec3(.92,.83,.68),spectrum(shift),.68);
          float alpha=(core*.72+fringe*.36)*fade*uStrength;
          gl_FragColor=vec4(col,alpha);
        }`
    });
    function beam(width,length,rotation,z,opacity=1){
      const mesh=new THREE.Mesh(new THREE.PlaneGeometry(length,width),beamMat.clone());
      mesh.rotation.z=rotation; mesh.position.z=z; mesh.material.uniforms.uStrength.value=opacity;
      scene.add(mesh); return mesh;
    }
    const beams=[
      beam(.32,10.5,-.43,-1,.7),
      beam(.18,8.2,.17,-.9,.8),
      beam(.52,9.0,.46,-1.2,.34),
      beam(.13,7.5,-.82,-.8,.55)
    ];
    const glowMat=new THREE.SpriteMaterial({map:(()=>{
      const c=document.createElement('canvas');c.width=c.height=128;
      const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
      g.addColorStop(0,'rgba(255,239,205,0.95)');g.addColorStop(.13,'rgba(255,183,91,0.45)');
      g.addColorStop(.48,'rgba(115,142,255,0.12)');g.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=g;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
    })(),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
    const flare=new THREE.Sprite(glowMat);flare.scale.set(4.6,4.6,1);scene.add(flare);

    // Fine neural connections stay in the background, like a faint field of intelligence.
    const points=[];
    for(let i=0;i<44;i++) points.push(new THREE.Vector3((Math.random()-.5)*10,(Math.random()-.5)*6,(Math.random()-.5)*2-2));
    const pointGeo=new THREE.BufferGeometry().setFromPoints(points);
    const pointCloud=new THREE.Points(pointGeo,new THREE.PointsMaterial({color:0x9db7ed,size:.022,transparent:true,opacity:.36}));
    scene.add(pointCloud);
    const segments=[];
    points.forEach((a,i)=>points.forEach((b,j)=>{if(j>i&&a.distanceTo(b)<1.55)segments.push(a.x,a.y,a.z,b.x,b.y,b.z)}));
    const netGeo=new THREE.BufferGeometry();netGeo.setAttribute('position',new THREE.Float32BufferAttribute(segments,3));
    const network=new THREE.LineSegments(netGeo,new THREE.LineBasicMaterial({color:0x829bd1,transparent:true,opacity:.075}));
    scene.add(network);

    let scroll=0,smooth=0,mouseX=0,mouseY=0;
    const updateScroll=()=>{scroll=Math.max(0,Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));};
    addEventListener('scroll',updateScroll,{passive:true});updateScroll();
    addEventListener('pointermove',e=>{mouseX=(e.clientX/innerWidth-.5)*.24;mouseY=(e.clientY/innerHeight-.5)*.18},{passive:true});
    addEventListener('resize',()=>{
      camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight);
    });
    const clock=new THREE.Clock();
    const animate=()=>{
      if(disposed)return;
      raf=requestAnimationFrame(animate);
      const t=clock.getElapsedTime();smooth+=(scroll-smooth)*.035;
      // Crystal travels from upper-right towards lower-left as the visitor scrolls.
      crystalRig.position.set(2.25-smooth*4.25+mouseX,1.0-smooth*2.0-mouseY,0);
      crystalRig.scale.setScalar(.88-smooth*.13);
      crystalRig.rotation.set(.08+Math.sin(t*.19)*.055+mouseY,-.22+Math.sin(t*.23)*.11+mouseX,Math.sin(t*.14)*.025);
      inner.rotation.set(t*.18,t*-.24,t*.09);
      flare.position.set(crystalRig.position.x-.22,crystalRig.position.y-.12,-.4);
      causticSheet.position.x = crystalRig.position.x * .28;
      causticSheet.position.y = crystalRig.position.y * .22;
      causticSheet.rotation.z = -.08 + Math.sin(t*.12)*.025;
      causticMaterial.opacity = .34 + Math.sin(t*.35)*.045;
      flare.material.rotation=t*.025;
      beams.forEach((b,i)=>{b.position.x=crystalRig.position.x+(i-1.5)*.15;b.position.y=crystalRig.position.y+(i-1.5)*.12;b.material.uniforms.uTime.value=t;b.material.uniforms.uStrength.value=(.65+Math.sin(t*.45+i)*.12)*(1-smooth*.08)});
      pointCloud.rotation.y=network.rotation.y=Math.sin(t*.07)*.035;
      warm.intensity=42+Math.sin(t*.8)*7;cool.intensity=30+Math.cos(t*.6)*7;
      renderer.render(scene,camera);
    };
    animate();
    addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(raf);renderer.dispose();pmrem.dispose();env.dispose();causticTexture.dispose();causticMaterial.dispose();crystalGeo.dispose();crystalMat.dispose();edgeGeo.dispose();pointGeo.dispose();netGeo.dispose();},{once:true});
  } catch(error) {
    console.warn('PERSPECTRA optical scene could not initialise:',error);
    canvas.remove();
  }
})();
