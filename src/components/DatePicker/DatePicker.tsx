import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays } from 'lucide-react';
import Label from '#components/Label/Label';
import Calendar from '#components/Calendar/Calendar';
import { useMounted } from '#/hooks/useMounted';
import { usePresence } from '#/hooks/usePresence';
import { useFloatingReposition } from '#/hooks/useFloatingReposition';
import { computePosition } from '#/utils/computePosition';
import { formatMediumDate, toISODate } from '#/utils/date';
import type { DatePickerProps } from './DatePicker.types';
import '../Input/Input.scss';
import '../Label/Label.scss';
import './DatePicker.scss';
import '../../styles/overlay-entrance.scss';

const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      id,
      value: valueProp,
      defaultValue,
      onValueChange,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      label,
      description,
      error = false,
      errorMessage,
      required = false,
      disabled = false,
      size = 'default',
      placeholder = 'Select a date',
      name,
      min,
      max,
      isDateDisabled,
      weekStartsOn = 0,
      locale,
      showOutsideDays = true,
      formatValue,
      side = 'bottom',
      align = 'start',
      sideOffset = 4,
      panelLabel = 'Choose a date',
      previousMonthLabel,
      nextMonthLabel,
      className,
    },
    ref,
  ) => {
    // ── Selection ────────────────────────────────────────────────────────────
    const controlledValue = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState<Date | null>(
      defaultValue ?? null,
    );
    const selected = controlledValue ? (valueProp ?? null) : internalValue;

    // ── Panel ────────────────────────────────────────────────────────────────
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
    const close = useCallback(() => setOpen(false), [setOpen]);

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    // The WRAP is the anchor, not the button: the button is `flex: 1` inside a
    // padded wrap, so anchoring to it would inset the panel by the field's own
    // padding and leave the panel visibly off the field's left edge.
    const [wrapNode, setWrapNode] = useState<HTMLDivElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(
      null,
    );
    const mounted = useMounted();
    const { present, status, onExitAnimationEnd } = usePresence(open);

    const triggerId = `${id}-trigger`;
    const panelId = `${id}-panel`;
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error && errorMessage ? `${id}-error` : undefined;
    const describedBy =
      [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    const reposition = useCallback(() => {
      if (!wrapNode || !panelRef.current) return;
      setPosition(
        computePosition(
          wrapNode.getBoundingClientRect(),
          panelRef.current.getBoundingClientRect(),
          side,
          align,
          sideOffset,
        ),
      );
    }, [wrapNode, side, align, sideOffset]);

    useLayoutEffect(() => {
      if (!open) return;
      reposition();
    }, [open, reposition]);

    // computePosition measures once; this is what keeps the panel glued to the
    // field when the window resizes or any ancestor scrolls.
    useFloatingReposition(open, reposition, wrapNode);

    // Outside click closes. mousedown rather than click so a drag that starts
    // outside and ends inside cannot resurrect the panel.
    useEffect(() => {
      if (!open) return;
      const onMouseDown = (event: MouseEvent) => {
        const target = event.target as Node;
        if (panelRef.current?.contains(target)) return;
        if (wrapNode?.contains(target)) return;
        close();
      };
      document.addEventListener('mousedown', onMouseDown);
      return () => document.removeEventListener('mousedown', onMouseDown);
    }, [open, wrapNode, close]);

    // Escape closes and hands focus back to the field. The calendar grid
    // deliberately does not preventDefault on Escape, so it reaches here.
    useEffect(() => {
      if (!open) return;
      const onKey = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [open, close]);

    const selectDate = (date: Date) => {
      if (!controlledValue) setInternalValue(date);
      onValueChange?.(date);
      close();
      triggerRef.current?.focus();
    };

    const display = selected
      ? (formatValue ?? ((d: Date) => formatMediumDate(d, locale)))(selected)
      : undefined;

    const panel = present && mounted && (
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-label={panelLabel}
        data-side={side}
        onAnimationEnd={onExitAnimationEnd}
        className={`ui-date-picker__panel ${status === 'closing' ? 'ui-overlay-exit' : 'ui-overlay-enter'}`}
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          visibility: position ? 'visible' : 'hidden',
        }}
        // The panel is portalled to <body>, so Tab from the trigger walks past
        // it in DOM order rather than into it. Focus lands inside on open
        // instead, and this closes the panel the moment focus leaves it for
        // anything other than the field — which is what a Tab out means here.
        // A null relatedTarget (a click on dead space) is left to the
        // outside-mousedown handler; closing on it would fire on every
        // non-focusable click inside the panel's own chrome.
        onBlur={(event) => {
          const next = event.relatedTarget as Node | null;
          if (!next) return;
          if (panelRef.current?.contains(next)) return;
          if (wrapNode?.contains(next)) return;
          close();
        }}
      >
        <Calendar
          id={`${id}-calendar`}
          autoFocus
          value={selected}
          defaultMonth={selected ?? undefined}
          onValueChange={selectDate}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          weekStartsOn={weekStartsOn}
          locale={locale}
          showOutsideDays={showOutsideDays}
          size={size}
          previousMonthLabel={previousMonthLabel}
          nextMonthLabel={nextMonthLabel}
        />
      </div>
    );

    return (
      <div
        className={`ui-input-field ui-input-field--sz-${size}${className ? ' ' + className : ''}`}
      >
        {label && (
          <Label
            htmlFor={triggerId}
            required={required}
            disabled={disabled}
            description={description}
            descriptionId={descriptionId}
            size={size}
          >
            {label}
          </Label>
        )}
        {!label && description && (
          <span id={descriptionId} className="ui-label__description">
            {description}
          </span>
        )}
        <div
          ref={setWrapNode}
          className={`ui-input-wrap ui-date-picker__trigger-wrap${disabled ? ' ui-input-wrap--disabled' : ''}${error ? ' ui-input-wrap--error' : ''}${open ? ' ui-date-picker__trigger-wrap--open' : ''}`}
          // The whole field opens the panel, like a native date control — the
          // glyph and the wrap's padding are siblings of the button, so without
          // this there is a dead strip down the right edge of a field whose
          // cursor already says "clickable". Clicks that originate in a real
          // button are ignored so nothing double-fires.
          onClick={(event) => {
            if (disabled) return;
            if ((event.target as HTMLElement).closest('button')) return;
            setOpen(!open);
            triggerRef.current?.focus();
          }}
        >
          <button
            ref={(node) => {
              triggerRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref)
                (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
                  node;
            }}
            id={triggerId}
            type="button"
            role="combobox"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            aria-required={required || undefined}
            aria-invalid={error || undefined}
            aria-describedby={describedBy}
            disabled={disabled}
            className="ui-date-picker__trigger"
            onClick={() => setOpen(!open)}
            onKeyDown={(event) => {
              // Enter and Space already reach `onClick` on a native button;
              // only the arrows need wiring, and only to OPEN — once the panel
              // is up the grid owns them.
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                if (!open) setOpen(true);
              }
            }}
          >
            <span
              className={`ui-date-picker__value${display ? '' : ' ui-date-picker__value--placeholder'}`}
            >
              {display ?? placeholder}
            </span>
          </button>
          {required && !label && (
            <span className="ui-input__required" aria-hidden="true">
              *
            </span>
          )}
          <span className="ui-date-picker__icon" aria-hidden="true">
            <CalendarDays />
          </span>
        </div>
        {name !== undefined && (
          <input
            type="hidden"
            name={name}
            value={selected ? toISODate(selected) : ''}
          />
        )}
        {/*
          `role="alert"` so a validation error appearing after submit is
          announced even when focus never returns to the field; the trigger's
          aria-describedby only covers the case where it does. Rendered
          conditionally on purpose — inserting the node IS the live-region
          trigger.
        */}
        {error && errorMessage && (
          <p id={errorId} className="ui-input__error" role="alert">
            {errorMessage}
          </p>
        )}
        {panel && createPortal(panel, document.body)}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
