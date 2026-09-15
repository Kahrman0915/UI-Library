import { forwardRef } from 'react';
import { Anim, DemoStage, clicks, path } from './timeline';
import type { Key, StageHandle, Track } from './timeline';
import { Bar, Box, Cursor, SkeletonSidebar, SkeletonThumb, Window, at } from './parts';
import type { DemoProps } from './SpacesDemo';

/* ── Dashboard Library ────────────────────────────────────────────────────────
   Search narrows the grid, a filter narrows it again with a chip, and the
   dashboard that's left gets added to a space. Resets and loops. 10.4s. */

const DURATION = 10.4;
const pos = (s: number) => [24 + (s % 3) * 210, 88 + Math.floor(s / 3) * 206] as const;
const KEPT_1 = [1, 3, 4, 7];
const KEPT_2 = [3, 7];
const SHIFT = 34;

function cardTracks(k: number) {
  const [x0, y0] = pos(k);
  const s1 = KEPT_1.indexOf(k);
  const s2 = KEPT_2.indexOf(k);
  const back = 9.05 + 0.035 * k;
  if (s1 < 0) {
    return {
      opacity: [[0, 1], [2.7, 1], [2.95, 0, 'in'], [back, 0], [back + 0.4, 1, 'out']] as Track,
      scale: [[0, 1], [2.7, 1], [2.95, 0.96, 'in'], [back, 0.96], [back + 0.4, 1, 'out']] as Track,
    };
  }
  const d1 = [pos(s1)[0] - x0, pos(s1)[1] - y0];
  const a = 2.9 + 0.09 * s1;
  const x: Key[] = [[0, 0], [a, 0], [a + 0.45, d1[0], 'inOut']];
  const y: Key[] = [[0, 0], [a, 0], [a + 0.45, d1[1], 'inOut']];
  if (s2 < 0) {
    x.push([9.0, d1[0]], [9.1, 0, 'hold']);
    y.push([9.0, d1[1]], [9.1, 0, 'hold']);
    return {
      x,
      y,
      opacity: [[0, 1], [5.85, 1], [6.1, 0, 'in'], [back, 0], [back + 0.4, 1, 'out']] as Track,
      scale: [[0, 1], [5.85, 1], [6.1, 0.96, 'in'], [back, 0.96], [back + 0.4, 1, 'out']] as Track,
    };
  }
  const d2 = [pos(s2)[0] - x0, pos(s2)[1] - y0 + SHIFT];
  const b = 6.0 + 0.1 * s2;
  x.push([b, d1[0]], [b + 0.45, d2[0], 'inOut'], [9.0, d2[0]], [9.45, 0, 'inOut']);
  y.push([b, d1[1]], [b + 0.45, d2[1], 'inOut'], [9.0, d2[1]], [9.45, 0, 'inOut']);
  return { x, y };
}

const cursor = path(
  { S: [520, 390], A: [560, 82], B: [732, 82], C: [651, 154], D: [672, 216], E: [342, 330] },
  [[0, 'S'], [1.0, 'S'], [1.6, 'A'], [3.6, 'A'], [4.1, 'B'], [4.6, 'B'], [5.0, 'C'], [5.35, 'C'], [5.6, 'D'], [6.7, 'D'], [7.3, 'E'], [8.9, 'E'], [9.8, 'S']],
);

function LibraryCard({ k }: { k: number }) {
  const [x, y] = pos(k);
  return (
    <SkeletonThumb x={x} y={y} hue="blue" titleW={[112, 96, 124, 104, 88, 118][k % 6]} tracks={cardTracks(k)} h={188} imageH={92} badge={k < 3}>
      <Bar x={12} y={146} w={52} h={5} tone="muted" radius={2} />
      <Bar x={136} y={146} w={44} h={5} tone="muted" radius={2} />
      <Anim tracks={k === 3 ? { scale: [[0, 1], [7.4, 1], [7.48, 0.95, 'out'], [7.64, 1, 'out']] } : undefined} className="pd-fill-primary" style={at(12, 158, 168, 22, { borderRadius: 5 })}>
        <Bar x={54} y={8} w={60} h={6} tone="primary-fg" opacity={0.85} radius={3} />
        {k === 3 ? (
          <Anim tracks={{ opacity: [[0, 0], [7.5, 0], [7.7, 1, 'out'], [8.8, 1], [9.0, 0, 'in']] }} className="pd-fill-success pd-center" style={at(0, 0, 168, 22, { opacity: 0, borderRadius: 5, gap: 6 })}>
            <svg width="11" height="9" viewBox="-1 -1 12 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 0 4 L 3.5 7.5 L 10 0" />
            </svg>
            <span className="pd-bar pd-bar--primary-fg" style={{ width: 36, height: 6, opacity: 0.85 }} />
          </Anim>
        ) : null}
      </Anim>
    </SkeletonThumb>
  );
}

