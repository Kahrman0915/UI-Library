// Design-check lint for the Figma file, as a use_figma snippet.
// Paste the whole file into a use_figma script AFTER `await figma.setCurrentPageAsync(page)`,
// then: `return await designCheck(['2152:747', '2269:2988']);`
// Checks (playbook "Design-check lint"): unbound SOLID paint, unstyled TEXT, generic layer names,
// unbound non-zero padding/radius/gap, and horizontal overflow of in-flow children.
// Skips instance internals (they belong to the master) and absolutely-positioned children
// (overlays ignore their parent's padding — that check false-positives otherwise).
// Spacing TIERS (docs/spacing.md): a screen or example frame should bind gap/padding to a
// semantic `space/*` role, not straight to a primitive `spacing/N` rung. Pass
// `{ screen: true }` to report primitive bindings under `primitiveBinding`. That bucket is
// ADVISORY — outside `allZero` — until migration has happened; `{ strictTiers: true }`
// folds it into the gate. Masters keep their own geometry on primitives, so leave `screen` off for them.
async function designCheck(frameIds, opts = {}) {
  const GENERIC = /^(Frame|Group|Rectangle|Ellipse|Vector|Line|Component|Instance)(\s+\d+)?$/i;
  const hasVar = (n, k) => !!(n.boundVariables && n.boundVariables[k]);
  const out = { unboundPaint: [], unstyledText: [], genericName: [], unboundGeometry: [], overflow: [], primitiveBinding: [] };
  const boundSpacing = []; // { label, n, p, id } — resolved after the sync walk
  function walk(n, label, parent) {
    if (GENERIC.test(n.name)) out.genericName.push(`${label} ${n.type} "${n.name}" [${n.id}]`);
    if (n.type === 'TEXT' && !n.textStyleId) out.unstyledText.push(`${label} "${n.name}" [${n.id}]`);
    for (const key of ['fills', 'strokes']) {
      const arr = n[key]; if (!Array.isArray(arr)) continue;
      arr.forEach((p, i) => {
        if (p.type !== 'SOLID' || p.visible === false) return;
        const styleId = key === 'fills' ? n.fillStyleId : n.strokeStyleId;
        if (!(n.boundVariables && n.boundVariables[key] && n.boundVariables[key][i]) && !styleId)
          out.unboundPaint.push(`${label} ${n.type} "${n.name}" [${n.id}] ${key}[${i}]`);
      });
    }
    for (const p of ['paddingTop','paddingRight','paddingBottom','paddingLeft','topLeftRadius','topRightRadius','bottomRightRadius','bottomLeftRadius','itemSpacing'])
      if (p in n && n[p] !== 0 && !hasVar(n, p)) out.unboundGeometry.push(`${label} "${n.name}" [${n.id}] ${p}=${n[p]}`);
      else if (opts.screen && p in n && n[p] !== 0 && !/Radius$/.test(p)) boundSpacing.push({ label, n, p, id: n.boundVariables[p].id });
    if (parent && parent.absoluteBoundingBox && n.absoluteBoundingBox && 'layoutMode' in parent && parent.layoutMode !== 'NONE' && n.layoutPositioning !== 'ABSOLUTE') {
      const pb = parent.absoluteBoundingBox, nb = n.absoluteBoundingBox;
      const over = Math.round((nb.x + nb.width) - (pb.x + pb.width - (parent.paddingRight || 0)));
      if (over > 1) out.overflow.push(`${label} "${n.name}" [${n.id}] overflows "${parent.name}" by ${over}px`);
    }
    if (n.type === 'INSTANCE') return;
    for (const c of (n.children || [])) walk(c, label, n);
  }
  for (const id of frameIds) {
    const f = await figma.getNodeByIdAsync(id);
    if (!f) { out.genericName.push(`MISSING FRAME ${id}`); continue; }
    walk(f, f.name.slice(0, 5).trim(), null);
  }
  // Tier check: a gap/padding bound to a primitive rung on a screen frame. Resolved here
  // because variable lookups are async and the walk is not.
  const nameCache = new Map();
  for (const b of boundSpacing) {
    if (!nameCache.has(b.id)) { const v = await figma.variables.getVariableByIdAsync(b.id); nameCache.set(b.id, v ? v.name : ''); }
    const name = nameCache.get(b.id);
    if (/^spacing\//.test(name)) out.primitiveBinding.push(`${b.label} "${b.n.name}" [${b.n.id}] ${b.p} → ${name} (use a space/* role)`);
  }
  const counts = Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length]));
  const gate = Object.entries(counts).filter(([k]) => opts.strictTiers || k !== 'primitiveBinding');
  return { counts, allZero: gate.every(([, v]) => v === 0), findings: out };
}
