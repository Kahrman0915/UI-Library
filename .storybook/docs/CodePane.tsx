import { useId, useState, type ReactNode } from 'react';
import { Button } from '../../src/index';
import './docs.scss';

/**
 * A code block that shows a few lines, then expands into a scrollable pane.
 *
 * Some of our stories are long (Button's `AllVariants` is a nested loop), and a
 * page that prints every one of them in full is unreadable — the reader scrolls
 * past hundreds of lines of source to reach the next example. Collapsed by
 * default with a fade and a "View code" button; expanded it caps at a fixed
 * height and scrolls inside itself, so the page length never depends on how
 * long any single snippet is.
 *
 * The fade needs to match the code surface exactly, so this owns the surface:
 * `docs.scss` makes Storybook's `.docblock-source` transparent and paints
 * `--card` on the wrapper instead. That also puts the code on the same surface
 * as the preview stage above it.
 */
export function CodePane({
  children,
  collapsible = true,
}: {
  children: ReactNode;
  /**
   * `false` drops the collapsed state and the toggle entirely, leaving a
   * height-capped scrolling pane. For the Preview tab's Code panel, where
   * switching to the tab *is* the reveal and a "Hide code" button would be
   * asking the reader to undo the thing they just asked for.
   */
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const viewportId = `${id}-code`;
  const expanded = open || !collapsible;

  return (
    <div className={`ui-docs-code${expanded ? ' ui-docs-code--open' : ''}`}>
      <div className="ui-docs-code__viewport" id={viewportId}>
        {children}
      </div>
      {collapsible ? (
        <>
          {open ? null : (
            <div className="ui-docs-code__fade" aria-hidden="true" />
          )}
          <div className="ui-docs-code__bar">
            <Button
              id={`${id}-toggle`}
              size="xsmall"
              style="outline"
              label={open ? 'Hide code' : 'View code'}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={viewportId}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
