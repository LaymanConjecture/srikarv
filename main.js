const root = document.documentElement;
const world = document.querySelector('#world');
const theme = document.querySelector('#theme');
const motion = document.querySelector('#motion');
const sound = document.querySelector('#sound');
const status = document.querySelector('#status');
const intro = document.querySelector('.intro');
const returnButton = document.querySelector('#return');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;

function applyTheme(value) {
  root.dataset.theme = value === 'dark' ? 'dark' : 'light';
  theme.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  document.querySelector('#time-label').textContent = root.dataset.theme === 'dark' ? 'Night' : 'Day';
}
applyTheme(root.dataset.theme);
theme.addEventListener('click', () => {
  applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  try { localStorage.setItem('srikar-theme', root.dataset.theme); } catch {}
});
addEventListener('storage', event => { if (event.key === 'srikar-theme') applyTheme(event.newValue); });

function setPaused(value) {
  paused = value;
  world.classList.toggle('paused', paused);
  motion.setAttribute('aria-pressed', String(paused));
  motion.setAttribute('aria-label', paused ? 'Resume animation' : 'Pause animation');
  motion.title = paused ? 'Resume animation' : 'Pause animation';
}
setPaused(paused);
motion.addEventListener('click', () => setPaused(!paused));
reducedMotion.addEventListener('change', event => setPaused(event.matches));
world.addEventListener('pointermove', event => {
  if (paused || reducedMotion.matches || event.pointerType !== 'mouse') return;
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

// Locally synthesized wind: no tracking, external audio, or autoplay.
let audioContext;
let windGain;
let soundEnabled = false;
let soundBusy = false;
async function createWind() {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!Audio) throw new Error('Audio unavailable');
  audioContext = new Audio();
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 8, audioContext.sampleRate);
  const samples = buffer.getChannelData(0);
  let previous = 0;
  for (let i = 0; i < samples.length; i++) {
    previous = (previous + .025 * (Math.random() * 2 - 1)) / 1.025;
    samples[i] = previous * 3;
  }
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 650;
  windGain = audioContext.createGain();
  windGain.gain.value = 0;
  source.connect(filter).connect(windGain).connect(audioContext.destination);
  source.start();
}
sound.addEventListener('click', async () => {
  if (soundBusy) return;
  soundBusy = true;
  try {
    if (!audioContext) await createWind();
    await audioContext.resume();
    soundEnabled = !soundEnabled;
    windGain.gain.setTargetAtTime(soundEnabled ? .23 : 0, audioContext.currentTime, .3);
    sound.setAttribute('aria-pressed', String(soundEnabled));
    status.textContent = soundEnabled ? 'Ambient wind on.' : 'Ambient wind off.';
  } catch { status.textContent = 'Ambient sound is unavailable in this browser.'; }
  finally { soundBusy = false; }
});
document.addEventListener('visibilitychange', () => {
  if (!audioContext) return;
  if (document.hidden) void audioContext.suspend().catch(() => {});
  else if (soundEnabled) void audioContext.resume().catch(() => {});
});
