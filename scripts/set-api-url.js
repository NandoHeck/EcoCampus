'use strict';

/**
 * Atualiza a `<meta name="ecocampus-api">` em todos os HTMLs para apontar
 * ao backend em produção.
 *
 * Uso:
 *   node scripts/set-api-url.js https://ecocampus-api.onrender.com/api
 *   node scripts/set-api-url.js ""         # remove a meta (volta para localhost)
 */

const fs = require('fs');
const path = require('path');

const HTML_FILES = [
  'index.html',
  'offline.html',
  'pages/404.html',
  'pages/anuncio.html',
  'pages/anuncios.html',
  'pages/cadastro.html',
  'pages/criar-anuncio.html',
  'pages/dashboard.html',
  'pages/editar-anuncio.html',
  'pages/favoritos.html',
  'pages/login.html',
  'pages/perfil.html'
];

// Casa a linha inteira do meta (com whitespace inicial e newline final)
const META_REGEX = /^[ \t]*<meta\s+name=["']ecocampus-api["'][^>]*>[ \t]*\r?\n/gm;

function main() {
  const url = process.argv[2];
  if (url === undefined) {
    console.error('Uso: node scripts/set-api-url.js <URL_DA_API>');
    console.error('  Ex.: node scripts/set-api-url.js https://ecocampus-api.onrender.com/api');
    console.error('  Para remover: node scripts/set-api-url.js ""');
    process.exit(1);
  }

  const ROOT = path.resolve(__dirname, '..');
  const cleanUrl = url.trim().replace(/\/$/, '');
  const tag = cleanUrl
    ? `  <meta name="ecocampus-api" content="${cleanUrl}">\n`
    : '';

  let changed = 0;
  for (const rel of HTML_FILES) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) { console.warn('  ! não encontrado:', rel); continue; }
    let content = fs.readFileSync(full, 'utf8');
    const before = content;

    // Remove qualquer meta ecocampus-api existente (linha inteira)
    content = content.replace(META_REGEX, '');

    if (tag) {
      // Insere logo depois do bloco de meta tags PWA (após apple-touch-icon)
      const anchor = /<link\s+rel=["']apple-touch-icon["'][^>]*>\s*\n/;
      if (anchor.test(content)) {
        content = content.replace(anchor, (m) => m + tag);
      } else {
        // fallback: insere antes de </head>
        content = content.replace('</head>', tag + '</head>');
      }
    }

    if (content !== before) {
      fs.writeFileSync(full, content, 'utf8');
      changed++;
      console.log('  ✓', rel);
    }
  }

  console.log(`\n${changed} arquivo(s) atualizado(s).`);
  if (cleanUrl) {
    console.log(`API_BASE fixada em: ${cleanUrl}`);
  } else {
    console.log('Meta removida — voltou a usar detecção automática (localhost:3333).');
  }
}

main();
