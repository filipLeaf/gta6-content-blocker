// Builds the extension into dist/ (load that folder in the browser).
//   node scripts/build.mjs          one build
//   node scripts/build.mjs --watch  rebuild on every change
//   node scripts/build.mjs --zip    zip dist/ for the stores
import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const watch = process.argv.includes('--watch');
const zip = process.argv.includes('--zip');

if (zip) {
  const { version } = JSON.parse(readFileSync('dist/manifest.json', 'utf8'));
  const out = `gta6-spoiler-blocker-${version}.zip`;
  rmSync(out, { force: true });
  execFileSync('zip', ['-r', '-q', `../${out}`, '.'], { cwd: 'dist' });
  console.log(`Created ${out}`);
  process.exit(0);
}

// Files copied as-is: [from, to]
const STATIC = [
  ['public', 'dist'],
  ['src/content/blocker.css', 'dist/content/blocker.css'],
  ['src/popup/popup.html', 'dist/popup/popup.html'],
  ['src/popup/popup.css', 'dist/popup/popup.css'],
  ['src/options/options.html', 'dist/options/options.html'],
  ['src/options/options.css', 'dist/options/options.css'],
];

function copyStatic() {
  for (const [from, to] of STATIC) cpSync(from, to, { recursive: true });
}

// Content scripts can't be ES modules, so every entry is bundled into one IIFE file.
const options = {
  entryPoints: {
    'content/content': 'src/content/index.ts',
    'popup/popup': 'src/popup/popup.ts',
    'options/options': 'src/options/options.ts',
  },
  outdir: 'dist',
  bundle: true,
  format: 'iife',
  target: ['chrome120', 'firefox128'],
  logLevel: 'info',
  plugins: [{ name: 'copy-static', setup: (b) => b.onEnd(copyStatic) }],
};

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(options);
}
