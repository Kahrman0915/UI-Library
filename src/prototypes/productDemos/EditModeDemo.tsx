import { forwardRef } from 'react';
import { Anim, DemoStage, clicks, path } from './timeline';
import type { StageHandle, Track } from './timeline';
import { Bar, Box, Cursor, EditDecor, SkeletonCompact, SkeletonSidebar, SkeletonThumb, Window, at } from './parts';
import type { DemoProps } from './SpacesDemo';

/* ── Edit mode ────────────────────────────────────────────────────────────────
   Edit → rename the space → drag a card to swap places → grow a compact card
   into a thumbnail → Done. The cards fade and reset before the loop. 11s. */

const DURATION = 11;
const ON = 1.75;
const OFF = 8.5;
const RESET = 10.2;
const pos = (s: number) => [24 + (s % 3) * 210, 88 + Math.floor(s / 3) * 206] as const;

const decor: Track = [[0, 0], [ON, 0], [ON + 0.3, 1, 'out'], [OFF, 1], [OFF + 0.3, 0, 'in']];
const fadeReset = (peak = 1): Track => [[0, peak], [9.8, peak], [10.1, 0, 'in'], [10.35, 0], [10.75, peak, 'out']];
const hold = (from: number, to: number, a: number, b: number, e: 'inOut' | 'in' | 'linear' = 'inOut'): Track => [[0, from], [a, from], [b, to, e], [RESET, to], [RESET + 0.05, from, 'hold']];

const cursor = path(
  { S: [520, 390], EDIT: [832, 78], TITLE: [342, 75], GRIP: [419, 146], DROP: [839, 146], RES: [636, 210], RES2: [636, 313] },
  [[0, 'S'], [1.0, 'S'], [1.55, 'EDIT'], [2.3, 'EDIT'], [2.85, 'TITLE'], [4.2, 'TITLE'], [4.65, 'GRIP'], [5.0, 'GRIP'], [5.8, 'DROP'], [6.1, 'DROP'], [6.65, 'RES'], [6.8, 'RES'], [7.6, 'RES2'], [7.9, 'RES2'], [8.35, 'EDIT'], [9.2, 'EDIT'], [10.4, 'S']],
);

