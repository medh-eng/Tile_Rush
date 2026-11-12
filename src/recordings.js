// Real recorded performances. No oscillators, pitch shifting or time stretching.
// Buffers are decoded lazily; only two short stereo excerpts are retained.
export class RecordingBank {
  constructor(ctx, { fetcher = (input) => globalThis.fetch(input), maxBuffers = 2 } = {}) {
    this.ctx = ctx; this.fetcher = fetcher; this.maxBuffers = maxBuffers;
    this.buffers = new Map(); this.pending = new Map(); this.active = null;
    this.master = ctx.createGain(); this.master.connect(ctx.destination);
  }
  async load(recording) {
    const key = recording.src;
    if (this.buffers.has(key)) {
      const buffer = this.buffers.get(key); this.buffers.delete(key); this.buffers.set(key, buffer); return buffer;
    }
    if (this.pending.has(key)) return this.pending.get(key);
    const promise = (async () => {
      const response = await this.fetcher(key);
      if (!response.ok) throw new Error('The piano recording could not be downloaded. Please try again.');
      const buffer = await this.ctx.decodeAudioData(await response.arrayBuffer());
      if (buffer.duration < recording.duration - .15) throw new Error('The piano recording is incomplete. Please try again.');
      this.buffers.set(key, buffer);
      while (this.buffers.size > this.maxBuffers) this.buffers.delete(this.buffers.keys().next().value);
      return buffer;
    })();
    this.pending.set(key, promise);
    try { return await promise; } finally { this.pending.delete(key); }
  }
  play(buffer, at, offset) {
    this.stop();
    if (offset >= buffer.duration) return;
    const source = this.ctx.createBufferSource(), envelope = this.ctx.createGain(); source.buffer = buffer;
    envelope.gain.setValueAtTime(0, at); envelope.gain.linearRampToValueAtTime(1, at + .012);
    source.connect(envelope); envelope.connect(this.master);
    const voice = { source, envelope }; this.active = voice;
    source.onended = () => { source.disconnect(); envelope.disconnect(); if (this.active === voice) this.active = null; };
    source.start(at, Math.max(0, offset));
  }
  stop() {
    const voice = this.active; this.active = null;
    if (voice) { try { voice.source.stop(); } catch { /* already ended */ } voice.source.disconnect(); voice.envelope.disconnect(); }
  }
  setVolume(value) { this.master.gain.setTargetAtTime(value, this.ctx.currentTime, .03); }
}
