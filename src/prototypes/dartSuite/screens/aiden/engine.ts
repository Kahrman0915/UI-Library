/* ── Aiden · the canned-reply engine and the reply runtime ─────────────────────
   No network. A reply is built deterministically from what the user typed and
   what is in the store at that moment, so the conversation does real things:
   it finds dashboards that exist, proposes adding one to a space you have, and
   reads back YOUR requests.

   The store's AidenMessage only carries text. Rich turns (result rows, an
   action card, request rows) ride along as extra fields on the same object —
   `RichMessage` — which the store keeps untouched because it deep-copies
   whatever it is given. That is what lets a conversation started in the mini
   window show the same result rows in the panel and in its own tab.

   The runtime (pending dots, the streaming reveal) is module-level rather than
   component state, because the SAME conversation moves between surfaces — the
   mini unmounts when the panel mounts — and a reply that is on its way must
   not be lost in that move. */

import { useSyncExternalStore } from 'react';
import type { ChatActionStatus } from '../../../../components/Chat';
import { ME } from '../../data';
import { requesterStatus } from '../../store';
import type { SuiteState } from '../../store';
import type { AidenChat, AidenMessage, Dashboard } from '../../types';

/* ── Rich messages ────────────────────────────────────────────────────────── */

export type AidenAction = {
  dashboardId: string;
  /** Add to this existing space… */
  spaceId?: string;
  /** …or create a new one with this name. */
  newSpaceName?: string;
  /** Filled in once a new space has been created, so Undo can delete it. */
  createdSpaceId?: string;
  status: ChatActionStatus;
  /** "Not now" was pressed — nothing changed. */
  declined?: boolean;
};

export type RichMessage = AidenMessage & {
  kind?: 'text' | 'results' | 'action' | 'requests';
  dashboardIds?: string[];
  requestIds?: string[];
  action?: AidenAction;
};

export const asRich = (m: AidenMessage) => m as RichMessage;

let seq = 0;
export const mid = () => `am-${Date.now().toString(36)}-${(seq++).toString(36)}`;
export const newChatId = () => `chat-${Date.now().toString(36)}-${(seq++).toString(36)}`;

export const titleFrom = (text: string) => {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.length > 48 ? `${t.slice(0, 47)}…` : t;
};

/** The starters, on every first-run surface. Scoped to what the engine can answer. */
export const STARTERS = [
  'Which dashboards cover collections?',
  'What does promise-to-pay measure?',
  'What did my team open this week?',
];

/* ── Matching ─────────────────────────────────────────────────────────────── */

const STOP = new Set(
  'which what where when does dashboard dashboards cover covers about show find have with this that there their these those from into your mine please could would should tell give list most some anything something measure measures open opened track tracks the and for any all are can see'.split(
    ' ',
  ),
);

const stem = (w: string) => w.replace(/ies$/, 'y').replace(/s$/, '');

const keywords = (text: string) =>
  [...new Set(text.toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 4 && !STOP.has(w)).map(stem))];

