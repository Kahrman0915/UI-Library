import { forwardRef } from 'react';
import { Anim, DemoStage, clicks, path } from './timeline';
import type { Key, StageHandle, Track } from './timeline';
import { Beacon, Box, Cursor, MiniChart, Text, Window, at, hueVars } from './parts';
import type { ChartType, Hue } from './parts';
import type { DemoProps } from './SpacesDemo';

/* ── Get started walkthrough (version B: starts on the Dashboard Library) ─────
   One 24-second loop in three 8-second steps:
     1 · browse the library — a beacon on Libraries › Dashboards, the Risk
         filter, a search for "collections"
     2 · Add to space → Add to New Space → the builder → name it, add a second
         dashboard → Done → the new space appears in the sidebar
     3 · Edit → drag a card → ••• → Card layout → Compact → Done
   More detailed than the three feature demos: real labels and dashboard names,
   abstract text everywhere else. */

export const GET_STARTED_DURATION = 24;
export const GET_STARTED_STEPS = [0, 8, 16] as const;

const R = 23.62;
const reset = (from: number, to: number, a: number, b: number, e: 'inOut' | 'in' | 'out' = 'inOut'): Track => [[0, from], [a, from], [b, to, e], [R, to], [R + 0.02, from, 'hold']];
const fade = (pairs: ReadonlyArray<readonly [number, number, number]>, start: number): Track => {
  const k: Key[] = [[0, start]];
  for (const [t, from, to] of pairs) k.push([t, from], [t + 0.2, to, to > from ? 'out' : 'in']);
  return k;
};

type Dash = { name: string; type: ChartType; hue: Hue };
const DASHBOARDS: Dash[] = [
  { name: 'Collections aging', type: 'line', hue: 'rose' },
  { name: 'Collateral health', type: 'donut', hue: 'emerald' },
  { name: 'Collections risk', type: 'bars', hue: 'blue' },
  { name: 'Loan pipeline', type: 'hbars', hue: 'violet' },
  { name: 'Portfolio risk', type: 'area', hue: 'amber' },
  { name: 'Branch performance', type: 'kpi', hue: 'cyan' },
];

const P = {
  DASH: [98, 332], RISK: [642, 133], SEARCH: [352, 133], BTN0: [340, 342], NEWROW: [550, 225], NAME: [296, 121], TILE: [729, 215],
  ROWPLUS: [856, 247], DONEB: [834, 68], WRSIDE: [78, 256], EDIT: [823, 78], GRIP: [261, 137], DROP: [471, 137], MORE: [634, 140], COMPACT: [550, 192],
} as const;
const cursor = path(P, [
  [0, 'DASH'], [2.5, 'DASH'], [3.2, 'RISK'], [4.4, 'RISK'], [4.9, 'SEARCH'], [8.1, 'SEARCH'], [8.6, 'BTN0'], [9.1, 'BTN0'], [9.55, 'NEWROW'], [10.0, 'NEWROW'],
  [10.35, 'NAME'], [11.3, 'NAME'], [11.8, 'TILE'], [12.3, 'TILE'], [12.7, 'ROWPLUS'], [13.3, 'ROWPLUS'], [13.75, 'DONEB'], [14.25, 'DONEB'], [14.95, 'WRSIDE'],
  [16.0, 'WRSIDE'], [16.7, 'EDIT'], [17.4, 'EDIT'], [17.95, 'GRIP'], [18.25, 'GRIP'], [19.0, 'DROP'], [19.3, 'DROP'], [19.75, 'MORE'], [20.05, 'MORE'],
  [20.4, 'COMPACT'], [21.2, 'COMPACT'], [21.75, 'EDIT'], [22.4, 'EDIT'], [23.3, 'DASH'],
]);

function Thumbnail({ d, w = 192, h = 96 }: { d: Dash; w?: number; h?: number }) {
  return (
    <div className="pd-abs pd-hue-bg pd-clip" style={at(0, 0, w, h, hueVars(d.hue))}>
      <MiniChart type={d.type} width={w} height={h} />
    </div>
  );
}

