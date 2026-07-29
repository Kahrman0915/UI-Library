import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Menubar, {
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from './Menubar';
import Kbd from '../Kbd/Kbd';
import type { UiDocsParameters } from '../../types/DocsTypes';

const meta: Meta<typeof Menubar> = {
  title: 'Components/Menubar',
  component: Menubar,
  parameters: {
    layout: 'padded',
    ui: {
      description:
        'The desktop-style horizontal menu bar. Once one menu is open, hovering the ' +
        'others switches between them, and arrow keys move across the triggers. Built ' +
        'on `DropdownMenu`, so positioning and item behaviour come along for free.',
      tags: ['compound', '11 parts'],
    } satisfies UiDocsParameters,
  },
};

export default meta;

type Story = StoryObj<typeof Menubar>;

export const Playground: Story = {
  render: () => {
    const [wordWrap, setWordWrap] = useState(true);
    const [minimap, setMinimap] = useState(false);
    const [profile, setProfile] = useState('benoit');

    return (
      <Menubar id="mb">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Tab <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              New Window <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>New Incognito Window</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>
              Print… <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Undo <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Cut</MenubarItem>
            <MenubarItem>Copy</MenubarItem>
            <MenubarItem>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem
              checked={wordWrap}
              onCheckedChange={setWordWrap}
            >
              Word Wrap
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked={minimap} onCheckedChange={setMinimap}>
              Show Minimap
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarItem>
              Reload <MenubarShortcut>⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>Toggle Fullscreen</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="profiles">
          <MenubarTrigger>Profiles</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Switch profile</MenubarLabel>
            <MenubarRadioGroup value={profile} onValueChange={setProfile}>
              <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
              <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
              <MenubarRadioItem value="luis">Luis</MenubarRadioItem>
            </MenubarRadioGroup>
            <MenubarSeparator />
            <MenubarItem>Edit…</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );
  },
};

export const KeyboardNavigation: Story = {
  name: 'Keyboard navigation',
  parameters: {
    docs: {
      description: {
        story:
          'The bar is a **single tab stop** — a roving tabindex means Tab lands on ' +
          'the bar once and moves past it, rather than stepping through every menu. ' +
          'Arrow keys move between triggers from there. Once any menu is open, ' +
          '*hovering* another trigger switches to it, which is the behaviour that ' +
          'makes a menu bar feel native. Two v1 gaps to know about: there are no ' +
          'submenus (only `ContextMenu` has those), and ArrowLeft/Right does not ' +
          'work from *inside* an open menu — use hover, or Escape then arrow.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--p-5)' }}>
      <Menubar id="mb-kbd">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
            <MenubarItem>Open…</MenubarItem>
            <MenubarItem>Save</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="help">
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Documentation</MenubarItem>
            <MenubarItem>Keyboard shortcuts</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 'var(--p-2) var(--p-4)',
          margin: 0,
          alignItems: 'center',
          fontSize: 'var(--text-sm)',
          color: 'var(--muted-foreground)',
        }}
      >
        <dt><Kbd size="sm">Tab</Kbd></dt>
        <dd style={{ margin: 0 }}>Enter the bar — once, not once per menu.</dd>
        <dt style={{ display: 'flex', gap: 'var(--p-1)' }}>
          <Kbd size="sm">←</Kbd>
          <Kbd size="sm">→</Kbd>
        </dt>
        <dd style={{ margin: 0 }}>Move between triggers. Wraps at both ends.</dd>
        <dt style={{ display: 'flex', gap: 'var(--p-1)' }}>
          <Kbd size="sm">Enter</Kbd>
          <Kbd size="sm">↓</Kbd>
        </dt>
        <dd style={{ margin: 0 }}>Open the focused menu and move into it.</dd>
        <dt style={{ display: 'flex', gap: 'var(--p-1)' }}>
          <Kbd size="sm">↑</Kbd>
          <Kbd size="sm">↓</Kbd>
        </dt>
        <dd style={{ margin: 0 }}>Move between items, wrapping at the ends.</dd>
        <dt><Kbd size="sm">Esc</Kbd></dt>
        <dd style={{ margin: 0 }}>Close and return focus to the trigger.</dd>
      </dl>
    </div>
  ),
};

export const DisabledItems: Story = {
  name: 'Disabled states',
  parameters: {
    docs: {
      description: {
        story:
          'The two levels behave differently, on purpose.\n\n' +
          'A disabled **trigger** still takes arrow-key focus — it just can’t be ' +
          'opened, by click, hover or keyboard. That follows the APG menubar ' +
          'pattern: disabled items stay focusable so a keyboard user discovers the ' +
          'option exists and learns it is currently unavailable, rather than ' +
          'wondering where it went.\n\n' +
          'A disabled **item** is skipped by Up/Down entirely — `ITEM_SELECTOR` ' +
          'excludes `[data-disabled]` — and can’t be activated. Inside an open menu ' +
          'the arrow keys are a scan, so stopping on dead rows is friction.\n\n' +
          'Either way both stay **visible**: a menu that silently loses entries is ' +
          'harder to trust than one that shows what is unavailable right now.',
      },
    },
  },
  render: () => (
    <Menubar id="mb-disabled">
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New</MenubarItem>
          <MenubarItem disabled>Revert (no unsaved changes)</MenubarItem>
          <MenubarSeparator />
          <MenubarItem disabled>Export…</MenubarItem>
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger disabled>Edit (nothing selected)</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Zoom in</MenubarItem>
          <MenubarItem>Zoom out</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};
