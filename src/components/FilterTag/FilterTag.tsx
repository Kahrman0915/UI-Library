import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import CloseButton from '../CloseButton';
import Button from '../Button';
import type { FilterTagGroupProps, FilterTagProps, FilterTagSize } from './FilterTag.types';
import './FilterTag.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Group context — optional. A FilterTag works standalone; inside a group it
// reports its index before removal so the group can place focus afterwards.
// ═════════════════════════════════════════════════════════════════════════════

type GroupContextValue = { willRemove: (index: number) => void; size: FilterTagSize };
const GroupContext = createContext<GroupContextValue | null>(null);
const IndexContext = createContext<number>(-1);

// SSR-safe: useLayoutEffect warns on the server. Same local pattern as
// useAutosizeTextarea.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const FilterTag = forwardRef<HTMLSpanElement, FilterTagProps>(
  ({ id, label, onRemove, removeLabel, size: sizeProp, className, ...rest }, ref) => {
    const group = useContext(GroupContext);
    const index = useContext(IndexContext);
    // Own prop, else the group's, else `default`.
    const size = sizeProp ?? group?.size ?? 'default';

    return (
      <span
        {...rest}
        ref={ref}
        id={id}
        className={`ui-filter-tag ui-filter-tag--sz-${size}${className ? ' ' + className : ''}`}
      >
        <span className="ui-filter-tag__label">{label}</span>
        <CloseButton
          id={`${id}-remove`}
          size="sm"
          className="ui-filter-tag__remove"
          ariaLabel={removeLabel ?? `Remove ${label}`}
          onClick={() => {
            // Report first: the group has to know which slot emptied before the
            // parent re-renders without this tag.
            if (group && index >= 0) group.willRemove(index);
            onRemove();
          }}
        />
      </span>
    );
  },
);

FilterTag.displayName = 'FilterTag';

const FilterTagGroup = forwardRef<HTMLDivElement, FilterTagGroupProps>(
  (
    {
      id,
      label,
      hideLabel = false,
      onClearAll,
      clearAllLabel = 'Clear all',
      size = 'default',
      returnFocusRef,
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);
    // The slot that emptied, and how many tags there were when it did. Focus is
    // only moved once the count actually drops — a parent that ignores
    // onRemove must not have focus yanked about.
    const pending = useRef<{ index: number; count: number } | null>(null);

    const items = Children.toArray(children).filter(isValidElement);
    const count = items.length;

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const willRemove = useCallback(
      (index: number) => {
        pending.current = { index, count };
      },
      [count],
    );

    // Layout effect, not effect: focus has to land before paint, or the ring
    // flashes on <body> for a frame.
    useIsomorphicLayoutEffect(() => {
      const p = pending.current;
      if (!p || count >= p.count) return;
      pending.current = null;
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('.ui-filter-tag__remove') ?? [];
      if (buttons.length > 0) {
        // The tag that slid into the removed slot, or the new last one.
        buttons[Math.min(p.index, buttons.length - 1)].focus();
        return;
      }
      (returnFocusRef?.current ?? rootRef.current)?.focus();
    });

    const labelId = `${id}-label`;

    return (
      <div
        {...rest}
        ref={setRefs}
        id={id}
        // Focusable only as the last-resort landing spot when every tag is gone
        // and no returnFocusRef was given. -1 keeps it out of the tab order.
        tabIndex={-1}
        className={`ui-filter-tag-group ui-filter-tag-group--sz-${size}${className ? ' ' + className : ''}`}
      >
        <span id={labelId} className={`ui-filter-tag-group__label${hideLabel ? ' ui-filter-tag-group__label--hidden' : ''}`}>
          {label}
        </span>
        <GroupContext.Provider value={{ willRemove, size }}>
          <ul ref={listRef} className="ui-filter-tag-group__list" aria-labelledby={labelId}>
            {items.map((child, i) => (
              <li key={child.key ?? i} className="ui-filter-tag-group__item">
                <IndexContext.Provider value={i}>{child}</IndexContext.Provider>
              </li>
            ))}
          </ul>
        </GroupContext.Provider>
        {onClearAll && count > 0 && (
          <Button
            id={`${id}-clear`}
            label={clearAllLabel}
            style="ghost"
            size={size}
            onClick={() => {
              pending.current = { index: 0, count };
              onClearAll();
            }}
          />
        )}
      </div>
    );
  },
);

FilterTagGroup.displayName = 'FilterTagGroup';

export default FilterTag;
export { FilterTagGroup };
