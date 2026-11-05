const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const source = path.join(__dirname, '../public/icon.jpg');
  const outputDir = path.join(__dirname, '../electron/assets');
  const output = path.join(outputDir, 'AlQuranPrayer.ico');
  if (!fs.existsSync(source)) throw new Error('Missing source Quran artwork: ' + source);
  fs.mkdirSync(outputDir, { recursive: true });

  // Windows ICO: multiple embedded PNG frames, from small taskbar sizes
  // through 256px Explorer icons. All frames use the supplied Quran artwork.
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const frames = [];
  for (const size of sizes) {
    const png = await sharp(source)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .png()
      .toBuffer();
    frames.push({ size, png });
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO image type
  header.writeUInt16LE(frames.length, 4);

  const directory = Buffer.alloc(frames.length * 16);
  let offset = header.length + directory.length;
  frames.forEach((frame, index) => {
    const entry = index * 16;
    directory.writeUInt8(frame.size === 256 ? 0 : frame.size, entry);
    directory.writeUInt8(frame.size === 256 ? 0 : frame.size, entry + 1);
    directory.writeUInt8(0, entry + 2); // palette
    directory.writeUInt8(0, entry + 3); // reserved
    directory.writeUInt16LE(1, entry + 4); // planes
    directory.writeUInt16LE(32, entry + 6); // bits per pixel
    directory.writeUInt32LE(frame.png.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += frame.png.length;
  });

  fs.writeFileSync(output, Buffer.concat([header, directory, ...frames.map(f => f.png)]));
  const stat = fs.statSync(output);
  if (stat.size < 1000) throw new Error('Generated Windows icon is unexpectedly small');
  console.log(`Created ${output} (${stat.size} bytes; ${sizes.join(', ')} px frames)`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
