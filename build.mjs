// build.mjs — bundles src/ ES modules into the single-file index.html that
// GitHub Pages serves. No external dependencies; run with: node build.mjs
//
// How it works: each module body is a verbatim slice of the original game, so
// concatenating them (after stripping the import/export lines) reproduces the
// original program inside one IIFE. Order matters only for the few top-level
// statements (canvas setup, listener registration, boot), handled below.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

const ORDER = [
  'core/constants.js',
  'core/utils.js',
  'engine/canvas.js',
  'engine/audio.js',
  'game/state.js',
  'content/levels.js',
  'content/worldmap.js',
  'draw/creatures.js',
  'game/entities.js',
  'draw/render.js',
  'game/flow.js',
  'scenes/WorldMapScene.js',
  'scenes/BossScene.js',
  'scenes/CutsceneScene.js',
  'scenes/TitleScene.js',
  'scenes/StageScene.js',
  'scenes/SceneManager.js',
  'engine/loop.js',
  'core/input.js',
  'main.js',
];

function strip(code) {
  return code
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      if (t.startsWith('import ')) return false;       // drop ESM imports
      if (t.startsWith('export ')) return false;        // drop "export { ... };"
      return true;
    })
    .join('\n')
    .trim();
}

const chunks = [];
for (const rel of ORDER) {
  const code = readFileSync(join(here, 'src', rel), 'utf8');
  chunks.push(`/* ===== ${rel} ===== */\n${strip(code)}`);
}

const program = chunks.join('\n\n');
const iife = `(() => {\n'use strict';\n\n${program}\n\n})();`;

const shell = readFileSync(join(here, 'build.shell.html'), 'utf8');
if (!shell.includes('<!--BUNDLE-->')) {
  throw new Error('build.shell.html is missing the <!--BUNDLE--> placeholder');
}
const html = shell.replace('<!--BUNDLE-->', iife);

const out = join(here, 'index.html');
writeFileSync(out, html);
console.log(`Built ${out}`);
console.log(`  modules : ${ORDER.length}`);
console.log(`  JS size : ${iife.length} bytes`);
console.log(`  HTML    : ${html.length} bytes`);
