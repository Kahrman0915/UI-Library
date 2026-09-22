/* ── Aiden · the two tab pages ─────────────────────────────────────────────────
   A1.5 NEW TAB · the launcher (`aiden-launcher`): the page the tab bar's +
   leads to when you want to ask rather than open something. Submitting creates
   the conversation and REPLACES this tab with it — the launcher never renders
   a reply itself (the AidenLauncher contract).

   A1.4 FULL · its own tab (`aiden-chat`): the same conversation that started
   in the mini window or the panel, now owning the body. The shell stays. A
   short list of your chats sits on the left, per the AI/Aiden History Sidebar
   recipe. */

import { MessageSquare, SquarePen } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/Button';
import {
  ChatComposer,
  ChatComposerActions,
  ChatComposerDictation,
  ChatComposerInput,
  ChatComposerSend,
  ChatGreeting,
  ChatSuggestion,
  ChatSuggestions,
} from '../../../../components/Chat';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../../components/Empty';
import Item, { ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../../components/Item';
import ScrollArea from '../../../../components/ScrollArea';
import { toast } from '../../../../components/Toast';
import { AidenSparkles } from '../../../AidenSparkles';
import { useNav } from '../../nav';
import { useSuite } from '../../store';
import { Conversation } from './Conversation';
import { STARTERS, sendMessage } from './engine';
import './Aiden.scss';

/* ── A1.5 · the launcher ──────────────────────────────────────────────────── */

export function AidenLauncherPage() {
  const { state, saveChat, update } = useSuite();
  const { replace } = useNav();
  const [value, setValue] = useState('');
  const [recording, setRecording] = useState(false);

  const start = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const chatId = sendMessage(null, text, { state, saveChat, update });
    setValue('');
    replace({ page: 'aiden-chat', chatId });
  };

  return (
    <div className="ds-aiden-launcher" data-surface="aiden">
      <div className="ds-aiden-launcher__column">
        <ChatGreeting
          icon={<AidenSparkles gradient size={40} />}
          title="What can I help you find?"
          description="Ask about your dashboards, spaces or anything in DART Central."
        />
        <ChatComposer id="ds-aiden-launcher-composer" value={value} onValueChange={setValue} onSubmit={start}>
          <ChatComposerInput placeholder="Message Aiden…" aria-label="Message Aiden" autoFocus />
          <ChatComposerActions>
            <ChatComposerDictation
              recording={recording}
              onClick={() => {
                if (recording) return setRecording(false);
                setRecording(true);
                toast('Listening…', { id: 'aiden-dictation', duration: 1600 });
                window.setTimeout(() => {
                  setValue('Which dashboards cover servicing?');
                  setRecording(false);
                }, 1600);
              }}
            />
            <ChatComposerSend id="ds-aiden-launcher-send" />
          </ChatComposerActions>
        </ChatComposer>
        <ChatSuggestions className="ds-aiden-launcher__suggestions">
          {STARTERS.map((s) => (
            <ChatSuggestion key={s} onClick={() => start(s)}>
              <AidenSparkles size={14} />
              {s}
            </ChatSuggestion>
          ))}
        </ChatSuggestions>
      </div>
    </div>
  );
}

/* ── A1.4 · the full tab ──────────────────────────────────────────────────── */

export function AidenChatPage({ chatId }: { chatId: string }) {
  const { state } = useSuite();
  const { go, replace } = useNav();
  const chat = state.aidenChats.find((c) => c.id === chatId);

  return (
    <div className="ds-aiden-page" data-surface="aiden">
      <nav className="ds-aiden-history" aria-label="Your chats with Aiden">
        <Button
          id="ds-aiden-history-new"
          style="outline"
          size="sm"
          label="New chat"
          IconLeft={() => <SquarePen size={16} aria-hidden="true" />}
          onClick={() => go({ page: 'aiden-launcher' })}
        />
        <ScrollArea id="ds-aiden-history-scroll" className="ds-aiden-history__scroll" type="hover">
          <p className="ds-aiden-history__label">Recent</p>
          <ItemGroup className="ds-aiden-history__list">
            {state.aidenChats.map((c) => (
              <Item
                key={c.id}
                id={`ds-aiden-history-${c.id}`}
                size="xs"
                variant={c.id === chatId ? 'muted' : 'default'}
                aria-current={c.id === chatId ? 'page' : undefined}
                onClick={() => c.id !== chatId && replace({ page: 'aiden-chat', chatId: c.id })}
              >
                <ItemMedia>
                  <MessageSquare />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{c.title}</ItemTitle>
                  <ItemDescription>{c.updatedAt}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </ScrollArea>
      </nav>

      <div className="ds-aiden-page__main">
        {chat ? (
          <Conversation key={chatId} idPrefix="ds-aiden-tab" chatId={chatId} sendSize="default" follow="open" />
        ) : (
          <Empty className="ds-aiden-page__empty">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare />
              </EmptyMedia>
              <EmptyTitle>This chat is gone</EmptyTitle>
              <EmptyDescription>It may have been started in a session that has ended. Start a new one.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button id="ds-aiden-empty-new" label="New chat" onClick={() => replace({ page: 'aiden-launcher' })} />
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  );
}
