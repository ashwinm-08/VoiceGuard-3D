// Web Audio API Synthesizer for VoiceGuard 3D Interactive Model

class AudioSynthService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.5;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setConfig(enabled: boolean, volume: number) {
    this.soundEnabled = enabled;
    this.volume = Math.max(0, Math.min(1, volume / 100));
  }

  public playClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playTone(freq: number, duration: number = 0.3, type: OscillatorType = 'sine') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(this.volume * 0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playFormantTone(f1: number, f2: number, f3: number, duration: number = 0.6) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.3, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    masterGain.connect(this.ctx.destination);

    const freqs = [f1, f2, f3];
    const weights = [0.5, 0.35, 0.15];

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(weights[idx], now);
      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();
      osc.stop(now + duration);
    });
  }

  public playChallengeTone(type: string, difficulty: string) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = difficulty === 'hard' ? 0.35 : difficulty === 'easy' ? 0.7 : 0.5;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    if (type === 'pitch-glide') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + duration * 0.5);
      osc.frequency.exponentialRampToValueAtTime(440, now + duration);
    } else if (type === 'frequency-sweep') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + duration);
    } else if (type === 'vowel-transition') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(800, now + duration * 0.3);
      osc.frequency.linearRampToValueAtTime(300, now + duration);
    } else {
      // Harmonic analysis
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(this.volume * 0.15, now);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + duration);
  }

  public playAlert(type: 'safe' | 'warning' | 'critical') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.ctx.destination);

    if (type === 'safe') {
      // Pleasant rising major chord
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, now + i * 0.08);
        g.gain.linearRampToValueAtTime(this.volume * 0.2, now + i * 0.08 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
        osc.connect(g);
        g.connect(gain);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } else if (type === 'warning') {
      // Two-tone warning beep
      [600, 480].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(this.volume * 0.2, now + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.1);
        osc.connect(g);
        g.connect(gain);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.11);
      });
    } else {
      // Critical threat siren
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.15);
      osc.frequency.linearRampToValueAtTime(880, now + 0.3);
      osc.frequency.linearRampToValueAtTime(440, now + 0.45);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  }
}

export const audioSynth = new AudioSynthService();
