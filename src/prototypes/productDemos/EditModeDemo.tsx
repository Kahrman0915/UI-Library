import { forwardRef } from 'react';
import { Anim, DemoStage, clicks, path } from './timeline';
import type { StageHandle, Track } from './timeline';
import { Bar, Box, Cursor, EditDecor, SkeletonCompact, SkeletonSidebar, SkeletonThumb, Text, Window, at } from './parts';
import type { DemoProps } from './SpacesDemo';

/* ── Edit mode ────────────────────────────────────────────────────────────────
   Edit → rename the space → drag a card to swap places → open a compact card's
   ••• menu → Card layout → Thumbnail, and it grows → Done. Cards change size
   from that menu; there is no corner to drag. The cards fade and reset before
   the loop. 11s. */

const DURATION = 11;
const ON = 1.75;
const OFF = 8.5;
const RESET = 10.2;
const MORE_CLICK = 6.55; // the ••• on card B
const PICK = 7.1; // Card layout → Thumbnail
const GROW = 7.4;
const GROW_END = 8.0;
const pos = (s: number) => [24 + (s % 3) * 210, 88 + Math.floor(s / 3) * 206] as const;

const decor: Track = [[0, 0], [ON, 0], [ON + 0.3, 1, 'out'], [OFF, 1], [OFF + 0.3, 0, 'in']];
const fadeReset = (peak = 1): Track => [[0, peak], [9.8, peak], [10.1, 0, 'in'], [10.35, 0], [10.75, peak, 'out']];
const hold = (from: number, to: number, a: number, b: number, e: 'inOut' | 'in' | 'linear' = 'inOut'): Track => [[0, from], [a, from], [b, to, e], [RESET, to], [RESET + 0.05, from, 'hold']];

const cursor = path(
  { S: [520, 390], EDIT: [832, 78], TITLE: [342, 75], GRIP: [261, 146], DROP: [681, 146], MORE: [630, 148], THUMB: [566, 238] },
  [[0, 'S'], [1.0, 'S'], [1.55, 'EDIT'], [2.3, 'EDIT'], [2.85, 'TITLE'], [4.2, 'TITLE'], [4.65, 'GRIP'], [5.0, 'GRIP'], [5.8, 'DROP'], [6.1, 'DROP'], [6.45, 'MORE'], [6.7, 'MORE'], [7.0, 'THUMB'], [7.3, 'THUMB'], [8.3, 'EDIT'], [9.2, 'EDIT'], [10.4, 'S']],
);

export const EditModeDemo = forwardRef<StageHandle, DemoProps>(({ playing, className }, ref) => {
  const [dx, dy] = pos(2);
  const [bx, by] = pos(1);
  return (
    <DemoStage ref={ref} duration={DURATION} width={880} height={495} playing={playing} stillTime={4.2} label="Animation: editing a space — renaming it, dragging a card, and switching a card to Thumbnail from its menu" className={className}>
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
          <SkeletonCompact x={bx} y={by + 103} titleW={76} tracks={{ opacity: fadeReset(), y: hold(0, 103, GROW, GROW_END) }}>
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

          {/* card B: a compact card switched to Thumbnail from its ••• menu */}
          <Anim tracks={{ opacity: fadeReset(), height: hold(87, 190, GROW, GROW_END) }} className="pd-card" style={at(bx, by, 192, 87)}>
            <Anim tracks={{ opacity: [[0, 1], [GROW + 0.05, 1], [GROW + 0.3, 0, 'in'], [RESET, 0], [RESET + 0.05, 1, 'hold']] }} style={at(0, 0, 192, 87)}>
              <Box x={12} y={12} w={28} h={28} className="pd-fill-primary" style={{ borderRadius: 6, opacity: 0.25 }} />
              <Bar x={50} y={16} w={92} h={8} tone="muted-fg" opacity={0.6} radius={4} />
              <Bar x={50} y={31} w={118} h={6} tone="muted" radius={3} />
              <Box x={12} y={54} w={168} h={1} className="pd-rule" />
              <Bar x={12} y={68} w={56} h={6} tone="primary" opacity={0.6} radius={3} />
            </Anim>
            <Anim tracks={{ opacity: [[0, 0], [GROW + 0.25, 0], [GROW_END - 0.05, 1, 'out'], [RESET, 1], [RESET + 0.05, 0, 'hold']] }} style={at(0, 0, 192, 190, { opacity: 0 })}>
              {/* An empty child, like its neighbours' edit decor, so it drops the footer bar they don't show. */}
              <SkeletonThumb x={0} y={0} hue="emerald" titleW={110}><></></SkeletonThumb>
            </Anim>
            <EditDecor w={192} h={87} opacity={decor} outlineHeight={hold(85, 188, GROW, GROW_END)} moreScale={[[0, 1], [MORE_CLICK - 0.02, 1], [MORE_CLICK + 0.07, 0.88, 'out'], [MORE_CLICK + 0.22, 1, 'out']]} />
          </Anim>

          <SkeletonThumb x={pos(0)[0]} y={pos(0)[1]} hue="emerald" titleW={110} tracks={{ opacity: fadeReset(), x: hold(0, 420, 5.0, 5.8), scale: [[0, 1], [4.72, 1], [4.9, 1.03, 'out'], [5.8, 1.03], [5.98, 1, 'out']] }}>
            <EditDecor w={192} h={190} opacity={decor} />
          </SkeletonThumb>

          {/* the ••• menu on card B */}
          <Anim tracks={{ opacity: [[0, 0], [MORE_CLICK + 0.05, 0], [MORE_CLICK + 0.2, 1, 'out'], [PICK + 0.2, 1], [PICK + 0.35, 0, 'in']], y: [[0, -4], [MORE_CLICK + 0.05, -4], [MORE_CLICK + 0.2, 0, 'out']] }} className="pd-popover" style={at(bx + 44, by + 30, 150, 100, { opacity: 0, zIndex: 5 })}>
            <Text x={12} y={8} className="pd-t--muted">Card layout</Text>
            <Anim tracks={{ opacity: [[0, 0], [PICK - 0.25, 0], [PICK - 0.19, 1, 'out'], [PICK + 0.2, 1], [PICK + 0.35, 0, 'in']] }} className="pd-fill-accent" style={at(4, 62, 142, 28, { opacity: 0, borderRadius: 5 })} />
            {(['Compact', 'Thumbnail'] as const).map((label, i) => (
              <Box key={label} x={0} y={30 + i * 32} w={150} h={28}>
                <Box x={14} y={9} w={10} h={10} style={{ borderRadius: 999, border: 'var(--border-w-100) solid var(--muted-foreground)' }} />
                <Anim
                  tracks={{ opacity: label === 'Thumbnail' ? [[0, 0], [PICK + 0.03, 0], [PICK + 0.08, 1, 'out'], [RESET, 1], [RESET + 0.05, 0, 'hold']] : [[0, 1], [PICK + 0.03, 1], [PICK + 0.08, 0, 'in'], [RESET, 0], [RESET + 0.05, 1, 'hold']] }}
                  className="pd-bar pd-bar--fg"
                  style={at(17, 12, 4, 4, { opacity: label === 'Thumbnail' ? 0 : 1 })}
                />
                <Text x={32} y={4} className="pd-t--sm">{label}</Text>
              </Box>
            ))}
          </Anim>
        </Box>
        <Cursor x={cursor.x} y={cursor.y} scale={clicks([1.65, 2.9, MORE_CLICK, PICK, 8.4], [[4.7, 5.85]])} />
      </Window>
    </DemoStage>
  );
});
EditModeDemo.displayName = 'EditModeDemo';
