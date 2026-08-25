import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MessageSquare, Pencil, Sparkles, SquarePen, Trash2 } from 'lucide-react';
import Sidebar, {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '../components/Sidebar';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/DropdownMenu';
import Button from '../components/Button';
import Mark from '../components/Mark';
import { ChatGreeting } from '../components/Chat';

/**
 * THE HISTORY SIDEBAR IS A RECIPE, NOT A COMPONENT FAMILY — an owner decision
 * (2026-08-09). Every part already exists: `Sidebar` provides the shell,
 * collapse behavior and the sub-768px Drawer swap; `SidebarInput` is the
 * search; `SidebarGroup`+`GroupLabel` are the date groups; `SidebarMenuButton`
 * rows are the conversations; `SidebarMenuAction`+`DropdownMenu` carry
 * rename/delete. A `ChatHistory*` family would be a parallel clone of Sidebar
 * — the exact duplication debt CLAUDE.md warns about — and search and date
 * grouping are app state anyway.
 *
 * PROMOTE TO COMPONENTS ONLY IF sub-applications start copy-paste-drifting
 * this recipe. Until then, this story is the reference implementation.
 */
const meta: Meta = {
  title: 'AI/Aiden History Sidebar',
  parameters: {
    layout: 'fullscreen',
    ui: {
      description:
        'The conversation-history sidebar for full-screen Aiden — past chats ' +
        'with search, date groups and rename/delete row actions — assembled ' +
        'entirely from the existing `Sidebar`, `DropdownMenu` and `Chat` ' +
        'families.\n\n' +
        '**This is a recipe, not a component family** (owner decision): a ' +
        '`ChatHistory*` family would clone Sidebar\'s job, and the promote ' +
        'trigger is written down — sub-apps copy-paste-drifting this story.',
      tags: ['ai', 'recipe', 'composition'],
    },
  },
};

export default meta;

const HISTORY: Record<string, { id: string; title: string }[]> = {
  Today: [
    { id: 'c1', title: 'Q4 revenue summary' },
    { id: 'c2', title: 'IRM request triage' },
  ],
  Yesterday: [
    { id: 'c3', title: 'Dashboard layout ideas' },
    { id: 'c4', title: 'SQL for retention cohort' },
  ],
  'Previous 7 days': [
    { id: 'c5', title: 'Phoenix queue backlog' },
    { id: 'c6', title: 'Onboarding email draft' },
    { id: 'c7', title: 'Chart palette question' },
  ],
};

export const Recipe: StoryObj = {
  render: function RecipeStory() {
    const [active, setActive] = useState('c1');
    const [query, setQuery] = useState('');
    const q = query.toLowerCase();
    return (
      <div data-surface="aiden" style={{ height: '100vh' }}>
        <SidebarProvider>
          <Sidebar collapsible="offcanvas">
            <SidebarHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--p-2)', padding: 'var(--p-1) var(--p-2)' }}>
                <Mark id="hist-mark" Icon={Sparkles} size="sm" motion="none" label="Aiden" />
                <span style={{ flex: 1, font: 'var(--font-semibold) var(--text-sm)/var(--leading-5) var(--font-family)', color: 'var(--sidebar-foreground)' }}>
                  Aiden
                </span>
                <Button
                  id="hist-new"
                  size="xs"
                  style="ghost"
                  iconOnly
                  IconCenter={() => <SquarePen size={14} aria-hidden="true" />}
                  aria-label="New chat"
                />
              </div>
              <SidebarInput
                placeholder="Search chats…"
                aria-label="Search chats"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </SidebarHeader>
            <SidebarContent>
              {Object.entries(HISTORY).map(([group, chats]) => {
                const visible = chats.filter((c) => c.title.toLowerCase().includes(q));
                if (visible.length === 0) return null;
                return (
                  <SidebarGroup key={group}>
                    <SidebarGroupLabel>{group}</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {visible.map((c) => (
                          <SidebarMenuItem key={c.id}>
                            <SidebarMenuButton
                              isActive={c.id === active}
                              onClick={() => setActive(c.id)}
                              tooltip={c.title}
                            >
                              <MessageSquare />
                              <span>{c.title}</span>
                            </SidebarMenuButton>
                            <DropdownMenu id={`hist-${c.id}-menu`}>
                              <DropdownMenuTrigger>
                                <SidebarMenuAction showOnHover aria-label={`Actions for ${c.title}`}>
                                  <Pencil />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => {}}>
                                  <Pencil /> Rename
                                </DropdownMenuItem>
                                {/* DropdownMenu ships no destructive variant (ContextMenu
                                    does) — the red is inline here, and if this recipe gets
                                    promoted, adding the variant to DropdownMenu comes first. */}
                                <DropdownMenuItem style={{ color: 'var(--error)' }} onClick={() => {}}>
                                  <Trash2 /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                );
              })}
            </SidebarContent>
            <SidebarFooter />
          </Sidebar>
          <SidebarInset>
            <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
              <ChatGreeting
                icon={<Sparkles />}
                title="How can I help today?"
                description={`Active conversation: ${active}`}
              />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
  },
};
