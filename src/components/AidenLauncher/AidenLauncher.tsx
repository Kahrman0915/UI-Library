import { forwardRef, useState } from 'react';
import {
  ChatComposer,
  ChatComposerActions,
  ChatComposerInput,
  ChatComposerSend,
  ChatGreeting,
  ChatSuggestion,
  ChatSuggestions,
} from '../Chat';
import type { AidenLauncherProps } from './AidenLauncher.types';
import './AidenLauncher.scss';

/**
 * The embedded ask — Aiden's doorway on a sub-application's home screen.
 *
 * Named during the DART Central build: the block that LOOKS like a chat but
 * is not one — no transcript exists yet, and submitting NAVIGATES (into the
 * panel, the full screen, a route) rather than appending a message. That
 * navigation is the consumer's `onSubmit`; the launcher never routes.
 *
 * Composes the real parts — `ChatGreeting`, `ChatComposer` family,
 * `ChatSuggestions` — so the doorway and the destination are visibly the
 * same product. Self-applies `data-surface="aiden"`. It is the one Chat-family
 * surface that owns its own draft by default (it is one-shot); pass
 * `value`/`onValueChange` to control it, e.g. to clear after navigating.
 */
const AidenLauncher = forwardRef<HTMLDivElement, AidenLauncherProps>(
  (
    {
      id,
      title,
      description,
      icon,
      placeholder = 'Ask anything…',
      suggestions,
      onSubmit,
      disabled,
      value: valueProp,
      onValueChange,
      className,
      ...rest
    },
    ref,
  ) => {
    const [inner, setInner] = useState('');
    const controlled = valueProp !== undefined;
    const value = controlled ? valueProp : inner;
    const setValue = (v: string) => {
      if (!controlled) setInner(v);
      onValueChange?.(v);
    };

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        data-surface="aiden"
        className={`ui-aiden-launcher${className ? ' ' + className : ''}`}
      >
        <ChatGreeting title={title} description={description} icon={icon} />
        <ChatComposer
          id={`${id}-composer`}
          value={value}
          onValueChange={setValue}
          onSubmit={onSubmit}
          disabled={disabled}
        >
          <ChatComposerInput placeholder={placeholder} aria-label={placeholder} />
          <ChatComposerActions>
            <ChatComposerSend id={`${id}-send`} />
          </ChatComposerActions>
        </ChatComposer>
        {suggestions && suggestions.length > 0 && (
          <ChatSuggestions className="ui-aiden-launcher__suggestions">
            {suggestions.map((s) => (
              <ChatSuggestion
                key={s}
                disabled={disabled}
                onClick={() => onSubmit(s)}
              >
                {s}
              </ChatSuggestion>
            ))}
          </ChatSuggestions>
        )}
      </div>
    );
  },
);

AidenLauncher.displayName = 'AidenLauncher';

export default AidenLauncher;
