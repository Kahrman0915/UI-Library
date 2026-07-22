import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  Star,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Workflow,
  Bell,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import {
  Button,
  Badge,
  Chip,
  Card,
  CardBody,
  Avatar,
  AvatarGroup,
  StatusDot,
  Switch,
  Separator,
  Banner,
  Kbd,
  Blockquote,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  InputGroup,
  InputGroupInput,
  InputGroupButton,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../index';
import { ThemeHarness } from './ThemeHarness';

const meta: Meta = {
  title: 'Prototypes/Marketing Page',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

// The full-ramp gradient token, clipped to text.
const gradientText: CSSProperties = {
  backgroundImage: 'var(--gradient-full-ramp)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
};

const section: CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto',
  padding: '0 var(--p-6)',
};

const eyebrow: CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: 'var(--tracking-widest)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-semibold)',
  color: 'var(--muted-foreground)',
};

const features = [
  { id: 'f-speed', Icon: Zap, title: 'Instant builds', desc: 'Sub-second incremental builds with a globally distributed cache.' },
  { id: 'f-secure', Icon: Shield, title: 'Enterprise security', desc: 'SOC 2 Type II, SSO/SAML, and audit logs on every plan tier.' },
  { id: 'f-analytics', Icon: BarChart3, title: 'Real-time analytics', desc: 'Track usage, errors, and latency the moment they happen.' },
  { id: 'f-global', Icon: Globe, title: 'Edge network', desc: 'Deploy to 40 regions with automatic failover and routing.' },
  { id: 'f-flow', Icon: Workflow, title: 'Automations', desc: 'Wire builds, deploys, and alerts into no-code workflows.' },
  { id: 'f-alerts', Icon: Bell, title: 'Smart alerts', desc: 'Anomaly detection that pages you only when it truly matters.' },
];

const plans = [
  {
    id: 'p-starter', name: 'Starter', monthly: 0, yearly: 0, blurb: 'For side projects and experiments.',
    features: ['1 project', '100 build minutes', 'Community support', 'Basic analytics'],
    cta: 'Start free', style: 'outline' as const, popular: false,
  },
  {
    id: 'p-pro', name: 'Pro', monthly: 24, yearly: 20, blurb: 'For growing teams that ship daily.',
    features: ['Unlimited projects', '5,000 build minutes', 'Priority support', 'Advanced analytics', 'SSO / SAML'],
    cta: 'Start 14-day trial', style: 'default' as const, popular: true,
  },
  {
    id: 'p-ent', name: 'Enterprise', monthly: null, yearly: null, blurb: 'For organizations at scale.',
    features: ['Everything in Pro', 'Dedicated cache', 'Audit logs & SLA', 'Onboarding manager'],
    cta: 'Contact sales', style: 'outline' as const, popular: false,
  },
];

const testimonials = [
  { id: 't1', quote: "We cut deploy times by 70% in a week. The onboarding was so smooth our whole team switched the same day.", name: 'Priya Nandakumar', role: 'Staff Engineer, Loop', fallback: 'PN', status: 'online' as const },
  { id: 't2', quote: "The analytics alone paid for the plan. We catch regressions before customers ever notice them.", name: 'Marcus Bell', role: 'CTO, Northwind', fallback: 'MB', status: 'away' as const },
  { id: 't3', quote: "Finally a platform that treats DX as a first-class feature. It just gets out of the way.", name: 'Ren Guo', role: 'Founder, Fathom', fallback: 'RG', status: 'busy' as const },
];

const faqs = [
  { value: 'q1', q: 'Can I change plans at any time?', a: 'Yes — upgrade, downgrade, or cancel from your billing settings. Changes are prorated to the day.' },
  { value: 'q2', q: 'Do you offer a free trial?', a: 'Every paid plan includes a 14-day trial with full access to Pro features. No card required to start.' },
  { value: 'q3', q: 'Is there a discount for annual billing?', a: 'Annual billing saves roughly 17% versus monthly, applied automatically when you toggle it on the pricing card.' },
  { value: 'q4', q: 'What does support look like?', a: 'Community support on Starter, priority email on Pro, and a dedicated Slack channel with an SLA on Enterprise.' },
];

