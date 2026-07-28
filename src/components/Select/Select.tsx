import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { useMounted } from '#/hooks/useMounted';
import { computePosition } from '#/utils/computePosition';
import { SelectContext } from './Select.context';
import type {
  SelectContentProps,
  SelectGroupProps,
  SelectItemProps,
  SelectLabelProps,
  SelectProps,
  SelectSeparatorProps,
  SelectTriggerProps,
} from './Select.types';
import '../Input/Input.scss';
import '../Label/Label.scss';
import './Select.scss';

const useSelect = () => {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error('Select subcomponents must be used inside <Select>.');
  }
  return ctx;
};

const ITEM_SELECTOR = '[role="option"]:not([data-disabled])';

const getItems = (root: HTMLElement | null): HTMLElement[] =>
  root ? Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)) : [];

// ═════════════════════════════════════════════════════════════════════════════
// Root — carries the label / description / error surround like Input does.
// ═════════════════════════════════════════════════════════════════════════════

const Select = ({
  id,
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  name,
  disabled = false,
  required = false,
  size = 'default',
  label,
  description,
  error = false,
  errorMessage,
  className,
  children,
}: SelectProps) => {
  const controlledValue = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );
  const value = controlledValue ? valueProp : internalValue;

  const setValue = useCallback(
    (next: string) => {
      if (!controlledValue) setInternalValue(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );

  const controlledOpen = openProp !== undefined;
  const [openState, setOpenState] = useState(defaultOpen);
  const open = controlledOpen ? (openProp as boolean) : openState;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlledOpen) setOpenState(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const toggle = useCallback(() => {
    if (!disabled) setOpen(!open);
  }, [open, setOpen, disabled]);
  const close = useCallback(() => setOpen(false), [setOpen]);

  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);

  // Item registry: SelectItem calls registerItem on mount so the trigger can
  // display the label matching the current `value`. `itemsVersion` bumps on every
  // (de)registration and feeds the ctx memo below, so the trigger re-renders once
  // items mount — otherwise a pre-set `value` shows the placeholder until the user
  // interacts (the ctx object was memoized without the registry as a dependency).
  const itemsRef = useRef<Map<string, React.ReactNode>>(new Map());
  const [itemsVersion, setItemsVersion] = useState(0);
  const registerItem = useCallback(
    (itemValue: string, itemLabel: React.ReactNode) => {
      itemsRef.current.set(itemValue, itemLabel);
      setItemsVersion((n) => n + 1);
      return () => {
        itemsRef.current.delete(itemValue);
        setItemsVersion((n) => n + 1);
      };
    },
    [],
  );
  // Resolve labels eagerly from the children tree too: the options are only
  // mounted (portalled) while the listbox is open, so `registerItem` alone never
  // sees them before the first open — a pre-set `value` would show the
  // placeholder until the user interacts. Walking children fixes that; the ref
  // registry stays as a fallback for any dynamically-injected items.
  const itemLabels = useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    const walk = (nodes: React.ReactNode) => {
      Children.forEach(nodes, (child) => {
        if (!isValidElement(child)) return;
        if (child.type === SelectItem) {
          const p = child.props as SelectItemProps;
          map.set(p.value, p.label ?? p.children);
        } else {
          const kids = (child.props as { children?: React.ReactNode })?.children;
          if (kids) walk(kids);
        }
      });
    };
    walk(children);
    return map;
  }, [children]);
  const getItemLabel = useCallback(
    (v: string) => itemLabels.get(v) ?? itemsRef.current.get(v),
    [itemLabels],
  );

  const ctxValue = useMemo(
    () => ({
      id,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      open,
      toggle,
      close,
      value,
      setValue,
      disabled,
      required,
      size,
      error,
      triggerNode,
      setTriggerNode,
      registerItem,
      getItemLabel,
    }),
    [
      id,
      open,
      toggle,
      close,
      value,
      setValue,
      disabled,
      required,
      size,
      error,
      triggerNode,
      registerItem,
      getItemLabel,
      itemsVersion,
    ],
  );

  const errorId = errorMessage ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <SelectContext.Provider value={ctxValue}>
      <div
        className={`ui-input-field ui-input-field--sz-${size}${className ? ' ' + className : ''}`}
      >
        {label && (
          <label
            htmlFor={`${id}-trigger`}
            className={`ui-label${disabled ? ' ui-label--disabled' : ''}`}
          >
            <span className="ui-label__text">
              {label}
              {required && (
                <span className="ui-label__required" aria-hidden="true">
                  *
                </span>
              )}
            </span>
            {description && (
              <span id={descriptionId} className="ui-label__description">
                {description}
              </span>
            )}
          </label>
        )}
        {!label && description && (
          <span id={descriptionId} className="ui-label__description">
            {description}
          </span>
        )}
        {children}
        {name !== undefined && (
          <input
            type="hidden"
            name={name}
            value={value ?? ''}
            required={required}
          />
        )}
        {errorMessage && (
          <p id={errorId} className="ui-input__error">
            {errorMessage}
          </p>
        )}
      </div>
    </SelectContext.Provider>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Trigger — reuses `.ui-input-wrap`, adds a chevron on the right.
