import { forwardRef } from 'react';
import type { ChatLayoutAsideProps } from './Chat.types';

/**
 * The split-view region beside the transcript — where a `ChatArtifact`
 * renders. Place it as a SIBLING of `ChatLayoutBody`/`Footer` inside
 * `ChatLayout`; the layout notices it via `:has()` and becomes a two-column
 * grid, transcript + composer left, aside right, full height.
 *
 * Hidden under 768px by the stylesheet — on a phone, swap the artifact into a
 * `Drawer` instead (the Sidebar-below-768 precedent).
 */
const ChatLayoutAside = forwardRef<HTMLDivElement, ChatLayoutAsideProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-chat-layout__aside${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

ChatLayoutAside.displayName = 'ChatLayoutAside';

export default ChatLayoutAside;
