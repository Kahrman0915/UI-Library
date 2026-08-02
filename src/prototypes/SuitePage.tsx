import type { CSSProperties, ReactNode } from 'react';
import {
  ArrowRight, Bell, ChartColumn, Check, FileText, Globe, Heart, Lock, Plug,
  Quote, Search, Shield, Sparkles, Users, Workflow, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Avatar, Badge, Button, Chip, Separator } from '../index';
import { BRAND_ANCHORS, SUB_BRANDS } from './deeperThemingRecipe';
import type { BrandKey } from './deeperThemingRecipe';

type Mode = 'light' | 'dark';

/**
 * The SUITE page — the parent, not a sub-app.
 *
 * Every other view in this POC answers "what does one brand look like". This one
 * answers the question that motivated the whole exercise: do six of them, on one
 * page, at the same time, read as a family?
 *
 * That makes it the only place the full ramp belongs. A sub-app page uses one
 * brand because one brand is in charge; the suite page uses all of them because
 * the parent's identity IS the set. Two things carry that here — the ramp across
 * the headline and the six-corner bubble field behind the hero — and both are
 * scoped to `.poc-suite-*` so they cannot leak into a branded page.
 *
 * Each app card is a real `data-brand` scope, so its mark, its accent, its
 * border and its tinted surface all come from that brand's anchors. Nothing on
 * this page hardcodes a brand colour.
 */

const ICONS: Record<BrandKey, LucideIcon> = {
  db: ChartColumn, nb: FileText, dc: Globe, ec: Zap, ph: Heart, rm: Sparkles, aiden: Sparkles,
};

type App = { brand: BrandKey; name: string; tag: string; body: string; features: string[] };

const APPS: App[] = [
  { brand: 'db', name: 'DARTBoards', tag: 'Your AI-powered analytics command centre',
    body: 'The control hub for all your data analytics and reporting needs. Build dashboards, create reports and unlock insights with AI.',
    features: ['AI dashboards', 'Smart reports', 'Real-time analytics', 'Custom visualisations'] },
  { brand: 'nb', name: 'NoteGen', tag: 'AI-generated documentation',
    body: 'Automatically generate comprehensive documentation, meeting notes and knowledge bases from your data and conversations.',
    features: ['Auto docs', 'Meeting notes', 'Knowledge base', 'Smart templates'] },
  { brand: 'dc', name: 'Discovery Center', tag: 'Explore & discover insights',
    body: 'Discover patterns, explore data relationships and uncover hidden insights across all your data sources.',
    features: ['Data exploration', 'Pattern discovery', 'Cross-source analysis', 'Visual discovery'] },
  { brand: 'ec', name: 'Eclipse', tag: 'AI-powered predictive analytics',
    body: 'Machine learning and predictive modelling. Forecast trends, detect anomalies and predict outcomes with AI.',
    features: ['ML models', 'Forecasting', 'Anomaly detection', 'Auto ML'] },
  { brand: 'ph', name: 'Phoenix', tag: 'Real-time data pipelines',
    body: 'Advanced data transformation and pipeline orchestration. Turn raw data into actionable insights automatically.',
    features: ['Data pipelines', 'ETL automation', 'Schema evolution', 'Quality checks'] },
  { brand: 'rm', name: 'IRM', tag: 'Team collaboration & governance',
    body: 'Internal team workspace for collaboration, governance and compliance. Manage permissions, audit trails and team workflows.',
    features: ['Team spaces', 'Access control', 'Audit logs', 'Compliance'] },
];

const STATS = [
  { n: '500K+', l: 'Active users' },
  { n: '2M+', l: 'Dashboards created' },
  { n: '50B+', l: 'Data points analysed' },
  { n: '99.9%', l: 'Uptime SLA' },
];

const QUOTES = [
  { q: 'DART has completely transformed how we approach data analytics. The AI-powered insights save us hours every week.',
    n: 'Sarah Chen', r: 'Director of Analytics, TechCorp Global' },
  { q: 'The unified platform approach means our team no longer has to juggle multiple tools. It is a game-changer.',
    n: 'Michael Rodriguez', r: 'VP of Data Engineering, DataFlow Inc' },
  { q: 'NoteGen’s natural-language querying makes data accessible to everyone, not just data scientists.',
    n: 'Emily Thompson', r: 'Chief Analytics Officer, Insight Dynamics' },
];

