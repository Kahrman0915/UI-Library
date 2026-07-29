import {
  Children,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Search } from 'lucide-react';
import Dialog, { DialogBody, DialogHeader } from '#components/Dialog/Dialog';
import { CommandContext } from './Command.context';
import type {
  CommandContextValue,
  CommandItemRegistration,
} from './Command.context';
import type {
  CommandDialogProps,
  CommandEmptyProps,
  CommandGroupProps,
  CommandInputProps,
  CommandItemProps,
  CommandListProps,
  CommandProps,
  CommandSeparatorProps,
  CommandShortcutProps,
} from './Command.types';
import './Command.scss';

const defaultFilter = (search: string, itemValue: string) =>
  itemValue.toLowerCase().includes(search.toLowerCase());

/**
 * Walk a React children tree and pull out its plain-text content, ignoring
 * elements. Used to derive a filter value from `<CommandItem><Icon/>Calendar</CommandItem>`
 * when the consumer doesn't pass an explicit `value`.
 */
const nodeToText = (node: React.ReactNode): string => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join(' ').trim();
  if (typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: React.ReactNode } }).props;
    return nodeToText(props?.children);
  }
  return '';
};

const useCommand = () => {
  const ctx = useContext(CommandContext);
  if (!ctx) {
    throw new Error(
      'Command subcomponents must be used inside a <Command> root.',
    );
  }
  return ctx;
};

// ═════════════════════════════════════════════════════════════════════════════
// Root
// ═════════════════════════════════════════════════════════════════════════════

const Command = forwardRef<HTMLDivElement, CommandProps>(
  (
    {
      id,
      value: valueProp,
      defaultValue = '',
      onValueChange,
      filter = defaultFilter,
      className,
      children,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const controlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const search = controlled ? (valueProp as string) : internalValue;

    const setSearch = useCallback(
      (next: string) => {
        if (!controlled) setInternalValue(next);
        onValueChange?.(next);
      },
      [controlled, onValueChange],
    );

    const [activeId, setActiveId] = useState<string | null>(null);
    const itemsRef = useRef<Map<string, CommandItemRegistration>>(new Map());
    const listRef = useRef<HTMLDivElement | null>(null);

    const register = useCallback((item: CommandItemRegistration) => {
      itemsRef.current.set(item.id, item);
      return () => {
        itemsRef.current.delete(item.id);
      };
    }, []);

    const isVisible = useCallback(
      (itemValue: string) => {
        if (!search) return true;
        return filter(search, itemValue);
      },
      [search, filter],
    );

    // Compute a flat list of visible items in DOM order using the list container.
    const getVisibleIds = useCallback((): string[] => {
      const list = listRef.current;
      if (!list) return [];
      const nodes = list.querySelectorAll<HTMLElement>(
        '[data-ui-command-item][data-visible="true"]:not([data-disabled])',
      );
      return Array.from(nodes)
        .map((n) => n.getAttribute('data-item-id'))
        .filter((v): v is string => v !== null);
    }, []);

    const move = useCallback(
      (delta: number | 'first' | 'last') => {
        const ids = getVisibleIds();
        if (ids.length === 0) return;
        if (delta === 'first') {
          setActiveId(ids[0]);
          return;
        }
        if (delta === 'last') {
          setActiveId(ids[ids.length - 1]);
          return;
        }
        setActiveId((prev) => {
          const idx = prev ? ids.indexOf(prev) : -1;
          if (idx === -1) return delta > 0 ? ids[0] : ids[ids.length - 1];
          const next = idx + delta;
          if (next < 0) return ids[ids.length - 1];
          if (next >= ids.length) return ids[0];
          return ids[next];
        });
      },
      [getVisibleIds],
    );

    const selectActive = useCallback(() => {
      if (!activeId) return;
      const item = itemsRef.current.get(activeId);
      if (!item || item.disabled) return;
      item.onSelect?.(item.value);
    }, [activeId]);

    // When the search value changes, always reset to the first visible item so
    // the highlight stays inside the filtered set.
    useEffect(() => {
      const ids = getVisibleIds();
      if (ids.length === 0) {
        setActiveId(null);
        return;
      }
      setActiveId((prev) => (prev && ids.includes(prev) ? prev : ids[0]));
    }, [search, getVisibleIds]);

    // Visible count for CommandEmpty to hide/show itself. Two fixes here:
    // (1) real deps — the old effect had NO dependency array, so it ran a DOM
    //     query + setState after every single render;
    // (2) count INCLUDES disabled items (unlike keyboard-nav's getVisibleIds) —
    //     a search matching only disabled items is not "no results", and the
    //     old count rendered the empty state over visibly matching rows.
    const [visibleCount, setVisibleCount] = useState(0);
    useEffect(() => {
      const list = listRef.current;
      if (!list) {
        setVisibleCount(0);
        return;
      }
      setVisibleCount(
        list.querySelectorAll('[data-ui-command-item][data-visible="true"]')
          .length,
      );
    }, [search, children]);

    // Global keydown on the root — handles arrows + Enter even when the input isn't focused.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        move(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        move('first');
      } else if (e.key === 'End') {
        e.preventDefault();
        move('last');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectActive();
      }
    };

    // Scroll the active item into view whenever it changes.
    useEffect(() => {
      if (!activeId) return;
      const list = listRef.current;
      const node = list?.querySelector<HTMLElement>(
        `[data-item-id="${CSS.escape(activeId)}"]`,
      );
      node?.scrollIntoView({ block: 'nearest' });
    }, [activeId]);

    const ctxValue = useMemo<CommandContextValue>(
      () => ({
        rootId: id,
        search,
        setSearch,
        activeId,
        setActiveId,
        filter,
        register,
        isVisible,
        move,
        selectActive,
        listRef,
        visibleCount,
      }),
      [
        id,
        search,
        setSearch,
        activeId,
        filter,
        register,
        isVisible,
        move,
        selectActive,
        visibleCount,
      ],
    );

    return (
      <CommandContext.Provider value={ctxValue}>
        <div
          // Default label sits BEFORE {...rest} so a consumer can localize or
          // replace it. After the spread it was unoverridable — the component
          // hard-coded English into every app that used it.
          aria-label="Command menu"
          {...rest}
          ref={ref}
          id={id}
          role="dialog"
          className={`ui-command${className ? ' ' + className : ''}`}
          onKeyDown={handleKeyDown}
        >
          {children}
        </div>
      </CommandContext.Provider>
    );
  },
);

