# DOM → Figma bridge

How the deeper-theming POC pages get from Storybook into Figma **as native Figma
nodes** — rectangles, real text, real vectors — rather than screenshots.

Written 2026-08-07, after it built the Dashboard page (`951:50`) end to end.
Read this together with the `pocThemingV2.rebuild_2026_08_07` block in
[`figma-ledger.json`](./figma-ledger.json), which carries the page IDs and status.

> **Why it exists.** There is no headless browser in this repo, and the POC pages
> were always built natively (see the ledger's `conventions`). So the bridge
> reads the *rendered* DOM and replays it through the Figma Plugin API. Charts
> arrive as editable vectors; nothing is rasterised.

---

## The shape of it

1. **In the browser** (via the Browser-pane `javascript_tool`): walk a story's
   DOM and emit a compact scene graph — absolute geometry plus computed paint.
2. **In Figma** (via `use_figma`): replay that scene graph as
   `createRectangle` / `createText` / `createNodeFromSvg`.

The scene graph is deliberately lossy. Only things that *paint* survive: a fill,
a border, text, or an SVG. That drops most of the tree.

---

## Status per page

| Figma page | Story | State |
|---|---|---|
| `951:50` Dashboard | Dashboard | **Done** — 12 frames, 6 brands × 2 modes |
| `951:51` Marketing | Marketing | **Not built** — see "Marketing" below |
| `951:52` Suite | Suite | **Not built** — see "Suite" below |

---

## Cost model — read this before planning a page

Dashboard was cheap because of one property, and it is worth testing for on
every page:

> Within a single mode, all six brands render the **same layout**. Only colours
> differ. So one extract plus a small colour map reproduces the other five by
> `clone()` + recolour.

That was **verified, not assumed** — build the map by pairing nodes positionally
across brands and assert no source colour maps to two different targets. For
Dashboard it came back 1:1 with zero conflicts, 21 pairs, and turned 12 extracts
into 2.

Two hard limits on the shortcut:

- **Cross-*mode* remapping is NOT safe.** White maps to page, card *and* ink at
  once. Each mode needs its own extract.
- **Gradients break it.** Gradient colours end up baked inside SVG strings,
  where a solid-paint map cannot reach them. See Marketing.

The `use_figma` `code` parameter caps at **50 000 characters**, which is the real
budget. A page that will not fit must be built across several calls appending
into the same frame.

---

## Browser side — the extractor

Paste as one `javascript_exec`. Defines `window.__gradSvg` and `window.__extract`.

```js
window.__fixColor = (s) => s.replace(
  /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?:\s*\/\s*([\d.]+))?\)/g,
  (_, r, g, b, a) => { const c=[r,g,b].map(v=>Math.round(parseFloat(v)*255));
    return a !== undefined && +a < 1 ? `rgba(${c.join(',')},${a})` : `rgb(${c.join(',')})`; });

const splitTop = (s) => { const out=[]; let d=0, cur='';
  for (const ch of s) { if (ch==='(') d++; else if (ch===')') d--;
    if (ch===',' && !d) { out.push(cur.trim()); cur=''; } else cur+=ch; }
  if (cur.trim()) out.push(cur.trim()); return out; };

const parseStops = (parts) => parts.map((p, i) => {
  const m = p.match(/^(.*?)\s+([\d.]+)%$/);
  const col = (m ? m[1] : p).trim();
  const off = m ? +m[2] : (i === 0 ? 0 : 100);
  const c = col.match(/rgba?\(([^)]+)\)/);
  let stop = col, op = 1;
  if (c) { const v = c[1].split(',').map(Number);
    if (v.length > 3) { op = v[3]; stop = `rgb(${v[0]},${v[1]},${v[2]})`; } }
  return { stop, op, off };
});

/* CSS background-image -> a standalone SVG. SVG gradients are something
   createNodeFromSvg genuinely understands, so this reuses the one import path
   already proven rather than hand-rolling Figma paint matrices. */
window.__gradSvg = function (bgRaw, w, h, radiusPx) {
  const bg = window.__fixColor(bgRaw);
  const layers = splitTop(bg).filter((l) => /gradient\(/.test(l));
  if (!layers.length) return null;
  const defs = []; const rects = [];
  layers.forEach((layer, i) => {
    const id = `g${i}`;
    const lin = layer.match(/^linear-gradient\((.*)\)$/s);
    const rad = layer.match(/^radial-gradient\((.*)\)$/s);
    if (lin) {
      const parts = splitTop(lin[1]);
      let ang = 180;
      if (/deg$/.test(parts[0])) ang = parseFloat(parts.shift());
      const stops = parseStops(parts);
      const r2 = (ang - 90) * Math.PI / 180;
      const dx = Math.cos(r2), dy = Math.sin(r2);
      defs.push(`<linearGradient id="${id}" x1="${(0.5-dx/2).toFixed(4)}" y1="${(0.5-dy/2).toFixed(4)}" `
        + `x2="${(0.5+dx/2).toFixed(4)}" y2="${(0.5+dy/2).toFixed(4)}">`
        + stops.map(s=>`<stop offset="${s.off}%" stop-color="${s.stop}" stop-opacity="${s.op}"/>`).join('')
        + `</linearGradient>`);
    } else if (rad) {
      const parts = splitTop(rad[1]);
      let rw=50, rh=50, cx=50, cy=50;
      const m = parts[0].match(/([\d.]+)%\s+([\d.]+)%\s+at\s+([\d.]+)%\s+([\d.]+)%/);
      if (m) { rw=+m[1]; rh=+m[2]; cx=+m[3]; cy=+m[4]; parts.shift(); }
      const stops = parseStops(parts);
      const sx=rw/50, sy=rh/50, C=cx/100, Cy=cy/100;
      defs.push(`<radialGradient id="${id}" cx="${C}" cy="${Cy}" r="0.5" `
        + `gradientTransform="translate(${(C*(1-sx)).toFixed(4)} ${(Cy*(1-sy)).toFixed(4)}) `
        + `scale(${sx.toFixed(4)} ${sy.toFixed(4)})">`
        + stops.map(s=>`<stop offset="${s.off}%" stop-color="${s.stop}" stop-opacity="${s.op}"/>`).join('')
        + `</radialGradient>`);
    } else return;
    rects.push(`<rect width="${w}" height="${h}" rx="${radiusPx}" fill="url(#${id})"/>`);
  });
  if (!rects.length) return null;
  // CSS paints the FIRST layer on top; SVG paints last-on-top
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
    + `<defs>${defs.join('')}</defs>${rects.reverse().join('')}</svg>`;
};

