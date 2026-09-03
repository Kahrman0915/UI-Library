import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Ellipsis, Slash } from 'lucide-react';
import Breadcrumb, {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb';
import DropdownMenu, {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../DropdownMenu';
import Button from '../Button';
import Card, { CardBody } from '../Card';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The trail back up from wherever the user is now. Every level is a link ' +
        'except the current page, which is marked `aria-current` and deliberately is ' +
        'not clickable.',
      tags: ['compound', '7 parts', 'navigation'],
      usage: {
        when: [
          'A screen sits **below** a navigation item — a detail view under a list, a task under a section. The trail names where you are and gives one click back up.',
          'The app has persistent chrome (a sidebar, an app rail, a tab strip). There the breadcrumb is the only thing expressing depth *below* the level that chrome already shows.',
          'Depth is 2–4. Past that, collapse the middle with `BreadcrumbEllipsis` rather than letting the trail wrap.',
        ],
        avoid: [
          'A top-level page that IS a navigation item. A one-level crumb repeats the sidebar and says nothing.',
          'Terminal outcome screens — a confirmation or a success page is a result, not a location. Give it explicit forward actions instead.',
          'Modal surfaces. Inside a `Dialog` or `FullScreenDialog` you are in a task, not a place; the exit is the close control.',
          'Pairing it with a back **button** that goes to the same place. Pick one — two affordances doing one job is the ambiguity the trail was meant to remove.',
        ],
        notes:
          'A breadcrumb is NAVIGATION, not cancellation. It answers "where am I and how do I go up"; a `Cancel` button answers "throw this away". If a screen holds unsaved work, the guard belongs to the navigation event, not to a button — otherwise the sidebar, the app rail and the tab strip are all unguarded doors, and adding a Cancel button next to a breadcrumb just duplicates a route that is already covered.\n\n' +
          'Do not repeat the application name in the trail when the chrome already states it. Root at the section the user would recognise from the nav.',
      },
      changelog: [
        {
          date: '2026-07-29',
          summary: 'Initial build complete.',
          detail:
            'Component shipped: tokenised styles, full prop surface, stories, and documented API.',
        },
      ],
    } satisfies UiDocsParameters,
  },
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Playground: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const WithSlashSeparator: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const WithEllipsis: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs/components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const WithDropdownCollapse: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu id="crumb-drop">
            <DropdownMenuTrigger>
              <Button
                id="crumb-ellipsis"
                iconOnly
                IconCenter={Ellipsis}
                style="ghost"
                size="sm"
                aria-label="Show hidden segments"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Docs</DropdownMenuItem>
              <DropdownMenuItem>Components</DropdownMenuItem>
              <DropdownMenuItem>Base</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs/components/base">Base</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const LongPath: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        {[
          { label: 'Workspace', href: '/' },
          { label: 'Design system', href: '/design-system' },
          { label: 'Components', href: '/design-system/components' },
          { label: 'Navigation', href: '/design-system/components/navigation' },
        ].map((crumb) => (
          <Fragment key={crumb.href}>
            <BreadcrumbItem>
              <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const OnCard: Story = {
  render: () => (
    <div style={{ maxWidth: 'var(--max-w-2xl)' }}>
      <Card id="breadcrumb-card">
        <CardBody>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/reports">Reports</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/reports/quarterly">
                  Quarterly
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Q4 2025</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div
            style={{
              marginTop: 'var(--p-4)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--card-foreground)',
            }}
          >
            Q4 2025 Report
          </div>
          <p
            style={{
              color: 'var(--muted-foreground)',
              marginTop: 'var(--p-1)',
            }}
          >
            Placed above a heading to anchor the reader.
          </p>
        </CardBody>
      </Card>
    </div>
  ),
};