const search = (dashboards: Dashboard[], text: string) => {
  const keys = keywords(text);
  if (!keys.length) return [];
  return dashboards
    .filter((d) => d.lifecycle === 'published')
    .map((d) => {
      const name = d.name.toLowerCase();
      const desc = d.description.toLowerCase();
      const cat = d.category.toLowerCase();
      const score = keys.reduce((s, k) => s + (name.includes(k) ? 3 : 0) + (cat.includes(k) ? 2 : 0) + (desc.includes(k) ? 1 : 0), 0);
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.d.views - a.d.views)
    .map((x) => x.d);
};

const lastResults = (history: AidenMessage[]) => {
  for (let i = history.length - 1; i >= 0; i--) {
    const m = asRich(history[i]);
    if (m.dashboardIds?.length) return m.dashboardIds;
  }
  return [];
};

/* ── The reply ────────────────────────────────────────────────────────────── */

export function buildReply(text: string, state: SuiteState, history: AidenMessage[]): RichMessage {
  const q = text.toLowerCase();
  const id = mid();
  const say = (t: string, extra: Partial<RichMessage> = {}): RichMessage => ({ id, from: 'assistant', text: t, kind: 'text', ...extra });

  // 1 · "Add … to a space" — propose, never just do.
  if (/\badd\b/.test(q) && /\bspaces?\b/.test(q)) {
    const named = state.dashboards.find((d) => q.includes(d.name.toLowerCase()));
    const referred = /\b(closest|first|top|that|it|this|one)\b/.test(q) ? state.dashboards.find((d) => d.id === lastResults(history)[0]) : undefined;
    const dash = named ?? referred ?? search(state.dashboards, text)[0];
    if (!dash) {
      return say('Which dashboard should I add? Name it — for example “Add Support Backlog to Weekly Ops Review” — or ask me to find one first.');
    }
    const space = state.spaces.filter((s) => !s.shared).find((s) => q.includes(s.name.toLowerCase()));
    if (space?.items.some((i) => i.dashboardId === dash.id)) {
      return say(`${dash.name} is already in ${space.name}, so there is nothing to add.`);
    }
    const newSpaceName = space ? undefined : dash.name.split(' ')[0];
    return say('One step before I do it:', {
      kind: 'action',
      action: { dashboardId: dash.id, spaceId: space?.id, newSpaceName, status: 'proposed' },
    });
  }

  // 2 · Your requests.
  if (/\brequests?\b/.test(q)) {
    const mine = state.requests.filter((r) => r.requesterId === ME.id);
    const open = mine.filter((r) => requesterStatus(r.status).group !== 'done');
    const reply = open.filter((r) => requesterStatus(r.status).group === 'reply');
    const order = { reply: 0, review: 1, active: 2, done: 3 } as const;
    const rows = [...open].sort((a, b) => order[requesterStatus(a.status).group] - order[requesterStatus(b.status).group]).slice(0, 4);
    if (!open.length) return say(`You have ${mine.length} requests and none are open. Start a new one from My Requests.`, { kind: 'requests', requestIds: [] });
    const head = `You have ${open.length} open request${open.length === 1 ? '' : 's'}`;
    const tail = reply.length
      ? ` — ${reply.length} ${reply.length === 1 ? 'needs' : 'need'} your reply, so ${reply.length === 1 ? 'that one is' : 'those are'} first.`
      : ', and none are waiting on you.';
    return say(head + tail, { kind: 'requests', requestIds: rows.map((r) => r.id) });
  }

  // 3 · A definition.
  if (/promise.to.pay/.test(q)) {
    return say(
      'Promise-to-pay is the share of contacted accounts that commit to a payment date, and how many of those promises are kept. It lives on Collections Performance, split by queue and agent.',
      { kind: 'results', dashboardIds: ['collections-performance'] },
    );
  }

  // 4 · What the team is opening.
  if (/\bteam\b|this week|popular|most (used|viewed)/.test(q)) {
    const top = [...state.dashboards].filter((d) => d.hasAccess && d.lifecycle === 'published').sort((a, b) => b.views - a.views).slice(0, 3);
    return say('Your team opened these most this week — most viewed first.', { kind: 'results', dashboardIds: top.map((d) => d.id) });
  }

  // 5 · Find dashboards.
  const found = search(state.dashboards, text).slice(0, 3);
  if (found.length) {
    const n = found.length;
    return say(n === 1 ? 'One does:' : `${n === 2 ? 'Two' : 'Three'} do — closest first.`, { kind: 'results', dashboardIds: found.map((d) => d.id) });
  }
  if (/dashboard|report|metric/.test(q)) {
    return say('I couldn’t find a dashboard about that. Try other words, or open Browse to look through all of them.');
  }

  // 6 · Anything else.
  return say(
    'I can find dashboards, explain what they measure, add them to your spaces, and check on your requests. Try “Which dashboards cover servicing?” or “What’s happening with my requests?”',
  );
}

/* ── Runtime: pending dots + the streaming reveal ─────────────────────────── */

type Runtime = { pending: Record<string, boolean>; streamingId: string | null };

let rt: Runtime = { pending: {}, streamingId: null };
const listeners = new Set<() => void>();
const timers = new Map<string, number>();
const set = (next: Partial<Runtime>) => {
  rt = { ...rt, ...next };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

export const useAidenRuntime = () => useSyncExternalStore(subscribe, () => rt);

export const finishStreaming = (msgId: string) => {
  if (rt.streamingId === msgId) set({ streamingId: null });
};

export type SendDeps = {
  state: SuiteState;
  saveChat: (c: AidenChat) => void;
  update: (fn: (d: SuiteState) => void) => void;
};

/**
 * Append the user's turn now, the reply after a short think. Returns the chat
 * id — a new one when `chat` is null.
 */
export function sendMessage(chat: AidenChat | null, text: string, { state, saveChat, update }: SendDeps): string {
  const user: RichMessage = { id: mid(), from: 'user', text };
  const base: AidenChat = chat
    ? { ...chat, messages: [...chat.messages, user], updatedAt: 'Just now' }
    : { id: newChatId(), title: titleFrom(text), messages: [user], updatedAt: 'Just now' };
  saveChat(base);

  const reply = buildReply(text, state, base.messages);
  const chatId = base.id;
  set({ pending: { ...rt.pending, [chatId]: true }, streamingId: null });
  timers.set(
    chatId,
    window.setTimeout(() => {
      timers.delete(chatId);
      // Append through the draft, not by overwriting the chat: an action card
      // on an earlier turn may have changed while Aiden was thinking.
      update((d) => {
        const c = d.aidenChats.find((x) => x.id === chatId);
        if (c) {
          c.messages.push(reply);
          c.updatedAt = 'Just now';
        }
      });
      const pending = { ...rt.pending };
      delete pending[chatId];
      set({ pending, streamingId: reply.id });
      // Belt and braces: if no surface is showing this chat, nothing will ever
      // report the reveal finished, and the composer would stay on Stop.
      window.setTimeout(() => finishStreaming(reply.id), (reply.text.length / 3) * 20 + 600);
    }, 800),
  );
  return chatId;
}

/** The Stop button: drop a reply still being thought about, or finish the reveal. */
export function stopReply(chatId: string) {
  const t = timers.get(chatId);
  if (t) {
    window.clearTimeout(t);
    timers.delete(chatId);
    const pending = { ...rt.pending };
    delete pending[chatId];
    set({ pending });
    return;
  }
  set({ streamingId: null });
}

/** Patch one message's action in place (Confirm, Undo, Not now). */
export const patchAction = (
  update: SendDeps['update'],
  chatId: string,
  msgId: string,
  patch: Partial<AidenAction>,
) =>
  update((d) => {
    const m = d.aidenChats.find((c) => c.id === chatId)?.messages.find((x) => x.id === msgId) as RichMessage | undefined;
    if (m?.action) m.action = { ...m.action, ...patch };
  });