function MarketingPage() {
  const [annual, setAnnual] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  return (
    <ThemeHarness>
      {showBanner && (
        <Banner
          id="promo"
          variant="brand"
          Icon={Sparkles}
          title="Introducing Nebula 4.1 — AI summaries are now generally available."
          action={<Button id="promo-cta" label="Read the announcement" size="xsmall" style="outline" IconRight={ArrowRight} />}
          onClose={() => setShowBanner(false)}
          centered
        />
      )}

      {/* Nav */}
      <nav style={{ ...section, display: 'flex', alignItems: 'center', gap: 'var(--p-6)', padding: 'var(--p-4) var(--p-6)' }}>
        <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>
          <span style={gradientText}>Nebula</span>
        </span>
        <div style={{ display: 'flex', gap: 'var(--p-1)' }}>
          {['Features', 'Pricing', 'Docs', 'Changelog'].map((l) => (
            <Button key={l} id={`nav-${l}`} label={l} style="ghost" size="small" />
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <Tooltip id="nav-search" delayDuration={0}>
          <TooltipTrigger>
            <Button id="nav-search-btn" label="Search" style="ghost" size="small" />
          </TooltipTrigger>
          <TooltipContent>
            Press <Kbd size="sm">⌘K</Kbd> anywhere
          </TooltipContent>
        </Tooltip>
        <Button id="nav-signin" label="Sign in" style="ghost" size="small" />
        <Button id="nav-start" label="Get started" size="small" IconRight={ArrowRight} />
      </nav>

      {/* Hero */}
      <header style={{ ...section, textAlign: 'center', padding: 'var(--p-16) var(--p-6) var(--p-12)' }}>
        <div style={{ display: 'inline-flex', marginBottom: 'var(--p-5)' }}>
          <Badge id="hero-badge" variant="info-outline" label="New · Edge functions in every region" IconLeft={Sparkles} />
        </div>
        <h1 style={{ margin: 0, fontSize: 'var(--text-6xl)', lineHeight: 'var(--leading-none)', fontWeight: 'var(--font-bold)', letterSpacing: 'var(--tracking-tight)' }}>
          Ship your product
          <br />
          <span style={gradientText}>at the speed of thought</span>
        </h1>
        <p style={{ maxWidth: 620, margin: 'var(--p-6) auto 0', fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-8)', color: 'var(--muted-foreground)' }}>
          The build, deploy, and observability platform that scales from your first commit to your billionth request — without changing tools.
        </p>
        <div style={{ display: 'flex', gap: 'var(--p-3)', justifyContent: 'center', marginTop: 'var(--p-8)', flexWrap: 'wrap' }}>
          <Button id="hero-start" label="Start building free" size="large" IconRight={ArrowRight} />
          <Button id="hero-demo" label="Watch demo" size="large" style="outline" IconLeft={Play} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--p-3)', justifyContent: 'center', alignItems: 'center', marginTop: 'var(--p-8)' }}>
          <AvatarGroup id="hero-avatars" max={5} size="sm">
            <Avatar id="ha1" fallback="AB" size="sm" />
            <Avatar id="ha2" fallback="CD" size="sm" />
            <Avatar id="ha3" fallback="EF" size="sm" />
            <Avatar id="ha4" fallback="GH" size="sm" />
            <Avatar id="ha5" fallback="IJ" size="sm" />
            <Avatar id="ha6" fallback="KL" size="sm" />
          </AvatarGroup>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-1)' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} width={14} height={14} fill="var(--warning)" stroke="var(--warning)" />
            ))}
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginLeft: 'var(--p-1)' }}>
              Trusted by 12,000+ teams
            </span>
          </div>
        </div>
      </header>

      {/* Logo cloud */}
      <div style={{ ...section, paddingBottom: 'var(--p-12)' }}>
        <p style={{ ...eyebrow, textAlign: 'center', marginBottom: 'var(--p-5)' }}>Powering teams at</p>
        <div style={{ display: 'flex', gap: 'var(--p-8)', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Loop', 'Northwind', 'Fathom', 'Cadence', 'Vertex', 'Orbit'].map((c) => (
            <span key={c} style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)', color: 'var(--muted-foreground)' }}>{c}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ background: 'var(--muted)', padding: 'var(--p-16) 0' }}>
        <div style={section}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--p-10)' }}>
            <p style={eyebrow}>Everything you need</p>
            <h2 style={{ margin: 'var(--p-2) 0 0', fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-bold)' }}>One platform, every stage</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--p-4)' }}>
            {features.map(({ id, Icon, title, desc }) => (
              <Card key={id} id={id} interactive>
                <CardBody>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--rounded-xl)', background: 'var(--background)', border: 'var(--border-w-100) solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--p-4)' }}>
                    <Icon width={20} height={20} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>{title}</h3>
                  <p style={{ margin: 'var(--p-1-5) 0 0', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-5)', color: 'var(--muted-foreground)' }}>{desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature spotlight — Tabs */}
      <section style={{ ...section, padding: 'var(--p-16) var(--p-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-8)' }}>
          <p style={eyebrow}>A closer look</p>
          <h2 style={{ margin: 'var(--p-2) 0 0', fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-bold)' }}>Built for the whole loop</h2>
        </div>
        <Tabs id="spotlight" defaultValue="build">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <TabsList>
              <TabsTrigger value="build">Build</TabsTrigger>
              <TabsTrigger value="deploy">Deploy</TabsTrigger>
              <TabsTrigger value="observe">Observe</TabsTrigger>
            </TabsList>
          </div>
          {[
            { v: 'build', title: 'Builds that keep up with you', body: 'Incremental, cached, and parallelized by default. Your CI feels instant even as the monorepo grows.' },
            { v: 'deploy', title: 'Deploy with confidence', body: 'Atomic releases, instant rollbacks, and preview URLs on every pull request — no config required.' },
            { v: 'observe', title: 'See everything in one place', body: 'Logs, metrics, and traces unified into a single timeline so you can go from alert to root cause in seconds.' },
          ].map((t) => (
            <TabsContent key={t.v} value={t.v}>
              <Card id={`sp-${t.v}`} style={{ marginTop: 'var(--p-5)' }}>
                <CardBody>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--p-6)', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-semibold)' }}>{t.title}</h3>
                      <p style={{ margin: 'var(--p-3) 0 var(--p-5)', color: 'var(--muted-foreground)', lineHeight: 'var(--leading-6)' }}>{t.body}</p>
                      <Button id={`sp-cta-${t.v}`} label="Learn more" style="outline" IconRight={ChevronRight} />
                    </div>
                    <div style={{ aspectRatio: '16 / 10', borderRadius: 'var(--rounded-lg)', backgroundImage: 'var(--gradient-full-ramp)', opacity: 0.9 }} />
                  </div>
                </CardBody>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Metrics band */}
      <section style={{ background: 'var(--foreground)', color: 'var(--background)', padding: 'var(--p-12) 0' }}>
        <div style={{ ...section, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--p-6)', textAlign: 'center' }}>
          {[
            { n: '99.99%', l: 'Uptime SLA' },
            { n: '40ms', l: 'p50 latency' },
            { n: '12k+', l: 'Teams shipping' },
            { n: '2.1B', l: 'Requests / day' },
          ].map((m) => (
            <div key={m.l}>
              <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-bold)' }}>{m.n}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--background)', opacity: 0.85, marginTop: 'var(--p-1)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ ...section, padding: 'var(--p-16) var(--p-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-6)' }}>
          <p style={eyebrow}>Pricing</p>
          <h2 style={{ margin: 'var(--p-2) 0 0', fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-bold)' }}>Simple, scalable pricing</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--p-3)', marginBottom: 'var(--p-8)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: annual ? 'var(--muted-foreground)' : 'var(--foreground)' }}>Monthly</span>
          <Switch id="billing" checked={annual} onCheckedChange={setAnnual} aria-label="Annual billing" />
          <span style={{ fontSize: 'var(--text-sm)', color: annual ? 'var(--foreground)' : 'var(--muted-foreground)' }}>Annual</span>
          <Chip id="save-chip" label="Save 17%" active />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--p-4)', alignItems: 'start' }}>
          {plans.map((p) => {
            const price = p.monthly === null ? null : annual ? p.yearly : p.monthly;
            return (
              <div key={p.id} data-theme={p.popular ? undefined : undefined} style={{ position: 'relative' }}>
                <Card id={p.id} interactive style={p.popular ? { borderColor: 'var(--primary)', borderWidth: 'var(--border-w-300)', boxShadow: 'var(--shadow-lg)' } : undefined}>
                  <CardBody>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>{p.name}</h3>
                      {p.popular && <Badge id={`${p.id}-pop`} variant="default" label="Most popular" />}
                    </div>
                    <p style={{ margin: 'var(--p-2) 0 var(--p-4)', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{p.blurb}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--p-1)' }}>
                      {price === null ? (
                        <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)' }}>Custom</span>
                      ) : (
                        <>
                          <span style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-bold)' }}>${price}</span>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>/mo</span>
                        </>
                      )}
                    </div>
                    <div style={{ margin: 'var(--p-5) 0' }}>
                      <Button id={`${p.id}-cta`} label={p.cta} style={p.style} className="ui-block-cta" />
                    </div>
                    <Separator />
                    <ul style={{ listStyle: 'none', margin: 'var(--p-4) 0 0', padding: 0, display: 'grid', gap: 'var(--p-2-5)' }}>
                      {p.features.map((f) => (
                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)', fontSize: 'var(--text-sm)' }}>
                          <Check width={16} height={16} color="var(--success)" /> {f}
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: 'var(--muted)', padding: 'var(--p-16) 0' }}>
        <div style={section}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--p-10)' }}>
            <p style={eyebrow}>Loved by developers</p>
            <h2 style={{ margin: 'var(--p-2) 0 0', fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-bold)' }}>Don't take our word for it</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--p-4)' }}>
            {testimonials.map((t) => (
              <Card key={t.id} id={t.id}>
                <CardBody>
                  <Blockquote>{t.quote}</Blockquote>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)', marginTop: 'var(--p-5)' }}>
                    <Avatar id={`${t.id}-a`} fallback={t.fallback} />
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', display: 'flex', alignItems: 'center', gap: 'var(--p-1-5)' }}>
                        {t.name} <StatusDot status={t.status} />
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{t.role}</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ ...section, maxWidth: 760, padding: 'var(--p-16) var(--p-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--p-8)' }}>
          <p style={eyebrow}>FAQ</p>
          <h2 style={{ margin: 'var(--p-2) 0 0', fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-bold)' }}>Questions, answered</h2>
        </div>
        <Accordion id="faq" type="single" collapsible defaultValue="q1">
          {faqs.map((f) => (
            <AccordionItem key={f.value} value={f.value}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Final CTA */}
      <section style={{ ...section, padding: '0 var(--p-6) var(--p-16)' }}>
        <div style={{ borderRadius: 'var(--rounded-2xl)', padding: 'var(--p-12)', textAlign: 'center', backgroundImage: 'var(--gradient-violet-cyan-emerald-diagonal)', color: '#ffffff' }}>
          <Rocket width={32} height={32} style={{ margin: '0 auto var(--p-3)' }} />
          <h2 style={{ margin: 0, fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-bold)' }}>Start shipping today</h2>
          <p style={{ margin: 'var(--p-3) auto var(--p-6)', maxWidth: 460, opacity: 0.9 }}>Deploy your first project in under two minutes. No credit card required.</p>
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <InputGroup>
              <InputGroupInput placeholder="you@company.com" aria-label="Work email" />
              <InputGroupButton>Get started</InputGroupButton>
            </InputGroup>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: 'var(--border-w-100) solid var(--border)', padding: 'var(--p-12) 0' }}>
        <div style={{ ...section, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 'var(--p-8)' }}>
          <div>
            <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>
              <span style={gradientText}>Nebula</span>
            </span>
            <p style={{ margin: 'var(--p-2) 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', maxWidth: 280 }}>
              The platform for teams who ship. Built for developers, trusted by enterprises.
            </p>
            <div style={{ marginTop: 'var(--p-3)' }}>
              <Badge id="status" variant="success-outline" label="All systems operational" IconLeft={() => <StatusDot status="online" />} />
            </div>
          </div>
          {[
            { h: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { h: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { h: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
          ].map((col) => (
            <div key={col.h}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--p-3)' }}>{col.h}</div>
              <div style={{ display: 'grid', gap: 'var(--p-2)' }}>
                {col.links.map((l) => (
                  <a key={l} href="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...section, marginTop: 'var(--p-8)' }}>
          <Separator />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--p-5)', flexWrap: 'wrap', gap: 'var(--p-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>© 2026 Nebula, Inc. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 'var(--p-2)' }}>
              <Chip id="c-twitter" label="Twitter" size="small" />
              <Chip id="c-github" label="GitHub" size="small" />
              <Chip id="c-discord" label="Discord" size="small" />
            </div>
          </div>
        </div>
      </footer>
    </ThemeHarness>
  );
}

export const Landing: Story = {
  render: () => <MarketingPage />,
};
