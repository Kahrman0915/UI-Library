import { forwardRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import Button from '#components/Button/Button';
import type { CodeProps, CodeBlockProps } from './Code.types';
import './Code.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Code — inline <code>.
// ═════════════════════════════════════════════════════════════════════════════

const Code = forwardRef<HTMLElement, CodeProps>(
  ({ className, children, ...rest }, ref) => (
    <code
      {...rest}
      ref={ref}
      className={`ui-code${className ? ' ' + className : ''}`}
    >
      {children}
    </code>
  ),
);

Code.displayName = 'Code';

// ═════════════════════════════════════════════════════════════════════════════
// CodeBlock — <pre> with an optional filename header and copy button.
// No syntax highlighting (that would need a dependency).
// ═════════════════════════════════════════════════════════════════════════════

const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    { id, code, filename, language, showCopy = true, className, children, ...rest },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);

    // Prefer `code`; fall back to a string child for the clipboard payload.
    const text = code ?? (typeof children === 'string' ? children : '');

    const copy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard blocked (insecure context / permissions) — no-op.
      }
    };

    const hasFilename = filename !== undefined && filename !== null && filename !== '';
    const hasHeader = hasFilename || showCopy;

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        data-language={language}
        className={`ui-code-block${className ? ' ' + className : ''}`}
      >
        {hasHeader && (
          <div className="ui-code-block__header">
            {hasFilename && (
              <span className="ui-code-block__filename">{filename}</span>
            )}
            {showCopy && (
              <Button
                id={`${id}-copy`}
                iconOnly
                size="xsmall"
                style="ghost"
                IconCenter={copied ? Check : Copy}
                aria-label={copied ? 'Copied' : 'Copy code'}
                onClick={copy}
                className="ui-code-block__copy"
              />
            )}
          </div>
        )}
        <pre className="ui-code-block__pre">
          <code className="ui-code-block__code">{children ?? code}</code>
        </pre>
      </div>
    );
  },
);

CodeBlock.displayName = 'CodeBlock';

export default Code;
export { CodeBlock };
