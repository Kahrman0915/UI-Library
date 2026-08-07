/* ────────────────────────────────────────────────────────────────────────────
   Figma-side builder for the DOM → Figma bridge.  See docs/figma-dom-bridge.md.

   This file is NOT run by node. It is the body of a `use_figma` call: paste it,
   then append the payload as `const P = <contents of a docs/figma-payloads/*.json>`
   plus one of the drivers at the bottom.

   Payload shapes
   ──────────────
   Marketing  {meta, scene, lib, deltas}   one file per mode, six brands inside
   Suite      {meta, scene, lib}           TWO files per mode, slice 1 then 2

   scene[]  {t:'b'|'t'|'s', x,y,w,h, …}
            b  box   f? r? bw?+bc?
            t  text  s fs fw lh c m? al? one? g?      (also paints f/bc if present)
            s  svg   i (lib index) sw sh              (%w%/%h% get sw/sh)
   lib      array (Marketing) or sparse object (Suite slices) of SVG templates
   deltas[] {b, solid, gradText, txt, svgc, fix}  — per non-base brand
            solid    {baseHex: brandHex}   blanket remap
            fix      {nodeIdx: {f?,c?,bc?,sv?}}  exact overrides where the
                     blanket map would be wrong (ec dark's chart slot 1)
   ──────────────────────────────────────────────────────────────────────────── */

// ── fonts ────────────────────────────────────────────────────────────────────
const ok = {};
for (const f of ['Inter', 'JetBrains Mono'])
  for (const s of ['Regular', 'Medium', 'Semi Bold', 'Bold']) {
    try { await figma.loadFontAsync({ family: f, style: s }); ok[f + s] = true; }
    catch (e) { ok[f + s] = false; }
  }
const styleFor = (fw) => (fw >= 700 ? 'Bold' : fw >= 600 ? 'Semi Bold' : fw >= 500 ? 'Medium' : 'Regular');

// ── colour ───────────────────────────────────────────────────────────────────
/* '466af4' or '466af4@0.5' → {r,g,b,a}. The @alpha suffix only appears when the
   DOM colour was translucent; Figma keeps alpha on the paint, not the colour. */
const un = (h) => {
  const [rgb, a] = String(h).split('@');
  return { r: parseInt(rgb.slice(0, 2), 16) / 255, g: parseInt(rgb.slice(2, 4), 16) / 255,
           b: parseInt(rgb.slice(4, 6), 16) / 255, a: a === undefined ? 1 : +a };
};
const paint = (h) => { const c = un(h); return [{ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a }]; };

