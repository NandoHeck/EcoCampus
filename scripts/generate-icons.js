'use strict';

/**
 * Gera os PNGs necessários para o PWA a partir dos SVGs em `img/`.
 * Executa uma única vez com: `npm run icons`
 *
 * Saídas:
 *   img/icon-192.png            (any purpose)
 *   img/icon-512.png            (any purpose)
 *   img/icon-maskable-512.png   (maskable purpose)
 *   img/apple-touch-icon.png    (180x180 — iOS)
 *   img/favicon-32.png / favicon-16.png
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const IMG = path.join(ROOT, 'img');

async function main() {
  const svgAny = fs.readFileSync(path.join(IMG, 'icon.svg'));
  const svgMaskable = fs.readFileSync(path.join(IMG, 'icon-maskable.svg'));

  const targets = [
    { src: svgAny,      size: 192, out: 'icon-192.png' },
    { src: svgAny,      size: 512, out: 'icon-512.png' },
    { src: svgMaskable, size: 512, out: 'icon-maskable-512.png' },
    { src: svgAny,      size: 180, out: 'apple-touch-icon.png' },
    { src: svgAny,      size: 32,  out: 'favicon-32.png' },
    { src: svgAny,      size: 16,  out: 'favicon-16.png' }
  ];

  for (const t of targets) {
    const outPath = path.join(IMG, t.out);
    await sharp(t.src, { density: 384 })
      .resize(t.size, t.size, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`  ✓ ${t.out}  (${t.size}x${t.size})`);
  }

  console.log('\nÍcones gerados com sucesso em /img.');
}

main().catch((err) => {
  console.error('Falha ao gerar ícones:', err);
  process.exit(1);
});
