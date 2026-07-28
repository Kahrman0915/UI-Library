import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Button } from '../../src/index';
import './docs.scss';

/**
 * The code half of an example block: a three-line strip that expands into a
 * scrolling pane, with the toggle floating over the code itself.
 *
 * Printing every story's source in full made pages 17,000px tall — you scrolled
 * past hundreds of lines of JSX to reach the next example, and page length was
 * set by how verbose a snippet happened to be rather than by how much there was
 * to read. Collapsed, this shows just enough to recognise the snippet;
 * expanded, it caps its height and scrolls inside itself, so the page never
 * grows past a predictable length.
 *
 * Renders its own line-number gutter. Storybook's `<Source>` emits one
 * `<pre>` of highlighted text with no per-line elements, so a CSS counter has
 * nothing to count — but the block is `white-space: pre` on a fixed line
 * height, so numbering it is just "count the newlines and stack them at the
 * same leading". See `.ui-docs-code__gutter` in docs.scss for the alignment.
 */
export function CodePane({
  children,
  collapsible = true,
}: {
  children: ReactNode;
  /**
   * `false` drops the collapsed state and the toggle, leaving a height-capped
   * scrolling pane.
   */
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const viewportId = `${id}-code`;
  const expanded = open || !collapsible;

  // `<Source>` resolves its snippet asynchronously, and re-renders when the
  // mode flips, so the line count has to be observed rather than read once.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const measure = () => {
      const pre = node.querySelector('pre');
      const text = pre?.textContent ?? '';
      setLineCount(text ? text.replace(/\n$/, '').split('\n').length : 0);
    };

    measure();
    const observer = new MutationObserver(measure);
    observer.observe(node, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`ui-docs-code${expanded ? ' ui-docs-code--open' : ''}`}>
      <div className="ui-docs-code__viewport" id={viewportId} ref={viewportRef}>
        <div className="ui-docs-code__gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        {children}
      </div>
      {collapsible ? (
        <>
          <div className="ui-docs-code__fade" aria-hidden="true" />
          <Button
            id={`${id}-toggle`}
            size="small"
            style="outline"
            label={open ? 'Collapse' : 'View Code'}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={viewportId}
            className="ui-docs-code__toggle"
          />
        </>
      ) : null}
    </div>
  );
}
