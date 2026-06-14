/**
 * One-off generator for the new-message notification sound.
 * Synthesizes a single bright boxing-ring "ding" bell — a gym/boxing
 * exercise cue — and encodes it to MP3. The committed asset already exists;
 * only re-run this to regenerate it:
 *     npm i -D @breezystack/lamejs
 *     node scripts/gen-chat-sound.mjs
 *     npm uninstall @breezystack/lamejs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Mp3Encoder } from '@breezystack/lamejs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_RATE = 44100;
const OUT = path.join(__dirname, '..', 'public', 'sounds', 'new-message.mp3');

// A boxing-ring bell is a bright brass bell: a few inharmonic partials over a
// strong fundamental, ringing out with a long sustain after each strike.
const PARTIALS = [
    { ratio: 1.0, gain: 1.0, decay: 3.0 },
    { ratio: 2.0, gain: 0.6, decay: 3.6 },
    { ratio: 2.41, gain: 0.5, decay: 4.2 },
    { ratio: 3.0, gain: 0.42, decay: 4.8 },
    { ratio: 4.16, gain: 0.3, decay: 5.6 },
    { ratio: 5.43, gain: 0.22, decay: 6.6 },
    { ratio: 6.79, gain: 0.14, decay: 7.8 },
];

/** One bell strike of `dur` seconds at fundamental `f0`, written into `buf`
 *  from sample `start`. Bright brass partials with a long ringing tail, plus a
 *  tiny strike transient for the metallic "ting" attack. */
function strike(buf, start, dur, f0, amp) {
    const n = Math.floor(dur * SAMPLE_RATE);
    for (let i = 0; i < n; i++) {
        const t = i / SAMPLE_RATE;

        let ring = 0;
        for (const p of PARTIALS) {
            ring += p.gain * Math.sin(2 * Math.PI * f0 * p.ratio * t) * Math.exp(-p.decay * t);
        }

        // Sharp clapper contact at the very attack.
        const click = i < 80 ? (1 - i / 80) * (Math.random() * 2 - 1) * 0.4 : 0;

        const idx = start + i;
        if (idx < buf.length) buf[idx] += amp * (ring * 0.5 + click);
    }
}

const totalDur = 1.7; // seconds
const total = Math.floor(totalDur * SAMPLE_RATE);
const buf = new Float32Array(total);

// A single boxing-bell "ding".
strike(buf, 0, 1.6, 600, 0.95);

// Normalize to avoid clipping, then convert to 16-bit PCM.
let peak = 0;
for (let i = 0; i < total; i++) peak = Math.max(peak, Math.abs(buf[i]));
const norm = peak > 0 ? 0.89 / peak : 1;
const pcm = new Int16Array(total);
for (let i = 0; i < total; i++) {
    const v = Math.max(-1, Math.min(1, buf[i] * norm));
    pcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
}

const enc = new Mp3Encoder(1, SAMPLE_RATE, 128);
const chunks = [];
const BLOCK = 1152;
for (let i = 0; i < pcm.length; i += BLOCK) {
    const out = enc.encodeBuffer(pcm.subarray(i, i + BLOCK));
    if (out.length) chunks.push(Buffer.from(out));
}
const end = enc.flush();
if (end.length) chunks.push(Buffer.from(end));

fs.writeFileSync(OUT, Buffer.concat(chunks));
console.log('wrote', OUT, fs.statSync(OUT).size, 'bytes');
