/**
 * The charts subsystem.
 *
 * A sibling of `components/`, not a member of it — the family has its own frame,
 * its own maths in `src/utils/{scale,ticks,path,stack,series}.ts`, and its own
 * accessibility gate. `Chart/` is the engine every mark mounts on; each mark
 * owns its folder and its stories.
 */
export * from './Chart';
export { BarChart, ChartBars } from './Bar';
export { LineChart, ChartLine } from './Line';
export { AreaChart, ChartArea } from './Area';
