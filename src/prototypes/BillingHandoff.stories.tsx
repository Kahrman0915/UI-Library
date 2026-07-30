import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Download,
  Eye,
  MoreHorizontal,
  Send,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  Badge,
  Banner,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CodeBlock,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FeaturedIcon,
  Kbd,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toaster,
  toast,
} from '../index';

// ─────────────────────────────────────────────────────────────────────────────
// Test-drive screen #4: "Billing & usage" from the Figma handoff (page
// "🧪 Example — Billing"). Exercises the previously-untouched clusters —
// overlays (AlertDialog, DropdownMenu), feedback (Banner, Alert, Progress),
// disclosure (Accordion, Tabs), plus Breadcrumb, FeaturedIcon, ButtonGroup,
// CodeBlock, Kbd, Badge. Toast + AlertDialog are wired live.
// ─────────────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Prototypes/Billing Handoff',
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj;

const faqs = [
  {
    value: 'proration',
    q: 'How does upgrading mid-cycle work?',
    a: 'We prorate the difference — you’re only charged for the days remaining in the current cycle.',
  },
  {
    value: 'refunds',
    q: 'Can I get a refund?',
    a: 'Annual plans are refundable within 30 days. Monthly plans are not refundable but you can cancel anytime.',
  },
  {
    value: 'seats',
    q: 'What happens if I exceed my seats?',
    a: 'Extra seats are billed at $5/seat/month, added to your next invoice.',
  },
];

const invoices = [
  { id: 'INV-0042', date: 'Jul 1, 2026', amount: '$29.00' },
  { id: 'INV-0041', date: 'Jun 1, 2026', amount: '$29.00' },
  { id: 'INV-0040', date: 'May 1, 2026', amount: '$29.00' },
];

function UsageStat({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <Card id={`stat-${label}`} style={{ flex: 1 }}>
      <CardBody>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
            {label}
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
            {value}
          </span>
        </div>
        <Progress
          id={`p-${label}`}
          value={pct}
          variant={pct >= 75 ? 'warning' : 'default'}
          aria-label={`${label} usage`}
          style={{ marginTop: 'var(--p-3)' }}
        />
      </CardBody>
    </Card>
  );
}

function Billing() {
  const [cancelOpen, setCancelOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Toaster />
      <div
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: 'var(--p-8)',
          display: 'grid',
          gap: 'var(--p-6)',
        }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Settings</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Billing</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--foreground)',
            }}
          >
            Billing &amp; usage
          </h1>
          <p style={{ margin: 'var(--p-1) 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
            Manage your plan, payment method and usage.
          </p>
        </div>

        <Banner
          id="trial"
          variant="warning"
          title="Your free trial ends in 5 days — upgrade to keep your data."
        />

        <Tabs id="billing-tabs" defaultValue="usage">
          <TabsList>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="plan">Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="usage">
            <div style={{ display: 'grid', gap: 'var(--p-6)', marginTop: 'var(--p-5)' }}>
              <div style={{ display: 'flex', gap: 'var(--p-5)' }}>
                <UsageStat label="Storage" value="34 of 50 GB" pct={68} />
                <UsageStat label="Team seats" value="8 of 10 used" pct={80} />
              </div>

              {/* Plan card */}
              <Card id="plan">
                <CardBody>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-3)' }}>
                    <FeaturedIcon Icon={Sparkles} variant="brand" shape="square" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
                        Pro plan · $29 / month
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                        Billed monthly · renews Aug 3, 2026
                      </div>
                    </div>
                    <Badge id="plan-current" label="Current" variant="success" />
                  </div>
                  <ButtonGroup id="plan-actions" style={{ marginTop: 'var(--p-4)' }}>
                    <Button id="change-plan" label="Change plan" />
                    <Button id="cancel-plan" style="outline" label="Cancel plan" onClick={() => setCancelOpen(true)} />
                  </ButtonGroup>
                </CardBody>
              </Card>

              <Alert
                id="card-expiring"
                variant="warning"
                Icon={TriangleAlert}
                title="Payment method expiring"
                description="Your card ending 4242 expires next month. Update it to avoid interruption."
              />

              {/* FAQ */}
              <section>
                <h2 style={{ margin: '0 0 var(--p-3)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
                  Billing FAQ
                </h2>
                <Accordion id="faq" type="single" collapsible defaultValue="proration">
                  {faqs.map((f) => (
                    <AccordionItem key={f.value} value={f.value}>
                      <AccordionTrigger>{f.q}</AccordionTrigger>
                      <AccordionContent>{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>

              {/* API key */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)', marginBottom: 'var(--p-2)' }}>
                  <h2 style={{ flex: 1, margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
                    Secret API key
                  </h2>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>Copy</span>
                  <Kbd size="sm">⌘C</Kbd>
                </div>
                <CodeBlock id="api-key" code="sk_live_51HqI9aXm2eRtY7uKpLmN3vB8cD0fG" />
              </section>

              {/* Invoices */}
              <section>
                <h2 style={{ margin: '0 0 var(--p-3)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
                  Recent invoices
                </h2>
                <div
                  style={{
                    border: 'var(--border-w-100) solid var(--border)',
                    borderRadius: 'var(--rounded-lg)',
                    overflow: 'hidden',
                    background: 'var(--card)',
                  }}
                >
                  {invoices.map((inv, i) => (
                    <div
                      key={inv.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--p-3)',
                        padding: 'var(--p-4)',
                        borderBottom:
                          i < invoices.length - 1 ? 'var(--border-w-100) solid var(--border)' : 'none',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{inv.id}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{inv.date}</div>
                      </div>
                      <span style={{ fontSize: 'var(--text-sm)' }}>{inv.amount}</span>
                      <Badge id={`paid-${inv.id}`} label="Paid" variant="success" />
                      <DropdownMenu id={`inv-menu-${inv.id}`}>
                        <DropdownMenuTrigger>
                          <Button
                            id={`inv-more-${inv.id}`}
                            style="ghost"
                            size="sm"
                            IconLeft={MoreHorizontal}
                            aria-label={`Actions for ${inv.id}`}
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onSelect={() => toast.success(`Downloading ${inv.id}…`)}>
                            <Download width={16} height={16} />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye width={16} height={16} />
                            View invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send width={16} height={16} />
                            Email to…
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <p style={{ marginTop: 'var(--p-5)', color: 'var(--muted-foreground)' }}>All invoices…</p>
          </TabsContent>
          <TabsContent value="plan">
            <p style={{ marginTop: 'var(--p-5)', color: 'var(--muted-foreground)' }}>Plan details…</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel-plan confirmation */}
      <AlertDialog id="cancel-confirm" open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <AlertDialogHeader
          id="cancel-confirm"
          title="Cancel your Pro plan?"
          description="You’ll keep Pro features until Aug 3, 2026, then move to the Free plan."
        />
        <AlertDialogBody>
          Your team will lose access to advanced analytics and priority support.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button id="keep" style="ghost" label="Keep plan" onClick={() => setCancelOpen(false)} />
          <Button
            id="confirm-cancel"
            variant="error"
            label="Cancel plan"
            onClick={() => {
              setCancelOpen(false);
              toast.success('Your plan will cancel on Aug 3, 2026.');
            }}
          />
        </AlertDialogFooter>
      </AlertDialog>
    </div>
  );
}

export const Billing_: Story = {
  name: 'Billing',
  render: () => <Billing />,
};