// ═════════════════════════════════════════════════════════════════════════════

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ placeholder, className, onClick, onKeyDown, ...rest }, ref) => {
    const ctx = useSelect();
    const displayed =
      ctx.value !== undefined ? ctx.getItemLabel(ctx.value) : undefined;
    const showPlaceholder =
      displayed === undefined || displayed === null || displayed === '';

    const composedRef = (node: HTMLButtonElement | null) => {
      ctx.setTriggerNode(node);
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
    };

    return (
      <div
        className={`ui-input-wrap ui-select__trigger-wrap${ctx.disabled ? ' ui-input-wrap--disabled' : ''}${ctx.error ? ' ui-input-wrap--error' : ''}${ctx.open ? ' ui-select__trigger-wrap--open' : ''}`}
      >
        <button
          {...rest}
          ref={composedRef}
          id={ctx.triggerId}
          type="button"
          role="combobox"
          aria-expanded={ctx.open}
          aria-haspopup="listbox"
          aria-controls={ctx.contentId}
          aria-required={ctx.required || undefined}
          aria-disabled={ctx.disabled || undefined}
          disabled={ctx.disabled}
          className={`ui-select__trigger${className ? ' ' + className : ''}`}
          onClick={(e) => {
            onClick?.(e);
            ctx.toggle();
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            if (
              e.key === 'ArrowDown' ||
              e.key === 'ArrowUp' ||
              e.key === 'Enter' ||
              e.key === ' '
            ) {
              e.preventDefault();
              if (!ctx.open) ctx.toggle();
            }
          }}
        >
          <span
            className={`ui-select__value${showPlaceholder ? ' ui-select__value--placeholder' : ''}`}
          >
            {showPlaceholder ? placeholder : displayed}
          </span>
        </button>
        <span className="ui-select__chevron" aria-hidden="true">
          <ChevronDown />
        </span>
      </div>
    );
  },
);

SelectTrigger.displayName = 'SelectTrigger';