const PILLARS = [
  { Icon: Lock, t: 'Enterprise security', b: 'SOC 2 compliant with end-to-end encryption.' },
  { Icon: Users, t: 'Team collaboration', b: 'Real-time collaboration across teams and departments.' },
  { Icon: Plug, t: 'Unlimited data sources', b: 'Connect to 200+ data sources and databases.' },
  { Icon: Globe, t: 'Global scale', b: 'Deploy anywhere with multi-region support.' },
  { Icon: Shield, t: 'Developer friendly', b: 'REST APIs, SDKs and extensive documentation.' },
  { Icon: Workflow, t: 'Workflow automation', b: 'Automate reports, alerts and data pipelines.' },
];

const NAV = ['DARTBoards', 'Discovery Center', 'Applications', 'Dev Resources', 'About Us'];

// ── shared type ramp ─────────────────────────────────────────────────────────
const EYEBROW: CSSProperties = {
  fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase',
  color: 'var(--muted-foreground)', fontWeight: 'var(--font-medium)',
};
const H2: CSSProperties = {
  margin: 0, fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-10)',
  fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-tight)',
};
const LEDE: CSSProperties = {
  margin: 0, fontSize: 'var(--text-base)', lineHeight: 'var(--leading-7)',
  color: 'var(--muted-foreground)', maxWidth: 'var(--max-w-2xl)',
};
const SECTION: CSSProperties = { padding: 'var(--p-20) var(--p-8)' };
const WRAP: CSSProperties = { maxWidth: 'var(--max-w-6xl)', margin: '0 auto' };

/**
 * A brand scope INSIDE the suite page.
 *
 * The recipe selects on `[data-theme-poc][data-brand='x'][data-mode='y']` — a
 * COMPOUND selector, all three on one element. A nested `<div data-brand="db">`
 * therefore matches nothing and silently renders stock slate, which is exactly
 * how this page looked on the first run: correct layout, no brand anywhere.
 * Stamp all three or stamp none.
 */
function BrandScope({ brand, mode, children, style }: { brand: BrandKey; mode: Mode; children: ReactNode; style?: CSSProperties }) {
  return (
    <div data-theme-poc="" data-brand={brand} data-mode={mode} style={style}>
      {children}
    </div>
  );
}

/** Live on the suite page: these marks are the six front doors, so a hover
 *  response is an affordance rather than decoration. `--poc-mark-px` feeds the
 *  two layers that cannot be a percentage (the sparkle blur, the shadows). */
function Mark({ brand, size = 44 }: { brand: BrandKey; size?: number }) {
  const Icon = ICONS[brand];
  return (
    <span
      className="poc-mark poc-mark--live"
      style={{ width: size, height: size, '--poc-mark-px': `${size}px` } as CSSProperties}
    >
      <span className="poc-mark__bloom" aria-hidden="true" />
      <span className="poc-mark__glint" data-i="1" aria-hidden="true" />
      <span className="poc-mark__glint" data-i="2" aria-hidden="true" />
      <span className="poc-mark__glint" data-i="3" aria-hidden="true" />
      <span className="poc-mark__sweep" aria-hidden="true" />
      <Icon size={Math.round(size * 0.46)} strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

/** A centred section head: eyebrow pill, title, lede. */
function Head({ pill, title, lede }: { pill: string; title: string; lede?: string }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--p-4)', justifyItems: 'center', textAlign: 'center', marginBottom: 'var(--p-12)' }}>
      <Badge id={`head-${pill}`} variant="outline" label={pill} />
      <h2 style={H2}>{title}</h2>
      {lede && <p style={{ ...LEDE, textAlign: 'center' }}>{lede}</p>}
    </div>
  );
}

