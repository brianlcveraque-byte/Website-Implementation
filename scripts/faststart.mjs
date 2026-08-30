/**
 * Move the moov atom in front of mdat, so an MP4 can start playing before it
 * has finished downloading. What `ffmpeg -movflags +faststart` does, minus
 * ffmpeg.
 *
 * The catch is that stco/co64 hold absolute file offsets into mdat. Relocating
 * moov ahead of mdat pushes every one of those forward by exactly moov's size,
 * so each entry has to be rewritten or the file becomes unplayable in a way
 * that looks fine until it is seeked.
 *
 * Only offsets are touched. Nothing is re-encoded, so the video and audio are
 * bit-for-bit the ones that went in.
 */
import { readFileSync, writeFileSync } from "node:fs";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: faststart.mjs <input.mp4> <output.mp4>");
  process.exit(1);
}

const buf = readFileSync(input);

/** Top-level box list: [type, start, size]. */
function topLevel(b) {
  const out = [];
  let o = 0;
  while (o + 8 <= b.length) {
    let size = b.readUInt32BE(o);
    const type = b.toString("latin1", o + 4, o + 8);
    let header = 8;
    if (size === 1) {
      size = Number(b.readBigUInt64BE(o + 8));
      header = 16;
    }
    if (size < header) break;
    out.push({ type, start: o, size });
    o += size;
  }
  return out;
}

const boxes = topLevel(buf);
const moov = boxes.find((x) => x.type === "moov");
const mdat = boxes.find((x) => x.type === "mdat");

if (!moov || !mdat) {
  console.error("No moov or no mdat — not an MP4 this script understands.");
  process.exit(1);
}
if (moov.start < mdat.start) {
  console.log("Already faststart. Nothing to do.");
  process.exit(0);
}

// moov is copied so the original stays intact for the offset walk.
const moovBuf = Buffer.from(buf.subarray(moov.start, moov.start + moov.size));

/**
 * Every chunk offset moves forward by moov's own length, because moov is being
 * inserted ahead of mdat and nothing else changes size.
 */
const delta = moov.size;

const CONTAINERS = new Set(["moov", "trak", "mdia", "minf", "stbl", "edts", "udta"]);
let patched = 0;

function walk(b, start, end) {
  let o = start;
  while (o + 8 <= end) {
    let size = b.readUInt32BE(o);
    const type = b.toString("latin1", o + 4, o + 8);
    let header = 8;
    if (size === 1) {
      size = Number(b.readBigUInt64BE(o + 8));
      header = 16;
    }
    if (size < header || o + size > end) break;

    if (type === "stco") {
      // version+flags (4), entry count (4), then 32-bit offsets.
      const count = b.readUInt32BE(o + header + 4);
      for (let i = 0; i < count; i++) {
        const at = o + header + 8 + i * 4;
        const v = b.readUInt32BE(at) + delta;
        if (v > 0xffffffff) {
          console.error("An offset no longer fits in 32 bits; this file needs co64.");
          process.exit(1);
        }
        b.writeUInt32BE(v, at);
        patched++;
      }
    } else if (type === "co64") {
      const count = b.readUInt32BE(o + header + 4);
      for (let i = 0; i < count; i++) {
        const at = o + header + 8 + i * 8;
        b.writeBigUInt64BE(b.readBigUInt64BE(at) + BigInt(delta), at);
        patched++;
      }
    } else if (CONTAINERS.has(type)) {
      walk(b, o + header, o + size);
    }

    o += size;
  }
}

walk(moovBuf, 8, moovBuf.length);

// Rebuild: everything that is not moov, in its original order, with moov
// spliced in immediately before mdat.
const parts = [];
for (const box of boxes) {
  if (box.type === "moov") continue;
  if (box.type === "mdat") parts.push(moovBuf);
  parts.push(buf.subarray(box.start, box.start + box.size));
}

const out = Buffer.concat(parts);
writeFileSync(output, out);

console.log(`patched ${patched} chunk offset(s) by +${delta}`);
console.log(`${input} -> ${output}  (${buf.length} -> ${out.length} bytes)`);

// Prove the rewrite rather than trust it: moov must now precede mdat, the
// length must be unchanged, and every chunk offset must land inside mdat.
const verify = topLevel(out);
const vMoov = verify.find((x) => x.type === "moov");
const vMdat = verify.find((x) => x.type === "mdat");
console.log("order:", verify.map((x) => x.type).join(" "));

let worst = null;
const vMoovBuf = out.subarray(vMoov.start, vMoov.start + vMoov.size);
function check(b, start, end, base) {
  let o = start;
  while (o + 8 <= end) {
    let size = b.readUInt32BE(o);
    const type = b.toString("latin1", o + 4, o + 8);
    let header = 8;
    if (size === 1) { size = Number(b.readBigUInt64BE(o + 8)); header = 16; }
    if (size < header || o + size > end) break;
    if (type === "stco" || type === "co64") {
      const count = b.readUInt32BE(o + header + 4);
      for (let i = 0; i < count; i++) {
        const v = type === "stco"
          ? b.readUInt32BE(o + header + 8 + i * 4)
          : Number(b.readBigUInt64BE(o + header + 8 + i * 8));
        if (v < vMdat.start || v >= vMdat.start + vMdat.size) worst = v;
      }
    } else if (CONTAINERS.has(type)) check(b, o + header, o + size, base);
    o += size;
  }
}
check(vMoovBuf, 8, vMoovBuf.length, vMoov.start);

const ok = vMoov.start < vMdat.start && out.length === buf.length && worst === null;
console.log(
  ok
    ? "VERIFIED: moov precedes mdat, size unchanged, every chunk offset inside mdat"
    : `FAILED: moovFirst=${vMoov.start < vMdat.start} sameSize=${out.length === buf.length} strayOffset=${worst}`,
);
process.exit(ok ? 0 : 1);