window.__extract = function (root) {
  const R = root.getBoundingClientRect();
  const px = (v) => Math.round(parseFloat(v) || 0);
  const fc = window.__fixColor;
  const rgba = (s) => { s = fc(s || ''); const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(',').map(Number); const a = p.length>3?p[3]:1; if (!a) return null;
    return [+(p[0]/255).toFixed(4), +(p[1]/255).toFixed(4), +(p[2]/255).toFixed(4), +a.toFixed(3)]; };

  /* createNodeFromSvg resolves NO CSS. Burn every paint in as a literal
     attribute while the live element is still there to read it from. */
  const inlineSvg = (svg) => { const cl = svg.cloneNode(true);
    const live=[svg,...svg.querySelectorAll('*')], cp=[cl,...cl.querySelectorAll('*')];
    live.forEach((L,i)=>{ const c=cp[i]; if(!c||!c.setAttribute) return; const cs=getComputedStyle(L);
      c.setAttribute('fill', cs.fill==='rgba(0, 0, 0, 0)'?'none':fc(cs.fill));
      if (cs.stroke && cs.stroke!=='none') c.setAttribute('stroke', fc(cs.stroke));
      const sw=parseFloat(cs.strokeWidth); if(sw) c.setAttribute('stroke-width',sw);
      c.removeAttribute('class'); c.removeAttribute('style');
      if (L.tagName==='text'){ c.setAttribute('font-size',parseFloat(cs.fontSize));
        c.setAttribute('font-family',cs.fontFamily.split(',')[0].replace(/["']/g,''));
        c.setAttribute('font-weight',cs.fontWeight); } });
    return cl.outerHTML.replace(/\saria-[a-z]+="[^"]*"/g,'')
      .replace(/\srole="[^"]*"/g,'').replace(/\sfocusable="[^"]*"/g,''); };

  /* A disc or pill carries its radius on a PARENT (overflow:hidden), so a
     filled child reads radius 0 and paints a square inside the circle. */
  const radiusOf = (el,b) => { const own=px(getComputedStyle(el).borderTopLeftRadius); if(own) return own;
    let p=el.parentElement;
    for(let i=0;i<3&&p;i++,p=p.parentElement){ const pr=px(getComputedStyle(p).borderTopLeftRadius); if(!pr) continue;
      const pb=p.getBoundingClientRect();
      if (Math.abs(pb.width-b.width)<=4 && Math.abs(pb.height-b.height)<=4) return pr; break; }
    return 0; };

  const nodes=[]; const seen=new Set();
  const walk=(el)=>{ const cs=getComputedStyle(el);
    if (cs.display==='none'||cs.visibility==='hidden'||!parseFloat(cs.opacity)) return;
    const b=el.getBoundingClientRect();
    // sr-only is a 1x1 clipping wrapper whose CHILDREN still report full-size
    // rects — prune the SUBTREE or the chart's table twin paints over the chart
    if (b.width<2 && b.height<2) return;
    if (el.tagName.toLowerCase()==='svg'){
      nodes.push({t:'s',x:+(b.x-R.x).toFixed(1),y:+(b.y-R.y).toFixed(1),
        w:+b.width.toFixed(1),h:+b.height.toFixed(1),v:inlineSvg(el)}); return; }
    const f=rgba(cs.backgroundColor);
    const bw=px(cs.borderTopWidth); const bc=bw?rgba(cs.borderTopColor):null;
    const rad=radiusOf(el,b);
    const s=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent)
      .join('').replace(/\s+/g,' ').trim();
    const bgi = cs.backgroundImage;
    const clipText = (cs.webkitBackgroundClip || cs.backgroundClip) === 'text';
    if (bgi && bgi !== 'none' && !clipText) {
      const g = window.__gradSvg(bgi, Math.round(b.width), Math.round(b.height),
        rad > 500 ? Math.round(Math.min(b.width,b.height)/2) : rad);
      if (g) nodes.push({t:'s',x:+(b.x-R.x).toFixed(1),y:+(b.y-R.y).toFixed(1),
        w:+b.width.toFixed(1),h:+b.height.toFixed(1),v:g});
    }
    if (f||bc||s) {
      const n={t:s?'t':'b',x:+(b.x-R.x).toFixed(1),y:+(b.y-R.y).toFixed(1),
        w:+b.width.toFixed(1),h:+b.height.toFixed(1)};
      if(f) n.f=f; if(rad) n.r=rad; if(bc){n.bw=bw;n.bc=bc;}
      if(s){ n.s=s.slice(0,220); n.fs=px(cs.fontSize); n.fw=+cs.fontWeight;
        n.lh=px(cs.lineHeight)||Math.round(px(cs.fontSize)*1.4);
        n.c=rgba(cs.color)||[0,0,0,1];
        if(/mono/i.test(cs.fontFamily)) n.m=1;
        if(cs.textAlign==='center'||cs.textAlign==='right') n.al=cs.textAlign;
        // one line in the browser must not wrap in Figma, whose Inter is wider
        if(b.height<=n.lh+4) n.one=1;
        if (clipText && bgi && bgi !== 'none') {
          const lin = fc(bgi).match(/linear-gradient\(([^]*)\)/);
          if (lin) { const cols=[...lin[1].matchAll(/rgba?\([^)]+\)/g)].map(m=>rgba(m[0])).filter(Boolean);
            const ang=(lin[1].match(/^\s*([\d.]+)deg/)||[])[1];
            if (cols.length>=2) n.g={a: ang?+ang:180, s: cols}; } } }
      const k=`${n.t}${n.x},${n.y},${n.w},${n.h},${n.f},${n.s||''}`;
      if(!seen.has(k)){seen.add(k);nodes.push(n);} }
    for (const c of el.children) walk(c); };
  walk(root); return nodes;
};
```

**Packing.** Identical SVG markup repeats (a mark appears at several sizes).
Send it once and reference it — worth ~20% on a mark-heavy page:

```js
window.__pack = (n) => { const lib=[]; const idx=new Map();
  for (const x of n) if (x.t === 's') {
    if (!idx.has(x.v)) { idx.set(x.v, lib.length); lib.push(x.v); }
    x.i = idx.get(x.v); delete x.v; }
  return { lib, n }; };
```

---

## Figma side — the builder

```js
const ok = {};
for (const f of ['Inter','JetBrains Mono']) for (const s of ['Regular','Medium','Semi Bold','Bold'])
  { try { await figma.loadFontAsync({ family: f, style: s }); ok[f+s]=true; } catch (e) { ok[f+s]=false; } }
const styleFor = (fw) => fw>=700?'Bold':fw>=600?'Semi Bold':fw>=500?'Medium':'Regular';
const paint = (c) => [{ type:'SOLID', color:{r:c[0],g:c[1],b:c[2]}, opacity:c[3] }];

const build = (data, name, W, H, px, py, lib) => {
  const frame = figma.createFrame();
  frame.name=name; frame.x=px; frame.y=py; frame.resize(W,H);
  frame.clipsContent=true; frame.fills=[];
  for (const n of data) { try {
    if (n.t==='s') { const g=figma.createNodeFromSvg(n.v !== undefined ? n.v : lib[n.i]);
      g.name='icon'; frame.appendChild(g);
      if (g.width && Math.abs(g.width-n.w)>0.5) g.rescale(n.w/g.width);
      g.x=n.x; g.y=n.y; continue; }
    // Figma TEXT has no background — its fill IS the glyph colour, so a DOM box
    // that also holds text needs TWO nodes
    if (n.f||n.bc) { const r=figma.createRectangle(); r.x=n.x; r.y=n.y;
      r.resize(Math.max(n.w,0.01),Math.max(n.h,0.01));
      r.fills=n.f?paint(n.f):[]; r.strokes=n.bc?paint(n.bc):[];
      if(n.bc){r.strokeWeight=n.bw||1; r.strokeAlign='INSIDE';}
      r.cornerRadius=Math.min(n.r||0,n.w/2,n.h/2);
      r.name=n.t==='t'?'bg':'box'; frame.appendChild(r); }
    if (n.t==='t') { const fam=n.m?'JetBrains Mono':'Inter'; let st=styleFor(n.fw);
      const useFam=ok[fam+st]?fam:'Inter'; if(!ok[useFam+st]) st='Regular';
      const t=figma.createText(); t.fontName={family:useFam,style:st};
      t.characters=n.s; t.fontSize=n.fs; t.lineHeight={unit:'PIXELS',value:n.lh};
      t.fills = n.g
        ? [{ type:'GRADIENT_LINEAR',
             gradientTransform:[[1,0,0],[0,1,0]],
             gradientStops:n.g.s.map((c,i)=>({ position:i/(n.g.s.length-1),
               color:{r:c[0],g:c[1],b:c[2],a:c[3]} })) }]
        : paint(n.c);
      t.textAutoResize='NONE'; t.x=n.x; t.y=n.y;
      t.resize(Math.max(n.w,1),Math.max(n.h,n.lh));
      t.textAlignHorizontal=n.al==='center'?'CENTER':n.al==='right'?'RIGHT':'LEFT';
      t.textAlignVertical='CENTER'; t.name=n.s.slice(0,24);
      if (n.one) { const x0=t.x,w0=t.width,y0=t.y,h0=t.height,al=t.textAlignHorizontal;
        t.textAutoResize='WIDTH_AND_HEIGHT';
        t.x = al==='CENTER'?x0+(w0-t.width)/2 : al==='RIGHT'?x0+w0-t.width : x0;
        t.y = y0+(h0-t.height)/2; }
      frame.appendChild(t); }
  } catch(e){} }
  return frame; };

const k=(p)=>[Math.round(p.color.r*255),Math.round(p.color.g*255),Math.round(p.color.b*255)]
  .join(',')+'|'+(p.opacity===undefined?1:+p.opacity.toFixed(3));
const parse=(s)=>{const[rgb,a]=s.split('|');const[r,g,b]=rgb.split(',').map(Number);
  return{r:r/255,g:g/255,b:b/255,a:+a};};
const recolour=(node,map)=>{let n=0;
  const apply=(arr)=>arr.map((p)=>{if(p.type!=='SOLID')return p;const to=map[k(p)];if(!to)return p;n++;
    const c=parse(to);return{...p,color:{r:c.r,g:c.g,b:c.b},opacity:c.a};});
  const walk=(x)=>{if('fills'in x&&Array.isArray(x.fills))x.fills=apply(x.fills);
    if('strokes'in x&&Array.isArray(x.strokes))x.strokes=apply(x.strokes);
    if('children'in x)x.children.forEach(walk);};
  walk(node);return n;};
```

`recolour` only touches **SOLID** paints. Gradient stops are untouched — which
is exactly why gradient-heavy pages cannot use the clone shortcut.

---

## Gotchas, all of them learned the hard way

1. **`createNodeFromSvg` resolves no CSS** — not `currentColor`, not
   `var(--chart-1)`, not a stylesheet rule. Inline every paint first.
2. **Chrome serialises `color-mix()` as `color(srgb r g b)`**, which Figma's SVG
   parser rejects. Convert to `rgb()`.
3. **sr-only wrappers are 1×1 but their children report full-size rects.** The
   chart's table twin was captured and painted over the chart. Prune the subtree.
4. **A disc's radius lives on the parent.** Filled children read radius 0 and
   paint squares inside circles.
5. **Figma's Inter is wider than Chrome's.** Single-line text wraps unless it is
   flagged at extract time and allowed to self-size.
6. **CSS paints the first background layer on top; SVG paints last on top.**
   Reverse the layer order.
7. **Cross-mode colour remapping is unsafe** — white maps to page, card and ink.
8. **`ec` dark is the one brand whose chart slot 1 is not its `--primary`.** A
   blanket map paints its bars `#23c7fe` instead of `#1da0f3`. Correct its chart
   subtree and legend dot after cloning. (The invariant check in the Storybook
   `Transition` story lists every such exception.)

---

## Marketing (`951:51`) — the plan

Six brand scopes, 1150×1837 each, both modes. **The clone shortcut does not
apply**: marks and the hero bubble field are stacked CSS gradients.

Building one cross-brand map produced 12 conflicts, all of one shape — db's
`#466af4` is *both* its solid `--primary` **and** the first stop of its
stat-text gradient, whereas nb's solid primary is `#306602` but that gradient
stop is `#418605`. **Keep gradient-text stops out of the solid map** and carry
them per brand; that leaves zero conflicts.

Payload that fits (measured, light mode):

| part | size |
|---|---|
| scene (SVGs replaced by a lib index) | 8.9 kB |
| SVG lib (13 unique entries, deduped) | 15.8 kB |
| per-brand `{solid, gradText, svg colour lists}` × 5 | 13.3 kB |
| **total + builder code** | **~43 kB** |

Figma rebuilds each brand from `scene + lib` with substitutions rather than
cloning. Then repeat for dark.

## Suite (`951:52`) — the plan

**One composite page, not six variants** — 1280 × 4474, with eleven brand
scopes inline plus one `data-surface="aiden"`. So it is 2 extracts (light,
dark), not 12.

But it is tall: 32 gradient elements and 53 SVGs. It will **not** fit one
50 kB call. Build it across several calls that append into the same frame —
create the frame in call 1, then pass slices of the scene graph in calls 2..n
looking the frame up by name.
