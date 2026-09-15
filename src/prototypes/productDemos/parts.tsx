import type { CSSProperties, ReactNode } from 'react';
import { Anim, sample } from './timeline';
import type { Key, Track, Tracks } from './timeline';

/* ── Product demos · shared scenery ───────────────────────────────────────────
   The window, sidebar, cards and charts every demo is drawn from. Coordinates
   are the Figma Motion frames' coordinates, in the window's own space. */

export type Hue = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';

export const at = (x: number, y: number, w?: number, h?: number, extra?: CSSProperties): CSSProperties => ({
  left: x,
  top: y,
  ...(w !== undefined ? { width: w } : null),
  ...(h !== undefined ? { height: h } : null),
  ...extra,
});

export const hueVars = (hue: Hue): CSSProperties =>
  ({ '--pd-hue': `var(--category-${hue})`, '--pd-hue-bg': `var(--category-${hue}-bg)` }) as CSSProperties;

/** A static positioned box. */
export function Box({ x, y, w, h, className, style, children }: { x: number; y: number; w?: number; h?: number; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={`pd-abs${className ? ' ' + className : ''}`} style={at(x, y, w, h, style)}>
      {children}
    </div>
  );
}

type BarTone = 'fg' | 'muted-fg' | 'muted' | 'primary' | 'primary-fg' | 'sidebar-fg' | 'accent-fg';

/** A skeleton text bar. */
export function Bar({ x, y, w, h, tone, opacity = 1, radius }: { x: number; y: number; w: number; h: number; tone: BarTone; opacity?: number; radius?: number }) {
  return <Box x={x} y={y} w={w} h={h} className={`pd-bar pd-bar--${tone}`} style={{ opacity, ...(radius !== undefined ? { borderRadius: radius } : null) }} />;
}

export function Text({ x, y, children, className = '', style }: { x: number; y: number; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`pd-abs pd-t ${className}`} style={at(x, y, undefined, undefined, style)}>
      {children}
    </div>
  );
}

/** Window chrome: title bar with traffic lights and an address pill. `addresses` cross-fade on their tracks. */
export function Window({ width, height, addresses, children }: { width: number; height: number; addresses: Array<{ slug: string; tracks?: Tracks; visible?: boolean }>; children: ReactNode }) {
  return (
    <div className="pd-abs pd-window" style={at(0, 0, width, height)}>
      <Box x={0} y={0} w={width} h={44} className="pd-titlebar">
        {[0, 1, 2].map((i) => (
          <Box key={i} x={16 + i * 14} y={18} w={8} h={8} className="pd-dot" />
        ))}
        <Box x={64} y={10} w={380} h={24} className="pd-address">
          {addresses.map((a) => (
            <Anim key={a.slug} tracks={a.tracks} className="pd-mono" style={at(12, 4, undefined, undefined, { opacity: a.visible ? 1 : 0 })}>
              dartboards / {a.slug}
            </Anim>
          ))}
        </Box>
      </Box>
      {children}
    </div>
  );
}

export type SkeletonRow = { width: number; hue: Hue; active?: Track; muted?: Track; activeAtStart?: boolean };

/** The abstract sidebar used by the three feature demos: skeleton labels, coloured space dots, a sliding highlight. */
export function SkeletonSidebar({ rows, highlightY, highlight }: { rows: SkeletonRow[]; highlightY: number; highlight?: Tracks }) {
  return (
    <Box x={0} y={44} w={220} h={496} className="pd-sidebar">
      <Bar x={16} y={20} w={88} h={10} tone="sidebar-fg" opacity={0.55} radius={4} />
      <Bar x={16} y={60} w={48} h={7} tone="muted-fg" opacity={0.5} radius={3} />
      <Anim tracks={highlight} className="pd-highlight" style={at(8, highlightY, 204, 32, { opacity: 0.7 })} />
      {rows.map((r, i) => (
        <Box key={i} x={8} y={80 + i * 36} w={204} h={32} style={hueVars(r.hue)}>
          <Box x={12} y={12} w={8} h={8} className="pd-dot pd-hue" />
          <Anim tracks={r.muted ? { opacity: r.muted } : undefined} className="pd-bar pd-bar--muted-fg" style={at(28, 12, r.width, 9, { opacity: r.activeAtStart ? 0 : 0.45 })} />
          <Anim tracks={r.active ? { opacity: r.active } : undefined} className="pd-bar pd-bar--accent-fg" style={at(28, 12, r.width, 9, { opacity: r.activeAtStart ? 0.85 : 0 })} />
        </Box>
      ))}
      <Bar x={36} y={236} w={72} h={8} tone="muted-fg" opacity={0.3} radius={4} />
    </Box>
  );
}

