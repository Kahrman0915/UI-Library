/* ── Aiden · one conversation, on any surface ──────────────────────────────────
   The mini window, the side panel and the full tab all render THIS — same
   transcript, same composer — which is the Aiden page's whole argument (build
   notes: "only geometry and anchoring differ"). `compact` is the mini's one
   difference: result rows drop their descriptions, the rule the AidenPanel
   stories recorded for the smallest surface. */

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  Activity,
  BarChart,
  ChartPie,
  Copy,
  FolderPlus,
  Inbox,
  LineChart,
  Paperclip,
  Plus,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import {
  ChatActionCard,
  ChatBubble,
  ChatComposer,
  ChatComposerActions,
  ChatComposerDictation,
  ChatComposerDrawer,
  ChatComposerInput,
  ChatComposerSend,
  ChatGreeting,
  ChatLayout,
  ChatLayoutBody,
  ChatLayoutFooter,
  ChatMessage,
  ChatMessageAction,
  ChatMessageActions,
  ChatMessageList,
  ChatSuggestion,
  ChatSuggestions,
} from '../../../../components/Chat';
import Item, { ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../../components/Item';
import { toast } from '../../../../components/Toast';
import { useStreamingText } from '../../../../hooks/useStreamingText';
import type { Size } from '../../../../types/GlobalTypes';
import { AidenSparkles } from '../../../AidenSparkles';
import { useNav } from '../../nav';
import { requesterStatus, toneBadge, typeLabel, useSuite } from '../../store';
import type { Dashboard, Route } from '../../types';
import { useUi } from '../../ui';
import { STARTERS, asRich, finishStreaming, patchAction, sendMessage, stopReply, useAidenRuntime } from './engine';
import type { RichMessage } from './engine';
import './Aiden.scss';

const CATEGORY_ICON: Record<Dashboard['category'], LucideIcon> = {
  Risk: LineChart,
  Customer: BarChart,
  Operations: Activity,
  Finance: ChartPie,
  Sales: TrendingUp,
};

const Glyph = () => <AidenSparkles gradient />;

/**
 * Where a link inside the conversation goes. Over a page (mini, panel) it
 * navigates that page's tab; in Aiden's own tab it opens a new one, so
 * following a result never throws the conversation away.
 */
const FollowCtx = createContext<'go' | 'open'>('go');
const useFollow = () => {
  const nav = useNav();
  const how = useContext(FollowCtx);
  return (r: Route) => (how === 'open' ? nav.open(r) : nav.go(r));
};

/* ── Rich parts ───────────────────────────────────────────────────────────── */

function Results({ ids, compact, idPrefix }: { ids: string[]; compact?: boolean; idPrefix: string }) {
  const { state } = useSuite();
  const go = useFollow();
  const { openAddToSpace } = useUi();
  const rows = ids.map((id) => state.dashboards.find((d) => d.id === id)).filter((d): d is Dashboard => !!d);
  if (!rows.length) return null;
  return (
    <ItemGroup aria-label="Dashboards Aiden found" className="ds-aiden-rows">
      {rows.map((d) => {
        const Icon = CATEGORY_ICON[d.category];
        return (
          <Item key={d.id} variant="outline" size="sm">
            <ItemMedia variant="icon">
              <Icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                <button type="button" className="ds-aiden-link" onClick={() => go({ page: 'dashboard', id: d.id })}>
                  {d.name}
                </button>
              </ItemTitle>
              {!compact && <ItemDescription>{d.description}</ItemDescription>}
            </ItemContent>
            <ItemActions>
              <Button
                id={`${idPrefix}-add-${d.id}`}
                style="ghost"
                size="sm"
                iconOnly
                IconCenter={Plus}
                aria-label={`Add ${d.name} to a space`}
                onClick={() => openAddToSpace(d.id)}
              />
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
  );
}

function Requests({ ids, compact, idPrefix }: { ids: string[]; compact?: boolean; idPrefix: string }) {
  const { state } = useSuite();
  const go = useFollow();
  const rows = ids.map((id) => state.requests.find((r) => r.id === id)).filter((r) => !!r);
  return (
    <div className="ds-aiden-rich">
      {rows.length > 0 && (
        <ItemGroup aria-label="Your open requests" className="ds-aiden-rows">
          {rows.map((r) => {
            const s = requesterStatus(r.status);
            return (
              <Item key={r.id} variant="outline" size="sm">
                <ItemMedia variant="icon">
                  <Inbox />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    <button type="button" className="ds-aiden-link" onClick={() => go({ page: 'request-detail', id: r.id })}>
                      {r.title}
                    </button>
                  </ItemTitle>
                  {!compact && <ItemDescription>{`${r.id} · ${typeLabel[r.type]}`}</ItemDescription>}
                </ItemContent>
                <ItemActions>
                  <Badge id={`${idPrefix}-req-${r.id.replace('#', '')}`} label={s.label} {...toneBadge(s.tone)} />
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      )}
      <div>
        <Button id={`${idPrefix}-my-requests`} style="outline" size="sm" label="Open My Requests" onClick={() => go({ page: 'my-requests' })} />
      </div>
    </div>
  );
}

function Action({ chatId, msg, idPrefix }: { chatId: string; msg: RichMessage; idPrefix: string }) {
  const { state, update, addToSpaces, removeFromSpace, saveSpace, deleteSpace } = useSuite();
  const go = useFollow();
  const a = msg.action;
  const dash = state.dashboards.find((d) => d.id === a?.dashboardId);
  if (!a || !dash) return null;

  const cardId = `${idPrefix}-action-${msg.id}`;
  const spaceId = a.spaceId ?? a.createdSpaceId;
  const space = state.spaces.find((s) => s.id === spaceId);
  const target = a.spaceId ? (space?.name ?? 'your space') : `a new space, “${a.newSpaceName}”`;
  const patch = (p: Parameters<typeof patchAction>[3]) => patchAction(update, chatId, msg.id, p);

  const confirm = () => {
    patch({ status: 'running' });
    window.setTimeout(() => {
      if (a.spaceId) {
        addToSpaces(dash.id, [a.spaceId]);
        patch({ status: 'done' });
      } else {
        const created = saveSpace({
          name: a.newSpaceName ?? 'New space',
          description: `Started by Aiden from ${dash.name}.`,
          hue: dash.hue,
          items: [{ dashboardId: dash.id, layout: 'card' }],
        });
        patch({ status: 'done', createdSpaceId: created.id });
      }
      toast.success(`Added ${dash.name}`, { description: a.spaceId ? `It is in ${space?.name ?? 'your space'} now.` : `“${a.newSpaceName}” is in your spaces.` });
    }, 900);
  };

  const undo = () => {
    if (a.createdSpaceId) deleteSpace(a.createdSpaceId);
    else if (a.spaceId) removeFromSpace(a.spaceId, dash.id);
    patch({ status: 'proposed', createdSpaceId: undefined });
    toast('Undone', { description: `${dash.name} is no longer in ${a.spaceId ? (space?.name ?? 'the space') : `“${a.newSpaceName}”`}.` });
  };

  const done = a.status === 'done';
  return (
    <ChatActionCard
      id={cardId}
      className="ds-aiden-action"
      status={a.status}
      icon={<FolderPlus aria-hidden="true" />}
      title={done ? `Added ${dash.name} to ${target}` : `Add ${dash.name} to ${target}`}
      description={
        a.spaceId
          ? `It goes at the end of ${space?.name ?? 'the space'}, as a card.`
          : `Creates “${a.newSpaceName}” with it on the canvas.`
      }
      statusLabel={a.declined ? 'Not added. Nothing changed.' : undefined}
      secondaryAction={
        a.declined ? undefined : a.status === 'proposed' ? (
          <Button id={`${cardId}-cancel`} style="ghost" size="sm" label="Not now" onClick={() => patch({ declined: true })} />
        ) : done && spaceId ? (
          <Button
            id={`${cardId}-open`}
            style="ghost"
            size="sm"
            label={a.createdSpaceId ? 'Open in Builder' : 'Open space'}
            onClick={() => go(a.createdSpaceId ? { page: 'builder', spaceId } : { page: 'space', id: spaceId })}
          />
        ) : undefined
      }
      primaryAction={
        a.declined ? (
          <Button id={`${cardId}-again`} style="ghost" size="sm" label="Add it after all" onClick={() => patch({ declined: false })} />
        ) : a.status === 'proposed' ? (
          <Button id={`${cardId}-confirm`} size="sm" label="Confirm" onClick={confirm} />
        ) : done ? (
          <Button id={`${cardId}-undo`} style="ghost" size="sm" label="Undo" onClick={undo} />
        ) : undefined
      }
    />
  );
}

/* ── A turn ───────────────────────────────────────────────────────────────── */

function AssistantTurn({
  chatId,
  msg,
  streaming,
  compact,
  idPrefix,
}: {
  chatId: string;
  msg: RichMessage;
  streaming: boolean;
  compact?: boolean;
  idPrefix: string;
}) {
  const { text, isStreaming, isDone } = useStreamingText(msg.text, { enabled: streaming, charsPerTick: 3 });
  useEffect(() => {
    if (streaming && isDone) finishStreaming(msg.id);
  }, [streaming, isDone, msg.id]);
  const live = streaming && isStreaming;

  return (
    <ChatMessage from="assistant" avatar={<Glyph />}>
      <ChatBubble streaming={live}>{live ? text : msg.text}</ChatBubble>
      {!live && msg.kind === 'results' && msg.dashboardIds && <Results ids={msg.dashboardIds} compact={compact} idPrefix={idPrefix} />}
      {!live && msg.kind === 'requests' && msg.requestIds && <Requests ids={msg.requestIds} compact={compact} idPrefix={idPrefix} />}
      {!live && msg.kind === 'action' && <Action chatId={chatId} msg={msg} idPrefix={idPrefix} />}
      {!live && !compact && (
        <ChatMessageActions>
          <ChatMessageAction icon={Copy} label="Copy" copyValue={msg.text} />
        </ChatMessageActions>
      )}
    </ChatMessage>
  );
}

/* ── The conversation ─────────────────────────────────────────────────────── */

export type ConversationProps = {
  idPrefix: string;
  /** null = nothing asked yet: the greeting and the starters. */
  chatId: string | null;
  /** Told the new id the first time something is sent. */
  onChatId?: (id: string) => void;
  compact?: boolean;
  sendSize?: Size;
  /** Optional lifted draft, so it survives a move from mini to panel. */
  draft?: string;
  onDraft?: (v: string) => void;
  greeting?: string;
  /** `open` = links open a new tab (Aiden's own tab). Default `go`. */
  follow?: 'go' | 'open';
};

const DICTATED = ['Which dashboards cover servicing?', 'What’s happening with my requests?', 'Add Support Backlog to Weekly Ops Review'];
let dictation = 0;

export function Conversation({ idPrefix, chatId, onChatId, compact, sendSize = 'sm', draft, onDraft, greeting, follow = 'go' }: ConversationProps) {
  const { state, saveChat, update } = useSuite();
  const rt = useAidenRuntime();
  const [ownDraft, setOwnDraft] = useState('');
  const value = draft ?? ownDraft;
  const setValue = onDraft ?? setOwnDraft;
  const [recording, setRecording] = useState(false);
  const recTimer = useRef<number | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => window.clearTimeout(recTimer.current), []);

  const chat = chatId ? (state.aidenChats.find((c) => c.id === chatId) ?? null) : null;
  const pending = !!(chat && rt.pending[chat.id]);
  const streamingId = rt.streamingId;
  const busy = pending || (!!chat && chat.messages.some((m) => m.id === streamingId));

  const submit = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    const id = sendMessage(chat, text, { state, saveChat, update });
    setValue('');
    if (id !== chatId) onChatId?.(id);
  };

  const toggleDictation = () => {
    window.clearTimeout(recTimer.current);
    if (recording) return setRecording(false);
    setRecording(true);
    toast('Listening…', { id: 'aiden-dictation', description: 'Speak now. Aiden stops when you pause.', duration: 2000 });
    recTimer.current = window.setTimeout(() => {
      const phrase = DICTATED[dictation++ % DICTATED.length];
      setValue(value ? `${value} ${phrase}` : phrase);
      setRecording(false);
    }, 1800);
  };

  return (
    <FollowCtx.Provider value={follow}>
    <ChatLayout className="ds-aiden-conversation" density={compact ? 'compact' : 'balanced'}>
      <ChatLayoutBody>
        <ChatMessageList>
          {!chat ? (
            <ChatGreeting
              icon={<AidenSparkles gradient size={32} />}
              title="What can I help you find?"
              description={greeting ?? 'Ask about your dashboards, spaces or anything in DART Central.'}
            >
              <ChatSuggestions>
                {STARTERS.map((s) => (
                  <ChatSuggestion key={s} onClick={() => submit(s)}>
                    {s}
                  </ChatSuggestion>
                ))}
              </ChatSuggestions>
            </ChatGreeting>
          ) : (
            <>
              {chat.messages.map((m) =>
                m.from === 'user' ? (
                  <ChatMessage key={m.id} from="user">
                    <ChatBubble>{m.text}</ChatBubble>
                  </ChatMessage>
                ) : (
                  <AssistantTurn
                    key={m.id}
                    chatId={chat.id}
                    msg={asRich(m)}
                    streaming={m.id === streamingId}
                    compact={compact}
                    idPrefix={idPrefix}
                  />
                ),
              )}
              {pending && (
                <ChatMessage from="assistant" avatar={<Glyph />}>
                  <ChatBubble pending typingLabel="Aiden is thinking" />
                </ChatMessage>
              )}
            </>
          )}
        </ChatMessageList>
      </ChatLayoutBody>
      <ChatLayoutFooter>
        <ChatComposer
          id={`${idPrefix}-composer`}
          value={value}
          onValueChange={setValue}
          onSubmit={submit}
          isStreaming={busy}
          onStop={() => chat && stopReply(chat.id)}
        >
          <ChatComposerInput placeholder="Message Aiden…" aria-label="Message Aiden" />
          <ChatComposerActions>
            <button
              type="button"
              aria-label="Attach file"
              className="ui-icon-button ui-icon-button--fill ui-chat-composer__tool"
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip aria-hidden="true" />
            </button>
            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) toast.success(`Attached ${f.name}`, { description: 'Aiden will read it with your next message.' });
                e.target.value = '';
              }}
            />
            <ChatComposerDictation recording={recording} onClick={toggleDictation} />
            <ChatComposerDrawer id={`${idPrefix}-expand`} title="Message Aiden" />
            <ChatComposerSend id={`${idPrefix}-send`} size={sendSize} />
          </ChatComposerActions>
        </ChatComposer>
      </ChatLayoutFooter>
    </ChatLayout>
    </FollowCtx.Provider>
  );
}