export const EditModeDemo = forwardRef<StageHandle, DemoProps>(({ playing, className }, ref) => {
  const [dx, dy] = pos(2);
  const [bx, by] = pos(1);
  return (
    <DemoStage ref={ref} duration={DURATION} width={880} height={495} playing={playing} stillTime={4.2} label="Animation: editing a space — renaming it, dragging a card, and resizing a card" className={className}>
      <Window width={880} height={540} addresses={[{ slug: 'my-space', visible: true }]}>
        <SkeletonSidebar highlightY={80} rows={[128, 100, 116, 88].map((width, i) => ({ width, hue: (['violet', 'blue', 'emerald', 'amber'] as const)[i], activeAtStart: i === 0 }))} />
        <Box x={220} y={44} w={660} h={496} className="pd-pane">
          <Anim tracks={{ width: [[0, 180], [2.95, 180], [3.35, 24, 'in'], [3.5, 24], [4.0, 150, 'linear'], [RESET, 150], [RESET + 0.05, 180, 'hold']], opacity: fadeReset(0.7) }} className="pd-bar pd-bar--muted-fg" style={at(24, 24, 180, 14, { opacity: 0.7, borderRadius: 5 })} />
          <Bar x={24} y={48} w={260} h={8} tone="muted" radius={4} />
          <Anim tracks={{ width: [[0, 190], [2.95, 190], [3.35, 34, 'in'], [3.5, 34], [4.0, 160, 'linear'], [RESET, 160], [RESET + 0.05, 190, 'hold']], opacity: [[0, 0], [2.88, 0], [3.0, 1, 'out'], [4.15, 1], [4.3, 0, 'in']] }} className="pd-ring" style={at(20, 18, 190, 26, { opacity: 0, borderRadius: 6 })} />
          <Anim tracks={{ opacity: [[0, 0], [2.95, 0], [3.0, 1], [4.15, 1], [4.2, 0]], x: [[0, 0], [2.95, 0], [3.35, -156, 'in'], [3.5, -156], [4.0, -30, 'linear']] }} className="pd-bar pd-bar--fg" style={at(208, 21, 1.5, 20, { opacity: 0, borderRadius: 1 })} />
          <Anim tracks={{ opacity: decor, x: [[0, 0], [2.95, 0], [3.35, -156, 'in'], [3.5, -156], [4.0, -30, 'linear'], [RESET, -30], [RESET + 0.05, 0, 'hold']] }} style={at(214, 23, 54, 16, { opacity: 0 })}>
            <Box x={0} y={0} w={54} h={16} className="pd-fill-primary" style={{ borderRadius: 8, opacity: 0.18 }} />
            <Bar x={10} y={5} w={34} h={6} tone="primary" opacity={0.9} radius={3} />
          </Anim>
          {[516, 550].map((x) => (
            <Box key={x} x={x} y={22} w={28} h={24} className="pd-control">
              <Bar x={9} y={7} w={10} h={10} tone="muted-fg" opacity={0.6} radius={2} />
            </Box>
          ))}
          <Anim tracks={{ opacity: [[0, 1], [ON, 1], [ON + 0.2, 0], [OFF, 0], [OFF + 0.2, 1]] }} className="pd-control" style={at(584, 22, 52, 24)}>
            <Bar x={9} y={11} w={10} h={2} tone="muted-fg" opacity={0.8} radius={1} />
            <Bar x={24} y={9} w={20} h={6} tone="muted-fg" opacity={0.8} radius={3} />
          </Anim>
          <Anim tracks={{ opacity: [[0, 0], [ON, 0], [ON + 0.2, 1], [OFF, 1], [OFF + 0.2, 0]] }} className="pd-fill-primary" style={at(584, 22, 52, 24, { opacity: 0, borderRadius: 6 })}>
            <Bar x={14} y={9} w={24} h={6} tone="primary-fg" opacity={0.9} radius={3} />
          </Anim>
          <Box x={24} y={72} w={612} h={1} className="pd-rule" />

          <SkeletonThumb x={dx} y={dy} hue="emerald" titleW={124} tracks={{ opacity: fadeReset(), x: hold(0, -420, 5.25, 5.85) }}>
            <EditDecor w={192} h={190} opacity={decor} />
          </SkeletonThumb>
          <SkeletonCompact x={bx} y={by + 103} titleW={76} tracks={{ opacity: fadeReset(), y: hold(0, 103, 6.8, 7.6) }}>
            <EditDecor w={192} h={87} opacity={decor} />
          </SkeletonCompact>
          <SkeletonCompact x={pos(3)[0]} y={pos(3)[1]} titleW={92} tracks={{ opacity: fadeReset() }}>
            <EditDecor w={192} h={87} opacity={decor} />
          </SkeletonCompact>
          <SkeletonCompact x={pos(3)[0]} y={pos(3)[1] + 103} titleW={104} tracks={{ opacity: fadeReset() }}>
            <EditDecor w={192} h={87} opacity={decor} />
          </SkeletonCompact>
          <SkeletonThumb x={pos(5)[0]} y={pos(5)[1]} hue="emerald" titleW={90} tracks={{ opacity: fadeReset() }}>
            <EditDecor w={192} h={190} opacity={decor} />
          </SkeletonThumb>

          {/* card B: compact that grows into a thumbnail */}
          <Anim tracks={{ opacity: fadeReset(), height: hold(87, 190, 6.8, 7.6) }} className="pd-card" style={at(bx, by, 192, 87)}>
            <Anim tracks={{ opacity: [[0, 1], [6.95, 1], [7.2, 0, 'in'], [RESET, 0], [RESET + 0.05, 1, 'hold']] }} style={at(0, 0, 192, 87)}>
              <Box x={12} y={12} w={28} h={28} className="pd-fill-primary" style={{ borderRadius: 6, opacity: 0.25 }} />
              <Bar x={50} y={16} w={92} h={8} tone="muted-fg" opacity={0.6} radius={4} />
              <Bar x={50} y={31} w={118} h={6} tone="muted" radius={3} />
              <Box x={12} y={54} w={168} h={1} className="pd-rule" />
              <Bar x={12} y={68} w={56} h={6} tone="primary" opacity={0.6} radius={3} />
            </Anim>
            <Anim tracks={{ opacity: [[0, 0], [7.15, 0], [7.55, 1, 'out'], [RESET, 1], [RESET + 0.05, 0, 'hold']] }} style={at(0, 0, 192, 190, { opacity: 0 })}>
              <SkeletonThumb x={0} y={0} hue="emerald" titleW={110} />
            </Anim>
            <EditDecor w={192} h={87} opacity={decor} outlineHeight={hold(85, 188, 6.8, 7.6)} handleY={hold(0, 103, 6.8, 7.6)} />
          </Anim>

          <SkeletonThumb x={pos(0)[0]} y={pos(0)[1]} hue="emerald" titleW={110} tracks={{ opacity: fadeReset(), x: hold(0, 420, 5.0, 5.8), scale: [[0, 1], [4.72, 1], [4.9, 1.03, 'out'], [5.8, 1.03], [5.98, 1, 'out']] }}>
            <EditDecor w={192} h={190} opacity={decor} />
          </SkeletonThumb>
        </Box>
        <Cursor x={cursor.x} y={cursor.y} scale={clicks([1.65, 2.9, 8.4], [[4.7, 5.85], [6.7, 7.65]])} />
      </Window>
    </DemoStage>
  );
});
EditModeDemo.displayName = 'EditModeDemo';
