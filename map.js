(() => {
  const viewport = document.querySelector('#map-viewport');
  const stage = document.querySelector('#map-stage');
  const dialog = document.querySelector('#world-dialog');
  const places = [
    {id:'about', title:'About Me', x:21, y:29.5, href:'about.html'},
    {id:'blog', title:'Blog', x:21, y:51.5, text:'No essays are published here yet.'},
    {id:'progress', title:'Science of Progress', x:51, y:21.5, text:'More about Science of Progress is coming soon.'},
    {id:'eternis', title:'Eternis', x:76, y:32.5, href:'https://eternis.ai'},
    {id:'government', title:'Autonomous Government', x:79, y:59.5, text:'More about Autonomous Government is coming soon.'},
    {id:'freysa', title:'Freysa', x:68, y:82.5, href:'https://freysa.ai'},
    {id:'holons', title:'Holons', x:47, y:84.5, text:'More about Holons is coming soon.'},
    {id:'investments', title:'Investments', x:24, y:80.5, href:'investments.html'},
  ];
  let returnFocus;
  function openPanel(title, text, trigger) {
    returnFocus = trigger;
    dialog.replaceChildren();
    const close = document.createElement('button');
    close.className = 'dialog-close'; close.textContent = '×'; close.setAttribute('aria-label','Close');
    close.addEventListener('click', () => dialog.close());
    const heading = document.createElement('h2'); heading.id = 'dialog-title'; heading.textContent = title;
    const body = document.createElement('p'); body.textContent = text;
    dialog.append(close, heading, body);
    dialog.showModal();
    close.focus();
  }
  for (const place of places) {
    const pin = document.createElement(place.href ? 'a' : 'button');
    pin.id = `place-${place.id}`; pin.className = 'place-label'; pin.textContent = place.title;
    pin.style.left = `${place.x}%`; pin.style.top = `${place.y}%`;
    if (place.href) pin.href = place.href;
    else pin.addEventListener('click', () => openPanel(place.title, place.text, pin));
    document.querySelector('#landmarks').append(pin);
  }
  const srikar = document.querySelector('#character-srikar');
  srikar.addEventListener('click', () => {
    openPanel('Srikar’s agent', 'The agent is not connected yet. Come back soon to chat.', srikar);
  });
  dialog.addEventListener('close', () => returnFocus?.focus({preventScroll:true}));
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if(event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  let mapWidth = 0;
  function resizeMap() {
    if (document.querySelector('#explore').hidden) return;
    const oldWidth = mapWidth;
    const center = oldWidth ? (viewport.scrollLeft + viewport.clientWidth / 2) / oldWidth : .5;
    const width = Math.max(1040, Math.min(viewport.clientWidth, viewport.clientHeight * 1586 / 992));
    stage.style.width = `${width}px`; stage.style.height = `${width * 992 / 1586}px`;
    stage.style.marginTop = `${Math.max(0, (viewport.clientHeight - width * 992 / 1586) / 2)}px`;
    mapWidth = width;
    viewport.scrollLeft = width * center - viewport.clientWidth / 2;
  }
  new ResizeObserver(resizeMap).observe(viewport);
  addEventListener('world-map:open', () => {
    resizeMap();
    requestAnimationFrame(() => { viewport.scrollLeft = stage.clientWidth * .42 - viewport.clientWidth / 2; });
  });
  addEventListener('world-map:close', () => { if(dialog.open) dialog.close(); });
  // Native touch scrolling; mouse drag pans the same map without extra controls.
  let drag;
  viewport.addEventListener('pointerdown', event => {
    if(event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('a,button')) return;
    drag = {x:event.clientX, y:event.clientY, left:viewport.scrollLeft, top:viewport.scrollTop};
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', event => {
    if(!drag) return;
    viewport.scrollLeft = drag.left + drag.x - event.clientX;
    viewport.scrollTop = drag.top + drag.y - event.clientY;
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture']) viewport.addEventListener(event, () => {drag=null;});
  // Keyboard focus naturally brings offscreen labels into view on small screens.
  stage.addEventListener('focusin', event => event.target.scrollIntoView({block:'nearest',inline:'nearest'}));
  resizeMap();
})();
