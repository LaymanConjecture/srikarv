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

const nightToggle = document.querySelector('#night-toggle');
const owl = document.querySelector('#owl');
const sceneStatus = document.querySelector('#scene-status');
let flight;
let sceneVersion = 0;
let soundVersion = 0;
let audio;
let master;
let callTimer;
let soundEnabled = false;
const voices = new Set();

function updateSoundState(enabled) {
  soundEnabled = enabled;
  owl.setAttribute('aria-pressed', String(enabled));
  owl.title = enabled ? 'Quiet the owl' : 'Play gentle owl sounds';
}

function stopCalls() {
  clearTimeout(callTimer);
  if (!audio) return;
  master.gain.cancelScheduledValues(audio.currentTime);
  master.gain.setTargetAtTime(0, audio.currentTime, .07);
  for (const voice of voices) {
    try { voice.stop(audio.currentTime + .15); } catch {}
  }
  voices.clear();
}

function muteOwl() {
  soundVersion++;
  updateSoundState(false);
  stopCalls();
}

// A quiet rounded hoot, synthesized locally; each note gently falls in pitch.
function hoot(start, duration, frequency, strength) {
  const voice = audio.createOscillator();
  const envelope = audio.createGain();
  const vibrato = audio.createOscillator();
  const depth = audio.createGain();
  const wave = audio.createPeriodicWave(new Float32Array([0, 0, 0, 0]), new Float32Array([0, 1, .07, .025]));
  voice.setPeriodicWave(wave);
  voice.frequency.setValueAtTime(frequency * 1.09, start);
  voice.frequency.exponentialRampToValueAtTime(frequency, start + duration * .32);
  voice.frequency.exponentialRampToValueAtTime(frequency * .94, start + duration);
  vibrato.frequency.value = 4.3;
  depth.gain.value = 2;
  vibrato.connect(depth).connect(voice.frequency);
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(strength, start + .12);
  envelope.gain.setTargetAtTime(strength * .72, start + .18, .12);
  envelope.gain.setTargetAtTime(0, start + duration - .22, .07);
  voice.connect(envelope).connect(master);
  voices.add(voice);
  voice.onended = () => { voices.delete(voice); voice.disconnect(); envelope.disconnect(); vibrato.disconnect(); depth.disconnect(); };
  voice.start(start);
  vibrato.start(start);
  voice.stop(start + duration + .2);
  vibrato.stop(start + duration + .2);
}

function scheduleCalls() {
  clearTimeout(callTimer);
  if (!soundEnabled || document.hidden || document.documentElement.dataset.theme !== 'dark') return;
  const start = audio.currentTime + .5;
  master.gain.setTargetAtTime(.15, audio.currentTime, .6);
  const pitch = 370 + Math.random() * 20;
  hoot(start, .9, pitch, .18);
  hoot(start + 1.25, .62, pitch * .94, .14);
  hoot(start + 2.02, 1.25, pitch * .91, .16);
  callTimer = setTimeout(scheduleCalls, 18000 + Math.random() * 6000);
}

async function enableOwl() {
  const version = ++soundVersion;
  try {
    if (!audio) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Audio unavailable');
      audio = new Audio();
      master = audio.createGain();
      master.gain.value = 0;
      master.connect(audio.destination);
    }
    await audio.resume();
    if (version !== soundVersion || document.documentElement.dataset.theme !== 'dark') return;
    updateSoundState(true);
    scheduleCalls();
  } catch {
    if (version !== soundVersion) return;
    updateSoundState(false);
    sceneStatus.textContent = 'The owl is resting. Sound is unavailable in this browser.';
  }
}

async function landOwl(animate) {
  const version = sceneVersion;
  flight?.cancel();
  owl.hidden = false;
  owl.classList.toggle('is-settled', !animate || reducedMotion.matches);
  owl.classList.toggle('is-flying', animate && !reducedMotion.matches);
  if (!animate || reducedMotion.matches) return;
  // Decode both poses before the flight, so slow networks never reveal an empty sprite.
  await Promise.all([...owl.querySelectorAll('img')].map(image => image.decode().catch(() => {})));
  if (version !== sceneVersion) return;
  if (reducedMotion.matches) { owl.classList.remove('is-flying'); owl.classList.add('is-settled'); return; }
  flight = owl.animate([
    { transform: 'translate(-90vw, 38vh) scale(.62) rotate(-12deg)', offset: 0 },
    { transform: 'translate(-60vw, 13vh) scale(.9) rotate(5deg)', offset: .35 },
    { transform: 'translate(-26vw, -2vh) scale(1.05) rotate(-6deg)', offset: .68 },
    { transform: 'translate(-4vw, -1vh) scale(1) rotate(3deg)', offset: .91 },
    { transform: 'translate(0, 0) scale(1) rotate(0)', offset: 1 },
  ], { duration: 6200, easing: 'cubic-bezier(.25,.55,.35,1)', fill: 'none' });
  try { await flight.finished; } catch { return; }
  if (version !== sceneVersion) return;
  owl.classList.remove('is-flying');
  owl.classList.add('is-settled');
  sceneStatus.textContent = 'An owl has settled in the tree. Select the owl to quiet or play its calls.';
}

function setNight(night, userInitiated = false) {
  sceneVersion++;
  muteOwl();
  document.documentElement.dataset.theme = night ? 'dark' : 'light';
  nightToggle.setAttribute('aria-pressed', String(night));
  nightToggle.title = night ? 'Return to daylight' : 'Night: an owl comes to rest';
  if (night) {
    void landOwl(userInitiated);
    if (userInitiated) void enableOwl();
  } else {
    flight?.cancel();
    owl.hidden = true;
    owl.classList.remove('is-flying', 'is-settled');
    if (document.activeElement === owl) nightToggle.focus();
  }
}

nightToggle.addEventListener('click', () => {
  setNight(document.documentElement.dataset.theme !== 'dark', true);
  try { localStorage.setItem('srikar-theme', document.documentElement.dataset.theme); } catch {}
});
owl.addEventListener('click', () => {
  if (soundEnabled) { muteOwl(); sceneStatus.textContent = 'Owl calls off.'; }
  else void enableOwl();
});
addEventListener('storage', event => { if (event.key === 'srikar-theme') setNight(event.newValue === 'dark'); });
reducedMotion.addEventListener('change', event => {
  if (event.matches && !owl.hidden) { flight?.cancel(); owl.classList.remove('is-flying'); owl.classList.add('is-settled'); }
});
document.addEventListener('visibilitychange', () => {
  if (!audio) return;
  if (document.hidden) { stopCalls(); void audio.suspend().catch(() => {}); }
  else if (soundEnabled) void audio.resume().then(scheduleCalls).catch(() => {});
});
setNight(document.documentElement.dataset.theme === 'dark');
