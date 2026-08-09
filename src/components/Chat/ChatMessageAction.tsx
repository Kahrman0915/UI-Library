import { forwardRef, useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import type { ChatMessageActionProps } from './Chat.types';
// Chat.scss (imported by Chat.tsx) owns this part's styles; icon-button.scss
// arrives the same way. Importing Chat.scss here too would be harmless (Vite
// dedupes), but the family convention is one stylesheet import at the root.

/**
 * One action in a `ChatMessageActions` row — copy, regenerate, thumbs up/down.
 *
 * The stories used to hand-roll these as raw `ui-button` class strings, which
 * meant every consumer would have re-invented the copy timer and the pressed
 * state. This is the shipped version: the shared `.ui-icon-button` shell, an
 * optional `aria-pressed` toggle shape, and `CodeBlock`'s exact
 * copy-with-check-swap behaviour behind a single `copyValue` prop.
 */
const ChatMessageAction = forwardRef<HTMLButtonElement, ChatMessageActionProps>(
  ({ icon: Icon, label, active, copyValue, onClick, className, ...rest }, ref) => {
    const [copied, setCopied] = useState(false);
    const copyTimer = useRef<number | undefined>(undefined);

    // Clear the pending reset on unmount — a bare setTimeout would fire a
    // state update on a dead component if the row unmounts within 2s.
    useEffect(() => () => window.clearTimeout(copyTimer.current), []);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (copyValue !== undefined) {
        try {
          await navigator.clipboard.writeText(copyValue);
          setCopied(true);
          window.clearTimeout(copyTimer.current);
          copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard blocked (insecure context / permissions) — no-op.
        }
      }
      onClick?.(e);
    };

    const Glyph = copied ? Check : Icon;

    return (
      <button
        {...rest}
        ref={ref}
        type="button"
        className={`ui-icon-button ui-icon-button--fill ui-chat-action${
          active ? ' ui-chat-action--active' : ''
        }${className ? ' ' + className : ''}`}
        // aria-pressed only when the action IS a toggle — a momentary copy
        // button announcing "not pressed" would be noise.
        aria-pressed={active === undefined ? undefined : active}
        aria-label={copied ? 'Copied' : label}
        onClick={handleClick}
      >
        <Glyph aria-hidden="true" />
      </button>
    );
  },
);

ChatMessageAction.displayName = 'ChatMessageAction';

export default ChatMessageAction;