function Lines({ x, y }: { x: number; y: number }) {
  return (
    <>
      <Box x={x} y={y} w={150} h={6} className="pd-bar pd-bar--muted" />
      <Box x={x} y={y + 12} w={112} h={6} className="pd-bar pd-bar--muted" />
    </>
  );
}

function CompactContent({ d }: { d: Dash }) {
  return (
    <div style={hueVars(d.hue)}>
      <Box x={12} y={12} w={28} h={28} className="pd-hue-bg" style={{ borderRadius: 6 }} />
      <Box x={20} y={20} w={12} h={12} className="pd-hue" style={{ borderRadius: 3 }} />
      <Text x={50} y={12}>{d.name}</Text>
      <Box x={50} y={31} w={118} h={6} className="pd-bar pd-bar--muted" />
      <Box x={12} y={54} w={168} h={1} className="pd-rule" />
      <Box x={12} y={68} w={56} h={6} className="pd-bar pd-bar--primary" style={{ opacity: 0.6 }} />
    </div>
  );
}

/* ── step 1 · the library ── */
function LibraryPage() {
  const pos = (k: number) => [24 + (k % 3) * 210, 130 + Math.floor(k / 3) * 206] as const;
  const card = (k: number) => {
    if ([1, 3, 5].includes(k)) return { opacity: reset(1, 0, 3.45, 3.65, 'in'), scale: reset(1, 0.96, 3.45, 3.65, 'in') };
    if (k === 2) return { x: reset(0, -210, 3.6, 4.05) };
    if (k === 4) return { x: reset(0, 210, 3.68, 4.13), y: reset(0, -206, 3.68, 4.13), opacity: reset(1, 0, 6.1, 6.3, 'in') };
    return undefined;
  };
  let chipX = 260;
  return (
    <Anim tracks={{ opacity: [[0, 1], [9.7, 1], [9.9, 0, 'in'], [23.66, 0], [23.95, 1, 'out']], y: [[0, 0], [23.66, 10, 'hold'], [23.95, 0, 'out']] }} style={at(0, 0, 660, 496)}>
      <Text x={24} y={14} className="pd-t--lg">Dashboard Library</Text>
      <Box x={24} y={50} w={260} h={8} className="pd-bar pd-bar--muted" />
      <Box x={24} y={74} w={220} h={30} className="pd-control pd-clip">
        <Box x={10} y={10} w={9} h={9} style={{ borderRadius: 999, border: 'var(--border-w-200) solid var(--muted-foreground)' }} />
        <Anim tracks={{ opacity: reset(1, 0, 5.05, 5.1) }} className="pd-bar pd-bar--muted" style={at(28, 12, 90, 6)} />
        <Anim tracks={{ width: reset(0, 72, 5.15, 5.9, 'inOut') }} className="pd-clip" style={at(28, 5, 0, 20)}>
          <Text x={0} y={0} className="pd-t--sm">collections</Text>
        </Anim>
        <Anim tracks={{ opacity: [[0, 0], [5.0, 0], [5.05, 1], [7.3, 1], [7.35, 0]], x: [[0, 0], [5.15, 0], [5.9, 73]] }} className="pd-bar pd-bar--fg" style={at(28, 7, 1.5, 16, { opacity: 0, borderRadius: 1 })} />
      </Box>
      <Anim tracks={{ opacity: [[0, 0], [4.95, 0], [5.1, 1, 'out'], [7.3, 1], [7.5, 0, 'in']] }} className="pd-ring" style={at(22, 72, 224, 34, { opacity: 0 })} />
      {(['All', 'Operations', 'Risk', 'Finance'] as const).map((label, i) => {
        const w = [40, 82, 48, 66][i];
        const x = chipX;
        chipX += w + 8;
        const on = label === 'All' ? reset(1, 0, 3.3, 3.45, 'in') : label === 'Risk' ? reset(0, 1, 3.3, 3.45, 'out') : undefined;
        return (
          <Box key={label} x={x} y={77} w={w} h={24} className="pd-control pd-center" style={{ borderRadius: 12 }}>
            <span className="pd-t pd-t--muted">{label}</span>
            {on ? (
              <Anim tracks={{ opacity: on }} className="pd-fill-primary pd-center" style={at(-1, -1, w, 24, { borderRadius: 12, opacity: label === 'All' ? 1 : 0 })}>
                <span className="pd-t pd-t--on-primary">{label}</span>
              </Anim>
            ) : null}
          </Box>
        );
      })}
      <Box x={24} y={116} w={612} h={1} className="pd-rule" />
      {DASHBOARDS.map((d, k) => {
        const [x, y] = pos(k);
        const locked = k === 4;
        return (
          <Anim key={d.name} tracks={card(k)} className="pd-card" style={at(x, y, 192, 190)}>
            <Thumbnail d={d} />
            {locked ? <Box x={0} y={0} w={192} h={96} className="pd-fill-background" style={{ opacity: 0.6 }} /> : null}
            {locked ? (
              <Box x={82} y={34} w={28} h={28} className="pd-card pd-center" style={{ borderRadius: 999 }}>
                <svg width="12" height="15" viewBox="0 0 12 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M2 7 V5 a4 4 0 0 1 8 0 V7" />
                  <rect x="0.8" y="7" width="10.4" height="7.2" rx="2" fill="currentColor" stroke="none" />
                </svg>
              </Box>
            ) : null}
            <Text x={12} y={102}>{d.name}</Text>
            <Lines x={12} y={124} />
            <Anim tracks={k === 0 ? { scale: [[0, 1], [8.6, 1], [8.67, 0.96, 'out'], [8.8, 1, 'out']] } : undefined} className={`${locked ? 'pd-fill-muted' : 'pd-fill-primary'} pd-center`} style={at(12, 156, 168, 24, { borderRadius: 5 })}>
              <span className={`pd-t ${locked ? 'pd-t--muted' : 'pd-t--on-primary'}`}>{locked ? 'No access' : 'Add to space'}</span>
            </Anim>
          </Anim>
        );
      })}
    </Anim>
  );
}

