import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const width = 1600;
const height = 1000;
const rows = Buffer.alloc((width * 4 + 1) * height);

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return;
  }

  const index = y * (width * 4 + 1) + 1 + x * 4;
  if (a >= 255) {
    rows[index] = r;
    rows[index + 1] = g;
    rows[index + 2] = b;
    rows[index + 3] = 255;
    return;
  }

  const alpha = a / 255;
  rows[index] = Math.round(r * alpha + rows[index] * (1 - alpha));
  rows[index + 1] = Math.round(g * alpha + rows[index + 1] * (1 - alpha));
  rows[index + 2] = Math.round(b * alpha + rows[index + 2] * (1 - alpha));
  rows[index + 3] = 255;
}

function fillRect(x, y, w, h, color, alpha = 255) {
  for (let yy = Math.max(0, y); yy < Math.min(height, y + h); yy += 1) {
    for (let xx = Math.max(0, x); xx < Math.min(width, x + w); xx += 1) {
      setPixel(xx, yy, color[0], color[1], color[2], alpha);
    }
  }
}

function fillCircle(cx, cy, radius, color, alpha = 255) {
  const radiusSq = radius * radius;
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radiusSq) {
        setPixel(x, y, color[0], color[1], color[2], alpha);
      }
    }
  }
}

function fillRoundedRect(x, y, w, h, radius, color, alpha = 255) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const left = xx < x + radius;
      const right = xx >= x + w - radius;
      const top = yy < y + radius;
      const bottom = yy >= y + h - radius;

      if ((left || right) && (top || bottom)) {
        const cx = left ? x + radius : x + w - radius - 1;
        const cy = top ? y + radius : y + h - radius - 1;
        const dx = xx - cx;
        const dy = yy - cy;
        if (dx * dx + dy * dy > radius * radius) {
          continue;
        }
      }

      setPixel(xx, yy, color[0], color[1], color[2], alpha);
    }
  }
}

function fillArch(cx, baseY, outerRadius, innerRadius, color, alpha = 255) {
  for (let y = baseY - outerRadius; y <= baseY; y += 1) {
    for (let x = cx - outerRadius; x <= cx + outerRadius; x += 1) {
      const dx = x - cx;
      const dy = y - baseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const insideOuter = distance <= outerRadius;
      const outsideInner = distance >= innerRadius || y > baseY - innerRadius * 0.68;
      if (insideOuter && outsideInner) {
        setPixel(x, y, color[0], color[1], color[2], alpha);
      }
    }
  }
}

for (let y = 0; y < height; y += 1) {
  const rowStart = y * (width * 4 + 1);
  rows[rowStart] = 0;
  for (let x = 0; x < width; x += 1) {
    const sky = y / height;
    const r = Math.round(18 + 25 * sky);
    const g = Math.round(92 + 48 * sky);
    const b = Math.round(82 + 35 * sky);
    setPixel(x, y, r, g, b);
  }
}

fillRect(0, 720, width, 280, [230, 244, 234], 255);
fillRoundedRect(900, 145, 420, 540, 18, [245, 248, 241], 232);
fillRoundedRect(950, 205, 320, 430, 14, [255, 255, 255], 210);
fillArch(1110, 560, 150, 88, [15, 122, 91], 255);
fillRoundedRect(1004, 556, 212, 46, 8, [15, 122, 91], 255);
fillRect(1092, 300, 38, 245, [15, 122, 91], 255);
fillCircle(1111, 286, 50, [245, 183, 68], 255);

fillRoundedRect(180, 580, 500, 180, 18, [255, 255, 255], 235);
fillRoundedRect(230, 625, 400, 34, 8, [223, 246, 234], 255);
fillRoundedRect(230, 680, 300, 34, 8, [245, 183, 68], 255);
fillCircle(285, 555, 64, [245, 183, 68], 255);
fillCircle(414, 545, 58, [163, 95, 59], 255);
fillCircle(540, 555, 64, [87, 150, 190], 255);
fillRoundedRect(235, 580, 100, 115, 16, [16, 34, 29], 245);
fillRoundedRect(370, 570, 90, 125, 16, [15, 122, 91], 245);
fillRoundedRect(492, 580, 100, 115, 16, [16, 34, 29], 245);

fillRoundedRect(655, 430, 200, 220, 18, [250, 252, 248], 240);
fillRoundedRect(700, 475, 110, 105, 16, [223, 246, 234], 255);
fillCircle(755, 498, 44, [15, 122, 91], 255);
fillRoundedRect(735, 560, 40, 70, 8, [245, 183, 68], 255);

fillRoundedRect(120, 800, 1280, 78, 22, [16, 34, 29], 60);
fillRoundedRect(1010, 730, 270, 80, 12, [15, 122, 91], 255);
fillRoundedRect(1040, 756, 120, 28, 8, [245, 248, 241], 255);
fillCircle(1220, 770, 34, [245, 183, 68], 255);

for (let i = 0; i < 9500; i += 1) {
  const x = Math.floor(Math.random() * width);
  const y = Math.floor(Math.random() * height);
  const shade = Math.floor(220 + Math.random() * 35);
  setPixel(x, y, shade, shade, shade, 18);
}

const signature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  signature,
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(rows, { level: 9 })),
  chunk("IEND", Buffer.alloc(0))
]);

const here = dirname(fileURLToPath(import.meta.url));
writeFileSync(`${here}/../public/assets/hero-donation.png`, png);
