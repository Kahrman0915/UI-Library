import { forwardRef } from 'react';
import type { ChatDisclaimerProps } from './Chat.types';

/**
 * The one-line caveat under the composer — "Aiden can make mistakes. Verify
 * important information."
 *
 * Trivial by design (no required `id`, like AspectRatio): it is a paragraph
 * with the right type ramp, nothing more. The copy is required rather than
 * baked in because the wording is a product decision, not a library one.
 */
const ChatDisclaimer = forwardRef<HTMLParagraphElement, ChatDisclaimerProps>(
  ({ children, className, ...rest }, ref) => (
    <p
      {...rest}
      ref={ref}
      className={`ui-chat-disclaimer${className ? ' ' + className : ''}`}
    >
      {children}
    </p>
  ),
);

ChatDisclaimer.displayName = 'ChatDisclaimer';

export default ChatDisclaimer;
