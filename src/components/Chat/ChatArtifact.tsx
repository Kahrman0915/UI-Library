import { forwardRef } from 'react';
import { Copy, Download, ExternalLink, FileText, X } from 'lucide-react';
import Badge from '../Badge/Badge';
import ChatMessageAction from './ChatMessageAction';
import type {
  ChatArtifactProps,
  ChatArtifactCardProps,
} from './Chat.types';

/**
 * The artifact panel — a document Aiden produced, rendered beside the
 * conversation. v1 is deliberately minimal: a titled surface with header
 * actions and a content slot. No versioning, no editing, no tabs — each is a
 * recorded deferral.
 *
 * The body is `children`: drop in a `ChatMarkdown` (via `@ui/lib/markdown`),
 * a `CodeBlock`, or anything else. The copy action copies `copyValue` — keep
 * it the SOURCE (markdown, code), not rendered text.
 */
const ChatArtifact = forwardRef<HTMLDivElement, ChatArtifactProps>(
  (
    {
      id,
      title,
      badge,
      copyValue,
      downloadHref,
      downloadName,
      onOpen,
      onClose,
      children,
      footer,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <section
        {...rest}
        ref={ref}
        id={id}
        aria-labelledby={`${id}-title`}
        className={`ui-chat-artifact${className ? ' ' + className : ''}`}
      >
        <header className="ui-chat-artifact__header">
          <h3 id={`${id}-title`} className="ui-chat-artifact__title">
            {title}
          </h3>
          {badge && <Badge id={`${id}-badge`} color="default" appearance="outline" label={badge} />}
          <div className="ui-chat-artifact__actions">
            {copyValue !== undefined && (
              <ChatMessageAction icon={Copy} label="Copy contents" copyValue={copyValue} />
            )}
            {downloadHref && (
              // A real <a download>, not a button faking one — the browser
              // owns the download. Icon-button shell classes, Pagination-style
              // class reuse.
              <a
                href={downloadHref}
                download={downloadName}
                className="ui-icon-button ui-icon-button--fill ui-chat-action"
                aria-label="Download"
              >
                <Download aria-hidden="true" />
              </a>
            )}
            {onOpen && (
              <ChatMessageAction icon={ExternalLink} label="Open in new window" onClick={onOpen} />
            )}
            {onClose && (
              <ChatMessageAction icon={X} label="Close artifact" onClick={onClose} />
            )}
          </div>
        </header>
        <div className="ui-chat-artifact__body">{children}</div>
        {footer && <footer className="ui-chat-artifact__footer">{footer}</footer>}
      </section>
    );
  },
);

ChatArtifact.displayName = 'ChatArtifact';

/** The inline card in the transcript that opens an artifact. Momentary. */
const ChatArtifactCard = forwardRef<HTMLButtonElement, ChatArtifactCardProps>(
  ({ title, description, icon, className, ...rest }, ref) => (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={`ui-chat-artifact-card${className ? ' ' + className : ''}`}
    >
      <span className="ui-chat-artifact-card__icon">
        {icon ?? <FileText aria-hidden="true" />}
      </span>
      <span className="ui-chat-artifact-card__text">
        <span className="ui-chat-artifact-card__title">{title}</span>
        {description && (
          <span className="ui-chat-artifact-card__description">{description}</span>
        )}
      </span>
    </button>
  ),
);

ChatArtifactCard.displayName = 'ChatArtifactCard';

export default ChatArtifact;
export { ChatArtifactCard };
