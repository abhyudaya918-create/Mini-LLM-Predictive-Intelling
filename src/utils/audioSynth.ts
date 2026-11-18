/**
 * Web Audio synthetic audio generator to produce valid WAV base64 data
 * for instant testing of acoustic multimodal analysis without external files.
 */

function encodeWav(samples: Float32Array, sampleRate: number): string {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM = 1)
  view.setUint16(20, 1, true);
  // channel count (1 mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 2)
  view.setUint32(28, sampleRate * 2, true);
  // block align (2 bytes)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  // Convert buffer to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Generate synthetic Guitar Arpeggio audio (3 seconds).
 */
export function generateGuitarArpeggio(): { base64: string; mimeType: string } {
  const sampleRate = 22050;
  const duration = 3.2;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  // Chords: C, E, G, B, C, D
  const freqs = [261.63, 329.63, 392.0, 493.88, 523.25, 587.33];
  const noteDuration = 0.45;

  for (let noteIdx = 0; noteIdx < freqs.length; noteIdx++) {
    const freq = freqs[noteIdx];
    const startSample = Math.floor(noteIdx * noteDuration * sampleRate);

    for (let i = 0; i < sampleRate * 1.2 && startSample + i < numSamples; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-t * 4); // pluck envelope
      // Fundamental + harmonic overtones for warm acoustic guitar tone
      const harmonic1 = Math.sin(2 * Math.PI * freq * t);
      const harmonic2 = 0.5 * Math.sin(2 * Math.PI * freq * 2 * t);
      const harmonic3 = 0.25 * Math.sin(2 * Math.PI * freq * 3 * t);
      const val = (harmonic1 + harmonic2 + harmonic3) * decay * 0.4;

      samples[startSample + i] += val;
    }
  }

  const base64 = encodeWav(samples, sampleRate);
  return { base64, mimeType: 'audio/wav' };
}

/**
 * Generate synthetic Nature Stream & Bird Song audio (3.5 seconds).
 */
export function generateNatureStream(): { base64: string; mimeType: string } {
  const sampleRate = 22050;
  const duration = 3.5;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  // Water stream: low-pass filtered noise with gentle swells
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < numSamples; i++) {
    const white = Math.random() * 2 - 1;
    // Pink noise approximation
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    const pink = (b0 + b1 + b2 + white * 0.5362) * 0.06;
    const t = i / sampleRate;
    const swell = 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.4 * t);
    samples[i] = pink * swell;
  }

  // Bird chirps at t = 0.6s and t = 1.9s
  const birdMoments = [0.6, 1.8, 2.7];
  for (const startSec of birdMoments) {
    const startSample = Math.floor(startSec * sampleRate);
    const chirpLen = Math.floor(0.22 * sampleRate);
    for (let i = 0; i < chirpLen && startSample + i < numSamples; i++) {
      const t = i / sampleRate;
      // Frequency sweep from 2800Hz to 4200Hz
      const chirpFreq = 2800 + 1400 * Math.sin((t / 0.22) * Math.PI);
      const amp = Math.sin((t / 0.22) * Math.PI) * 0.25;
      samples[startSample + i] += Math.sin(2 * Math.PI * chirpFreq * t) * amp;
    }
  }

  const base64 = encodeWav(samples, sampleRate);
  return { base64, mimeType: 'audio/wav' };
}

/**
 * Generate synthetic Vocal / Speech Formant audio (2.5 seconds).
 */
export function generateSpeechUtterance(): { base64: string; mimeType: string } {
  const sampleRate = 22050;
  const duration = 2.8;
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  // Vowel formant synthesis simulating spoken speech syllables "a-i-o-u"
  const vowels = [
    { f0: 130, f1: 730, f2: 1090 }, // /a/
    { f0: 140, f1: 270, f2: 2290 }, // /i/
    { f0: 125, f1: 570, f2: 840 },  // /o/
    { f0: 120, f1: 300, f2: 870 },  // /u/
  ];

  const syllableDuration = 0.55;
  for (let sIdx = 0; sIdx < vowels.length; sIdx++) {
    const v = vowels[sIdx];
    const startSample = Math.floor(sIdx * (syllableDuration + 0.1) * sampleRate);

    for (let i = 0; i < syllableDuration * sampleRate && startSample + i < numSamples; i++) {
      const t = i / sampleRate;
      const progress = i / (syllableDuration * sampleRate);
      const env = Math.sin(progress * Math.PI); // smooth speech envelope

      // Glottal pulse approximation with formants
      const voice = Math.sin(2 * Math.PI * v.f0 * t);
      const formant1 = Math.sin(2 * Math.PI * v.f1 * t) * 0.4;
      const formant2 = Math.sin(2 * Math.PI * v.f2 * t) * 0.2;

      samples[startSample + i] += (voice + formant1 + formant2) * env * 0.35;
    }
  }

  const base64 = encodeWav(samples, sampleRate);
  return { base64, mimeType: 'audio/wav' };
}