/* ── step 2 · the builder ── */
const PLACEHOLDER_TILES = new Set(['Metrics', 'Reports', 'Workflow', 'Aiden widget']);
function BuilderPage() {
  return (
    <Anim tracks={{ opacity: [[0, 0], [9.85, 0], [10.2, 1, 'out'], [13.85, 1], [14.05, 0, 'in']], y: [[0, 10], [9.85, 10], [10.2, 0, 'out']] }} className="pd-fill-background" style={at(0, 0, 660, 496, { opacity: 0 })}>
      <Box x={0} y={0} w={660} h={48}>
        <Box x={0} y={0} w={660} h={48} className="pd-fill-primary" style={{ opacity: 0.14 }} />
        <Box x={0} y={47} w={660} h={1} className="pd-fill-primary" style={{ opacity: 0.4 }} />
        <Text x={16} y={6} className="pd-t--sm-semibold pd-t--primary">Edit space mode</Text>
        <Text x={16} y={26} className="pd-t--muted pd-t--regular">Drag, resize and add components</Text>
        <Box x={516} y={12} w={60} h={24} className="pd-control pd-center"><span className="pd-t">Cancel</span></Box>
        <Anim tracks={{ scale: [[0, 1], [13.78, 1], [13.85, 0.95, 'out'], [14.0, 1, 'out']] }} className="pd-fill-primary pd-center" style={at(584, 12, 60, 24, { borderRadius: 6 })}>
          <span className="pd-t pd-t--on-primary">Done</span>
        </Anim>
      </Box>
      <Box x={0} y={48} w={452} h={448}>
        <Box x={16} y={12} w={260} h={34}>
          <Anim tracks={{ opacity: reset(0.7, 0, 10.38, 10.42) }} className="pd-abs pd-t pd-t--sm pd-t--muted" style={at(8, 7)}>Space name</Anim>
          <Anim tracks={{ width: reset(0, 127, 10.45, 11.15, 'inOut') }} className="pd-clip" style={at(8, 3, 0, 28)}>
            <Text x={0} y={0} className="pd-t--lg">Weekly review</Text>
          </Anim>
          <Anim tracks={{ opacity: [[0, 0], [10.4, 0], [10.45, 1], [11.3, 1], [11.35, 0]], x: [[0, 0], [10.45, 0], [11.15, 128]] }} className="pd-bar pd-bar--fg" style={at(8, 7, 1.5, 20, { opacity: 0, borderRadius: 1 })} />
        </Box>
        <Anim tracks={{ opacity: [[0, 0], [10.25, 0], [10.4, 1, 'out'], [11.3, 1], [11.45, 0, 'in']] }} className="pd-ring" style={at(14, 10, 264, 38, { opacity: 0 })} />
        <Box x={24} y={50} w={200} h={7} className="pd-bar pd-bar--muted" />
        <Box x={16} y={70} w={420} h={36} className="pd-dashed" />
        <Text x={28} y={78} className="pd-t--sm-semibold pd-t--muted">Heading</Text>
        <Box x={16} y={118} w={200} h={186} className="pd-card">
          <Box x={1} y={1} w={198} h={184} className="pd-dashed pd-dashed--primary" style={{ opacity: 0.6, borderRadius: 7 }} />
          <div className="pd-abs pd-clip" style={at(8, 8, 184, 96, { borderRadius: 6 })}>
            <Thumbnail d={DASHBOARDS[0]} w={184} h={96} />
          </div>
          <Text x={14} y={112}>{DASHBOARDS[0].name}</Text>
          <Lines x={14} y={132} />
        </Box>
        <Anim tracks={{ opacity: reset(0, 1, 12.8, 13.1, 'out'), scale: [[0, 0.94], [12.8, 0.94], [13.15, 1, 'outBack']] }} className="pd-card" style={at(232, 118, 200, 87, { opacity: 0 })}>
          <Box x={1} y={1} w={198} h={85} className="pd-dashed pd-dashed--primary" style={{ opacity: 0.6, borderRadius: 7 }} />
          <CompactContent d={DASHBOARDS[2]} />
        </Anim>
      </Box>
      <Box x={452} y={48} w={208} h={448} className="pd-fill-sidebar" style={{ borderLeft: 'var(--border-w-100) solid var(--sidebar-border)' }}>
        <Anim tracks={{ opacity: reset(1, 0, 11.9, 12.05, 'in') }} style={at(0, 0, 208, 448)}>
          <Text x={14} y={8} className="pd-t--sm-semibold pd-t--sidebar">Add components</Text>
          <Text x={14} y={28} className="pd-t--muted pd-t--regular">Choose what to add</Text>
          <Box x={14} y={54} w={180} h={26} className="pd-control"><Box x={24} y={10} w={90} h={6} className="pd-bar pd-bar--muted" /></Box>
          {['Dashboard', 'Metrics', 'Reports', 'Workflow', 'Aiden widget', 'Text box'].map((label, i) => (
            <Box key={label} x={14 + (i % 2) * 94} y={92 + Math.floor(i / 2) * 70} w={86} h={62} className="pd-card">
              {i === 0 ? <Anim tracks={{ opacity: reset(0, 1, 11.75, 11.82, 'out') }} className="pd-fill-accent" style={at(0, 0, 86, 62, { opacity: 0 })} /> : null}
              <Box x={10} y={10} w={18} h={18} className={label === 'Dashboard' ? 'pd-fill-primary' : 'pd-bar--muted-fg'} style={{ borderRadius: 5, opacity: label === 'Dashboard' ? 0.35 : PLACEHOLDER_TILES.has(label) ? 0.2 : 0.35 }} />
              {PLACEHOLDER_TILES.has(label) ? <Box x={10} y={39} w={[36, 34, 42, 55][i - 1]} h={6} className="pd-bar pd-bar--muted-fg" style={{ opacity: 0.45 }} /> : <Text x={10} y={34}>{label}</Text>}
            </Box>
          ))}
        </Anim>
        <Anim tracks={{ opacity: reset(0, 1, 12.0, 12.2, 'out') }} style={at(0, 0, 208, 448, { opacity: 0 })}>
          <Text x={14} y={8} className="pd-t--sm-semibold pd-t--sidebar">Add dashboards</Text>
          <Text x={14} y={30} className="pd-t--muted">← Back to components</Text>
          <Box x={14} y={54} w={180} h={26} className="pd-control"><Box x={24} y={10} w={90} h={6} className="pd-bar pd-bar--muted" /></Box>
          {[80, 64, 92, 70, 86, 60].map((w, r) => (
            <Box key={r} x={8} y={92 + r * 44} w={192} h={38}>
              <Box x={6} y={5} w={40} h={28} className="pd-fill-muted" style={{ borderRadius: 4 }} />
              <Box x={54} y={10} w={w} h={7} className="pd-bar pd-bar--muted-fg" style={{ opacity: 0.7 }} />
              <Box x={54} y={23} w={60} h={5} className="pd-bar pd-bar--muted" />
              <Anim tracks={r === 1 ? { opacity: reset(1, 0, 12.8, 12.85) } : undefined} className="pd-abs pd-t pd-t--sm-semibold pd-t--muted" style={at(172, 8)}>+</Anim>
              {r === 1 ? <Anim tracks={{ opacity: reset(0, 1, 12.8, 12.9) }} className="pd-abs pd-t pd-t--sm-semibold pd-t--success" style={at(170, 8, undefined, undefined, { opacity: 0 })}>✓</Anim> : null}
            </Box>
          ))}
        </Anim>
      </Box>
    </Anim>
  );
}