/** The pointer. Tracks are absolute window coordinates for the tip. */
export function Cursor({ x, y, scale }: { x: Track; y: Track; scale?: Track }) {
  return (
    <Anim tracks={{ x, y, scale }} style={{ left: 0, top: 0, width: 16, height: 24, transformOrigin: '0 0', zIndex: 20 }}>
      <svg width="16" height="24" viewBox="-1 -1 17 25" className="pd-cursor" style={{ display: 'block' }}>
        <path d="M 0 0 L 0 20 L 5 15 L 9 23 L 12 22 L 8 14 L 15 14 Z" />
      </svg>
    </Anim>
  );
}

/** A four-bar mark, the abstract "chart" inside skeleton thumbnails. */
function Marks({ baseline, heights = [26, 40, 18, 34], x0 = 64 }: { baseline: number; heights?: number[]; x0?: number }) {
  return (
    <>
      {heights.map((h, b) => (
        <Box key={b} x={x0 + b * 18} y={baseline - h} w={10} h={h} className="pd-hue" style={{ borderRadius: 2, opacity: 0.8 }} />
      ))}
    </>
  );
}

/** Abstract thumbnail card (skeleton text, hue-tinted image). */
export function SkeletonThumb({ x, y, hue, titleW, tracks, w = 192, h = 190, imageH = 108, badge, children }: { x: number; y: number; hue: Hue; titleW: number; tracks?: Tracks; w?: number; h?: number; imageH?: number; badge?: boolean; children?: ReactNode }) {
  return (
    <Anim tracks={tracks} className="pd-card" style={at(x, y, w, h, hueVars(hue))}>
      <Box x={0} y={0} w={w} h={imageH} className="pd-hue-bg">
        <Marks baseline={imageH - 30} />
      </Box>
      {badge ? <Box x={8} y={8} w={30} h={14} className="pd-fill-primary" style={{ borderRadius: 4 }} /> : null}
      <Bar x={12} y={imageH + 14} w={titleW} h={9} tone="muted-fg" opacity={0.6} radius={4} />
      <Bar x={12} y={imageH + 32} w={150} h={7} tone="muted" radius={4} />
      {children ?? <Bar x={12} y={imageH + 60} w={64} h={7} tone="primary" opacity={0.6} radius={4} />}
    </Anim>
  );
}

/** Abstract compact card. */
export function SkeletonCompact({ x, y, titleW, tracks, children }: { x: number; y: number; titleW: number; tracks?: Tracks; children?: ReactNode }) {
  return (
    <Anim tracks={tracks} className="pd-card" style={at(x, y, 192, 87)}>
      <Box x={12} y={12} w={28} h={28} className="pd-fill-primary" style={{ borderRadius: 6, opacity: 0.25 }} />
      <Bar x={50} y={16} w={titleW} h={8} tone="muted-fg" opacity={0.6} radius={4} />
      <Bar x={50} y={31} w={118} h={6} tone="muted" radius={3} />
      <Box x={12} y={54} w={168} h={1} className="pd-rule" />
      <Bar x={12} y={68} w={56} h={6} tone="primary" opacity={0.6} radius={3} />
      {children}
    </Anim>
  );
}

/**
 * A card in edit mode: the dashed outline and the drag grip (top left) fade in with edit
 * mode; the ••• card menu (top right) is always there. There is no resize handle — a card
 * changes size by choosing Compact or Thumbnail from that menu, never by dragging a corner.
 * `moreScale` pulses the ••• button when the cursor clicks it.
 */
export function EditDecor({ w, h, opacity, outlineHeight, moreScale }: { w: number; h: number; opacity: Track; outlineHeight?: Track; moreScale?: Track }) {
  return (
    <>
      <Anim tracks={{ opacity, height: outlineHeight }} className="pd-dashed pd-dashed--primary" style={at(1, 1, w - 2, h - 2, { opacity: 0, borderRadius: 7 })} />
      <Anim tracks={{ opacity }} className="pd-control" style={at(6, 6, 22, 14, { opacity: 0, borderRadius: 4 })}>
        {[0, 1, 2].map((a) => [0, 1].map((b) => <Box key={`${a}${b}`} x={6 + a * 4} y={3 + b * 4} w={2} h={2} className="pd-bar pd-bar--muted-fg" style={{ borderRadius: 1 }} />))}
      </Anim>
      <Anim tracks={moreScale ? { scale: moreScale } : undefined} className="pd-control pd-center" style={at(w - 26, 6, 20, 20, { borderRadius: 5, gap: 2 })}>
        {[0, 1, 2].map((i) => <span key={i} className="pd-bar pd-bar--muted-fg" style={{ width: 3, height: 3 }} />)}
      </Anim>
    </>
  );
}

export type ChartType = 'line' | 'area' | 'bars' | 'hbars' | 'donut' | 'kpi';