function Surface({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className="ui-card"
      style={{
        background: 'var(--card)', border: 'var(--border-w-100) solid var(--border)',
        borderRadius: 'var(--rounded-xl)', padding: 'var(--p-6)', ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function SuitePage({ mode }: { mode: Mode }) {
  return (
    <div style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* ── nav. Dark in BOTH modes: it is the parent's chrome, and pinning it
             stops the suite bar changing identity when a mode flips. */}
      <header
        style={{
          background: '#0b1220', color: '#e2e8f0',
          display: 'flex', alignItems: 'center', gap: 'var(--p-6)',
          padding: 'var(--p-3) var(--p-8)',
        }}
      >
        <strong style={{ fontSize: 'var(--text-base)', letterSpacing: 'var(--tracking-tight)' }}>
          <span className="poc-suite-text">dart</span> central
        </strong>
        <nav style={{ display: 'flex', gap: 'var(--p-5)', flex: 1, fontSize: 'var(--text-sm)', color: '#94a3b8' }}>
          {NAV.map((n) => <span key={n}>{n}</span>)}
        </nav>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)', fontSize: 'var(--text-sm)' }}>
          <Sparkles size={15} aria-hidden="true" /> Ask Aiden
        </span>
        <Search size={16} aria-hidden="true" />
        <Bell size={16} aria-hidden="true" />
        <Avatar id="suite-me" fallback="KM" size="sm" />
      </header>

      {/* ── hero. The bubble field and the ramp are the only two full-set
             elements on the page; everything below is per-brand. */}
      <section
        className="poc-suite-bubbles"
        style={{ ...SECTION, paddingTop: 'var(--p-24)', paddingBottom: 'var(--p-20)' }}
      >
        <div style={{ ...WRAP, display: 'grid', gap: 'var(--p-6)', justifyItems: 'center', textAlign: 'center' }}>
          <span style={EYEBROW}>Analytics platform powered by AI</span>
          <h1
            style={{
              margin: 0, fontSize: 'var(--text-6xl)', lineHeight: 'var(--leading-none)',
              fontWeight: 'var(--font-semibold)', letterSpacing: 'var(--tracking-tighter)',
              maxWidth: 'var(--max-w-4xl)',
            }}
          >
            One platform.
            <br />
            <span className="poc-suite-text">Infinite possibilities.</span>
          </h1>
          <p style={{ ...LEDE, textAlign: 'center', fontSize: 'var(--text-lg)', maxWidth: 'var(--max-w-2xl)' }}>
            Six powerful applications unified into one seamless platform — from dashboards to data
            pipelines to agentic solutions, all powered by Aiden, your DART AI intelligence agent.
          </p>

          {/* the Aiden entry point: an aiden scope, so it is violet on any page */}
          <BrandScope brand="aiden" mode={mode} style={{ width: '100%', maxWidth: 'var(--max-w-2xl)', marginTop: 'var(--p-4)' }}>
            <Surface style={{ padding: 'var(--p-5)', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'grid', gap: 'var(--p-4)' }}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--p-3)',
                    padding: 'var(--p-3) var(--p-4)', borderRadius: 'var(--rounded-lg)',
                    border: 'var(--border-w-100) solid var(--input)', background: 'var(--background)',
                    color: 'var(--muted-foreground)', fontSize: 'var(--text-sm)', textAlign: 'left',
                  }}
                >
                  <Mark brand="aiden" size={26} />
                  <span style={{ flex: 1 }}>Ask Aiden how to get started…</span>
                  <Button id="suite-ask" label="Ask" size="sm" IconRight={ArrowRight} />
                </div>
                <div style={{ display: 'flex', gap: 'var(--p-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip id="suite-c1" label="How to get started" />
                  <Chip id="suite-c2" label="Getting access" />
                  <Chip id="suite-c3" label="See Aiden in action" />
                </div>
              </div>
            </Surface>
          </BrandScope>
        </div>
      </section>

      {/* ── what's new */}
      <section style={{ ...SECTION, paddingTop: 0, paddingBottom: 'var(--p-16)' }}>
        <div style={WRAP}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--p-3)', marginBottom: 'var(--p-4)' }}>
            <strong style={{ fontSize: 'var(--text-sm)' }}>What&rsquo;s new</strong>
            <span style={{ flex: 1 }} />
            <a href="#0" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-text)' }}>View all updates →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 'var(--p-4)' }}>
            {[
              { brand: 'db' as BrandKey, tag: 'Launch', t: 'Introducing Dartboards', d: 'July 7, 2026' },
              { brand: 'dc' as BrandKey, tag: 'New feature', t: 'Spaces: your personal dashboard collections', d: 'July 1, 2026' },
            ].map((u) => (
              <BrandScope key={u.t} brand={u.brand} mode={mode}>
                <Surface style={{ padding: 'var(--p-4)', display: 'flex', alignItems: 'center', gap: 'var(--p-4)' }}>
                  <div style={{ display: 'grid', gap: 'var(--p-2)', flex: 1 }}>
                    <div style={{ display: 'flex', gap: 'var(--p-2)', alignItems: 'center' }}>
                      <Badge id={`u-${u.brand}-a`} variant="outline" label="Dartboards" />
                      <Badge id={`u-${u.brand}-b`} variant="default" label={u.tag} />
                    </div>
                    <strong style={{ fontSize: 'var(--text-sm)' }}>{u.t}</strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{u.d}</span>
                  </div>
                  <ArrowRight size={16} aria-hidden="true" style={{ color: 'var(--muted-foreground)' }} />
                </Surface>
              </BrandScope>
            ))}
          </div>
        </div>
      </section>

      {/* ── the six apps. Each card is its own brand scope — this is the section
             the whole POC exists to test. */}
      <section style={{ ...SECTION, background: 'var(--secondary)' }}>
        <div style={WRAP}>
          <Head
            pill="Unified platform"
            title="Six powerful applications"
            lede="Access specialised tools for every aspect of your data journey, all from one seamless platform."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 'var(--p-5)' }}>
            {APPS.map((a) => (
              <BrandScope key={a.brand} brand={a.brand} mode={mode}>
                <Surface style={{ display: 'grid', gap: 'var(--p-4)', height: '100%' }}>
                  <Mark brand={a.brand} />
                  <div style={{ display: 'grid', gap: 'var(--p-1)' }}>
                    <strong style={{ fontSize: 'var(--text-lg)', letterSpacing: 'var(--tracking-tight)' }}>{a.name}</strong>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-text)', fontWeight: 'var(--font-medium)' }}>
                      {a.tag}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-6)', color: 'var(--muted-foreground)' }}>
                    {a.body}
                  </p>
                  <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-2)', margin: 0, padding: 0, listStyle: 'none' }}>
                    {a.features.map((f) => (
                      <li key={f} style={{ display: 'flex', gap: 'var(--p-2)', alignItems: 'center', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                        <Check size={13} aria-hidden="true" style={{ color: 'var(--primary-text)', flex: 'none' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span style={{ marginTop: 'auto', paddingTop: 'var(--p-2)' }}>
                    <Button id={`open-${a.brand}`} label={`Open ${a.name}`} style="outline" size="sm" IconRight={ArrowRight} />
                  </span>
                </Surface>
              </BrandScope>
            ))}
          </div>
        </div>
      </section>

      {/* ── stats. Numerals take the ramp: the figure belongs to the suite, not
             to any one app. */}
      <section style={{ ...SECTION, paddingTop: 'var(--p-16)', paddingBottom: 'var(--p-16)' }}>
        <div style={{ ...WRAP, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 'var(--p-8)' }}>
          {STATS.map((s) => (
            <div key={s.l} style={{ display: 'grid', gap: 'var(--p-1)', justifyItems: 'center', textAlign: 'center' }}>
              <span
                className="poc-suite-text"
                style={{
                  fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-semibold)',
                  letterSpacing: 'var(--tracking-tight)', fontVariantNumeric: 'tabular-nums',
                }}
              >
                {s.n}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── testimonials */}
      <section style={{ ...SECTION, background: 'var(--secondary)' }}>
        <div style={WRAP}>
          <Head pill="Customer success" title="Loved by data teams" lede="What industry leaders say about DART Central." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 'var(--p-5)' }}>
            {QUOTES.map((q, i) => (
              <BrandScope key={q.n} brand={SUB_BRANDS[i % SUB_BRANDS.length]} mode={mode}>
                <Surface style={{ display: 'grid', gap: 'var(--p-4)', height: '100%' }}>
                  <Quote size={22} aria-hidden="true" style={{ color: 'var(--primary-text)' }} />
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-6)' }}>{q.q}</p>
                  <div style={{ marginTop: 'auto' }}>
                    <Separator id={`sep-${i}`} />
                    <div style={{ marginTop: 'var(--p-3)' }}>
                      <strong style={{ fontSize: 'var(--text-sm)', display: 'block' }}>{q.n}</strong>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{q.r}</span>
                    </div>
                  </div>
                </Surface>
              </BrandScope>
            ))}
          </div>
        </div>
      </section>

      {/* ── pillars */}
      <section style={SECTION}>
        <div style={WRAP}>
          <Head
            pill="Enterprise ready"
            title="Built for scale"
            lede="Enterprise-grade security, reliability and performance, trusted by teams worldwide."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 'var(--p-4)' }}>
            {PILLARS.map((p) => (
              <Surface key={p.t} style={{ display: 'flex', gap: 'var(--p-4)', alignItems: 'flex-start' }}>
                <span
                  style={{
                    display: 'grid', placeItems: 'center', flex: 'none',
                    width: 'var(--w-9)', height: 'var(--h-9)', borderRadius: 'var(--rounded-lg)',
                    background: 'var(--accent)', color: 'var(--foreground)',
                  }}
                >
                  <p.Icon size={17} aria-hidden="true" />
                </span>
                <div style={{ display: 'grid', gap: 'var(--p-1)' }}>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>{p.t}</strong>
                  <span style={{ fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-5)', color: 'var(--muted-foreground)' }}>{p.b}</span>
                </div>
              </Surface>
            ))}
          </div>
        </div>
      </section>

      {/* ── closing band: the one place the ramp is a FILL rather than text */}
      <section style={{ ...SECTION, paddingTop: 'var(--p-16)', paddingBottom: 'var(--p-16)' }}>
        <div style={WRAP}>
          <div
            className="poc-suite-ramp"
            style={{
              borderRadius: 'var(--rounded-2xl)', padding: 'var(--p-12) var(--p-8)',
              display: 'grid', gap: 'var(--p-4)', justifyItems: 'center', textAlign: 'center',
              color: '#ffffff',
            }}
          >
            <h2 style={{ ...H2, color: 'inherit' }}>One login. Six applications.</h2>
            <p style={{ ...LEDE, color: 'inherit', textAlign: 'center', opacity: 0.92 }}>
              Start with the app you need today. The rest are already waiting.
            </p>
            <span style={{ marginTop: 'var(--p-2)' }}>
              <Button id="suite-cta" label="Get started" IconRight={ArrowRight} />
            </span>
          </div>
        </div>
      </section>

      {/* ── footer */}
      <footer style={{ background: 'var(--secondary)', padding: 'var(--p-12) var(--p-8) var(--p-8)' }}>
        <div style={WRAP}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) repeat(auto-fit, minmax(160px, auto))', gap: 'var(--p-8)' }}>
            <div style={{ display: 'grid', gap: 'var(--p-3)', alignContent: 'start' }}>
              <strong style={{ fontSize: 'var(--text-base)' }}>
                <span className="poc-suite-text">dart</span> central
              </strong>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', maxWidth: 220 }}>
                Six applications, one platform, one intelligence layer.
              </span>
            </div>
            {[
              { h: 'Applications', l: APPS.map((a) => a.name) },
              { h: 'Resources', l: ['Documentation', 'API reference', 'Community', 'Blog'] },
              { h: 'Company', l: ['About us', 'Careers', 'Privacy', 'Terms'] },
            ].map((col) => (
              <div key={col.h} style={{ display: 'grid', gap: 'var(--p-2)', alignContent: 'start' }}>
                <strong style={{ fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-wide)' }}>{col.h}</strong>
                {col.l.map((l) => (
                  <a key={l} href="#0" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'var(--p-10)' }}>
            <Separator id="suite-footer-sep" />
            <p style={{ margin: 'var(--p-4) 0 0', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              © 2026 DART. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { BRAND_ANCHORS };
