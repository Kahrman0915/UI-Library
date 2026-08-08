/**
 * Structural guard for the POC recipe's one big template literal.
 *
 * Three ways this file has actually broken, all of which produce plausible
 * output rather than an obvious error:
 *
 *   1. a BACKTICK in a CSS comment terminates the string     (tsc catches it)
 *   2. prose left OUTSIDE a comment is valid-ish CSS, so the
 *      parser discards the declarations after it            (SILENT)
 *   3. unbalanced braces swallow whole rules                 (SILENT)
 *
 * Only 1 fails loudly on its own. This checks all three, plus that every line
 * outside a comment actually parses as CSS.
 */
import { readFileSync } from 'node:fs';

// Both POC generations: v1 and the parallel v2 (same template shape, poc2
// scope). Whichever POC loses the bake-off gets removed from this list when it
// is deleted in the adoption round.
const SOURCES = [
  'src/prototypes/deeperThemingRecipe.ts',
  'src/prototypes/deeperThemingRecipeV2.ts',
];
let failures = 0;
for (const SRC of SOURCES) {
const src = readFileSync(SRC, 'utf8');
const m = src.match(/export const POC_CSS = `([\s\S]*?)`\.trim\(\);/);
if (!m) {
  console.error('✗ POC_CSS template literal not found in ' + SRC);
  process.exit(1);
}
const raw = m[1];
const problems = [];

if (raw.includes('`')) problems.push('backtick inside POC_CSS — it terminates the template literal');

// blank comments IN PLACE so line numbers stay true
const css = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
if (/\/\*|\*\//.test(css)) problems.push('unbalanced comment delimiters');

let depth = 0;
css.split('\n').forEach((line, i) => {
  const l = line.trim();
  if (l) {
    const ok =
      /^[^{};]*\{$/.test(l) ||                  // selector {
      /^\}$/.test(l) ||                         // }
      /^[^{};]*\{[^{}]*\}$/.test(l) ||          // one-line rule
      /^--?[\w-]+:\s*.+;$/.test(l) ||           // custom property
      /^[a-z0-9-]+:\s*.*;$/.test(l) ||          // declaration
      /^[a-z0-9-]+:$/.test(l) ||                // property, value follows (digits: poc2)
      /^[a-z0-9-]+:\s*[\w-]*\($/.test(l) ||     // declaration opening a fn across lines
      /^[^{};]+,$/.test(l) ||                   // selector list
      /^[^{};]*[),]\s*;?$/.test(l) ||           // multi-line value
      /^\d+%(,\s*\d+%)*\s*\{.*$/.test(l) ||     // keyframe selector
      /^\$\{.*\}$/.test(l);                     // interpolation
    if (!ok) problems.push(`line ${i + 1} is not CSS: ${l.slice(0, 72)}`);
  }
  depth += (l.match(/\{/g) || []).length - (l.match(/\}/g) || []).length;
});
if (depth !== 0) problems.push(`braces unbalanced by ${depth}`);

if (problems.length) {
  console.error(`✗ ${SRC}: POC_CSS structural check failed:\n  ` + problems.join('\n  '));
  failures += 1;
} else {
  console.log(`✓ ${SRC.split('/').pop()} — ${raw.split('\n').length} lines, braces balanced, no stray backticks.`);
}
}
process.exit(failures ? 1 : 0);
