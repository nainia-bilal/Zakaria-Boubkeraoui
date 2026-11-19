import { type SoundBedId } from './nleTimelineLogic';

/**
 * Lightweight browser-native Web Audio sound bed synthesizer for non-destructive
 * preview audio mixing in the NLE workspace (zero external audio file dependencies).
 */
export class NleSoundBedEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private activeOscs: OscillatorNode[] = [];
  private activeMode: SoundBedId = 'none';
  private stepIndex = 0;

  public start(mode: SoundBedId, volumePercent: number): void {
    if (mode === 'none') {
      this.stop();
      return;
    }

    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    this.setVolume(volumePercent);

    if (this.activeMode === mode && this.intervalId !== null) {
      return;
    }

    this.clearPattern();
    this.activeMode = mode;
    this.stepIndex = 0;

    const triggerStep = () => {
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;

      if (mode === 'lofi-beat') {
        const chords = [
          [220, 261.63, 329.63],
          [196, 246.94, 293.66],
          [174.61, 220, 261.63],
          [164.81, 196, 246.94],
        ];
        const chord = chords[this.stepIndex % chords.length];
        chord.forEach((freq) => this.playTone(freq, 'triangle', now, 0.75, 0.12));
        this.stepIndex++;
      } else if (mode === 'cinematic-pad') {
        const notes = [110, 164.81, 220];
        const freq = notes[this.stepIndex % notes.length];
        this.playTone(freq, 'sine', now, 1.4, 0.2);
        this.playTone(freq * 1.5, 'sine', now, 1.4, 0.08);
        this.stepIndex++;
      } else if (mode === 'upbeat-pulse') {
        const bass = [130.81, 130.81, 164.81, 196, 174.61, 164.81, 146.83, 196];
        const freq = bass[this.stepIndex % bass.length];
        this.playTone(freq, 'sawtooth', now, 0.22, 0.1, 700);
        this.stepIndex++;
      }
    };

    triggerStep();
    const intervalMs = mode === 'upbeat-pulse' ? 320 : mode === 'lofi-beat' ? 900 : 1400;
    this.intervalId = window.setInterval(triggerStep, intervalMs);
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    startTime: number,
    durationSec: number,
    peakGain: number,
    lowpassHz: number = 1400
  ): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(lowpassHz, startTime);

    env.gain.setValueAtTime(0.0001, startTime);
    env.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.04);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.05);
    this.activeOscs.push(osc);
    osc.onended = () => {
      this.activeOscs = this.activeOscs.filter((o) => o !== osc);
    };
  }

  public setVolume(volumePercent: number): void {
    if (!this.ctx || !this.masterGain) return;
    const clamped = Math.min(1, Math.max(0, volumePercent / 100));
    this.masterGain.gain.setTargetAtTime(clamped * 0.45, this.ctx.currentTime, 0.05);
  }

  private clearPattern(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.activeOscs.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // ignore stopped oscillator
      }
    });
    this.activeOscs = [];
  }

  public stop(): void {
    this.clearPattern();
    this.activeMode = 'none';
  }

  public dispose(): void {
    this.stop();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.masterGain = null;
    }
  }
}
