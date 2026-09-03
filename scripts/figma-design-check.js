// Design-check lint for the Figma file, as a use_figma snippet.
// Paste the whole file into a use_figma script AFTER `await figma.setCurrentPageAsync(page)`,
// then: `return await designCheck(['2152:747', '2269:2988']);`
// Checks (playbook "Design-check lint"): unbound SOLID paint, unstyled TEXT, generic layer names,
// unbound non-zero padding/radius/gap, and horizontal overflow of in-flow children.
// Skips instance internals (they belong to the master) and absolutely-positioned children
// (overlays ignore their parent's padding — that check false-positives otherwise).
async function designCheck(frameIds) {
  const GENERIC = /^(Frame|Group|Rectangle|Ellipse|Vector|Line|Component|Instance)(\s+\d+)?$/i;
  const hasVar = (n, k) => !!(n.boundVariables && n.boundVariables[k]);
  const out = { unboundPaint: [], unstyledText: [], genericName: [], unboundGeometry: [], overflow: [] };
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
  const counts = Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length]));
  return { counts, allZero: Object.values(counts).every(v => v === 0), findings: out };
}