// ── svg ──────────────────────────────────────────────────────────────────────
const SVG_COL = /((?:fill|stroke|stop-color)=")([^"]*)(")/g;
/* Swap the k-th paint literal for cols[k]. Positional, because the template and
   the sibling brand's SVG are the same markup with different colours. */
const recolourSvg = (tplSrc, cols) => {
  if (!cols) return tplSrc;
  let k = 0;
  return tplSrc.replace(SVG_COL, (_m, a, v, b) => {
    const next = cols[k++];
    return a + (next === undefined ? v : next) + b;
  });
};
const sizeSvg = (s, w, h) => s.split('%w%').join(w).split('%h%').join(h);

// ── the replay ───────────────────────────────────────────────────────────────
/* `frame` may be an existing frame (Suite slice 2+) or null to create one. */
function build({ scene, lib, name, W, H, px, py, frame, subs }) {
  const f = frame || (() => {
    const n = figma.createFrame();
    n.name = name; n.x = px; n.y = py; n.resize(W, H);
    n.clipsContent = true; n.fills = [];
    return n;
  })();
  const S = subs || {};
  let made = 0, failed = 0;

  scene.forEach((n0, i) => {
    try {
      const fx = (S.fix && S.fix[i]) || {};
      // blanket remap; `fx` overrides it per node where it would be wrong
      const map = (h) => (h == null ? h : (S.solid && S.solid[h] !== undefined ? S.solid[h] : h));

      if (n0.t === 's') {
        const tpl = lib[n0.i];
        if (tpl === undefined) { failed++; return; }
        const cols = fx.sv || (S.svgc && S.svgc[n0.i]);
        const g = figma.createNodeFromSvg(sizeSvg(recolourSvg(tpl, cols), n0.sw || n0.w, n0.sh || n0.h));
        g.name = 'icon'; f.appendChild(g);
        if (g.width && Math.abs(g.width - n0.w) > 0.5) g.rescale(n0.w / g.width);
        g.x = n0.x; g.y = n0.y; made++; return;
      }

      const fill   = fx.f  !== undefined ? fx.f  : map(n0.f);
      const stroke = fx.bc !== undefined ? fx.bc : map(n0.bc);

      // A Figma TEXT node has no background — its fill IS the glyph colour — so
      // a DOM box that also carries text needs a rectangle behind it.
      if (fill || stroke) {
        const r = figma.createRectangle();
        r.x = n0.x; r.y = n0.y;
        r.resize(Math.max(n0.w, 0.01), Math.max(n0.h, 0.01));
        r.fills = fill ? paint(fill) : [];
        r.strokes = stroke ? paint(stroke) : [];
        if (stroke) { r.strokeWeight = n0.bw || 1; r.strokeAlign = 'INSIDE'; }
        r.cornerRadius = Math.min(n0.r || 0, n0.w / 2, n0.h / 2);
        r.name = n0.t === 't' ? 'bg' : 'box';
        f.appendChild(r); made++;
      }

      if (n0.t === 't') {
        const chars = (S.txt && S.txt[i] !== undefined) ? S.txt[i] : n0.s;
        const fam = n0.m ? 'JetBrains Mono' : 'Inter';
        let st = styleFor(n0.fw);
        const useFam = ok[fam + st] ? fam : 'Inter';
        if (!ok[useFam + st]) st = 'Regular';

        const t = figma.createText();
        t.fontName = { family: useFam, style: st };
        t.characters = chars;
        t.fontSize = n0.fs;
        t.lineHeight = { unit: 'PIXELS', value: n0.lh };

        const grad = (S.gradText && S.gradText[i]) || (n0.g && n0.g.s);
        t.fills = grad
          ? [{ type: 'GRADIENT_LINEAR',
               gradientTransform: [[1, 0, 0], [0, 1, 0]],
               gradientStops: grad.map((h, gi) => {
                 const c = un(h);
                 return { position: gi / Math.max(grad.length - 1, 1),
                          color: { r: c.r, g: c.g, b: c.b, a: c.a } };
               }) }]
          : paint(fx.c !== undefined ? fx.c : map(n0.c));

        t.textAutoResize = 'NONE';
        t.x = n0.x; t.y = n0.y;
        t.resize(Math.max(n0.w, 1), Math.max(n0.h, n0.lh));
        t.textAlignHorizontal = n0.al === 'center' ? 'CENTER' : n0.al === 'right' ? 'RIGHT' : 'LEFT';
        t.textAlignVertical = 'CENTER';
        t.name = chars.slice(0, 24);

        // Figma's Inter is wider than Chrome's, so a one-liner wraps unless it
        // is allowed to self-size; re-anchor it by its alignment afterwards.
        if (n0.one) {
          const x0 = t.x, w0 = t.width, y0 = t.y, h0 = t.height, al = t.textAlignHorizontal;
          t.textAutoResize = 'WIDTH_AND_HEIGHT';
          t.x = al === 'CENTER' ? x0 + (w0 - t.width) / 2 : al === 'RIGHT' ? x0 + w0 - t.width : x0;
          t.y = y0 + (h0 - t.height) / 2;
        }
        f.appendChild(t); made++;
      }
    } catch (e) { failed++; }
  });

  return { frame: f, made, failed };
}

/* ── DRIVER A · Marketing (one call per mode) ─────────────────────────────────
   Paste `const P = {…marketing-light.json…}` above this.

const MODE = P.meta.mode, [W, H] = P.meta.size, GAP = 120;
const ROW = MODE === 'dark' ? H + 200 : 0;
const page = figma.root.children.find((p) => p.name.includes('Marketing'));
await figma.setCurrentPageAsync(page);

const order = [P.meta.base, ...P.deltas.map((d) => d.b)];
const out = [];
order.forEach((brand, i) => {
  const d = i === 0 ? null : P.deltas[i - 1];
  const r = build({
    scene: P.scene, lib: P.lib,
    name: `Marketing · ${brand} · ${MODE}`,
    W, H, px: i * (W + GAP), py: ROW, frame: null,
    subs: d ? { solid: d.solid, gradText: d.gradText, txt: d.txt, svgc: d.svgc, fix: d.fix } : null,
  });
  page.appendChild(r.frame);
  out.push({ brand, id: r.frame.id, made: r.made, failed: r.failed });
});
return { createdNodeIds: out.map((o) => o.id), out };

   ── DRIVER B · Suite (TWO calls per mode, slice 1 then slice 2) ──────────────
   Paste `const P = {…suite-light-1.json…}` above this. Slice 1 creates the
   frame; later slices look it up BY NAME and append into it, because no
   JavaScript state survives between use_figma calls.

const MODE = P.meta.mode, [W, H] = P.meta.size;
const page = figma.root.children.find((p) => p.name.includes('Suite'));
await figma.setCurrentPageAsync(page);

const NAME = `Suite · ${MODE}`;
let frame = page.children.find((n) => n.name === NAME) || null;
if (!frame && !P.meta.first) throw new Error(`${NAME} missing — run slice 1 first`);

const r = build({
  scene: P.scene, lib: P.lib, name: NAME,
  W, H, px: MODE === 'dark' ? W + 160 : 0, py: 0, frame,
});
if (!frame) page.appendChild(r.frame);
return { createdNodeIds: [r.frame.id], slice: `${P.meta.slice}/${P.meta.of}`,
         made: r.made, failed: r.failed, children: r.frame.children.length };
──────────────────────────────────────────────────────────────────────────── */