/* ── step 2 end / step 3 · the new space ── */
function SpacePage() {
  const ON = 16.8;
  const OFF = 21.85;
  const decor: Track = [[0, 0], [ON + 0.05, 0], [ON + 0.35, 1, 'out'], [OFF, 1], [OFF + 0.3, 0, 'in']];
  const more = (scale?: Track) => (
    <Anim tracks={scale ? { scale } : undefined} className="pd-control pd-center" style={at(166, 6, 20, 20, { borderRadius: 5, gap: 2 })}>
      {[0, 1, 2].map((i) => <span key={i} className="pd-bar pd-bar--muted-fg" style={{ width: 3, height: 3 }} />)}
    </Anim>
  );
  const grip = (
    <Anim tracks={{ opacity: decor }} className="pd-control" style={at(6, 6, 22, 14, { opacity: 0, borderRadius: 4 })}>
      {[0, 1, 2].map((a) => [0, 1].map((b) => <Box key={`${a}${b}`} x={6 + a * 4} y={3 + b * 4} w={2} h={2} className="pd-bar pd-bar--muted-fg" />))}
    </Anim>
  );
  return (
    <Anim tracks={{ opacity: [[0, 0], [14.0, 0], [14.35, 1, 'out'], [23.3, 1], [23.55, 0, 'in']], y: [[0, 10], [14.0, 10], [14.35, 0, 'out']] }} style={at(0, 0, 660, 496, { opacity: 0 })}>
      <Text x={24} y={14} className="pd-t--lg">Weekly review</Text>
      <Anim tracks={{ opacity: [[0, 0], [ON, 0], [ON + 0.3, 1, 'out'], [OFF, 1], [OFF + 0.3, 0, 'in']] }} className="pd-fill-primary pd-center" style={at(160, 20, 56, 20, { opacity: 0, borderRadius: 10 })}>
        <span className="pd-t pd-t--on-primary">Editing</span>
      </Anim>
      <Box x={24} y={50} w={220} h={8} className="pd-bar pd-bar--muted" />
      <Anim tracks={{ opacity: [[0, 1], [ON, 1], [ON + 0.2, 0], [OFF, 0], [OFF + 0.2, 1]] }} className="pd-control pd-center" style={at(570, 20, 66, 28)}>
        <span className="pd-t">Edit</span>
      </Anim>
      <Anim tracks={{ opacity: [[0, 0], [ON, 0], [ON + 0.2, 1], [OFF, 1], [OFF + 0.2, 0]] }} className="pd-fill-primary pd-center" style={at(570, 20, 66, 28, { opacity: 0, borderRadius: 6 })}>
        <span className="pd-t pd-t--on-primary">Done</span>
      </Anim>
      <Box x={24} y={64} w={612} h={1} className="pd-rule" />
      <Box x={444} y={80} w={192} h={190} className="pd-dashed pd-center"><span className="pd-t pd-t--muted">+  Add dashboards</span></Box>

      <Anim tracks={{ x: reset(0, -210, 18.45, 19.0) }} className="pd-card" style={at(234, 80, 192, 87)}>
        <CompactContent d={DASHBOARDS[2]} />
        <Anim tracks={{ opacity: decor }} className="pd-dashed pd-dashed--primary" style={at(1, 1, 190, 85, { opacity: 0, borderRadius: 7 })} />
        {grip}
        {more()}
      </Anim>

      <Anim tracks={{ x: reset(0, 210, 18.25, 19.0), height: reset(190, 87, 20.55, 21.1), scale: [[0, 1], [18.02, 1], [18.2, 1.03, 'out'], [19.0, 1.03], [19.18, 1, 'out']] }} className="pd-card" style={at(24, 80, 192, 190, { zIndex: 2 })}>
        <Anim tracks={{ opacity: reset(1, 0, 20.55, 20.8, 'in') }} style={at(0, 0, 192, 190)}>
          <Thumbnail d={DASHBOARDS[0]} />
          <Text x={12} y={102}>{DASHBOARDS[0].name}</Text>
          <Lines x={12} y={124} />
        </Anim>
        <Anim tracks={{ opacity: reset(0, 1, 20.75, 21.05, 'out') }} style={at(0, 0, 192, 87, { opacity: 0 })}>
          <CompactContent d={DASHBOARDS[0]} />
        </Anim>
        <Anim tracks={{ opacity: decor, height: reset(188, 85, 20.55, 21.1) }} className="pd-dashed pd-dashed--primary" style={at(1, 1, 190, 188, { opacity: 0, borderRadius: 7 })} />
        {grip}
        {more([[0, 1], [19.75, 1], [19.82, 0.88, 'out'], [19.95, 1, 'out']])}
      </Anim>

      <Anim tracks={{ opacity: [[0, 0], [19.85, 0], [20.0, 1, 'out'], [20.5, 1], [20.65, 0, 'in']], y: [[0, -4], [19.85, -4], [20.0, 0, 'out']] }} className="pd-popover" style={at(278, 108, 150, 100, { opacity: 0, zIndex: 5 })}>
        <Text x={12} y={8} className="pd-t--muted">Card layout</Text>
        <Anim tracks={{ opacity: reset(0, 1, 20.3, 20.36, 'out') }} className="pd-fill-accent" style={at(4, 30, 142, 28, { opacity: 0, borderRadius: 5 })} />
        {(['Compact', 'Thumbnail'] as const).map((label, i) => (
          <Box key={label} x={0} y={30 + i * 32} w={150} h={28}>
            <Box x={14} y={9} w={10} h={10} style={{ borderRadius: 999, border: 'var(--border-w-100) solid var(--muted-foreground)' }} />
            <Anim tracks={{ opacity: label === 'Compact' ? reset(0, 1, 20.45, 20.5, 'out') : reset(1, 0, 20.45, 20.5, 'in') }} className="pd-bar pd-bar--fg" style={at(17, 12, 4, 4, { opacity: label === 'Compact' ? 0 : 1 })} />
            <Text x={32} y={4} className="pd-t--sm">{label}</Text>
          </Box>
        ))}
      </Anim>
    </Anim>
  );
}

