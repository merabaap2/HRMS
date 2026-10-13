const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPng(width, height, r, g, b, a = 255) {
  // Create raw RGBA rows with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // Blue rounded card with subtle gradient or icon style
      const isCorner =
        (x < 24 && y < 24 && Math.hypot(x - 24, y - 24) > 24) ||
        (x > width - 24 && y < 24 && Math.hypot(x - (width - 24), y - 24) > 24) ||
        (x < 24 && y > height - 24 && Math.hypot(x - 24, y - (height - 24)) > 24) ||
        (x > width - 24 && y > height - 24 && Math.hypot(x - (width - 24), y - (height - 24)) > 24);

      if (isCorner) {
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
      } else {
        const factor = (y / height) * 0.3;
        rawData[pixelOffset] = Math.max(0, Math.min(255, Math.floor(r * (1 - factor))));
        rawData[pixelOffset + 1] = Math.max(0, Math.min(255, Math.floor(g * (1 - factor))));
        rawData[pixelOffset + 2] = Math.max(0, Math.min(255, Math.floor(b * (1 - factor))));
        rawData[pixelOffset + 3] = a;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.slice(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate brand blue icon (#2563eb = rgb(37, 99, 235))
const p192 = createPng(192, 192, 37, 99, 235);
const p512 = createPng(512, 512, 37, 99, 235);

const publicDir = path.join(__dirname, '../public');
const rootDir = path.join(__dirname, '..');

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), p192);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), p512);
fs.writeFileSync(path.join(rootDir, 'icon-192.png'), p192);
fs.writeFileSync(path.join(rootDir, 'icon-512.png'), p512);

console.log('Successfully generated valid 192px and 512px PWA & Favicon icons!');