export const LibraryDemo = forwardRef<StageHandle, DemoProps>(({ playing, className }, ref) => (
  <DemoStage ref={ref} duration={DURATION} width={880} height={495} playing={playing} stillTime={7.8} label="Animation: searching and filtering the Dashboard Library, then adding a dashboard to a space" className={className}>
    <Window width={880} height={540} addresses={[{ slug: 'library', visible: true }]}>
      <SkeletonSidebar highlightY={116} rows={[128, 100, 116, 88].map((width, i) => ({ width, hue: (['violet', 'blue', 'emerald', 'amber'] as const)[i], activeAtStart: i === 1 }))} />
      <Box x={220} y={44} w={660} h={496} className="pd-pane">
        <Bar x={24} y={24} w={170} h={14} tone="muted-fg" opacity={0.7} radius={5} />
        <Bar x={24} y={48} w={230} h={8} tone="muted" radius={4} />
        <Box x={300} y={22} w={176} h={28} className="pd-control pd-clip">
          <Box x={10} y={9} w={9} h={9} style={{ borderRadius: 999, border: '1.5px solid var(--muted-foreground)', opacity: 0.8 }} />
          <Anim tracks={{ opacity: [[0, 1], [1.85, 1], [1.9, 0], [8.8, 0], [9.0, 1, 'out']] }} className="pd-bar pd-bar--muted" style={at(28, 11, 84, 6)} />
          <Anim tracks={{ width: [[0, 2], [1.9, 2], [2.6, 72, 'linear'], [8.8, 72], [9.0, 2, 'in']], opacity: [[0, 0], [1.88, 0], [1.9, 0.75], [8.8, 0.75], [9.0, 0]] }} className="pd-bar pd-bar--fg" style={at(28, 11, 2, 6, { opacity: 0 })} />
          <Anim tracks={{ opacity: [[0, 0], [1.7, 0], [1.75, 1], [3.8, 1], [3.85, 0]], x: [[0, 0], [1.9, 0], [2.6, 72, 'linear']] }} className="pd-bar pd-bar--fg" style={at(29, 7, 1.5, 14, { opacity: 0, borderRadius: 1 })} />
        </Box>
        <Anim tracks={{ opacity: [[0, 0], [1.7, 0], [1.85, 1, 'out'], [3.8, 1], [4.0, 0, 'in']] }} className="pd-ring" style={at(298, 20, 180, 32, { opacity: 0 })} />
        <Box x={484} y={22} w={64} h={28} className="pd-control">
          {[12, 8, 4].map((w, i) => (
            <Bar key={i} x={12 + (12 - w) / 2} y={9 + i * 4} w={w} h={1.5} tone="muted-fg" radius={1} />
          ))}
          <Bar x={30} y={11} w={24} h={6} tone="muted-fg" opacity={0.7} radius={3} />
        </Box>
        <Box x={556} y={22} w={80} h={28} className="pd-control">
          <Box x={2} y={2} w={38} h={24} className="pd-fill-muted" style={{ borderRadius: 5 }} />
          {[[15, 9], [21, 9], [15, 15], [21, 15]].map(([x, y]) => (
            <Bar key={`${x}${y}`} x={x} y={y} w={4} h={4} tone="muted-fg" radius={1} />
          ))}
          {[9, 14, 19].map((y) => (
            <Bar key={y} x={52} y={y} w={16} h={2} tone="muted-fg" opacity={0.6} radius={1} />
          ))}
        </Box>
        <Box x={24} y={68} w={612} h={1} className="pd-rule" />
        <Anim tracks={{ opacity: [[0, 0], [5.8, 0], [6.1, 1, 'out'], [8.8, 1], [9.0, 0, 'in']], x: [[0, -8], [5.8, -8], [6.1, 0, 'out']] }} style={at(24, 80, 110, 24, { opacity: 0 })}>
          <Box x={0} y={0} w={110} h={24} className="pd-fill-primary" style={{ borderRadius: 12, opacity: 0.18 }} />
          <Bar x={12} y={9} w={64} h={6} tone="primary" opacity={0.8} radius={3} />
          <Bar x={88} y={11} w={10} h={1.5} tone="primary" opacity={0.8} radius={1} />
        </Anim>
        {Array.from({ length: 9 }, (_, k) => (
          <LibraryCard key={k} k={k} />
        ))}
        <Anim tracks={{ opacity: [[0, 0], [4.2, 0], [4.4, 1, 'out'], [5.6, 1], [5.8, 0, 'in']], y: [[0, -6], [4.2, -6], [4.4, 0, 'out']] }} className="pd-popover" style={at(412, 56, 224, 148, { opacity: 0, zIndex: 5 })}>
          {[0, 1, 2, 3].map((r) => (
            <div key={r}>
              <Box x={12} y={14 + r * 32} w={14} h={14} className="pd-control" style={{ borderRadius: 3 }} />
              {r === 1 ? <Anim tracks={{ opacity: [[0, 0], [5.1, 0], [5.22, 1, 'out'], [8.8, 1], [9.0, 0]] }} className="pd-fill-primary" style={at(12, 46, 14, 14, { opacity: 0, borderRadius: 3 })} /> : null}
              <Bar x={36} y={18 + r * 32} w={[96, 120, 80, 108][r]} h={6} tone="muted-fg" opacity={0.55} radius={3} />
            </div>
          ))}
        </Anim>
      </Box>
      <Cursor x={cursor.x} y={cursor.y} scale={clicks([1.65, 4.15, 5.05, 7.45])} />
    </Window>
  </DemoStage>
));
LibraryDemo.displayName = 'LibraryDemo';