// ═════════════════════════════════════════════════════════════════════════════
// Content — portalled listbox with keyboard nav.
// ═════════════════════════════════════════════════════════════════════════════

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  (
    {
      children,
      side = 'bottom',
      align = 'start',
      sideOffset = 4,
      matchTriggerWidth = true,
      className,
      ...rest
    },
    ref,
  ) => {
    const ctx = useSelect();
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(
      null,
    );
    const [minWidth, setMinWidth] = useState<number | undefined>(undefined);
    const mounted = useMounted();

    useLayoutEffect(() => {
      if (!ctx.open || !ctx.triggerNode || !contentRef.current) return;
      const triggerRect = ctx.triggerNode.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      setPosition(
        computePosition(triggerRect, contentRect, side, align, sideOffset),
      );
      if (matchTriggerWidth) setMinWidth(triggerRect.width);
    }, [ctx.open, ctx.triggerNode, side, align, sideOffset, matchTriggerWidth, children]);

    // Focus the listbox container on open so keyboard nav starts here.
    // Move focus onto the selected item if any so screen readers announce it.
    useEffect(() => {
      if (!ctx.open) return;
      const raf = requestAnimationFrame(() => {
        const items = getItems(contentRef.current);
        const selected = items.find(
          (n) => n.getAttribute('data-value') === ctx.value,
        );
        (selected ?? items[0] ?? contentRef.current)?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }, [ctx.open, ctx.value]);

    // Outside click closes.
    useEffect(() => {
      if (!ctx.open) return;
      const onMouseDown = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          contentRef.current?.contains(target) ||
          ctx.triggerNode?.contains(target)
        )
          return;
        ctx.close();
      };
      document.addEventListener('mousedown', onMouseDown);
      return () => document.removeEventListener('mousedown', onMouseDown);
    }, [ctx.open, ctx.triggerNode, ctx.close]);

    // Escape / Tab closes + returns focus to trigger.
    useEffect(() => {
      if (!ctx.open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Tab') {
          if (e.key === 'Escape') e.preventDefault();
          ctx.close();
          ctx.triggerNode?.focus();
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [ctx.open, ctx.triggerNode, ctx.close]);

    // Type-ahead: build a search buffer and jump to the first item whose label
    // starts with the buffered characters. Cleared after 500ms of no keys.
    const typeaheadRef = useRef({ buffer: '', timer: 0 });
    const handleKeyDown = (e: React.KeyboardEvent) => {
      const items = getItems(contentRef.current);
      if (items.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const current = active ? items.indexOf(active) : -1;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = current < 0 ? 0 : (current + 1) % items.length;
        items[next]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = current <= 0 ? items.length - 1 : current - 1;
        items[next]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const value = active?.getAttribute('data-value');
        if (value) {
          ctx.setValue(value);
          ctx.close();
          ctx.triggerNode?.focus();
        }
      } else if (e.key.length === 1 && /\S/.test(e.key)) {
        // Type-ahead
        const state = typeaheadRef.current;
        window.clearTimeout(state.timer);
        state.buffer = (state.buffer + e.key).toLowerCase();
        state.timer = window.setTimeout(() => {
          state.buffer = '';
        }, 500);
        const match = items.find((n) =>
          (n.textContent ?? '')
            .toLowerCase()
            .trim()
            .startsWith(state.buffer),
        );
        match?.focus();
      }
    };

    if (!ctx.open || !mounted) return null;

    return createPortal(
      <div
        {...rest}
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
        }}
        id={ctx.contentId}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={ctx.triggerId}
        data-side={side}
        className={`ui-select__content${className ? ' ' + className : ''}`}
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          minWidth,
          visibility: position ? 'visible' : 'hidden',
        }}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>,
      document.body,
    );
  },
);

SelectContent.displayName = 'SelectContent';

// ═════════════════════════════════════════════════════════════════════════════
// Item — registers with the parent so the trigger can display its label.
// ═════════════════════════════════════════════════════════════════════════════

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, disabled = false, label, className, children, ...rest }, ref) => {
    const ctx = useSelect();
    const displayLabel = label ?? children;

    useEffect(() => {
      return ctx.registerItem(value, displayLabel);
    }, [ctx, value, displayLabel]);

    const selected = ctx.value === value;
    const activate = () => {
      if (disabled) return;
      ctx.setValue(value);
      ctx.close();
      ctx.triggerNode?.focus();
    };

    return (
      <div
        {...rest}
        ref={ref}
        role="option"
        tabIndex={-1}
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        data-value={value}
        data-state={selected ? 'checked' : 'unchecked'}
        className={`ui-select__item${className ? ' ' + className : ''}`}
        onClick={activate}
      >
        <span className="ui-select__item-indicator" aria-hidden="true">
          {selected && <Check />}
        </span>
        <span className="ui-select__item-content">{children}</span>
      </div>
    );
  },
);

SelectItem.displayName = 'SelectItem';

// ═════════════════════════════════════════════════════════════════════════════
// Group + Label + Separator
// ═════════════════════════════════════════════════════════════════════════════

const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ children, label, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      role="group"
      className={`ui-select__group${className ? ' ' + className : ''}`}
    >
      {label && <div className="ui-select__label">{label}</div>}
      {children}
    </div>
  ),
);

SelectGroup.displayName = 'SelectGroup';

const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ children, className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-select__label${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

SelectLabel.displayName = 'SelectLabel';

const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      role="separator"
      className={`ui-select__separator${className ? ' ' + className : ''}`}
    />
  ),
);

SelectSeparator.displayName = 'SelectSeparator';

export default Select;
export {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
};