/* ── the Add to Space window ── */
function AddToSpaceModal() {
  return (
    <>
      <Anim tracks={{ opacity: [[0, 0], [8.7, 0], [8.9, 0.6, 'out'], [9.65, 0.6], [9.85, 0, 'in']] }} className="pd-fill-background" style={at(0, 0, 660, 496, { opacity: 0, zIndex: 8 })} />
      <Anim tracks={{ opacity: [[0, 0], [8.72, 0], [8.95, 1, 'out'], [9.65, 1], [9.82, 0, 'in']], scale: [[0, 0.96], [8.72, 0.96], [8.95, 1, 'out']] }} className="pd-popover" style={at(176, 70, 308, 336, { opacity: 0, zIndex: 9, borderRadius: 10 })}>
        <Text x={16} y={10} className="pd-t--sm-semibold">Add to Space</Text>
        <Text x={16} y={32} className="pd-t--muted pd-t--regular">Choose the spaces for this dashboard</Text>
        <Text x={286} y={10} className="pd-t--sm-semibold pd-t--muted">×</Text>
        <Box x={16} y={58} w={276} h={28} className="pd-control"><Box x={26} y={11} w={90} h={6} className="pd-bar pd-bar--muted" /></Box>
        <Box x={16} y={96} w={276} h={30} className="pd-dashed pd-center" style={{ borderRadius: 6 }}>
          <Anim tracks={{ opacity: [[0, 0], [9.45, 0], [9.55, 1], [9.85, 1], [9.9, 0]] }} className="pd-fill-accent" style={at(0, 0, 274, 28, { opacity: 0, borderRadius: 5 })} />
          <span className="pd-t" style={{ position: 'relative' }}>+  Add to New Space</span>
        </Box>
        {(
          [
            ['My space', 'var(--info)'],
            ['Phone analytics', 'var(--warning)'],
            ['Call center', 'var(--success)'],
          ] as const
        ).map(([name, color], r) => (
          <Box key={name} x={16} y={136 + r * 46} w={276} h={40}>
            <Box x={8} y={9} w={10} h={10} style={{ borderRadius: 999, background: color }} />
            <Text x={26} y={2} className="pd-t--sm-medium">{name}</Text>
            <Box x={26} y={24} w={90} h={6} className="pd-bar pd-bar--muted" />
            <Box x={252} y={12} w={16} h={16} className="pd-control" style={{ borderRadius: 4 }} />
          </Box>
        ))}
        <Box x={0} y={284} w={308} h={1} className="pd-rule" />
        <Text x={16} y={299} className="pd-t--muted pd-t--regular">0 spaces selected</Text>
        <Box x={128} y={296} w={60} h={26} className="pd-control pd-center"><span className="pd-t">Cancel</span></Box>
        <Box x={196} y={296} w={96} h={26} className="pd-fill-primary pd-center" style={{ borderRadius: 6, opacity: 0.5 }}><span className="pd-t pd-t--on-primary">Save Changes</span></Box>
      </Anim>
    </>
  );
}

