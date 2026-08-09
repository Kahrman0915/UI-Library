import type { Components } from 'react-markdown';

export type ChatMarkdownProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  /** Seeds the ids of the code blocks inside (`${id}-code-L{line}`). */
  id: string;
  /** The markdown source — a model reply, streamed or complete. */
  children: string;
  /**
   * Escape hatch: override or extend the tag→component map. Merged over the
   * defaults, so overriding `a` keeps the library's `code`/`table`/… intact.
   */
  components?: Components;
  /**
   * Forwarded to every fenced-code `CodeBlock` — e.g. `{ showCopy: false }`
   * while a reply is still streaming.
   */
  codeBlockProps?: {
    showCopy?: boolean;
  };
  className?: string;
};
