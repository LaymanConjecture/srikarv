(() => {
  const $ = selector => document.querySelector(selector);
  const explore = $('#explore');
  const viewport = $('#map-viewport');
  const stage = $('#map-stage');
  const actor = $('#traveller');
  const routeLine = $('#walking-route');
  const dialog = $('#world-dialog');
  const menu = $('#places-menu');
  const menuToggle = $('#places-toggle');
  const status = $('#map-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const places = [
    { id:'about', title:'About Me', kind:'The cottage', x:21, y:21, banner:[17,12], road:[[42,44],[38,39],[31,32],[24,28]], text:"I'm Srikar. Welcome to my little corner of the world.", note:'My story will live here. For now, come explore the island.' },
    { id:'blog', title:'Blog', kind:'The library', x:21, y:43, banner:[14,45], road:[[41,53],[32,56],[27,53],[24,50]], text:'A quiet place for essays and ideas.', note:'No essays are published here yet.' },
    { id:'progress', title:'Science of Progress', kind:'The observatory', x:51, y:13, banner:[50,8], road:[[49,43],[47,36],[47,28],[50,23]], text:'Welcome to the observatory.', note:'This destination is taking shape. More about Science of Progress will appear here.' },
    { id:'eternis', title:'Eternis', kind:'The ancient tree', x:76, y:24, banner:[85,16], road:[[57,46],[64,42],[69,39],[75,34]], text:'You have reached the ancient tree.', note:'This destination is taking shape. More about Eternis will appear here.' },
    { id:'government', title:'Autonomous Government', kind:'The council hall', x:79, y:51, banner:[86,53], road:[[58,55],[67,57],[73,61],[76,57]], text:'Welcome to the council hall.', note:'This destination is taking shape. More about Autonomous Government will appear here.' },
    { id:'freysa', title:'Freysa', kind:'The crystal shrine', x:68, y:74, banner:[74,90], road:[[52,60],[58,66],[63,73],[67,80]], text:'You have found the crystal shrine.', note:'This destination is taking shape. More about Freysa will appear here.' },
    { id:'holons', title:'Holons', kind:'The connected gardens', x:47, y:76, banner:[48,95], road:[[47,61],[44,71],[43,82],[46,86]], text:'Welcome to the connected gardens.', note:'This destination is taking shape. More about Holons will appear here.' },
    { id:'investments', title:'Investments', kind:"Companies I've backed", x:24, y:72, banner:[18,91], road:[[41,53],[35,59],[30,65],[27,73],[24,79]], text:"A place for the companies I've backed.", note:'The company list will be added here.' },
  ];
  const characters = [
    {id:'srikar', name:'Srikar', x:42, y:46, title:'Where shall we go?', text:'Welcome. Each place opens a different part of my world. Pick a path, or let me show you around.'},
    {id:'archivist', name:'The archivist', x:28, y:53, title:'The library is quiet.', text:'No essays are published here yet. You can visit the library, or explore the rest of the island.'},
    {id:'keeper', name:'The keeper', x:55, y:77, title:'Welcome to the gardens.', text:'The path from here leads to Holons. Beyond the river, you can visit Eternis under the ancient tree.'},
  ];
  let visited = new Set();
  try {
    const stored = JSON.parse(localStorage.getItem('srikar-world-visited') || '[]');
    if (Array.isArray(stored)) visited = new Set(stored.filter(id => places.some(p => p.id === id)));
  } catch {}
  let position = [49,53];
  let zoom = 1;
  let walking = 0;
  let travelVersion = 0;
  let active = false;
  let dialogReturn = null;
  let artworkFailed = false;
  const center = [49,51];
  const graph = new Map();
  const pointKey = point => point.join(',');
  const distance = (a,b) => Math.hypot(a[0]-b[0], (a[1]-b[1])*.62547);
  function connect(a,b) {
    const ka = pointKey(a), kb = pointKey(b);
    if (!graph.has(ka)) graph.set(ka,{point:a, edges:new Set()});
    if (!graph.has(kb)) graph.set(kb,{point:b, edges:new Set()});
    graph.get(ka).edges.add(kb); graph.get(kb).edges.add(ka);
  }
  for (const place of places) {
    const road = [center,...place.road];
    for (let i=1;i<road.length;i++) connect(road[i-1],road[i]);
    place.arrival = road.at(-1);
  }
  connect(center,[42,46]); connect([27,53],[28,53]); connect([46,86],[55,77]);

  const nearestNode = point => [...graph.keys()].reduce((best,key) => !best || distance(point,graph.get(key).point)<distance(point,graph.get(best).point) ? key : best, null);
  function routeTo(target) {
    const start=nearestNode(position), end=nearestNode(target);
    const costs=new Map([[start,0]]), previous=new Map(), pending=new Set(graph.keys());
    while(pending.size) {
      const current=[...pending].reduce((a,b)=>(costs.get(a)??Infinity)<=(costs.get(b)??Infinity)?a:b);
      if(current===end || !costs.has(current)) break;
      pending.delete(current);
      for(const next of graph.get(current).edges) {
        const cost=costs.get(current)+distance(graph.get(current).point,graph.get(next).point);
        if(cost<(costs.get(next)??Infinity)){costs.set(next,cost);previous.set(next,current);}
      }
    }
    const keys=[end];while(keys[0]!==start && previous.has(keys[0]))keys.unshift(previous.get(keys[0]));
    return [...keys.map(key=>graph.get(key).point),target];
  }
  function renderActor() {actor.style.left=`${position[0]}%`;actor.style.top=`${position[1]}%`;}
  function centerOn(point=position, smooth=false) {
    const left=stage.offsetLeft+stage.clientWidth*point[0]/100-viewport.clientWidth/2;
    const top=stage.offsetTop+stage.clientHeight*point[1]/100-viewport.clientHeight/2;
    viewport.scrollTo({left,top,behavior:smooth&&!motion.matches?'smooth':'instant'});
  }
  function resizeMap(recenter=true) {
    if(!active)return;
    const width=viewport.clientWidth, height=viewport.clientHeight;
    $('#map-hint').textContent=artworkFailed?'Use Places to explore while the artwork is unavailable.':width<760?'Drag the map · Tap a place to visit':'Click a place to visit. Arrow keys to wander.';
    const fit=Math.min(width/1586,height/992);
    const base=width<760 ? 1040 : 1586*fit;
    const size=base*zoom;
    stage.style.width=`${size}px`;stage.style.height=`${size*992/1586}px`;
    stage.style.marginTop=`${Math.max(0,(height-size*992/1586)/2)}px`;
    if(recenter)centerOn();
    $('#zoom-out').disabled=zoom<=1;$('#zoom-in').disabled=zoom>=1.8;
  }
  new ResizeObserver(()=>resizeMap()).observe(viewport);
  function updateVisited() {
    $('#discovery-count').textContent=`${visited.size} of 8 places visited`;
    for(const place of places) {
      $(`#place-${place.id}`).dataset.visited=String(visited.has(place.id));
      $(`#menu-${place.id} .place-menu-check`).textContent=visited.has(place.id)?'✓':'';
    }
    try{localStorage.setItem('srikar-world-visited',JSON.stringify([...visited]));}catch{}
  }
  function setMenu(open) {
    menu.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));
    if(open)menu.querySelector('button').focus();
  }
  function stopWalking() {
    travelVersion++;cancelAnimationFrame(walking);actor.classList.remove('is-walking');routeLine.setAttribute('points','');
    $('#walk-marker').hidden=true;
    document.querySelectorAll('.is-destination').forEach(el=>el.classList.remove('is-destination'));
  }
  function travel(target,onArrival=()=>{},label='the path') {
    stopWalking();
    const version=travelVersion;
    const route=routeTo(target);
    routeLine.setAttribute('points',[position,...route].map(p=>`${p[0]*10},${p[1]*6.2547}`).join(' '));
    const marker=$('#walk-marker');marker.style.left=`${target[0]}%`;marker.style.top=`${target[1]}%`;marker.hidden=false;
    status.textContent=`Walking to ${label}.`;
    if(motion.matches){position=[...target];renderActor();stopWalking();centerOn();onArrival();return;}
    actor.classList.add('is-walking');
    let index=0,last=performance.now();
    const step=now=>{
      if(version!==travelVersion || !active)return;
      let budget=Math.min((now-last)/1000,.05)*28;last=now;
      while(index<route.length && budget>0){
        const next=route[index],length=distance(position,next);
        if(length<=budget){position=[...next];budget-=length;index++;}
        else{const t=budget/length;position=[position[0]+(next[0]-position[0])*t,position[1]+(next[1]-position[1])*t];budget=0;}
      }
      renderActor();
      if(viewport.clientWidth<760 || zoom>1.01)centerOn();
      if(index<route.length)walking=requestAnimationFrame(step);
      else{actor.classList.remove('is-walking');routeLine.setAttribute('points','');marker.hidden=true;onArrival();}
    };
    walking=requestAnimationFrame(step);
  }
  function showDialog(html,returnTarget) {
    dialogReturn=returnTarget || dialogReturn || viewport;
    dialog.innerHTML=html;
    if(!dialog.open)dialog.showModal();
    dialog.querySelector('.dialog-close').focus();
    dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  }
  const closeButton='<button class="dialog-close" aria-label="Close conversation" data-close><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>';
  function showPlace(place) {
    visited.add(place.id);updateVisited();
    document.querySelectorAll('.is-destination').forEach(el=>el.classList.remove('is-destination'));
    const html=`<div class="dialog-banner" style="--banner-x:${place.banner[0]}%;--banner-y:${place.banner[1]}%">${closeButton}</div><div class="dialog-body"><p class="dialog-kind">${escape(place.kind)}</p><h2 id="dialog-title">${escape(place.title)}</h2><p>${escape(place.text)}</p><p class="destination-state">${escape(place.note)}</p><div class="dialog-actions"><button data-close>Back to map</button><button id="dialog-guide">Talk to the guide</button></div></div>`;
    showDialog(html,$(`#place-${place.id}`));
    $('#dialog-guide').addEventListener('click',()=>showCharacter(characters[0]));
    status.textContent=`You reached ${place.title}.`;
  }
  function visit(id) {
    const place=places.find(p=>p.id===id);if(!place)return;
    if(dialog.open)dialog.close();setMenu(false);
    travel(place.arrival,()=>showPlace(place),place.title);
    if(!motion.matches)$(`#place-${place.id}`).classList.add('is-destination');
  }
  function showCharacter(character,mode='hello') {
    const choice=(label,id)=>`<button class="dialog-choice" data-choice="${id}">${escape(label)}<span aria-hidden="true">→</span></button>`;
    let title=character.title,text=character.text,choices='';
    if(character.id==='srikar') {
      if(mode==='projects') {
        title='Pick a place to begin.';text='Each landmark has its own path.';
        choices=places.filter(p=>!['about','blog'].includes(p.id)).map(p=>choice(p.title,p.id)).join('');
      } else choices=choice('Tell me about yourself','about')+choice('Show me the projects','projects')+choice('Where are the essays?','blog');
    } else if(character.id==='archivist') choices=choice('Visit Blog','blog')+choice('Meet Srikar','guide');
    else choices=choice('Visit Holons','holons')+choice('Take me to Eternis','eternis');
    showDialog(`<div class="guide-banner"><img src="assets/traveller.webp" alt=""><span>${escape(character.name)}<br>${character.id==='srikar'?'Your island guide':'Island resident'}</span>${closeButton}</div><div class="dialog-body"><h2 id="dialog-title">${escape(title)}</h2><p>${escape(text)}</p><div class="dialog-choices">${choices}</div><div class="dialog-actions"><button data-close>Keep exploring</button></div></div>`,$(`#character-${character.id}`));
    dialog.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.choice;
      if(id==='projects')showCharacter(character,'projects');
      else if(id==='guide')showCharacter(characters[0]);
      else visit(id);
    }));
  }
  function talk(character) {
    setMenu(false);travel([character.x,character.y],()=>showCharacter(character),character.name);
  }
  for(const place of places) {
    const pin=document.createElement('button');pin.className='place-pin';pin.id=`place-${place.id}`;
    pin.style.left=`${place.x}%`;pin.style.top=`${place.y}%`;pin.setAttribute('aria-label',`Visit ${place.title}`);
    pin.innerHTML=`<span class="place-label">${escape(place.title)}</span>`;
    pin.addEventListener('click',()=>visit(place.id));$('#landmarks').append(pin);
    const item=document.createElement('button');item.id=`menu-${place.id}`;
    item.innerHTML=`<span class="place-menu-number" aria-hidden="true">${String(places.indexOf(place)+1).padStart(2,'0')}</span><span>${escape(place.title)}</span><span class="place-menu-check" aria-hidden="true"></span>`;
    item.addEventListener('click',()=>visit(place.id));menu.append(item);
  }
  for(const character of characters) {
    const button=document.createElement('button');button.id=`character-${character.id}`;button.className='map-character';button.dataset.character=character.id;
    button.style.left=`${character.x}%`;button.style.top=`${character.y}%`;button.setAttribute('aria-label',`Talk to ${character.name}`);
    button.innerHTML=`<img src="assets/traveller.webp" alt="" width="1024" height="1536"><span class="character-label">${escape(character.name)}</span>`;
    button.addEventListener('click',()=>talk(character));$('#characters').append(button);
  }
  updateVisited();renderActor();
  dialog.addEventListener('close',()=>{if(active && dialogReturn?.isConnected)dialogReturn.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)dialog.close();}});
  menuToggle.addEventListener('click',()=>setMenu(menu.hidden));
  $('#meet-guide').addEventListener('click',()=>talk(characters[0]));
  $('#zoom-in').addEventListener('click',()=>{zoom=Math.min(1.8,zoom+.2);resizeMap();});
  $('#zoom-out').addEventListener('click',()=>{zoom=Math.max(1,zoom-.2);resizeMap();});
  $('#recenter').addEventListener('click',()=>{centerOn(position,true);viewport.focus({preventScroll:true});});
  function nearestPath(point) {
    let best=point,minimum=Infinity;
    for(const node of graph.values())for(const next of node.edges){
      const a=node.point,b=graph.get(next).point,dx=b[0]-a[0],dy=(b[1]-a[1])*.62547;
      const t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*.62547*dy)/(dx*dx+dy*dy)));
      const candidate=[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])];
      const d=distance(point,candidate);if(d<minimum){minimum=d;best=candidate;}
    }
    return best;
  }
  stage.addEventListener('click',event=>{
    if(event.target.closest('button'))return;
    const rect=stage.getBoundingClientRect();const point=[(event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100];
    setMenu(false);viewport.focus({preventScroll:true});travel(nearestPath(point));
  });
  const island=[[21,10],[65,6],[85,14],[94,44],[85,82],[69,93],[29,94],[10,74],[7,48],[12,25]];
  function onLand(point) {
    let inside=false;
    for(let i=0,j=island.length-1;i<island.length;j=i++){
      const a=island[i],b=island[j];
      if((a[1]>point[1])!==(b[1]>point[1]) && point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    return inside;
  }
  addEventListener('keydown',event=>{
    if(!active || dialog.open || event.ctrlKey || event.metaKey || event.altKey)return;
    if(event.key==='Escape' && !menu.hidden){setMenu(false);menuToggle.focus();event.preventDefault();return;}
    if(!menu.hidden)return;
    const vectors={ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0],ArrowUp:[0,-1.6],w:[0,-1.6],ArrowDown:[0,1.6],s:[0,1.6]};
    if(vectors[event.key]){
      event.preventDefault();stopWalking();const v=vectors[event.key],next=[position[0]+v[0],position[1]+v[1]];
      if(onLand(next)){position=next;renderActor();if(viewport.clientWidth<760 || zoom>1.01)centerOn();}
    }else if((event.key==='Enter' && event.target===viewport) || event.key==='e'){
      event.preventDefault();const candidates=[...places.map(p=>({point:p.arrival,run:()=>visit(p.id)})),...characters.map(c=>({point:[c.x,c.y],run:()=>talk(c)}))];
      const near=candidates.sort((a,b)=>distance(position,a.point)-distance(position,b.point))[0];
      if(distance(position,near.point)<10)near.run();else status.textContent='Move closer to a landmark or character to interact.';
    }
  });
  addEventListener('world-map:open',()=>{
    active=true;resizeMap();status.textContent='Welcome to the island. Visit a landmark or meet your guide.';
    Promise.allSettled([...document.querySelectorAll('.map-art')].map(image=>image.decode())).then(()=>{$('#map-loading').hidden=true;});
  });
  addEventListener('world-map:close',()=>{active=false;stopWalking();setMenu(false);if(dialog.open)dialog.close();});
  motion.addEventListener('change',()=>{if(motion.matches)stopWalking();});
  document.querySelectorAll('.map-art').forEach(image=>image.addEventListener('error',()=>{artworkFailed=true;status.textContent="The map artwork couldn't load. Use Places to explore.";$('#map-hint').textContent='Use Places to explore while the artwork is unavailable.';}));
})();