function Sidebar() {
  const shift: Track = [[0, 0], [13.95, 0], [14.2, 36, 'out'], [23.45, 36], [23.75, 0, 'inOut']];
  const row = (label: string, y: number, dot?: 'blue' | 'violet', tracks?: { active: Track; muted: Track; row?: Track; y?: Track; hover?: Track }) => (
    <Anim tracks={tracks?.row || tracks?.y ? { opacity: tracks?.row, y: tracks?.y } : undefined} style={at(8, y, 204, 32, { opacity: tracks?.row ? 0 : 1 })}>
      {tracks?.hover ? <Anim tracks={{ opacity: tracks.hover }} className="pd-highlight" style={at(0, 0, 204, 32, { opacity: 0 })} /> : null}
      {dot ? <Box x={14} y={12} w={8} h={8} className="pd-dot" style={{ background: `var(--category-${dot})` }} /> : null}
      <Anim tracks={tracks ? { opacity: tracks.muted } : undefined} className="pd-abs pd-t pd-t--sm pd-t--sidebar-muted" style={at(dot ? 30 : 14, 6, undefined, undefined, { opacity: tracks ? 0 : 1 })}>{label}</Anim>
      {tracks ? <Anim tracks={{ opacity: tracks.active }} className="pd-abs pd-t pd-t--sm-medium pd-t--sidebar" style={at(dot ? 30 : 14, 6)}>{label}</Anim> : null}
    </Anim>
  );
  return (
    <Box x={0} y={44} w={220} h={496} className="pd-sidebar">
      <Text x={16} y={14} className="pd-t--sm-semibold pd-t--sidebar">Dartboards</Text>
      <Anim tracks={{ y: [[0, 220], [14.0, 220], [14.3, 144, 'out'], [23.35, 144], [23.7, 220, 'inOut']] }} className="pd-highlight" style={at(8, 52, 204, 32, { opacity: 0.7 })} />
      {row('Home', 52)}
      {row('Recent', 88)}
      <Text x={16} y={140} className="pd-t--upper">Spaces</Text>
      {row('My space', 160, 'blue')}
      {row('Weekly review', 196, 'violet', {
        row: [[0, 0], [13.95, 0], [14.15, 1, 'out'], [23.35, 1], [23.6, 0, 'in']],
        active: fade([[14.0, 0, 1], [23.1, 1, 0]], 0),
        muted: fade([[14.0, 1, 0], [23.1, 0, 1]], 1),
        hover: [[0, 0], [14.9, 0], [15.0, 0.5, 'out'], [16.0, 0.5], [16.15, 0]],
      })}
      <Anim tracks={{ y: shift }} className="pd-abs pd-t pd-t--sm pd-t--sidebar-muted" style={at(22, 210)}>+  New space</Anim>
      <Anim tracks={{ y: shift }} className="pd-abs pd-t pd-t--upper" style={at(16, 252)}>Libraries</Anim>
      {row('Dashboards', 272, undefined, {
        y: shift,
        active: fade([[14.0, 1, 0], [23.35, 0, 1]], 1),
        muted: fade([[14.0, 0, 1], [23.35, 1, 0]], 0),
      })}
    </Box>
  );
}