/** A small, readable chart for the realistic walkthrough cards. */
export function MiniChart({ type, width, height }: { type: ChartType; width: number; height: number }) {
  if (type === 'kpi') {
    return (
      <>
        <Text x={18} y={12} className="pd-t--lg">$48.2M</Text>
        <Text x={18} y={42} className="pd-t--success">+6.4% this month</Text>
        <svg className="pd-abs" style={at(width - 136, height - 32, 118, 22)} viewBox="-1 -1 118 22">
          <polyline points="0,18 20,14 40,16 60,9 80,11 100,4 116,2" fill="none" className="pd-hue-stroke" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </>
    );
  }
  return (
    <svg className="pd-abs" style={at(0, 0, width, height)} viewBox={`0 0 ${width} ${height}`}>
      {type === 'bars' &&
        [26, 40, 32, 52, 44, 60].map((h, i) => (
          <rect key={i} x={(width - 100) / 2 + i * 18} y={height - 14 - h} width={10} height={h} rx={2} className="pd-hue-fill" opacity={0.85} />
        ))}
      {type === 'hbars' &&
        [0.82, 0.58, 0.36].map((f, i) => (
          <g key={i}>
            <rect x={22} y={24 + i * 18} width={width - 44} height={8} rx={4} className="pd-hue-fill" opacity={0.18} />
            <rect x={22} y={24 + i * 18} width={(width - 44) * f} height={8} rx={4} className="pd-hue-fill" opacity={0.9} />
          </g>
        ))}
      {(type === 'line' || type === 'area') &&
        (() => {
          const w = width - 36;
          const h = height - 34;
          const ys = type === 'line' ? [0.75, 0.62, 0.68, 0.45, 0.52, 0.3, 0.22] : [0.8, 0.7, 0.58, 0.62, 0.4, 0.34, 0.18];
          const pts = ys.map((y, i) => [18 + (i * w) / 6, 18 + y * h] as const);
          const line = pts.map((p) => p.join(',')).join(' ');
          return (
            <g>
              {type === 'area' && <polygon points={`${line} ${18 + w},${18 + h} 18,${18 + h}`} className="pd-hue-fill" opacity={0.3} />}
              <polyline points={line} fill="none" className="pd-hue-stroke" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={pts[6][0]} cy={pts[6][1]} r={3} className="pd-hue-fill" />
            </g>
          );
        })()}
      {type === 'donut' &&
        (() => {
          const s = Math.min(58, height - 26);
          const r = (s - 8) / 2;
          const cx = width / 2;
          const cy = height / 2;
          const c = 2 * Math.PI * r;
          return (
            <g>
              <circle cx={cx} cy={cy} r={r} fill="none" className="pd-hue-stroke" strokeWidth={8} opacity={0.2} />
              <circle cx={cx} cy={cy} r={r} fill="none" className="pd-hue-stroke" strokeWidth={8} strokeLinecap="round" strokeDasharray={`${c * 0.72} ${c}`} transform={`rotate(-90 ${cx} ${cy})`} />
            </g>
          );
        })()}
    </svg>
  );
}

/** Pulsing "you are here" beacon. */
export function Beacon({ cx, cy, size = 42, ring1, ring2, core }: { cx: number; cy: number; size?: number; ring1: readonly number[]; ring2: readonly number[]; core: { opacity: Track; scale: Track } }) {
  const pulse = (starts: readonly number[]): Tracks => {
    const o: Key[] = [[0, 0]];
    const s: Key[] = [[0, 1]];
    for (const t of starts) {
      o.push([t - 0.02, 0], [t, 0.9], [t + 0.9, 0, 'out']);
      s.push([t - 0.02, 2.6], [t, 1, 'hold'], [t + 0.9, 2.6, 'out']);
    }
    return { opacity: o, scale: s };
  };
  const box = at(cx - size / 2, cy - size / 2, size, size);
  return (
    <>
      <Anim tracks={pulse(ring1)} className="pd-beacon-ring" style={{ ...box, opacity: 0, zIndex: 19 }} />
      <Anim tracks={pulse(ring2)} className="pd-beacon-ring" style={{ ...box, opacity: 0, zIndex: 19 }} />
      <Anim tracks={core} className="pd-beacon-core" style={{ ...box, zIndex: 19 }} />
    </>
  );
}

/** Convenience: an on/off cross-fade pair for a list of switch times. */
export function onOff(startOn: boolean, flips: ReadonlyArray<readonly [number, boolean]>, dur = 0.25, high = 1): { on: Track; off: Track } {
  const on: Key[] = [[0, startOn ? high : 0]];
  const off: Key[] = [[0, startOn ? 0 : high]];
  for (const [t, toOn] of flips) {
    on.push([t, toOn ? 0 : high], [t + dur, toOn ? high : 0, 'out']);
    off.push([t, toOn ? high : 0], [t + dur, toOn ? 0 : high, 'out']);
  }
  return { on, off };
}

export { sample };
