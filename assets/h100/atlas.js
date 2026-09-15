// The text catalogue is the source of truth and remains usable without WebGL.
const $ = s => document.querySelector(s);
const entries = [...document.querySelectorAll('.part-entry')].map(el => ({
 id: el.id.slice(5), scale: el.dataset.scale, system: el.dataset.system,
 title: el.querySelector('summary').firstChild.textContent,
 spec: el.querySelector('summary span').textContent,
 summary: el.querySelector('.part-summary').textContent, el
}));
const byId = new Map(entries.map(p => [p.id,p]));
const scaleNames = {package:'Package',gpu:'GPU die',sm:'One SM'};
const captions = {package:'SXM module · conceptual package stack',gpu:'132 SMs · functional diagram',sm:'One SM · functional diagram'};
const systems = {structure:'Packaging',compute:'Compute',memory:'Memory',io:'Data movement',power:'Power & cooling',control:'Control & features'};
let scale='package', selected='die', isolated=false, hiddenSystems=new Set(), coolerVisible=false;
let sceneAPI=null;
function updateResults(){
 const query=$('#part-search').value.trim().toLowerCase();
 const filtered=entries.filter(p=>query ? `${p.title} ${p.spec} ${p.summary} ${p.system}`.toLowerCase().includes(query) : p.scale===scale);
 const nodes=filtered.map(p=>{
  const b=document.createElement('button');b.type='button';b.textContent=p.title;b.dataset.part=p.id;b.setAttribute('aria-pressed',String(selected===p.id));
  if(query){const s=document.createElement('span');s.textContent=scaleNames[p.scale];b.append(s)}
  return b;
 });
 $('#part-results').replaceChildren(...nodes);
 $('#result-count').textContent=filtered.length ? `${filtered.length} ${query?'matching':'selectable'} parts` : 'No matching parts. Try “memory” or “power”.';
}
function updateLayers(){
 const group=$('#layer-controls');group.replaceChildren();
 for(const [key,title] of Object.entries(systems)){
  if(!entries.some(p=>p.scale===scale&&p.system===key))continue;
  const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=!hiddenSystems.has(key);input.dataset.system=key;label.append(input,document.createTextNode(title));group.append(label);
 }
 if(scale==='package'){
  const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=coolerVisible;input.id='cooler-visible';label.append(input,document.createTextNode('Cooling assembly'));group.append(label);
 }
}
function applyVisibility(){sceneAPI?.update();$('#isolate').setAttribute('aria-pressed',String(isolated));$('#isolate').textContent=isolated?'Show context':'Isolate part'}
function selectPart(id,{scroll=false}={}){
 const p=byId.get(id);if(!p)return;
 if(scale!==p.scale){scale=p.scale;sceneAPI?.setScale(scale);updateLayers()}
 selected=id;hiddenSystems.delete(p.system);if(id==='cooler')coolerVisible=true;
 document.querySelectorAll('[data-scale]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.scale===scale))});
 $('#selected-part').replaceChildren();
 const heading=document.createElement('h3');heading.textContent=p.title;
 const spec=document.createElement('p');spec.className='part-spec';spec.textContent=p.spec;
 const description=document.createElement('p');description.textContent=p.summary;
 $('#selected-part').append(heading,spec,description);
 $('#selection-label').textContent=p.title;$('#view-caption').textContent=captions[scale];
 $('#catalogue-link').href=`#part-${id}`;
 updateResults();updateLayers();applyVisibility();
 if(scroll)$('#explore').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
$('#part-search').addEventListener('input',updateResults);
document.addEventListener('click',e=>{
 const target=e.target.closest('[data-part]');if(target)selectPart(target.dataset.part,{scroll:!target.closest('.inspector')});
 const b=e.target.closest('.scale-buttons button');if(b){isolated=false;selectPart({package:'die',gpu:'tpc',sm:'tensor'}[b.dataset.scale])}
});
$('#layer-controls').addEventListener('change',e=>{
 if(e.target.id==='cooler-visible')coolerVisible=e.target.checked;
 else if(e.target.dataset.system){if(e.target.checked)hiddenSystems.delete(e.target.dataset.system);else hiddenSystems.add(e.target.dataset.system)}
 applyVisibility();
});
$('#show-all').addEventListener('click',()=>{hiddenSystems.clear();isolated=false;coolerVisible=true;updateLayers();applyVisibility()});
$('#isolate').addEventListener('click',()=>{isolated=!isolated;applyVisibility()});
$('#explode').addEventListener('input',()=>{$('#explode-value').textContent=`${$('#explode').value}%`;sceneAPI?.update()});
$('#reset-view').addEventListener('click',()=>{hiddenSystems.clear();isolated=false;coolerVisible=false;$('#explode').value='35';$('#explode-value').textContent='35%';sceneAPI?.reset();updateLayers();applyVisibility()});
$('#catalogue-link').addEventListener('click',()=>byId.get(selected).el.open=true);
$('#expand-parts').addEventListener('click',()=>entries.forEach(p=>p.el.open=true));
$('#collapse-parts').addEventListener('click',()=>entries.forEach(p=>p.el.open=false));
function followHash(){const p=byId.get(location.hash.replace('#part-',''));if(p){p.el.open=true;selectPart(p.id)}}
addEventListener('hashchange',followHash);selectPart('die');followHash();
// Bounds, not predictions: decimal TB/s × FLOP/byte = TFLOP/s.
const format=(n,d=1)=>n.toLocaleString('en-US',{maximumFractionDigits:d});
function roofline(){
 const intensity=10**Number($('#intensity').value),peak=Number($('#precision').value),ceiling=Math.min(peak,3.35*intensity);
 $('#intensity-value').textContent=`${format(intensity)} FLOP/byte`;
 $('#roofline-result').textContent=`${format(ceiling)} TFLOPS`;
 $('#roofline-bound').textContent=3.35*intensity<peak?'HBM bandwidth ceiling':'Compute ceiling';
 $('#roofline-equation').textContent=`min(${format(peak,0)}, 3.35 × ${format(intensity)}) = ${format(ceiling)} TFLOPS`;
 $('#roofline-balance').textContent=`The two ceilings meet near ${format(peak/3.35,0)} FLOP/byte.`;
 const x=n=>64+(Math.log10(n)+1)/5*552,y=n=>212-(Math.log10(n)+1)/5*188;
 $('#roofline-path').setAttribute('d',`M${x(.1)},${y(.335)} L${x(peak/3.35)},${y(peak)} L${x(1e4)},${y(peak)}`);
 $('#roofline-guide').setAttribute('d',`M${x(intensity)},212V${y(ceiling)}`);
 $('#roofline-point').setAttribute('cx',x(intensity));$('#roofline-point').setAttribute('cy',y(ceiling));
 $('#roofline-chart').setAttribute('aria-label',`Ideal roofline. At ${format(intensity)} FLOP per byte, the upper bound is ${format(ceiling)} TFLOPS. ${$('#roofline-bound').textContent}.`);
}
$('#intensity').addEventListener('input',roofline);$('#precision').addEventListener('change',roofline);
document.querySelectorAll('[data-ai]').forEach(b=>b.addEventListener('click',()=>{$('#intensity').value=Math.log10(Number(b.dataset.ai));roofline()}));roofline();
// Lazy-load local modules. A failed import or unavailable GPU never hides the article.
async function init3D(){
 const T=await import('./vendor/three.module.js');const {OrbitControls}=await import('./vendor/OrbitControls.js');
 const container=$('#viewport');
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;
 renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Interactive schematic H100 model. Use the named part buttons for keyboard access.');container.prepend(renderer.domElement);
 const scene=new T.Scene();const camera=new T.PerspectiveCamera(37,1,.1,120);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=7;controls.maxDistance=48;controls.maxPolarAngle=Math.PI*.82;
 scene.add(new T.HemisphereLight(0xf1fff1,0x435143,3));
 const sun=new T.DirectionalLight(0xfff6dc,4);sun.position.set(4,12,8);scene.add(sun);
 const rim=new T.DirectionalLight(0xc3deec,2);rim.position.set(-8,4,-6);scene.add(rim);
 const roots={package:new T.Group(),gpu:new T.Group(),sm:new T.Group()};Object.values(roots).forEach(g=>scene.add(g));
 const all=[],picks=[];const colors={structure:0x54756c,compute:0x728c58,memory:0xb7985b,io:0x7d9ca2,power:0xa39a86,control:0x8a8297};
 const box=new T.BoxGeometry(1,1,1);
 function textTexture(text,sub,bg='#294437',fg='#e4ead4'){
  const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle=bg;ctx.fillRect(0,0,512,256);ctx.strokeStyle='#ffffff20';ctx.strokeRect(12,12,488,232);
  ctx.fillStyle=fg;ctx.textAlign='center';ctx.font='500 58px system-ui';ctx.fillText(text,256,126);if(sub){ctx.font='28px system-ui';ctx.fillText(sub,256,177)}
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return texture;
 }
 function part(view,id,x,y,z,w,h,d,{color,ex=[0,0,0],label,sub,metal=.35}={}){
  const p=byId.get(id);const g=new T.Group();g.position.set(x,y,z);g.userData={id,view,base:new T.Vector3(x,y,z),ex:new T.Vector3(...ex)};
  const mat=new T.MeshStandardMaterial({color:color??colors[p.system],roughness:.55,metalness:metal});const m=new T.Mesh(box,mat);m.scale.set(w,h,d);m.userData.id=id;g.add(m);picks.push(m);
  const edge=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(w,h,d)),new T.LineBasicMaterial({color:0xd3d9bd,transparent:true,opacity:.24}));g.add(edge);
  if(label){const plane=new T.Mesh(new T.PlaneGeometry(w*.94,d*.90),new T.MeshBasicMaterial({map:textTexture(label,sub),side:T.DoubleSide}));plane.rotation.x=-Math.PI/2;plane.position.y=h/2+.015;g.add(plane)}
  roots[view].add(g);all.push({g,m,edge,id,view,system:p.system});return g;
 }
 function line(view,points,color=0x79968c){const geo=new T.BufferGeometry().setFromPoints(points.map(v=>new T.Vector3(...v)));const obj=new T.Line(geo,new T.LineBasicMaterial({color,transparent:true,opacity:.35}));roots[view].add(obj);obj.userData.decor=true}
 // Physical component types. Board populations are representative.
 part('package','board',0,-.8,0,10,.22,8,{color:0x244b3f,ex:[0,-1.2,0]});
 for(const x of [-3.1,3.1])part('package','connector',x,-1.04,0,1.1,.2,6.1,{color:0xb59b59,ex:[0,-1.7,0]});
 part('package','substrate',0,-.50,0,7.5,.28,6,{color:0x395748,ex:[0,-.1,0]});
 part('package','interposer',0,-.25,0,6.9,.13,5.5,{color:0x687883,ex:[0,1.2,0]});
 for(let i=0;i<13;i++)for(let j=0;j<9;j++)part('package','bumps',-3+i*.5,-.37,-2+j*.5,.06,.07,.06,{color:0xc9b577,ex:[0,.7,0]});
 part('package','die',0,.05,0,3.25,.30,3.75,{color:0x46614a,ex:[0,2.8,0],label:'GH100',sub:'Hopper · 814 mm²'});
 const hbmSites=[[-2.55,-1.6],[-2.55,0],[-2.55,1.6],[2.55,-1.05],[2.55,1.05]];
 hbmSites.forEach(([x,z])=>{for(let k=0;k<4;k++)part('package',k===3?'hbm':'dram',x,-.1+k*.12,z,1.18,.1,1.25,{color:k===3?0xb5a06e:0x6c685b,ex:[Math.sign(x)*1.4,2+k*.45,z*.12],label:k===3?'HBM3':null,sub:null})});
 for(const x of [-4.35,4.35])for(let k=0;k<6;k++)part('package','vrm',x,-.51,-2.9+k*1.13,.64,.35,.74,{color:0x777b70,ex:[Math.sign(x)*.4,-1,0]});
 for(const z of [-3.35,3.35])for(let k=0;k<16;k++)part('package','capacitors',-3.7+k*.49,-.56,z,.23,.23,.28,{color:0xc3bca1,ex:[0,-1,Math.sign(z)*.4]});
 part('package','cooler',0,.54,0,7.2,.35,5.9,{color:0xb6bcb7,ex:[0,7,0],metal:.7});
 for(let k=0;k<19;k++)part('package','cooler',-3.2+k*.36,.95,0,.09,.55,5.7,{color:0x939d99,ex:[0,7,0],metal:.7});
 // Fine traces on the module, intentionally generic.
 for(let k=0;k<16;k++){const z=-3+k*.4;line('package',[[-4,-.68,z],[-3.8,-.68,z],[-3.3,-.68,z*.8]],0x8e9862);line('package',[[4,-.68,z],[3.8,-.68,z],[3.3,-.68,z*.8]],0x8e9862)}
 // Logical GPU map: eight GPC groups and exactly 66 TPC tiles.
 for(let g=0;g<8;g++){
  const x=g<4?-2.55:2.55,z=-3.5+(g%4)*2.0;
  part('gpu','gpc',x,-.25,z,4.0,.15,1.8,{color:0x375444,ex:[Math.sign(x)*.6,.1,(z/5)*.5]});
  const n=g<2?9:8;
  for(let i=0;i<n;i++)part('gpu','tpc',x-1.33+(i%3)*1.32,.0,z-.54+Math.floor(i/3)*.54,1.12,.22,.40,{color:0x7d9763,ex:[Math.sign(x)*.7,.8+Math.floor(i/3)*.12,z*.1]});
 }
 part('gpu','l2',0,-.10,-.55,.75,.28,7.7,{color:0xb49a5d,ex:[0,1.7,0],label:'L2',sub:'50 MB'});
 part('gpu','fabric',0,-.55,-.5,9.5,.12,8.5,{color:0x41534d,ex:[0,-1.1,0]});
 part('gpu','mmu',-3.4,.12,5.7,2.8,.18,.65,{ex:[-.4,2,1],label:'MMU / TLB'});
 part('gpu','clocks',3.4,.12,5.7,2.8,.18,.65,{ex:[.4,2,1],label:'Clocks'});
 for(let k=0;k<5;k++)for(const x of [-5.12,5.12])part('gpu','controller',x,.0,-3.65+k*1.68,.72,.25,1.36,{color:0x9c8a57,ex:[Math.sign(x)*1.3,.5,0]});
 part('gpu','nvlink',0,-.05,-5.08,8.9,.3,.7,{color:0x6d969c,ex:[0,1.3,-.9],label:'NVLink',sub:null});
 const bottom=[['pcie',-4.2,1.7],['copy',-2.2,1.7],['dispatch',0,2.1],['media',2.2,1.7],['security',4.2,1.7]];
 bottom.forEach(([id,x,w])=>part('gpu',id,x,-.05,4.45,w,.3,1.0,{ex:[x*.15,1.2,.9],label:{pcie:'PCIe',copy:'Copy',dispatch:'Dispatch',media:'Decode',security:'Trust'}[id]}));
 part('gpu','ecc',0,.12,5.7,3,.18,.65,{ex:[0,2,1],label:'ECC / repair'});
 // One SM: four schematic partitions. Functional callouts below are not additional cores.
 for(let q=0;q<4;q++){
  const x=-4.05+q*2.7;
  part('sm','scheduler',x,-.05,-3.2,2.42,.25,.75,{ex:[(q-1.5)*.45,1.8,-.7],label:'Scheduler'});
  part('sm','registers',x,-.03,-2.1,2.42,.28,1.08,{ex:[(q-1.5)*.45,1.2,-.3],label:'Registers',sub:'64 KiB / partition'});
  for(let k=0;k<8;k++)part('sm','fp32',x-.84+(k%4)*.56,.0,-.9+Math.floor(k/4)*.48,.47,.28,.4,{color:0x81996a,ex:[(q-1.5)*.55,1.8,0]});
  part('sm','fp64',x-.62,0,.25,1.12,.28,.65,{color:0x9cab83,ex:[(q-1.5)*.55,1.5,0],label:'FP64'});
  part('sm','int32',x+.62,0,.25,1.12,.28,.65,{color:0x7e9389,ex:[(q-1.5)*.55,1.5,0],label:'INT32'});
  part('sm','tensor',x,0,1.37,2.42,.36,1.18,{color:0xaebd7b,ex:[(q-1.5)*.65,2.6,.4],label:'Tensor Core'});
  part('sm','lsu',x-.62,0,2.6,1.12,.24,.72,{ex:[(q-1.5)*.55,1.4,.7],label:'LD / ST'});
  part('sm','sfu',x+.62,0,2.6,1.12,.24,.72,{ex:[(q-1.5)*.55,1.4,.7],label:'SFU'});
 }
 part('sm','l1',0,-.44,0,10.7,.20,7.8,{color:0x988953,ex:[0,-.7,0]});
 part('sm','instructions',0,-.1,-5.45,6,.18,.7,{ex:[0,1,-.8],label:'Instruction path'});
 const features=[['tma',-4.45,'TMA'],['barrier',-2.22,'Barriers'],['dpx',0,'DPX'],['cluster',2.22,'Clusters'],['transformer',4.45,'TE']];
 features.forEach(([id,x,label])=>part('sm',id,x,0,4.6,1.95,.28,.9,{ex:[x*.1,1.3,1.2],label}));
 // A label for the combined storage sits beyond the partition tiles.
 part('sm','l1',0,-.30,-4.5,6,.15,.7,{color:0x988953,ex:[0,-.7,-.3],label:'L1 / shared / texture',sub:null});
 let pending=false,disposed=false,frameFactor=1;
 function render(){if(disposed||pending)return;pending=true;requestAnimationFrame(()=>{pending=false;if(!disposed)renderer.render(scene,camera)})}
 function update(){
  const ex=Number($('#explode').value)/100;
  // Keep the top of a separated cooling assembly within the frame.
  const withCooler=scale==='package'&&coolerVisible&&!hiddenSystems.has('power');
  const nextFactor=withCooler?1+ex*.28:1;
  camera.position.sub(controls.target).multiplyScalar(nextFactor/frameFactor).add(controls.target);frameFactor=nextFactor;
  const targetY=withCooler ? .9+ex*2 : .9;
  camera.position.y+=targetY-controls.target.y;controls.target.y=targetY;controls.update();
  for(const v of Object.values(roots))v.visible=false;roots[scale].visible=true;
  for(const item of all){
   const {g,m,edge,id,system}=item;
   g.position.copy(g.userData.base).addScaledVector(g.userData.ex,ex);
   g.visible=!hiddenSystems.has(system)&&(!isolated||id===selected)&&(id!=='cooler'||coolerVisible);
   m.material.emissive.setHex(id===selected?0x607c3f:0x000000);m.material.emissiveIntensity=id===selected?.24:0;
   edge.material.opacity=id===selected?.85:.24;
  }
  for(const root of Object.values(roots))for(const child of root.children)if(child.userData.decor)child.visible=!isolated&&!hiddenSystems.has('structure');
  renderer.domElement.dataset.scale=scale;renderer.domElement.dataset.selected=selected;
  renderer.domElement.dataset.visibleParts=[...new Set(all.filter(i=>i.view===scale&&i.g.visible).map(i=>i.id))].join(',');
  render();
 }
 function reset(){frameFactor=1;camera.position.set(11,13,15).multiplyScalar(Math.max(1,.95/camera.aspect));controls.target.set(0,.9,0);controls.update();render()}
 function resize(){const bounds=container.getBoundingClientRect();const width=bounds.width,height=bounds.height-72;if(!width||!height)return;renderer.setSize(width,height,false);const nextAspect=width/height;const factor=Math.max(1,.95/nextAspect)/Math.max(1,.95/camera.aspect);camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);camera.aspect=nextAspect;camera.updateProjectionMatrix();render()}
 function setScale(){reset();update()}
 const observer=new ResizeObserver(resize);observer.observe(container);
 const theme=()=>{scene.background=new T.Color(getComputedStyle(document.documentElement).getPropertyValue('--scene').trim());render()};new MutationObserver(theme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 controls.addEventListener('change',render);
 const ray=new T.Raycaster(),pointer=new T.Vector2();let start=null;
 renderer.domElement.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,id:e.pointerId}});
 renderer.domElement.addEventListener('pointerup',e=>{
  if(!start||start.id!==e.pointerId||Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)return;
  const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
  const hit=ray.intersectObjects(picks.filter(m=>m.parent.visible&&m.parent.parent.visible),false)[0];if(hit)selectPart(hit.object.userData.id);start=null;
 });
 function rotate(delta){const v=camera.position.clone().sub(controls.target);v.applyAxisAngle(new T.Vector3(0,1,0),delta);camera.position.copy(controls.target).add(v);controls.update();render()}
 function zoom(factor){const v=camera.position.clone().sub(controls.target);v.setLength(T.MathUtils.clamp(v.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(v);controls.update();render()}
 $('#rotate-left').addEventListener('click',()=>rotate(-Math.PI/8));$('#rotate-right').addEventListener('click',()=>rotate(Math.PI/8));$('#zoom-in').addEventListener('click',()=>zoom(.85));$('#zoom-out').addEventListener('click',()=>zoom(1.18));
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();disposed=true;$('#model-state').textContent='The 3D context was interrupted. Reload to restore it; all explanations remain available.';container.classList.remove('model-ready')});
 sceneAPI={update,reset,setScale};resize();reset();theme();update();container.classList.add('model-ready');$('#model-state').textContent='Select a component to see its role.';
}
init3D().catch(()=>{
 $('#explore').classList.add('model-failed');$('#model-state').textContent='3D is unavailable in this browser. Search or select any part below; all explanations are available.';
 const note=document.createElement('div');note.className='fallback-art';note.textContent='H100 · component atlas';$('#viewport').append(note);
});