export const GetStartedDemo = forwardRef<StageHandle, DemoProps & { onTick?: (t: number) => void }>(({ playing, className, onTick }, ref) => (
  <DemoStage
    ref={ref}
    duration={GET_STARTED_DURATION}
    width={880}
    height={495}
    playing={playing}
    onTick={onTick}
    label="Animation: browsing the Dashboard Library, creating a space in the builder, then rearranging it in edit mode"
    className={className}
  >
    <Window
      width={880}
      height={540}
      addresses={[
        { slug: 'library', visible: true, tracks: { opacity: [[0, 1], [9.75, 1], [9.9, 0, 'in'], [23.4, 0], [23.6, 1, 'out']] } },
        { slug: 'new-space', tracks: { opacity: [[0, 0], [9.85, 0], [10.05, 1, 'out'], [13.9, 1], [14.05, 0, 'in']] } },
        { slug: 'weekly-review', tracks: { opacity: [[0, 0], [14.0, 0], [14.2, 1, 'out'], [23.35, 1], [23.5, 0, 'in']] } },
      ]}
    >
      <Sidebar />
      <Box x={220} y={44} w={660} h={496} className="pd-pane">
        <LibraryPage />
        <SpacePage />
        <BuilderPage />
        <AddToSpaceModal />
      </Box>
      <Beacon
        cx={P.DASH[0]}
        cy={P.DASH[1]}
        ring1={[0.05, 0.85, 1.65, 23.3]}
        ring2={[0.45, 1.25, 23.7]}
        core={{
          opacity: [[0, 1], [2.35, 1], [2.55, 0, 'in'], [23.3, 0], [23.5, 1, 'out']],
          scale: [[0, 1], [0.5, 1.15, 'inOut'], [1.0, 1, 'inOut'], [1.5, 1.15, 'inOut'], [2.0, 1, 'inOut']],
        }}
      />
      <Cursor x={cursor.x} y={cursor.y} scale={clicks([3.25, 4.95, 8.65, 9.6, 10.4, 11.85, 12.75, 13.8, 16.75, 19.8, 20.45, 21.8], [[18.0, 19.05]])} />
    </Window>
  </DemoStage>
));
GetStartedDemo.displayName = 'GetStartedDemo';
