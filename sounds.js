let context;
let enabled = true;
try { enabled = localStorage.getItem('philosophy-sound') !== 'off'; } catch {}
export function soundEnabled() { return enabled; }
export function unlockSound() {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume().catch(() => {});
  } catch {}
}
export function toggleSound() {
  enabled = !enabled;
  try { localStorage.setItem('philosophy-sound', enabled ? 'on' : 'off'); } catch {}
  if (enabled) { unlockSound(); playSound('click'); }
  else if (context) void context.suspend().catch(() => {});
  return enabled;
}
export function playSound(kind) {
  if (!enabled || !context || context.state !== 'running') return;
  const patterns = {
    click: [550], correct: [523, 659, 784], incorrect: [330, 260],
    timeout: [440, 330, 220], tick: [880], power: [440, 660, 880],
    spinning: [440, 494, 554, 622, 698, 784, 880, 988],
    topic: [523, 784], summary: [523, 659, 784, 1047],
  };
  (patterns[kind] ?? patterns.click).forEach((frequency, i) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const at = context.currentTime + i * .105;
    oscillator.type = kind === 'tick' ? 'sine' : 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(.065, at + .01);
    gain.gain.exponentialRampToValueAtTime(.001, at + .13);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(at); oscillator.stop(at + .15);
  });
}
