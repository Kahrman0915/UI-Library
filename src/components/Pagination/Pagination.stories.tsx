import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Pagination, {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './Pagination';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    ui: {
      description:
        'Page navigation for a long list or table. Cells are anchors styled as ' +
        'buttons, so every page is a real, shareable link rather than a piece of ' +
        'client state.',
      tags: ['compound', '7 parts', 'navigation'],
    } satisfies UiDocsParameters,
  },
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const Basic: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const WithEllipsis: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">6</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            7
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">8</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">24</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

export const IconOnlyPrevNext: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" showLabel={false} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" showLabel={false} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

// Interactive — clicking a page updates the active cell.
export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(2);
    const total = 5;
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              disabled={page === 1}
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.max(1, p - 1));
              }}
            />
          </PaginationItem>
          {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
            <PaginationItem key={n}>
              <PaginationLink
                href="#"
                isActive={n === page}
                onClick={(e) => {
                  e.preventDefault();
                  setPage(n);
                }}
              >
                {n}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              disabled={page === total}
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.min(total, p + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  },
};

export const DisabledEdges: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'First page and last page side by side, so both disabled states are visible ' +
          'without clicking anything.\n\n' +
          'An `<a>` has no native `disabled`, so the prop drops `href`, removes the ' +
          'tab stop and sets `aria-disabled` instead. Spreading it straight onto the ' +
          'anchor is what shipped originally — it emitted an invalid `disabled` ' +
          'attribute and a React warning, and the link stayed clickable.',
      },
    },
  },
  render: () => {
    const rows: Array<{ label: string; page: number }> = [
      { label: 'On the first page — Previous is disabled', page: 1 },
      { label: 'On the last page — Next is disabled', page: 5 },
    ];
    const total = 5;
    return (
      <div style={{ display: 'grid', gap: 'var(--p-6)' }}>
        {rows.map(({ label, page }) => (
          <div key={page} style={{ display: 'grid', gap: 'var(--p-2)' }}>
            <span
              style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}
            >
              {label}
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" disabled={page === 1} />
                </PaginationItem>
                {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
                  <PaginationItem key={n}>
                    <PaginationLink href="#" isActive={n === page}>
                      {n}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" disabled={page === total} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ))}
      </div>
    );
  },
};
