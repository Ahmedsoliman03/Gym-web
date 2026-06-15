/**
 * One-off generator for the in-app notification sound (votes, comments,
 * replies, job applications — everything except chat, which has its own
 * boxing-bell ding in scripts/gen-chat-sound.mjs).
 *
 * Synthesizes a soft two-note "glassy" chime (a gentle rising third) so it is
 * clearly distinct from the chat bell. The committed asset already exists; only
 * re-run this to regenerate it:
 *     npm i -D @breezystack/lamejs
 *     node scripts/gen-notification-sound.mjs
 *     npm uninstall @breezystack/lamejs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Mp3Encoder } from '@breezystack/lamejs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_RATE = 44100;
const OUT = path.join(__dirname, '..', 'public', 'sounds', 'notification.mp3');

// A glass/celesta-like tone: a clean fundamental with a couple of soft, mostly
// harmonic partials and a short, smooth decay — no metallic clapper transient.
const PARTIALS = [
    { ratio: 1.0, gain: 1.0, decay: 7.0 },
    { ratio: 2.0, gain: 0.35, decay: 9.0 },
    { ratio: 3.0, gain: 0.12, decay: 11.0 },
    { ratio: 4.2, gain: 0.06, decay: 13.0 },
];

/** One soft chime note of `dur` seconds at fundamental `f0`, written into `buf`
 *  from sample `start`. A short raised-cosine attack avoids any click. */
function note(buf, start, dur, f0, amp) {
    const n = Math.floor(dur * SAMPLE_RATE);
    const attack = Math.floor(0.005 * SAMPLE_RATE); // 5ms fade-in
    for (let i = 0; i < n; i++) {
        const t = i / SAMPLE_RATE;

        let ring = 0;
        for (const p of PARTIALS) {
            ring += p.gain * Math.sin(2 * Math.PI * f0 * p.ratio * t) * Math.exp(-p.decay * t);
        }

        // Smooth fade-in so the onset is gentle, not a pop.
        const env = i < attack ? 0.5 - 0.5 * Math.cos((Math.PI * i) / attack) : 1;

        const idx = start + i;
        if (idx < buf.length) buf[idx] += amp * ring * env;
    }
}

const totalDur = 1.1; // seconds
const total = Math.floor(totalDur * SAMPLE_RATE);
const buf = new Float32Array(total);

// Two ascending notes (C6 → E6, a major third) for a friendly "di-doo" cue.
note(buf, 0, 0.9, 1046.5, 0.9);
note(buf, Math.floor(0.13 * SAMPLE_RATE), 0.95, 1318.5, 0.9);

// Normalize to avoid clipping, then convert to 16-bit PCM.
let peak = 0;
for (let i = 0; i < total; i++) peak = Math.max(peak, Math.abs(buf[i]));
const norm = peak > 0 ? 0.85 / peak : 1;
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
