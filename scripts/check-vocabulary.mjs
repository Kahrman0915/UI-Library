// Preview-markup + vocabulary gate. Two checks nothing else performs.
//
// 1. PREVIEW CLASSES ARE REAL (below)
// 2. THE RETIRED SIZE VOCABULARY IS GONE (further down)
//
// Every `ui-*` class used in preview/**/*.html must be real — either STYLED (a
// selector exists in the built dist/styles.css) or EMITTED (a component renders
// it). The preview files are hand-authored and NO build step validates them, so
// a renamed or deleted class fails silently and the page just renders wrong.
//
// Both halves of the rule matter:
//   • styled-but-not-emitted is fine — the preview may show a state the React
//     component only reaches at runtime.
//   • emitted-but-not-styled is fine — `--default` rungs are usually no-ops,
//     since the base class already carries the default look.
//   • neither is drift, and that is what this catches.
//
// Emission is mostly by interpolation (`ui-attachment--state-${state}`), so
// prefixes are collected as well as whole literals.
//
// Run after `npm run build` — dist/styles.css is the oracle.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const rel = (p) => relative(ROOT, p);

const walk = (dir, test, out = []) => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, test, out);
    else if (test(name)) out.push(full);
  }
  return out;
};

const CSS = join(ROOT, 'dist/styles.css');
if (!existsSync(CSS)) {
  console.error('\n✗ dist/styles.css not found — run `npm run build` first.\n');
  process.exit(1);
}

// ── what the stylesheet defines ───────────────────────────────────────────────
const styled = new Set();
for (const m of readFileSync(CSS, 'utf8').matchAll(/\.(ui-[A-Za-z0-9_-]+)/g)) styled.add(m[1]);

// ── what the components emit ──────────────────────────────────────────────────
const emittedLiterals = new Set();
const emittedPrefixes = [];
for (const file of walk(join(ROOT, 'src'), (n) => n.endsWith('.tsx'))) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/ui-[A-Za-z0-9_-]*(?=\$\{)/g)) emittedPrefixes.push(m[0]);
  for (const m of text.matchAll(/\bui-[A-Za-z0-9_-]+/g)) emittedLiterals.add(m[0]);
}
const isEmitted = (cls) =>
  emittedLiterals.has(cls) ||
  emittedPrefixes.some((p) => cls.startsWith(p) && cls.length > p.length);

// ── what the previews use ─────────────────────────────────────────────────────
const previewFiles = walk(join(ROOT, 'preview'), (n) => n.endsWith('.html'));
const missing = [];
const seen = new Set();
let tokens = 0;

for (const file of previewFiles) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const attr of line.matchAll(/class\s*=\s*"([^"]*)"/g)) {
        for (const cls of attr[1].split(/\s+/)) {
          if (!cls.startsWith('ui-')) continue;
          tokens++;
          if (styled.has(cls) || isEmitted(cls)) continue;
          const key = `${rel(file)}:${cls}`;
          if (seen.has(key)) continue;
          seen.add(key);
          missing.push({ file: rel(file), line: i + 1, cls });
        }
      }
    });
}

// ── deprecated size vocabulary ────────────────────────────────────────────────
//
// The spelled-out scale (`xsmall` / `small` / `large`) was retired in favour of
// `xs` / `sm` / `default` / `lg`. TypeScript catches the typed call sites; it
// cannot see a raw class string or a hand-written HTML attribute, which is where
// the last stragglers hid — three in Pagination.tsx and 43 in preview/.
//
// Scoped to two structured patterns on purpose: a bare /small|large/ hits 80+
// files of legitimate prose and token names. docs/ and CLAUDE.md are NOT scanned
// — dated decision records are supposed to quote the old spellings.
const DEPRECATED = 'xsmall|small|large';
const PATTERNS = [
  { re: new RegExp(`--sz-(${DEPRECATED})\\b`), what: 'deprecated size class' },
  { re: new RegExp(`\\bsize\\s*[=:]\\s*(["'])(${DEPRECATED})\\1`), what: 'deprecated size value' },
];

const scanned = [
  ...walk(join(ROOT, 'src'), (n) => /\.(ts|tsx|scss)$/.test(n)),
  ...previewFiles,
  ...walk(join(ROOT, '.storybook'), (n) => /\.(ts|tsx|scss)$/.test(n)),
];

const stale = [];
for (const file of scanned) {
  if (rel(file) === 'scripts/check-vocabulary.mjs') continue;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const { re, what } of PATTERNS) {
        const m = line.match(re);
        if (m) stale.push({ file: rel(file), line: i + 1, what, text: m[0] });
      }
    });
}

// ── report ────────────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
console.log('\nPreview-markup + vocabulary check\n');
console.log(
  `  ${previewFiles.length} preview files · ${tokens} ui-* class tokens · ` +
    `${styled.size} styled selectors · ${emittedLiterals.size} emitted literals\n` +
    `  ${scanned.length} files scanned for the retired size vocabulary`,
);

if (stale.length) {
  console.error(`\n✗ ${stale.length} deprecated size literal(s):`);
  for (const h of stale) console.error(`   ${pad(`${h.file}:${h.line}`, 54)} ${h.what} — ${h.text}`);
}

if (missing.length) {
  console.error(`\n✗ ${missing.length} class(es) that are neither styled nor emitted:`);
  for (const m of missing) console.error(`   ${pad(`${m.file}:${m.line}`, 54)} .${m.cls}`);
  console.error(
    '\n   A preview class that exists nowhere else is drift — either the class was\n' +
      '   renamed in src/ and the preview was not updated, or the preview invented a\n' +
      '   ui-* class of its own (use a non-ui- prefix for page-local helpers).',
  );
}

if (stale.length || missing.length) {
  console.error('');
  process.exit(1);
}
console.log('\n✓ PASS — every preview class resolves, no retired size literals.\n');
