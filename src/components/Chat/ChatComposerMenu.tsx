import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useMounted } from '#/hooks/useMounted';
import { useFloatingReposition } from '#/hooks/useFloatingReposition';
import { computePosition } from '#/utils/computePosition';
import { useChatComposerContext } from './Chat.context';
import type {
  ChatComposerMenuItem,
  ChatComposerMenuProps,
} from './Chat.types';
// Styling note: the popup reuses Command's surface and item classes
// (.ui-command, .ui-command__item …) the way Pagination reuses .ui-button —
// class-level reuse, so the menu-item styling copy count STAYS AT FOUR.
// Command's logic is not reused: its active item is internal to its own
// keyboard model, and this menu's keys arrive via the composer's interceptor.
import '../Command/Command.scss';

type ActiveToken = {
  trigger: '/' | '@';
  query: string;
  /** Index of the trigger char in the composer value. */
  start: number;
  /** Caret position (exclusive end of the token). */
  end: number;
};

/**
 * Slash-command / @mention menu for the composer. Type `/` at the start of a
 * message or `@` at the start of any word and the menu opens above the
 * composer, filtering as you type; ↑↓ move, Enter or Tab insert, Escape
 * dismisses (until the token changes).
 *
 * MVP scope, deliberately: the token is plain text (no rich pills), the menu
 * anchors to the composer box (no caret-pixel tracking), and items are a
 * static list (no async loading). Each is a recorded deferral, not an
 * oversight.
 *
 * Renders nothing until a trigger token is live under the caret. The keyboard
 * runs through `ChatComposerContext.registerKeyInterceptor`, so the textarea
 * keeps focus the whole time and Enter-sends is suppressed while the menu is
 * open.
 */
