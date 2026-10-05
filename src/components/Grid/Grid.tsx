import { createElement, forwardRef, useCallback, useEffect, useRef } from 'react';
import type { GridProps } from './Grid.types';
import './Grid.scss';

// A grid of equal items whose gap is a LEVEL on the spacing ladder, and whose columns
// reflow from the narrowest an item may be — `repeat(auto-fill, minmax(min, 1fr))`, so
// there are no breakpoints and it answers to its container rather than the window.
//
// `maxItemWidth` is the one thing CSS cannot do: cap the reflowed column. A track that is
// `1fr` stretches until the next column fits, so a 368-minimum card renders ~740 wide on
// its own. Capping the ITEM leaves the tracks wide and the gaps ragged; the cap has to be
// on the TRACKS, and that needs the column count, which only measurement gives. Two traps,
// both of which pass types, tests and build and only fail in a real browser:
//
// 1. Never derive the count from what you wrote. The pinned template (`repeat(n, max)`)
//    is a fixed point of itself, so reading the computed tracks back turns one drop into a
//    one-way ratchet that never climbs again. The count is computed from the MEASURED grid
//    width, minimum and gap, every time.
// 2. Never create the observer in a callback ref paired with an effect teardown. Under
//    StrictMode the teardown runs twice and disconnects the live observer, and the ref is
//    not re-invoked, so the grid freezes at its first measurement. The observer lives in a
//    plain effect on an object ref.
//
// It observes the PARENT, not the grid: the grid's own box never changes with the cap
// (it stays 100% wide), but a parent is the honest source of "the space I was given".

const Grid = forwardRef<HTMLElement, GridProps>(
  (
    { level, minItemWidth, maxItemWidth, columns, stretch = false, as = 'div', className, style, children, ...rest },
    ref,
  ) => {
    const gridRef = useRef<HTMLElement | null>(null);
    const minProbe = useRef<HTMLElement | null>(null);
    const maxProbe = useRef<HTMLElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLElement | null) => {
        gridRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const measured = Boolean(maxItemWidth && minItemWidth);

    useEffect(() => {
      const grid = gridRef.current;
      if (!measured || !grid) return;
      const target = grid.parentElement ?? grid;

      const apply = () => {
        const width = grid.clientWidth;
        const min = minProbe.current?.offsetWidth ?? 0;
        const max = maxProbe.current?.offsetWidth ?? 0;
        const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
        if (!width || !min || !max) return;
        let n = Math.max(1, Math.floor((width + gap) / (min + gap)));
        if (columns) n = Math.min(n, columns);
        // Stretching collapses the empty tracks, so a pinned grid must not reserve them either.
        if (stretch) n = Math.min(n, Math.max(1, grid.querySelectorAll(':scope > :not(.ui-grid__probe)').length));
        const track = (width - (n - 1) * gap) / n;
        if (track > max) grid.style.setProperty('--ui-grid-template', `repeat(${n}, ${max}px)`);
        else grid.style.removeProperty('--ui-grid-template');
      };

      apply();
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(apply);
      observer.observe(target);
      return () => {
        observer.disconnect();
        grid.style.removeProperty('--ui-grid-template');
      };
    }, [measured, columns, stretch, minItemWidth, maxItemWidth, children]);

    const vars: Record<string, string | number> = {};
    if (minItemWidth) vars['--ui-grid-min'] = minItemWidth;
    if (maxItemWidth) vars['--ui-grid-max'] = maxItemWidth;
    if (columns) vars['--ui-grid-cols'] = columns;

    const mode = minItemWidth ? (columns ? 'capped' : 'fluid') : 'fixed';
    const cls =
      `ui-grid ui-grid--level-${level} ui-grid--${mode}` +
      (stretch ? ' ui-grid--stretch' : '') +
      (className ? ' ' + className : '');

    // The probes resolve the two lengths (which are usually tokens) to pixels. They are
    // absolutely positioned, so they take no grid cell, and they exist only when measuring.
    // Inside a list they are `li`s, so the markup stays valid.
    const probeTag = as === 'ul' || as === 'ol' ? 'li' : 'span';
    const probes = measured
      ? [
          createElement(probeTag, { key: 'min', ref: minProbe, className: 'ui-grid__probe ui-grid__probe--min', 'aria-hidden': true }),
          createElement(probeTag, { key: 'max', ref: maxProbe, className: 'ui-grid__probe ui-grid__probe--max', 'aria-hidden': true }),
        ]
      : null;

    return createElement(
      as,
      { ...rest, ref: setRefs, className: cls, style: { ...style, ...vars } },
      probes,
      children,
    );
  },
);

Grid.displayName = 'Grid';

export default Grid;
