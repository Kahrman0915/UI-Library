/* ── Aiden · the host — the Fab and its non-modal stops ────────────────────────
   Figma: Aiden A1.1–A1.4. Four stops, and the user chooses how far to go:

     closed  → the Fab at rest, bottom-right, twinkling once on arrival
     mini    → a small floating window anchored above the Fab
     panel   → the library AidenPanel, pinned right, below the tab strip
     full    → Aiden in ITS OWN TAB (route `aiden-chat`), the shell kept

   The maximize button steps up one stop per press (build notes). Nothing here
   is modal: the page behind stays usable at mini and at panel.

   Two deliberate calls:
   - THE FAB STAYS WHILE THE MINI IS OPEN (build notes: "the Fab is both its
     anchor and the control that closes it") and gives way at panel and full.
   - The mini is composed here. The Figma master has a Placement axis on
     AidenPanel; src does not, so the mini reuses the panel's own header classes
     inside a fixed Card rather than growing a prop from a prototype. */

import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Maximize2, SquarePen, X } from 'lucide-react';
import AidenPanel, { AidenPanelHeader } from '../../../../components/AidenPanel';
import Card from '../../../../components/Card';
import Fab from '../../../../components/Fab';
import { AidenSparkles } from '../../../AidenSparkles';
import { useNav } from '../../nav';
import { Conversation } from './Conversation';
import './Aiden.scss';

type Stop = 'closed' | 'mini' | 'panel';

const MODEL = 'Claude Opus 5';

export function AidenHost() {
  const { route, open } = useNav();
  const [stop, setStop] = useState<Stop>('closed');
  const [chatId, setChatId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const onAidenTab = route.page === 'aiden-chat' || route.page === 'aiden-launcher';
  // Aiden already has the whole body there; a second copy floating over it is noise.
  useEffect(() => {
    if (onAidenTab) setStop('closed');
  }, [onAidenTab]);

  const close = useCallback(() => setStop('closed'), []);
  const toPanel = useCallback(() => setStop('panel'), []);
  const toTab = useCallback(() => {
    setStop('closed');
    open(chatId ? { page: 'aiden-chat', chatId } : { page: 'aiden-launcher' });
  }, [chatId, open]);
  const newChat = () => {
    setChatId(null);
    setDraft('');
  };

  const conversation = (compact: boolean) => (
    <Conversation
      idPrefix={compact ? 'ds-aiden-mini' : 'ds-aiden-panel'}
      chatId={chatId}
      onChatId={setChatId}
      compact={compact}
      draft={draft}
      onDraft={setDraft}
    />
  );

  const newChatButton = chatId ? (
    <button
      type="button"
      className="ui-icon-button ui-icon-button--fill ui-aiden-panel__header-button"
      aria-label="New chat"
      onClick={newChat}
    >
      <SquarePen aria-hidden="true" />
    </button>
  ) : null;

  return (
    <>
      <div data-surface="aiden">
        {!onAidenTab && stop !== 'panel' && (
          <Fab
            id="ds-aiden-fab"
            intro
            aria-label={stop === 'mini' ? 'Close Aiden' : 'Ask Aiden'}
            aria-expanded={stop === 'mini'}
            aria-controls={stop === 'mini' ? 'ds-aiden-mini' : undefined}
            onClick={() => setStop((s) => (s === 'mini' ? 'closed' : 'mini'))}
          >
            <AidenSparkles />
          </Fab>
        )}

        {stop === 'mini' && (
          <Card
            id="ds-aiden-mini"
            className="ds-aiden-mini"
            role="complementary"
            aria-labelledby="ds-aiden-mini-title"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                close();
              }
            }}
          >
            <div className="ui-aiden-panel__header">
              <div className="ui-aiden-panel__header-content">
                <h2 id="ds-aiden-mini-title" className="ui-aiden-panel__title">
                  Aiden
                </h2>
                <p className="ui-aiden-panel__description">{MODEL}</p>
              </div>
              <div className="ui-aiden-panel__header-actions">
                {newChatButton}
                <button
                  type="button"
                  className="ui-icon-button ui-icon-button--fill ui-aiden-panel__header-button"
                  aria-label="Expand to side panel"
                  onClick={toPanel}
                >
                  <Maximize2 aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="ui-icon-button ui-icon-button--fill ui-aiden-panel__header-button"
                  aria-label="Close Aiden"
                  onClick={close}
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            </div>
            {conversation(true)}
          </Card>
        )}
      </div>

      <AidenPanel
        id="ds-aiden-panel"
        open={stop === 'panel'}
        onClose={close}
        onExpand={toTab}
        // Pinned below the tab strip, so the open tabs stay visible (A1.3).
        style={{ '--ui-aiden-panel-inset-top': 'var(--app-strip-height)' } as CSSProperties}
      >
        <AidenPanelHeader title="Aiden" description={MODEL}>
          {newChatButton}
        </AidenPanelHeader>
        {conversation(false)}
      </AidenPanel>
    </>
  );
}