const ChatComposerMenu = forwardRef<HTMLDivElement, ChatComposerMenuProps>(
  (
    {
      id,
      slashItems,
      mentionItems,
      onSelect,
      emptyLabel = 'No matches',
      className,
    },
    ref,
  ) => {
    const { value, onValueChange, inputRef, registerKeyInterceptor } =
      useChatComposerContext();
    const mounted = useMounted();
    const autoId = useId();
    const menuId = id ?? `chat-composer-menu-${autoId}`;

    const [token, setToken] = useState<ActiveToken | null>(null);
    const [selected, setSelected] = useState(0);
    // Escape parks the menu until the token itself changes.
    const dismissedRef = useRef<string | null>(null);
    const surfaceRef = useRef<HTMLDivElement | null>(null);

    // ── token detection — on every value change and caret move ──────────────
    const detect = useCallback(() => {
      const el = inputRef.current;
      if (!el || document.activeElement !== el) return setToken(null);
      const caret = el.selectionStart ?? 0;
      if (el.selectionEnd !== caret) return setToken(null); // a range, not a caret
      const before = value.slice(0, caret);
      const wsIdx = Math.max(
        before.lastIndexOf(' '),
        before.lastIndexOf('\n'),
        before.lastIndexOf('\t'),
      );
      const start = wsIdx + 1;
      const tokenText = before.slice(start);
      const trigger = tokenText[0];
      const isSlash = trigger === '/' && start === 0 && !!slashItems?.length;
      const isMention = trigger === '@' && !!mentionItems?.length;
      if (!isSlash && !isMention) return setToken(null);
      const next: ActiveToken = {
        trigger: trigger as '/' | '@',
        query: tokenText.slice(1),
        start,
        end: caret,
      };
      const key = `${next.trigger}${next.start}`;
      if (dismissedRef.current === key && next.query === '') return setToken(null);
      if (dismissedRef.current && dismissedRef.current !== key)
        dismissedRef.current = null;
      setToken(next);
    }, [value, inputRef, slashItems, mentionItems]);

    useEffect(() => {
      detect();
    }, [detect]);

    // Caret moves without value changes (arrow-left, click) need their own ear.
    useEffect(() => {
      const onSelectionChange = () => detect();
      document.addEventListener('selectionchange', onSelectionChange);
      return () =>
        document.removeEventListener('selectionchange', onSelectionChange);
    }, [detect]);

    // ── filtering ────────────────────────────────────────────────────────────
    const items = useMemo(() => {
      if (!token) return [];
      const source = token.trigger === '/' ? slashItems ?? [] : mentionItems ?? [];
      const q = token.query.toLowerCase();
      if (!q) return source;
      return source.filter((i) =>
        [i.value, i.label, ...(i.keywords ?? [])].some((k) =>
          k.toLowerCase().includes(q),
        ),
      );
    }, [token, slashItems, mentionItems]);

    // Clamp the highlight when the filter shrinks the list.
    useEffect(() => {
      setSelected((s) => Math.min(s, Math.max(0, items.length - 1)));
    }, [items.length]);
    // A fresh token starts at the top.
    const tokenKey = token ? `${token.trigger}${token.start}` : '';
    useEffect(() => {
      setSelected(0);
    }, [tokenKey]);

    const open = token !== null;

    // ── insert ───────────────────────────────────────────────────────────────
    const choose = useCallback(
      (item: ChatComposerMenuItem) => {
        if (!token) return;
        const insert =
          item.insertText ?? `${token.trigger}${item.value} `;
        const next =
          value.slice(0, token.start) + insert + value.slice(token.end);
        onValueChange?.(next);
        dismissedRef.current = null;
        setToken(null);
        // Restore the caret after React commits the new value.
        const el = inputRef.current;
        const pos = token.start + insert.length;
        requestAnimationFrame(() => {
          el?.focus();
          el?.setSelectionRange(pos, pos);
        });
        onSelect?.(item, { trigger: token.trigger, query: token.query });
      },
      [token, value, onValueChange, inputRef, onSelect],
    );

    // ── keyboard, via the composer's interceptor ────────────────────────────
    useEffect(() => {
      if (!open) return;
      return registerKeyInterceptor((e) => {
        switch (e.key) {
          case 'ArrowDown':
            setSelected((s) => (items.length ? (s + 1) % items.length : 0));
            return true;
          case 'ArrowUp':
            setSelected((s) =>
              items.length ? (s - 1 + items.length) % items.length : 0,
            );
            return true;
          case 'Enter':
          case 'Tab':
            if (items[selected]) choose(items[selected]);
            else setToken(null);
            return true;
          case 'Escape':
            dismissedRef.current = tokenKey;
            setToken(null);
            return true;
          default:
            return false;
        }
      });
    }, [open, items, selected, choose, registerKeyInterceptor, tokenKey]);

    // ── positioning — above the composer box, matching its width ────────────
    const reposition = useCallback(() => {
      const anchor = inputRef.current?.closest('.ui-chat-composer__box');
      const surface = surfaceRef.current;
      if (!anchor || !surface) return;
      const a = anchor.getBoundingClientRect();
      surface.style.width = `${Math.round(a.width)}px`;
      const { top, left } = computePosition(
        a,
        surface.getBoundingClientRect(),
        'top',
        'start',
        8,
      );
      surface.style.top = `${top}px`;
      surface.style.left = `${left}px`;
    }, [inputRef]);
    useEffect(() => {
      if (open) reposition();
    }, [open, items.length, reposition]);
    useFloatingReposition(open, reposition, inputRef.current);

    if (!open || !mounted) return null;

    return createPortal(
      <div
        ref={(node) => {
          surfaceRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
        }}
        id={menuId}
        role="listbox"
        aria-label={token?.trigger === '/' ? 'Commands' : 'Mentions'}
        className={`ui-command ui-chat-composer-menu${className ? ' ' + className : ''}`}
      >
        <div className="ui-command__list" role="presentation">
          {items.length === 0 && (
            <div className="ui-command__empty">{emptyLabel}</div>
          )}
          {items.map((item, i) => (
            <div
              key={item.value}
              id={`${menuId}-option-${i}`}
              role="option"
              aria-selected={i === selected}
              data-active={i === selected ? '' : undefined}
              className="ui-command__item"
              // preventDefault so the textarea never loses focus on click.
              onMouseDown={(e) => {
                e.preventDefault();
                choose(item);
              }}
              onMouseEnter={() => setSelected(i)}
            >
              {item.icon}
              <span className="ui-chat-composer-menu__labels">
                <span className="ui-chat-composer-menu__label">{item.label}</span>
                {item.description && (
                  <span className="ui-chat-composer-menu__description">
                    {item.description}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>,
      document.body,
    );
  },
);

ChatComposerMenu.displayName = 'ChatComposerMenu';

export default ChatComposerMenu;
