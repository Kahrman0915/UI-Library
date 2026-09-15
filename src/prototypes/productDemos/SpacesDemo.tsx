import { forwardRef } from 'react';
import { Anim, DemoStage, clicks } from './timeline';
import type { Key, StageHandle, Track } from './timeline';
import { Bar, Box, Cursor, SkeletonCompact, SkeletonSidebar, SkeletonThumb, Window, at } from './parts';
import type { Hue } from './parts';

/* ── Spaces ───────────────────────────────────────────────────────────────────
   A cursor clicks through four spaces in the sidebar; each click swaps the
   address and lands on a differently arranged space page. 10.4s loop. */

const DURATION = 10.4;
const CLICKS = [1.9, 4.3, 6.7, 9.1];
const EVENTS = CLICKS.map((c, j) => ({ c, from: j, to: (j + 1) % 4 }));
const SLUGS = ['my-space', 'team-space', 'weekly-review', 'project-space'];
const HUES: Hue[] = ['violet', 'blue', 'emerald', 'amber'];
const LABEL_W = [128, 100, 116, 88];
const GRIDS = [
  ['T', 'P', 'T', 'P', 'P', 'T'],
  ['P', 'T', 'P', 'T', 'T', 'P'],
  ['T', 'T', 'T', 'P', 'P', 'P'],
  ['P', 'P', 'T', 'T', 'P', 'P'],
] as const;

const rowTrack = (i: number, high: number, active: boolean): Track => {
  const k: Key[] = [[0, (i === 0) === active ? high : 0]];
  for (const { c, from, to } of EVENTS) {
    if (i === from) k.push([c, active ? high : 0], [c + 0.25, active ? 0 : high, 'out']);
    if (i === to) k.push([c, active ? 0 : high], [c + 0.25, active ? high : 0, 'out']);
  }
  return k;
};

const addressTrack = (i: number): Track => {
  const k: Key[] = [[0, i === 0 ? 1 : 0]];
  for (const { c, from, to } of EVENTS) {
    if (i === from) k.push([c, 1], [c + 0.15, 0, 'in']);
    if (i === to) k.push([c + 0.1, 0], [c + 0.3, 1, 'out']);
  }
  return k;
};

const pageTracks = (i: number) => {
  const o: Key[] = [[0, i === 0 ? 1 : 0]];
  const y: Key[] = [[0, 0]];
  for (const { c, from, to } of EVENTS) {
    if (i === from) {
      o.push([c + 0.05, 1], [c + 0.25, 0, 'in']);
      y.push([c + 0.05, 0], [c + 0.25, -8, 'in']);
    }
    if (i === to) {
      o.push([c + 0.2, 0], [c + 0.55, 1, 'out']);
      y.push([c + 0.2, 14, 'hold'], [c + 0.55, 0, 'out']);
    }
  }
  return { opacity: o, y };
};

const cardTracks = (page: number, k: number) => {
  if (page === 0) {
    return {
      opacity: [[0, 1], [9.3, 0, 'hold'], [9.38 + 0.04 * k, 0], [9.72 + 0.04 * k, 1, 'out']] as Track,
      y: [[0, 0], [9.3, 12, 'hold'], [9.38 + 0.04 * k, 12], [9.72 + 0.04 * k, 0, 'out']] as Track,
    };
  }
  const c0 = CLICKS[page - 1];
  return {
    opacity: [[0, 0], [c0 + 0.3 + 0.04 * k, 0], [c0 + 0.64 + 0.04 * k, 1, 'out']] as Track,
    y: [[0, 12], [c0 + 0.3 + 0.04 * k, 12], [c0 + 0.64 + 0.04 * k, 0, 'out']] as Track,
  };
};

const highlight: Track = [[0, 0], ...EVENTS.flatMap(({ c, from, to }) => [[c, 36 * from], [c + 0.3, 36 * to, 'out']] as Key[])];
const cursorX: Track = [[0, 158], ...CLICKS.flatMap((c) => [[c - 0.6, 158], [c - 0.32, 176, 'out'], [c - 0.05, 158, 'in']] as Key[])];
const cursorY: Track = [[0, 142], ...EVENTS.flatMap(({ c, from, to }) => [[c - 0.6, 142 + 36 * from], [c - 0.05, 142 + 36 * to, 'inOut']] as Key[])];

function SpacePage({ index }: { index: number }) {
  const cards: JSX.Element[] = [];
  let k = 0;
  GRIDS[index].forEach((kind, slot) => {
    const x = 24 + (slot % 3) * 210;
    const y = 88 + Math.floor(slot / 3) * 206;
    if (kind === 'T') {
      cards.push(<SkeletonThumb key={slot} x={x} y={y} hue={HUES[index]} titleW={[110, 90, 124][slot % 3]} tracks={cardTracks(index, k++)} />);
    } else {
      for (let p = 0; p < 2; p++) cards.push(<SkeletonCompact key={`${slot}-${p}`} x={x} y={y + p * 103} titleW={[92, 76, 104][(slot + p) % 3]} tracks={cardTracks(index, k++)} />);
    }
  });
  return (
    <Anim tracks={pageTracks(index)} style={at(0, 0, 660, 496, { opacity: index === 0 ? 1 : 0 })}>
      <Bar x={24} y={24} w={[180, 150, 200, 164][index]} h={14} tone="muted-fg" opacity={0.7} radius={5} />
      <Bar x={24} y={48} w={[260, 230, 290, 240][index]} h={8} tone="muted" radius={4} />
      <Box x={560} y={22} w={28} h={20} className="pd-fill-muted" style={{ borderRadius: 6 }} />
      <Box x={596} y={22} w={40} h={20} className="pd-fill-muted" style={{ borderRadius: 6 }} />
      <Box x={24} y={72} w={612} h={1} className="pd-rule" />
      {cards}
    </Anim>
  );
}

export type DemoProps = { playing?: boolean; className?: string };

export const SpacesDemo = forwardRef<StageHandle, DemoProps>(({ playing, className }, ref) => (
  <DemoStage ref={ref} duration={DURATION} width={880} height={495} playing={playing} label="Animation: clicking between spaces in the sidebar, each opening its own page of dashboards" className={className}>
    <Window width={880} height={540} addresses={SLUGS.map((slug, i) => ({ slug, tracks: { opacity: addressTrack(i) }, visible: i === 0 }))}>
      <SkeletonSidebar
        highlightY={80}
        highlight={{ y: highlight }}
        rows={SLUGS.map((_, i) => ({ width: LABEL_W[i], hue: HUES[i], active: rowTrack(i, 0.85, true), muted: rowTrack(i, 0.45, false), activeAtStart: i === 0 }))}
      />
      <Box x={220} y={44} w={660} h={496} className="pd-pane">
        {[0, 1, 2, 3].map((i) => (
          <SpacePage key={i} index={i} />
        ))}
      </Box>
      <Cursor x={cursorX} y={cursorY} scale={clicks(CLICKS)} />
    </Window>
  </DemoStage>
));
SpacesDemo.displayName = 'SpacesDemo';