Command.displayName = 'Command';

// ═════════════════════════════════════════════════════════════════════════════
// Input
// ═════════════════════════════════════════════════════════════════════════════

const CommandInput = forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, placeholder = 'Type a command or search…', ...rest }, ref) => {
    const ctx = useCommand();
    return (
      <div className="ui-command__input-wrap">
        <span className="ui-command__input-icon" aria-hidden="true">
          <Search />
        </span>
        <input
          {...rest}
          ref={ref}
          type="text"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded="true"
          aria-controls={`${ctx.rootId}-list`}
          aria-activedescendant={
            ctx.activeId ? `${ctx.rootId}-item-${ctx.activeId}` : undefined
          }
          className={`ui-command__input${className ? ' ' + className : ''}`}
          placeholder={placeholder}
          value={ctx.search}
          onChange={(e) => ctx.setSearch(e.target.value)}
        />
      </div>
    );
  },
);

CommandInput.displayName = 'CommandInput';

// ═════════════════════════════════════════════════════════════════════════════
// List
// ═════════════════════════════════════════════════════════════════════════════

const CommandList = forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, children, ...rest }, ref) => {
    const ctx = useCommand();
    const composedRef = (node: HTMLDivElement | null) => {
      ctx.listRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };
    return (
      <div
        {...rest}
        ref={composedRef}
        id={`${ctx.rootId}-list`}
        role="listbox"
        className={`ui-command__list${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

CommandList.displayName = 'CommandList';

// ═════════════════════════════════════════════════════════════════════════════
// Empty — shown only when no items match the current search.
// ═════════════════════════════════════════════════════════════════════════════

const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, children, ...rest }, ref) => {
    const ctx = useCommand();
    if (ctx.visibleCount > 0) return null;
    return (
      <div
        {...rest}
        ref={ref}
        role="presentation"
        className={`ui-command__empty${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

CommandEmpty.displayName = 'CommandEmpty';

// ═════════════════════════════════════════════════════════════════════════════
// Group — hides itself if all descendant items are filtered out.
// ═════════════════════════════════════════════════════════════════════════════

const groupHasVisibleChild = (node: React.ReactNode, search: string, filter: (s: string, v: string) => boolean): boolean => {
  if (!node) return false;
  if (!search) return true;
  const arr = Children.toArray(node);
  for (const child of arr) {
    if (
      child &&
      typeof child === 'object' &&
      'type' in child &&
      (child as { type: unknown }).type === CommandItem
    ) {
      const props = (child as { props: CommandItemProps }).props;
      const derived = props.value ?? nodeToText(props.children);
      const keywords = props.keywords ? ' ' + props.keywords.join(' ') : '';
      const matchValue = (derived + keywords).trim();
      if (matchValue === '' || filter(search, matchValue)) return true;
    }
  }
  return false;
};

const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, className, children, ...rest }, ref) => {
    const ctx = useCommand();
    const visible = groupHasVisibleChild(children, ctx.search, ctx.filter);
    if (!visible) return null;
    return (
      <div
        {...rest}
        ref={ref}
        role="group"
        className={`ui-command__group${className ? ' ' + className : ''}`}
      >
        {heading && <div className="ui-command__group-heading">{heading}</div>}
        {children}
      </div>
    );
  },
);

CommandGroup.displayName = 'CommandGroup';

// ═════════════════════════════════════════════════════════════════════════════
// Item
// ═════════════════════════════════════════════════════════════════════════════

const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(
  (
    {
      value,
      keywords,
      disabled = false,
      onSelect,
      variant = 'default',
      className,
      children,
      onClick,
      onMouseMove,
      ...rest
    },
    ref,
  ) => {
    const ctx = useCommand();
    const reactId = useId();
    const idRef = useRef(reactId);

    // Derive value from children if not explicitly given. Walks the tree so
    // that `<CommandItem><Icon/>Calendar</CommandItem>` yields "Calendar".
    const derivedValue = value ?? nodeToText(children);
    const matchValue = keywords
      ? `${derivedValue} ${keywords.join(' ')}`.trim()
      : derivedValue;
    const isVisible = ctx.isVisible(matchValue);
    const isActive = ctx.activeId === idRef.current;

    useEffect(() => {
      const id = idRef.current;
      const unregister = ctx.register({
        id,
        value: derivedValue,
        disabled,
        onSelect,
      });
      return unregister;
    }, [ctx, derivedValue, disabled, onSelect]);

    return (
      <div
        {...rest}
        ref={ref}
        id={`${ctx.rootId}-item-${idRef.current}`}
        role="option"
        aria-selected={isActive}
        aria-disabled={disabled || undefined}
        data-ui-command-item=""
        data-item-id={idRef.current}
        data-visible={isVisible ? 'true' : 'false'}
        data-active={isActive ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-variant={variant}
        className={`ui-command__item ui-command__item--${variant}${!isVisible ? ' ui-command__item--hidden' : ''}${className ? ' ' + className : ''}`}
        onClick={(e) => {
          onClick?.(e);
          if (disabled) return;
          onSelect?.(derivedValue);
        }}
        onMouseMove={(e) => {
          onMouseMove?.(e);
          if (!disabled && !isActive) ctx.setActiveId(idRef.current);
        }}
      >
        {children}
      </div>
    );
  },
);

CommandItem.displayName = 'CommandItem';

// ═════════════════════════════════════════════════════════════════════════════
// Separator
// ═════════════════════════════════════════════════════════════════════════════

const CommandSeparator = forwardRef<HTMLDivElement, CommandSeparatorProps>(
  ({ className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={`ui-command__separator${className ? ' ' + className : ''}`}
    />
  ),
);

CommandSeparator.displayName = 'CommandSeparator';

// ═════════════════════════════════════════════════════════════════════════════
// Shortcut chip inside a CommandItem
// ═════════════════════════════════════════════════════════════════════════════

const CommandShortcut = forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      {...rest}
      ref={ref}
      className={`ui-command__shortcut${className ? ' ' + className : ''}`}
    >
      {children}
    </span>
  ),
);

CommandShortcut.displayName = 'CommandShortcut';

// ═════════════════════════════════════════════════════════════════════════════
// Dialog wrapper — the classic cmd-K modal pattern
// ═════════════════════════════════════════════════════════════════════════════

const CommandDialog = ({
  id,
  open,
  onClose,
  title = 'Command menu',
  description,
  placement = 'top',
  className,
  children,
}: CommandDialogProps) => {
  return (
    <Dialog
      id={id}
      open={open}
      onClose={onClose}
      closeOnOutsideClick
      className={`ui-command-dialog ui-command-dialog--${placement}${className ? ' ' + className : ''}`}
    >
      <DialogHeader
        id={id}
        title={title}
        description={description}
        showCloseButton={false}
        className="ui-command-dialog__header"
      />
      <DialogBody className="ui-command-dialog__body">{children}</DialogBody>
    </Dialog>
  );
};

CommandDialog.displayName = 'CommandDialog';

export default Command;
export {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
};
