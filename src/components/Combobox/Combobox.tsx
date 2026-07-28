import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useMounted } from '#/hooks/useMounted';
import { usePresence } from '#/hooks/usePresence';
import { computePosition } from '#/utils/computePosition';
import type { ComboboxOption, ComboboxProps } from './Combobox.types';
import '../Input/Input.scss';
import '../Label/Label.scss';
import './Combobox.scss';
import '../../styles/overlay-entrance.scss';

const optionSearchKey = (option: ComboboxOption): string => {
  if (option.searchText) return option.searchText;
  if (typeof option.label === 'string') return option.label;
  return option.value;
};

const defaultFilter = (option: ComboboxOption, search: string): boolean => {
  if (!search) return true;
  return optionSearchKey(option)
    .toLowerCase()
    .includes(search.toLowerCase());
};

const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      id,
      options,
      value: valueProp,
      defaultValue,
      onValueChange,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      name,
      size = 'default',
      label,
      description,
      error = false,
      errorMessage,
      placeholder = 'Select…',
      searchPlaceholder = 'Search…',
      emptyMessage = 'No results.',
      disabled = false,
      required = false,
      clearable = false,
      filter = defaultFilter,
      side = 'bottom',
      align = 'start',
      sideOffset = 4,
      matchTriggerWidth = true,
      className,
      ...rest
    },
    ref,
  ) => {
    const controlledValue = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState<string | undefined>(
      defaultValue,
    );
    const value = controlledValue ? valueProp : internalValue;

    const setValue = useCallback(
      (next: string | undefined) => {
        if (!controlledValue) setInternalValue(next);
        if (next !== undefined) onValueChange?.(next);
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

    const [search, setSearch] = useState('');
    const [highlightIndex, setHighlightIndex] = useState(0);

    const triggerId = `${id}-trigger`;
    const listboxId = `${id}-listbox`;
    const searchInputId = `${id}-search`;
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = errorMessage ? `${id}-error` : undefined;

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);
    const [position, setPosition] = useState<{
      top: number;
      left: number;
    } | null>(null);
    const [minWidth, setMinWidth] = useState<number | undefined>(undefined);
    const mounted = useMounted();
    const { present, status, onExitAnimationEnd } = usePresence(open);

    // Filter options against the current search.
    const filtered = useMemo(
      () => options.filter((o) => filter(o, search)),
      [options, filter, search],
    );

    // Clamp highlight to the filtered length.
    useEffect(() => {
      if (highlightIndex >= filtered.length) setHighlightIndex(0);
    }, [filtered.length, highlightIndex]);

    // On open, reset search + highlight to the selected item (or 0).
    useEffect(() => {
      if (!open) return;
      setSearch('');
      const currentIdx = options.findIndex((o) => o.value === value);
      setHighlightIndex(currentIdx >= 0 ? currentIdx : 0);
      const raf = requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
      return () => cancelAnimationFrame(raf);
    }, [open, value, options]);

    // Position the popup.
    useLayoutEffect(() => {
      if (!open || !triggerRef.current || !contentRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      setPosition(
        computePosition(triggerRect, contentRect, side, align, sideOffset),
      );
      if (matchTriggerWidth) setMinWidth(triggerRect.width);
    }, [open, side, align, sideOffset, matchTriggerWidth, filtered.length]);

    // Outside click closes.
    useEffect(() => {
      if (!open) return;
      const onMouseDown = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          contentRef.current?.contains(target) ||
          triggerRef.current?.contains(target)
        )
          return;
        setOpen(false);
      };
      document.addEventListener('mousedown', onMouseDown);
      return () => document.removeEventListener('mousedown', onMouseDown);
    }, [open, setOpen]);

    // Escape / Tab closes + returns focus to trigger.
    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Tab') {
          if (e.key === 'Escape') e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [open, setOpen]);

    // Scroll highlighted item into view.
    useLayoutEffect(() => {
      if (!open || filtered.length === 0) return;
      const el = contentRef.current?.querySelector<HTMLElement>(
        `[data-index="${highlightIndex}"]`,
      );
      el?.scrollIntoView({ block: 'nearest' });
    }, [highlightIndex, filtered.length, open]);

    const selectAt = useCallback(
      (idx: number) => {
        const option = filtered[idx];
        if (!option || option.disabled) return;
        setValue(option.value);
        setOpen(false);
        triggerRef.current?.focus();
      },
      [filtered, setValue, setOpen],
    );

    const clear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!controlledValue) setInternalValue(undefined);
        onValueChange?.('');
      },
      [controlledValue, onValueChange],
    );

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((i) => {
          if (filtered.length === 0) return 0;
          const next = (i + 1) % filtered.length;
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((i) => {
          if (filtered.length === 0) return 0;
          return i <= 0 ? filtered.length - 1 : i - 1;
        });
      } else if (e.key === 'Home') {
        e.preventDefault();
        setHighlightIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setHighlightIndex(Math.max(0, filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectAt(highlightIndex);
      }
    };

    const selected = options.find((o) => o.value === value);
    const showPlaceholder = !selected;
    const showClear = clearable && !!selected && !disabled;
    const activeDescendantId = filtered[highlightIndex]
      ? `${id}-opt-${filtered[highlightIndex].value}`
      : undefined;

    return (
      <div
        {...rest}
        ref={ref}
        // The required id previously never reached the DOM (it only seeded
        // child ids) — <Combobox id="x"> now renders an element with id="x".
        id={id}
        className={`ui-input-field ui-input-field--sz-${size}${className ? ' ' + className : ''}`}
      >
        {label && (
          <label
            htmlFor={triggerId}
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
              // aria-hidden keeps the helper out of the trigger's accessible
              // NAME (it sits inside the <label>); the trigger re-exposes it
              // as a description via aria-describedby.
              <span
                id={descriptionId}
                className="ui-label__description"
                aria-hidden="true"
              >
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

        <div
          className={`ui-input-wrap ui-combobox__trigger-wrap${disabled ? ' ui-input-wrap--disabled' : ''}${error ? ' ui-input-wrap--error' : ''}${open ? ' ui-combobox__trigger-wrap--open' : ''}`}
        >
          <button
            ref={triggerRef}
            id={triggerId}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            // Only reference the listbox while it exists in the DOM.
            aria-controls={open ? listboxId : undefined}
            aria-required={required || undefined}
            aria-disabled={disabled || undefined}
            aria-invalid={error || undefined}
            aria-describedby={
              [description ? descriptionId : null, error && errorMessage ? errorId : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            disabled={disabled}
            className="ui-combobox__trigger"
            onClick={() => {
              if (!disabled) setOpen(!open);
            }}
            onKeyDown={(e) => {
              if (
                e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'Enter' ||
                e.key === ' '
              ) {
                e.preventDefault();
                if (!open) setOpen(true);
              }
            }}
          >
            <span
              className={`ui-combobox__value${showPlaceholder ? ' ui-combobox__value--placeholder' : ''}`}
            >
              {showPlaceholder ? placeholder : selected!.label}
            </span>
          </button>
          {showClear && (
            <button
              type="button"
              aria-label="Clear selection"
              className="ui-combobox__clear"
              onClick={clear}
            >
              <X />
            </button>
          )}
          <span className="ui-combobox__chevron" aria-hidden="true">
            <ChevronDown />
          </span>
        </div>

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

        {present &&
          mounted &&
          createPortal(
            <div
              ref={contentRef}
              onAnimationEnd={onExitAnimationEnd}
              className={`ui-combobox__content ${status === 'closing' ? 'ui-overlay-exit' : 'ui-overlay-enter'}`}
              data-side={side}
              style={{
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                minWidth,
                visibility: position ? 'visible' : 'hidden',
              }}
            >
              <div className="ui-combobox__search-wrap">
                <span className="ui-combobox__search-icon" aria-hidden="true">
                  <Search />
                </span>
                <input
                  ref={searchRef}
                  id={searchInputId}
                  type="text"
                  // NOT role="combobox" — the trigger button already carries
                  // it, and APG allows exactly one per pattern. This is the
                  // popup's filter field: a named searchbox that still drives
                  // the listbox via aria-activedescendant.
                  role="searchbox"
                  aria-label={searchPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  aria-controls={listboxId}
                  aria-activedescendant={activeDescendantId}
                  className="ui-combobox__search-input"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
              <div
                id={listboxId}
                role="listbox"
                aria-labelledby={triggerId}
                className="ui-combobox__listbox"
              >
                {filtered.length === 0 ? (
                  <div className="ui-combobox__empty" role="status">
                    {emptyMessage}
                  </div>
                ) : (
                  filtered.map((option, idx) => {
                    const isSelected = option.value === value;
                    const isHighlighted = idx === highlightIndex;
                    return (
                      <div
                        key={option.value}
                        id={`${id}-opt-${option.value}`}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        data-index={idx}
                        data-disabled={option.disabled ? '' : undefined}
                        data-highlighted={isHighlighted ? '' : undefined}
                        data-state={isSelected ? 'checked' : 'unchecked'}
                        className="ui-combobox__item"
                        onMouseEnter={() => setHighlightIndex(idx)}
                        onClick={() => selectAt(idx)}
                      >
                        <span
                          className="ui-combobox__item-indicator"
                          aria-hidden="true"
                        >
                          {isSelected && <Check />}
                        </span>
                        <span className="ui-combobox__item-content">
                          <span className="ui-combobox__item-label">
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="ui-combobox__item-description">
                              {option.description}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

Combobox.displayName = 'Combobox';

export default Combobox;
