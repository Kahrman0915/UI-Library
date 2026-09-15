import { Children, forwardRef, useEffect, useState } from 'react';
import { TAB_BAR_DRAG_TYPE } from '../TabBar/TabBar.constants';
import type { SplitViewPaneProps, SplitViewProps, SplitViewSide } from './SplitView.types';
import './SplitView.scss';

const carriesTab = (e: React.DragEvent) =>
  Array.from(e.dataTransfer.types).includes(TAB_BAR_DRAG_TYPE);

const sideOf = (e: React.DragEvent<HTMLElement>): SplitViewSide => {
  const rect = e.currentTarget.getBoundingClientRect();
  const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
  const firstHalf = e.clientX < rect.left + rect.width / 2;
  return firstHalf !== rtl ? 'start' : 'end';
};

/**
 * Two documents side by side, split 50/50 — the page half of a `TabBarSplit`.
 * Each pane scrolls on its own. The split is fixed: there is no divider to drag.
 *
 * Drag a tab from a `TabBar` over the view and it shows which half the tab will
 * open in. Keyboard users get the same result from the tab's right-click menu
 * ("Open in split view"), which is why the drop zones are pointer-only.
 */
const SplitView = forwardRef<HTMLDivElement, SplitViewProps>(
  (
    {
      id,
      onTabDrop,
      startDropLabel = 'Open here',
      endDropLabel = 'Open here',
      className,
      children,
      onDragOver,
      onDragLeave,
      onDrop,
      ...rest
    },
    ref,
  ) => {
    const panes = Math.min(Children.count(children), 2);
    const [hover, setHover] = useState<SplitViewSide | null>(null);

    // A drag that ends outside the view (dropped on the bar, or cancelled with Escape)
    // never fires dragleave here, so clear the zones whenever any drag ends.
    useEffect(() => {
      if (!hover) return;
      const clear = () => setHover(null);
      window.addEventListener('dragend', clear);
      window.addEventListener('drop', clear);
      return () => {
        window.removeEventListener('dragend', clear);
        window.removeEventListener('drop', clear);
      };
    }, [hover]);

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        data-panes={panes}
        data-drop={hover ?? undefined}
        className={`ui-split-view${className ? ' ' + className : ''}`}
        onDragOver={(e) => {
          onDragOver?.(e);
          if (!onTabDrop || !carriesTab(e)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          const side = sideOf(e);
          if (side !== hover) setHover(side);
        }}
        onDragLeave={(e) => {
          onDragLeave?.(e);
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          setHover(null);
        }}
        onDrop={(e) => {
          onDrop?.(e);
          if (!onTabDrop || !carriesTab(e)) return;
          e.preventDefault();
          const value = e.dataTransfer.getData(TAB_BAR_DRAG_TYPE);
          const side = sideOf(e);
          setHover(null);
          if (value) onTabDrop({ value, side });
        }}
      >
        {children}
        {hover && (
          <div className="ui-split-view__drop" aria-hidden="true">
            <div id={`${id}-drop-start`} className="ui-split-view__zone" data-side="start" data-hover={hover === 'start' ? '' : undefined}>
              <span className="ui-split-view__zone-label">{startDropLabel}</span>
            </div>
            <div id={`${id}-drop-end`} className="ui-split-view__zone" data-side="end" data-hover={hover === 'end' ? '' : undefined}>
              <span className="ui-split-view__zone-label">{endDropLabel}</span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

SplitView.displayName = 'SplitView';

/** One half of a `SplitView`. Scrolls independently of its neighbour. */
const SplitViewPane = forwardRef<HTMLDivElement, SplitViewPaneProps>(
  ({ active = false, className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      data-active={active ? '' : undefined}
      className={`ui-split-view__pane${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

SplitViewPane.displayName = 'SplitViewPane';

export default SplitView;
export { SplitViewPane };
