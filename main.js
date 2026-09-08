const world = document.querySelector('#world');
const intro = document.querySelector('.intro');
const returnButton = document.querySelector('#return');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
world.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType !== 'mouse') return;
  world.style.setProperty('--pan-x', `${(event.clientX / innerWidth - .5) * -12}px`);
  world.style.setProperty('--pan-y', `${(event.clientY / innerHeight - .5) * -8}px`);
});
world.addEventListener('pointerleave', () => {
  world.style.setProperty('--pan-x', '0px');
  world.style.setProperty('--pan-y', '0px');
});
for (let i = 0; i < 20; i++) {
  const mote = document.createElement('span');
  mote.className = 'mote';
  mote.style.cssText = `--x:${(i * 37 + 11) % 100}%;--y:${35 + (i * 17 % 60)}%;--duration:${8 + i % 7}s;--delay:${-i * 1.7}s`;
  document.querySelector('.motes').append(mote);
}

function immerse(value) {
  world.classList.toggle('immersed', value);
  intro.inert = value;
  intro.setAttribute('aria-hidden', String(value));
  returnButton.hidden = !value;
  (value ? returnButton : document.querySelector('#enter')).focus({ preventScroll: true });
}
document.querySelector('#enter').addEventListener('click', () => immerse(true));
returnButton.addEventListener('click', () => immerse(false));
addEventListener('keydown', event => { if (event.key === 'Escape' && world.classList.contains('immersed')) immerse(false); });
