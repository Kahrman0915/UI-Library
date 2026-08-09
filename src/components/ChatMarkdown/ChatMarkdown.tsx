import { forwardRef, useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Code, { CodeBlock } from '../Code/Code';
import Blockquote from '../Blockquote/Blockquote';
import { ensureLanguages } from './languages';
import type { ChatMarkdownProps } from './ChatMarkdown.types';
import './ChatMarkdown.scss';

/**
 * Rendered markdown for a model reply — the one component allowed to import
 * the markdown/highlighting dependencies (see CLAUDE.md hard rule 1's scoped
 * exception, and `src/markdown.ts`: this is NOT exported from the main entry,
 * so apps that never render AI markdown never pay for it).
 *
 * XSS-safety is by construction, not by sanitizer:
 * - react-markdown builds a React tree — there is no HTML string render path,
 *   and raw HTML in the markdown stays inert text because `rehype-raw` is
 *   deliberately absent. Never add it.
 * - dangerous URL schemes (`javascript:` …) are stripped by react-markdown's
 *   default urlTransform.
 * - the single `dangerouslySetInnerHTML` below receives only
 *   `hljs.highlight()` output, which HTML-escapes its input.
 *
 * Everything renders through the library's own primitives — `Code`,
 * `CodeBlock`, `Blockquote` — so a reply looks like the design system, not
 * like a markdown stylesheet bolted onto it.
 */
const ChatMarkdown = forwardRef<HTMLDivElement, ChatMarkdownProps>(
  ({ id, children, components, codeBlockProps, className, ...rest }, ref) => {
    const merged = useMemo<Components>(() => {
      const hljs = ensureLanguages();

      const defaults: Components = {
        // Fences are handled here at the <pre> level, reading the UNRENDERED
        // hast node: its child <code> carries `language-x` in
        // properties.className and the raw source as its text child. Working
        // from the hast sidesteps the classic react-markdown problem of
        // telling inline code from fences after rendering (the `inline` prop
        // was removed in v9).
        pre({ node }) {
          const codeNode = node?.children?.[0];
          const props =
            codeNode && codeNode.type === 'element' ? codeNode.properties : undefined;
          const cls = Array.isArray(props?.className)
            ? props.className.join(' ')
            : String(props?.className ?? '');
          const language = /language-([\w+-]+)/.exec(cls)?.[1];
          const textNode =
            codeNode && codeNode.type === 'element' ? codeNode.children?.[0] : undefined;
          const raw =
            textNode && textNode.type === 'text'
              ? textNode.value.replace(/\n$/, '')
              : '';
          const line = node?.position?.start.line ?? 0;

          const canHighlight = language && hljs.getLanguage(language);
          return (
            <CodeBlock
              id={`${id}-code-L${line}`}
              // `code` is the COPY payload (always the raw source);
              // `children` is the display. CodeBlock was built with exactly
              // this split.
              code={raw}
              language={language}
              filename={language}
              showCopy={codeBlockProps?.showCopy}
              className="ui-chat-markdown__block"
            >
              {canHighlight ? (
                <span
                  // hljs.highlight HTML-escapes its input — see the header note.
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(raw, { language }).value,
                  }}
                />
              ) : (
                raw
              )}
            </CodeBlock>
          );
        },
        // Only inline code ever reaches the DOM through this — fenced content
        // is consumed by `pre` above, which ignores its rendered children.
        code({ children: kids }) {
          return <Code>{kids}</Code>;
        },
        blockquote({ children: kids }) {
          return <Blockquote>{kids}</Blockquote>;
        },
        a({ href, children: kids }) {
          return (
            // Model-emitted links leave the app; new tab + the rel pair is the
            // safe default. Consumers routing internally override `a`.
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-chat-markdown__link"
            >
              {kids}
            </a>
          );
        },
      };
      return { ...defaults, ...components };
    }, [id, components, codeBlockProps?.showCopy]);

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-chat-markdown${className ? ' ' + className : ''}`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={merged}>
          {children}
        </ReactMarkdown>
      </div>
    );
  },
);

ChatMarkdown.displayName = 'ChatMarkdown';

export default ChatMarkdown;
