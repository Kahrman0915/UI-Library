import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, ReactNode } from 'react';

/* ── Product demos · timeline ─────────────────────────────────────────────────
   A keyframe timeline small enough to read in one sitting. The demos were
   authored in Figma Motion; every track below is those keyframes, ported as
   `[seconds, value, easing]` triples, so a timing tweak is the same edit in
   both places.

   One requestAnimationFrame loop per stage samples every registered track and
   writes inline styles straight onto the element. React renders the scenery
   once and never re-renders per frame — a 24-second demo at 60fps would
   otherwise be ~1,400 renders of a few hundred nodes. */

export type Ease = 'linear' | 'in' | 'out' | 'inOut' | 'outBack' | 'hold';
/** `[time in seconds, value, easing from the previous key to this one]` */
export type Key = readonly [number, number, Ease?];
export type Track = readonly Key[];

const EASE: Record<Ease, (x: number) => number> = {
  linear: (x) => x,
  in: (x) => x * x * x,
  out: (x) => 1 - (1 - x) ** 3,
  inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2),
  outBack: (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
  },
  // Matches Figma's HOLD: stay on the previous value, then jump at the key.
  hold: (x) => (x >= 1 ? 1 : 0),
};

/** The value of a track at time `t`. Before the first key and after the last, the end values hold. */
export function sample(track: Track, t: number): number {
  if (track.length === 0) return 0;
  if (t <= track[0][0]) return track[0][1];
  for (let i = 1; i < track.length; i++) {
    const [t1, v1, e] = track[i];
    if (t < t1) {
      const [t0, v0] = track[i - 1];
      const p = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * EASE[e ?? 'linear'](p);
    }
  }
  return track[track.length - 1][1];
}

/** A cursor or pointer path: named points visited at given times, eased in and out. */
export function path(
  points: Record<string, readonly [number, number]>,
  stops: ReadonlyArray<readonly [number, string]>,
): { x: Track; y: Track } {
  const x: Key[] = [];
  const y: Key[] = [];
  stops.forEach(([t, name], i) => {
    const p = points[name];
    x.push([t, p[0], i ? 'inOut' : undefined]);
    y.push([t, p[1], i ? 'inOut' : undefined]);
  });
  return { x, y };
}

/** Cursor press feedback: quick dips for clicks, held dips for drags. */
export function clicks(times: readonly number[], holds: ReadonlyArray<readonly [number, number]> = []): Track {
  const k: Array<readonly [number, number, Ease?]> = [[0, 1]];
  for (const c of times) k.push([c - 0.02, 1], [c + 0.07, 0.82, 'out'], [c + 0.22, 1, 'out']);
  for (const [a, b] of holds) k.push([a - 0.02, 1], [a + 0.08, 0.85, 'out'], [b, 0.85], [b + 0.15, 1, 'out']);
  return k.sort((p, q) => p[0] - q[0]);
}

export type Tracks = Partial<Record<'opacity' | 'x' | 'y' | 'scale' | 'width' | 'height', Track>>;

type Registration = { el: HTMLElement; tracks: Tracks };

type TimelineApi = {
  register: (r: Registration) => () => void;
  time: () => number;
};

const TimelineContext = createContext<TimelineApi | null>(null);

function apply({ el, tracks }: Registration, t: number) {
  if (tracks.opacity) el.style.opacity = String(sample(tracks.opacity, t));
  if (tracks.width) el.style.width = `${sample(tracks.width, t)}px`;
  if (tracks.height) el.style.height = `${sample(tracks.height, t)}px`;
  if (tracks.x || tracks.y || tracks.scale) {
    const x = tracks.x ? sample(tracks.x, t) : 0;
    const y = tracks.y ? sample(tracks.y, t) : 0;
    const s = tracks.scale ? sample(tracks.scale, t) : 1;
    el.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  }
}

export type StageHandle = {
  /** Jump to a time in seconds. */
  seek: (t: number) => void;
  time: () => number;
};

export type DemoStageProps = {
  /** Loop length in seconds. */
  duration: number;
  /** Design-space size the scenery is drawn at. It scales to the container's width. */
  width: number;
  height: number;
  playing?: boolean;
  /** Where the loop rests when motion is reduced or the demo is paused before it starts. */
  stillTime?: number;
  /** Called on every frame with the current time. Keep it cheap. */
  onTick?: (t: number) => void;
  label: string;
  className?: string;
  children: ReactNode;
};

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(q.matches);
    on();
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return reduced;
}

/**
 * Plays a demo. Owns the loop, the scale-to-fit and reduced motion.
 * Under `prefers-reduced-motion` the loop never starts and the scenery rests at `stillTime`.
 */
export const DemoStage = forwardRef<StageHandle, DemoStageProps>(
  ({ duration, width, height, playing = true, stillTime = 0, onTick, label, className, children }, ref) => {
    const wrap = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const regs = useRef(new Set<Registration>());
    const tRef = useRef(stillTime);
    const reduced = usePrefersReducedMotion();
    const tickRef = useRef(onTick);
    tickRef.current = onTick;

    const renderAt = useCallback((t: number) => {
      tRef.current = t;
      regs.current.forEach((r) => apply(r, t));
      tickRef.current?.(t);
    }, []);

    const api = useMemo<TimelineApi>(
      () => ({
        register: (r) => {
          regs.current.add(r);
          apply(r, tRef.current);
          return () => regs.current.delete(r);
        },
        time: () => tRef.current,
      }),
      [],
    );

    useImperativeHandle(ref, () => ({ seek: (t) => renderAt(((t % duration) + duration) % duration), time: () => tRef.current }), [duration, renderAt]);

    useLayoutEffect(() => {
      const el = wrap.current;
      if (!el) return;
      const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width));
      ro.observe(el);
      return () => ro.disconnect();
    }, [width]);

    useEffect(() => {
      if (reduced) {
        renderAt(stillTime);
        return;
      }
      if (!playing) return;
      let raf = 0;
      let last = performance.now();
      const loop = (now: number) => {
        const dt = (now - last) / 1000;
        last = now;
        renderAt((tRef.current + dt) % duration);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
    }, [playing, reduced, duration, stillTime, renderAt]);

    return (
      <TimelineContext.Provider value={api}>
        <div
          ref={wrap}
          className={`pd-stage${className ? ' ' + className : ''}`}
          style={{ aspectRatio: `${width} / ${height}` }}
          role="img"
          aria-label={label}
        >
          <div className="pd-stage__scene" style={{ width, height, transform: `scale(${scale})` }} aria-hidden="true">
            {children}
          </div>
        </div>
      </TimelineContext.Provider>
    );
  },
);
DemoStage.displayName = 'DemoStage';

type AnimProps = {
  tracks?: Tracks;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/** A positioned element whose style follows the stage's timeline. */
export function Anim({ tracks, className, style, children }: AnimProps) {
  const ref = useRef<HTMLDivElement>(null);
  const api = useContext(TimelineContext);
  useLayoutEffect(() => {
    if (!api || !ref.current || !tracks) return;
    return api.register({ el: ref.current, tracks });
    // Tracks are static per mount; re-registering on identity would thrash.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);
  return (
    <div ref={ref} className={`pd-abs${className ? ' ' + className : ''}`} style={style}>
      {children}
    </div>
  );
}
