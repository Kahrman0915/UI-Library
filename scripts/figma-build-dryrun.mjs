/**
 * Dry-run the Figma-side builder against the staged payloads, using a stub
 * Plugin API. Catches the errors that are expensive to find inside Figma:
 * unresolved lib refs, malformed SVG, colours outside 0–1, missing fonts,
 * NaN geometry, nodes silently swallowed by the builder's try/catch.
 *
 *   node scripts/figma-build-dryrun.mjs
 *
 * It does NOT prove the page looks right — only that every node the payload
 * describes can be constructed. Visual truth still needs a Figma screenshot.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'docs/figma-payloads';
const SRC = readFileSync('scripts/figma-build-poc-page.js', 'utf8');

/* Pull the builder out of the reference file so the dry run tests the SAME
   source that gets pasted into use_figma — not a copy that can drift. */
const body = SRC.slice(0, SRC.indexOf('/* ── DRIVER A'));

let created = 0, svgParsed = 0;
const problems = [];

const rect = () => ({
  type: 'RECTANGLE', x: 0, y: 0, width: 0, height: 0, name: '',
  fills: [], strokes: [], strokeWeight: 1, strokeAlign: 'INSIDE', cornerRadius: 0,
  resize(w, h) { this.width = w; this.height = h; },
});
const text = () => ({
  type: 'TEXT', x: 0, y: 0, width: 0, height: 0, name: '', characters: '',
  fontName: null, fontSize: 0, lineHeight: null, fills: [],
  textAutoResize: 'NONE', textAlignHorizontal: 'LEFT', textAlignVertical: 'TOP',
  resize(w, h) { this.width = w; this.height = h; },
});
const frame = () => ({
  type: 'FRAME', x: 0, y: 0, width: 0, height: 0, name: '', id: 'stub',
  clipsContent: true, fills: [], children: [],
  resize(w, h) { this.width = w; this.height = h; },
  appendChild(c) { this.children.push(c); created++; },
});

const figma = {
  loadFontAsync: async ({ family, style }) => {
    // mirror the real file's inventory: Inter + JetBrains Mono, four weights
    const fams = { Inter: 1, 'JetBrains Mono': 1 };
    const styles = { Regular: 1, Medium: 1, 'Semi Bold': 1, Bold: 1 };
    if (!fams[family] || !styles[style]) throw new Error('no font');
  },
  createRectangle: rect,
  createText: text,
  createFrame: frame,
  createNodeFromSvg: (svg) => {
    if (/%[wh]%/.test(svg)) throw new Error('unsubstituted size placeholder');
    if (/var\(|currentColor|color\(srgb/.test(svg)) throw new Error('unresolved CSS in SVG');
    const open = (svg.match(/<svg/g) || []).length, close = (svg.match(/<\/svg>/g) || []).length;
    if (open !== 1 || close !== 1) throw new Error('malformed svg envelope');
    const w = +(svg.match(/^<svg[^>]*width="([\d.]+)"/) || [])[1];
    if (!Number.isFinite(w) || w <= 0) throw new Error('svg has no usable width');
    svgParsed++;
    const n = frame(); n.width = w; n.height = w; n.rescale = () => {};
    return n;
  },
};

const check = (node, where) => {
  for (const p of [...(node.fills || []), ...(node.strokes || [])]) {
    if (p.type === 'SOLID') {
      for (const k of ['r', 'g', 'b']) {
        const v = p.color[k];
        if (!Number.isFinite(v) || v < 0 || v > 1) problems.push(`${where}: colour.${k}=${v}`);
      }
      if (!Number.isFinite(p.opacity) || p.opacity < 0 || p.opacity > 1) problems.push(`${where}: opacity=${p.opacity}`);
    }
    if (p.type === 'GRADIENT_LINEAR') {
      if (!p.gradientStops.length) problems.push(`${where}: empty gradient`);
      for (const s of p.gradientStops)
        for (const k of ['r', 'g', 'b', 'a'])
          if (!Number.isFinite(s.color[k])) problems.push(`${where}: gradient stop ${k}=${s.color[k]}`);
    }
  }
  for (const k of ['x', 'y', 'width', 'height'])
    if (!Number.isFinite(node[k])) problems.push(`${where}: ${k}=${node[k]}`);
};

const run = async (P, label, subs) => {
  created = 0; svgParsed = 0;
  const fn = new Function('figma', 'P', 'subs', `return (async()=>{${body}
    const [W,H] = P.meta.size || [1000,1000];
    const r = build({scene:P.scene, lib:P.lib, name:'t', W, H, px:0, py:0, frame:null, subs});
    return r;})()`);
  const r = await fn(figma, P, subs);
  r.frame.children.forEach((c, i) => check(c, `${label}#${i}`));

  // every node in the payload must produce at least one Figma node
  const expect = P.scene.filter((n) => n.t === 's' || n.f || n.bc || n.t === 't').length;
  const status = r.failed === 0 && r.made >= expect ? 'ok' : 'MISMATCH';
  console.log(`  ${label.padEnd(26)} made=${String(r.made).padEnd(5)} svg=${String(svgParsed).padEnd(4)} failed=${r.failed}  ${status}`);
  return r.failed === 0 && r.made >= expect;
};

let allOk = true;
for (const f of readdirSync(DIR).sort()) {
  const P = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  if (!P.scene) continue;
  console.log(f);
  if (P.deltas && P.deltas.length) {
    allOk &= await run(P, `${P.meta.base} (base)`, null);
    for (const d of P.deltas)
      allOk &= await run(P, d.b, { solid: d.solid, gradText: d.gradText, txt: d.txt, svgc: d.svgc, fix: d.fix });
  } else {
    allOk &= await run(P, P.meta.mode ? `${P.meta.page} ${P.meta.mode}` : f, null);
  }
}

if (problems.length) {
  console.log(`\n${problems.length} value problems:`);
  for (const p of problems.slice(0, 20)) console.log('  ' + p);
  allOk = false;
}
console.log(allOk ? '\nPASS — every payload replays cleanly' : '\nFAIL');
process.exit(allOk ? 0 : 1);
