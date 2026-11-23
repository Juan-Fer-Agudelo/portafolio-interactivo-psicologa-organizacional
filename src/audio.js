// Música ambiental generada en el navegador con Web Audio (sin archivos de audio).
// Para usar una canción propia, reemplaza esta clase por un elemento <audio>.

const CHORDS = [
  [174.61, 220.0, 261.63, 329.63], // Fa maj7
  [146.83, 220.0, 261.63, 349.23], // Re m7
  [164.81, 196.0, 246.94, 293.66], // Mi m7
  [130.81, 196.0, 246.94, 329.63], // Do maj7
];
const MELODY = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
const CHORD_SECONDS = 7;

export class Ambient {
  constructor() {
    this.ctx = null;
    this.playing = false;
    this.timer = null;
    this.step = 0;
  }

  build() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 1100;
    this.filter.connect(this.master);

    // Eco suave para las notas de la melodía
    this.delay = this.ctx.createDelay(1);
    this.delay.delayTime.value = 0.42;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.35;
    this.delay.connect(feedback);
    feedback.connect(this.delay);
    this.delay.connect(this.filter);
  }

  tone(freq, start, attack, hold, release, peak, type, destination) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + attack);
    gain.gain.setValueAtTime(peak, start + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + release);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(start);
    osc.stop(start + attack + hold + release + 0.1);
  }

  schedule() {
    if (!this.playing) return;
    const now = this.ctx.currentTime + 0.05;
    const chord = CHORDS[this.step % CHORDS.length];
    chord.forEach((freq, i) => {
      this.tone(freq, now, 2.2, CHORD_SECONDS - 3, 3.2, 0.11, i % 2 ? 'triangle' : 'sine', this.filter);
    });
    // Unas pocas notas sueltas sobre el acorde
    const notes = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < notes; i++) {
      const freq = MELODY[Math.floor(Math.random() * MELODY.length)];
      const at = now + 0.6 + Math.random() * (CHORD_SECONDS - 1.5);
      this.tone(freq, at, 0.02, 0.05, 1.6, 0.05, 'sine', this.delay);
    }
    this.step += 1;
    this.timer = window.setTimeout(() => this.schedule(), CHORD_SECONDS * 1000);
  }

  async start() {
    if (!this.ctx) this.build();
    this.playing = true;
    await this.ctx.resume();
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.5, now + 1.2);
    this.schedule();
  }

  stop() {
    if (!this.ctx) return;
    this.playing = false;
    window.clearTimeout(this.timer);
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.6);
  }

  toggle() {
    if (this.playing) this.stop();
    else this.start();
    return this.playing;
  }
}
