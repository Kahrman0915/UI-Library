/* DART Central · Home — widgets that fill their box.

   A Home widget is whatever size its owner dragged it to, so a list inside it
   shows as many rows as FIT — more as the widget grows, fewer as it shrinks —
   and says "N more" only when something is actually cut off. Every row is
   rendered and measured; the ones past the bottom stay laid out but are hidden
   (`visibility: hidden`, so they are skipped by Tab and screen readers too).

   Structure: `root` (fills the widget body) › `clip` (the rows) + the more line.
   The more line only takes room when rows are hidden, so the measurement asks
   "do all rows fit the whole box?" first, and only then "how many fit above a
   more line?". It can never oscillate: hiding rows never makes room for them. */

import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Button from '../../../../components/Button';
import { Sparkline } from '../../../../charts';
import { useNav } from '../../nav';
import type { Route } from '../../types';

/** The more line and the gap above it. */
const MORE_H = 32;

/** `reserveMore`: keep room for an "N more" line when rows are cut off (off when the widget already says the total). */
export function useFit(total: number, reserveMore = true) {
  const rootRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(total);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const clip = clipRef.current;
    if (!root || !clip) return;
    const measure = () => {
      const rows = [...clip.querySelectorAll<HTMLElement>('[data-fit]')];
      if (!rows.length) return setVisible(0);
      // Measured from the frame, not the clip: the clip reaches past the frame to make room for row hover.
      const top = root.getBoundingClientRect().top;
      const bottoms = rows.map((el) => el.getBoundingClientRect().bottom - top);
      const fitIn = (h: number) => bottoms.filter((b) => b <= h + 0.5).length;
      const full = root.clientHeight;
      const all = fitIn(full) === rows.length;
      setVisible(all ? rows.length : Math.max(1, fitIn(reserveMore ? full - MORE_H : full)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [total, reserveMore]);
  /** Spread on each row: marks it for measuring, and hides it once it no longer fits. */
  const row = (i: number) =>
    i >= visible ? { 'data-fit': '', 'aria-hidden': true as const, className: 'ds-fit-hidden' } : { 'data-fit': '', className: undefined };
  return { rootRef, clipRef, hidden: Math.max(0, total - visible), row };
}

/** The frame a fitting list sits in, with its "N more" line. */
export function FitFrame({
  fit,
  more,
  children,
}: {
  fit: ReturnType<typeof useFit>;
  /** What the more line says and where it goes. */
  more?: { id: string; label: (n: number) => string; route?: Route; onClick?: () => void };
  children: ReactNode;
}) {
  const { go } = useNav();
  return (
    <div ref={fit.rootRef} className="ds-fit">
      <div ref={fit.clipRef} className="ds-fit__clip">
        {children}
      </div>
      {more && fit.hidden > 0 &&
        (more.route || more.onClick ? (
          <Button id={more.id} style="link" size="sm" className="ds-fit__more" label={more.label(fit.hidden)} onClick={() => (more.onClick ? more.onClick() : go(more.route!))} />
        ) : (
          <span className="ds-fit__more ds-fit__more--text">{more.label(fit.hidden)}</span>
        ))}
    </div>
  );
}

/** The content box of an element, kept current — for widgets that size a chart to their space. */
export function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0, gap: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const next = { w: el.clientWidth, h: el.clientHeight, gap: parseFloat(getComputedStyle(el).columnGap) || 0 };
      setBox((b) => (b.w === next.w && b.h === next.h && b.gap === next.gap ? b : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

/**
 * One KPI: what it counts, the number, and the line that makes the number mean something
 * ("4 of 5 attested", "next due Oct 16"). A tile you can click through to where it lives.
 */
export function KpiTile({
  id,
  label,
  value,
  context,
  tone = 'default',
  progress,
  trend,
  size = 'default',
  onClick,
}: {
  id: string;
  label: string;
  value: string | number;
  context: string;
  tone?: 'default' | 'success' | 'warning' | 'error';
  /** 0–100: draws a bar under the number. */
  progress?: number;
  /** A trend drawn beside the number, filling the tile's height. */
  trend?: number[];
  /** `lg` is the Today strip's: a bigger number, and room for a trend. */
  size?: 'default' | 'lg';
  onClick?: () => void;
}) {
  return (
    <button id={id} type="button" className={`ds-kpi${size === 'lg' ? ' ds-kpi--lg' : ''}${trend ? ' ds-kpi--trend' : ''}`} onClick={onClick} disabled={!onClick}>
      <span className="ds-kpi__text">
        <span className="ds-kpi__label">{label}</span>
        {/* The number is always the text colour; the tone colours the line that says why. */}
        <span className="ds-kpi__value">{value}</span>
        {progress !== undefined && (
          <span className="ds-kpi__bar" aria-hidden="true">
            <span className={`ds-kpi__fill ds-kpi__fill--${tone}`} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
          </span>
        )}
        <span className={`ds-kpi__context${tone !== 'default' ? ` ds-tone--${tone}` : ''}`}>{context}</span>
      </span>
      {trend && <KpiTrend id={`${id}-trend`} label={`${label}, last 12 weeks`} data={trend} />}
    </button>
  );
}

function KpiTrend({ id, label, data }: { id: string; label: string; data: number[] }) {
  const [ref, box] = useBox<HTMLSpanElement>();
  return (
    <span ref={ref} className="ds-kpi__trend">
      {box.h >= 24 && box.w >= 48 && <Sparkline id={id} label={label} data={data} variant="area" height={Math.floor(box.h)} />}
    </span>
  );
}

/**
 * KPI tiles: all in one row when there is room, otherwise two across (one, for an odd count).
 * Tiles keep their natural height — a taller widget gets more content under them, never taller
 * empty tiles. Only `stretch` (the Today strip, whose height is sized to its tiles) fills.
 */
export function KpiGrid({ children, stretch = false, oneRow = false }: { children: ReactNode[]; stretch?: boolean; oneRow?: boolean }) {
  const [ref, box] = useBox<HTMLDivElement>();
  const tiles = children.filter(Boolean);
  const n = tiles.length;
  const fitsOneRow = box.w >= 112 * n + 12 * (n - 1);
  // `oneRow` (a Medium widget, whose height holds one row): when they don't all fit across, keep the
  // first two — so list the tiles most-urgent first.
  const shown = oneRow && box.w && !fitsOneRow ? tiles.slice(0, 2) : tiles;
  // Never a lonely tile on its own row: an even count halves, an odd one stacks.
  const cols = fitsOneRow ? n : shown.length % 2 === 0 ? 2 : 1;
  return (
    <div ref={ref} className={`ds-kpi-grid${stretch ? ' ds-kpi-grid--stretch' : ''}${oneRow ? ' ds-kpi-grid--one-row' : ''}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {shown}
    </div>
  );
}

/**
 * The Small-size design: one big number, what it counts, one line of context. Apple's
 * small widgets are this — a glance, then a tap to open the app where it lives.
 */
export function BigStat({
  id,
  label,
  value,
  context,
  tone = 'default',
  progress,
  onClick,
}: {
  id: string;
  label: string;
  value: string | number;
  context?: string;
  tone?: 'default' | 'success' | 'warning' | 'error';
  progress?: number;
  onClick?: () => void;
}) {
  return (
    <button id={id} type="button" className="ds-bigstat" onClick={onClick} disabled={!onClick}>
      <span className="ds-bigstat__value">{value}</span>
      <span className="ds-bigstat__label">{label}</span>
      {progress !== undefined && (
        <span className="ds-kpi__bar" aria-hidden="true">
          <span className={`ds-kpi__fill ds-kpi__fill--${tone}`} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </span>
      )}
      {context && <span className={`ds-bigstat__context${tone !== 'default' ? ` ds-tone--${tone}` : ''}`}>{context}</span>}
    </button>
  );
}
