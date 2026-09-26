// Generates the full custom icon set for the app — no dependencies, pure node.
// Design: navy rounded square (matches dark theme) + sky ring + white check.
// Run with: node scripts/make-icon.js
const { writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { deflateSync } = require("node:zlib");

const root = join(__dirname, "..", "assets", "images");

// --- minimal PNG writer (RGBA, 8-bit, non-interlaced) ---
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++)
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- tiny software canvas ---
function canvas(s) {
  return {
    s,
    buf: Buffer.alloc(s * s * 4),
    px(x, y, r, g, b, a = 255) {
      x |= 0;
      y |= 0;
      if (x < 0 || y < 0 || x >= this.s || y >= this.s) return;
      const i = (y * this.s + x) * 4;
      // source-over blend
      const sa = a / 255;
      const da = this.buf[i + 3] / 255;
      const oa = sa + da * (1 - sa);
      if (oa === 0) return;
      this.buf[i] = (r * sa + this.buf[i] * da * (1 - sa)) / oa;
      this.buf[i + 1] = (g * sa + this.buf[i + 1] * da * (1 - sa)) / oa;
      this.buf[i + 2] = (b * sa + this.buf[i + 2] * da * (1 - sa)) / oa;
      this.buf[i + 3] = oa * 255;
    },
    disc(cx, cy, r, col) {
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++)
          if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) this.px(x, y, ...col);
    },
    line(x0, y0, x1, y1, w, col) {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const steps = Math.ceil(Math.hypot(dx, dy));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        this.disc(x0 + dx * t, y0 + dy * t, w / 2, col);
      }
    },
    rrect(x0, y0, x1, y1, rad, top, bottom) {
      for (let y = Math.floor(y0); y < y1; y++) {
        const t = (y - y0) / (y1 - y0);
        const col = top.map((c, i) => Math.round(c + (bottom[i] - c) * t));
        for (let x = Math.floor(x0); x < x1; x++) {
          const cx = Math.min(Math.max(x, x0 + rad), x1 - rad);
          const cy = Math.min(Math.max(y, y0 + rad), y1 - rad);
          if ((x - cx) ** 2 + (y - cy) ** 2 <= rad * rad) this.px(x, y, ...col);
        }
      }
    },
    ring(cx, cy, r, w, col) {
      for (let y = Math.floor(cy - r - w); y <= Math.ceil(cy + r + w); y++)
        for (let x = Math.floor(cx - r - w); x <= Math.ceil(cx + r + w); x++) {
          const d = Math.hypot(x - cx, y - cy);
          if (Math.abs(d - r) <= w / 2) this.px(x, y, ...col);
        }
    },
  };
}

const NAVY_TOP = [22, 36, 63];
const NAVY_BOT = [11, 18, 32];
const SKY = [91, 156, 240];
const WHITE = [255, 255, 255];

function drawMark(c, u) {
  // u = unit (canvas size / 1024)
  const S = (v) => v * u;
  c.rrect(S(64), S(64), S(960), S(960), S(220), NAVY_TOP, NAVY_BOT);
  c.ring(S(512), S(512), S(300), S(56), SKY);
  // check: (380,530) -> (490,640) -> (660,400)
  c.line(S(380), S(530), S(490), S(640), S(88), WHITE);
  c.line(S(490), S(640), S(660), S(400), S(88), WHITE);
}

function drawMono(c, u) {
  const S = (v) => v * u;
  c.ring(S(512), S(512), S(300), S(72), WHITE);
  c.line(S(380), S(530), S(490), S(640), S(104), WHITE);
  c.line(S(490), S(640), S(660), S(400), S(104), WHITE);
}

function save(name, size, draw) {
  const c = canvas(size);
  draw(c, size / 1024);
  writeFileSync(join(root, name), encodePNG(size, size, c.buf));
  console.log(`wrote ${name} (${size}x${size})`);
}

function saveSolid(name, size, col) {
  const c = canvas(size);
  for (let i = 0; i < size * size; i++) {
    c.buf[i * 4] = col[0];
    c.buf[i * 4 + 1] = col[1];
    c.buf[i * 4 + 2] = col[2];
    c.buf[i * 4 + 3] = 255;
  }
  writeFileSync(join(root, name), encodePNG(size, size, c.buf));
  console.log(`wrote ${name} (${size}x${size})`);
}

save("icon.png", 1024, drawMark);
save("android-icon-foreground.png", 1024, drawMark);
saveSolid("android-icon-background.png", 1024, NAVY_BOT);
save("android-icon-monochrome.png", 1024, drawMono);
save("splash-icon.png", 1024, drawMark);
save("favicon.png", 256, drawMark);
