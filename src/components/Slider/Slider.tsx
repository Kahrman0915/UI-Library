import { forwardRef, useCallback, useRef, useState } from 'react';
import Label from '#components/Label/Label';
import type { SliderProps, SliderValueProps } from './Slider.types';
import './Slider.scss';

/** Snap to the step grid, then clamp into [min, max]. */
const snap = (raw: number, min: number, max: number, step: number): number => {
  if (step <= 0) return Math.min(max, Math.max(min, raw));
  const steps = Math.round((raw - min) / step);
  // toFixed guards against float drift on fractional steps (0.1 + 0.2 …).
  const snapped = Number((min + steps * step).toFixed(10));
  return Math.min(max, Math.max(min, snapped));
};

const Slider = forwardRef<HTMLDivElement, SliderProps>((props, ref) => {
  const {
    id,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    label,
    description,
    showValue = false,
    formatValue,
    size = 'default',
    className,
    ...restProps
  } = props;

  // `range` / `value` / `defaultValue` / `onValueChange` are read off `props`
  // below rather than destructured above, so they'd otherwise ride `...rest`
  // onto the DOM — React warns on the boolean and the rest land as attributes.
  // Same two-step strip as Accordion.
  const {
    range: _range,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    ...rest
  } = restProps as typeof restProps & SliderValueProps;

  const isRange = props.range === true;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activeThumb = useRef<'lower' | 'upper' | null>(null);

  // State is always a [lower, upper] pair. In single mode `lower` is pinned to
  // `min` so the filled portion is simply min → value, and only the upper thumb
  // is rendered. That keeps one code path for geometry, drag and painting.
  const toPair = useCallback(
    (v: number | [number, number] | undefined): [number, number] | undefined => {
      if (v === undefined) return undefined;
      return Array.isArray(v) ? [v[0], v[1]] : [min, v];
    },
    [min],
  );

  const [internal, setInternal] = useState<[number, number]>(
    () => toPair(props.defaultValue) ?? (isRange ? [min, max] : [min, min]),
  );

  const controlled = props.value !== undefined;
  const pair = (controlled ? toPair(props.value) : internal) ?? [min, min];
  const [lower, upper] = pair;

  const emit = (next: [number, number]) => {
    if (!controlled) setInternal(next);
    if (isRange) {
      (props.onValueChange as ((v: [number, number]) => void) | undefined)?.(next);
    } else {
      (props.onValueChange as ((v: number) => void) | undefined)?.(next[1]);
    }
  };

  const setThumb = (which: 'lower' | 'upper', raw: number) => {
    const v = snap(raw, min, max, step);
    // Single mode: `lower` stays pinned to `min`, only the value moves.
    if (!isRange) {
      emit([min, v]);
      return;
    }
    // Range: each thumb clamps against the other. They may meet but never
    // cross, and dragging one must never shove the other along with it.
    if (which === 'upper') {
      emit([lower, Math.max(v, lower)]);
    } else {
      emit([Math.min(v, upper), upper]);
    }
  };

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const valueFromPointer = (clientX: number): number => {
    const el = trackRef.current;
    if (!el) return min;
    const r = el.getBoundingClientRect();
    const ratio = r.width === 0 ? 0 : (clientX - r.left) / r.width;
    return min + ratio * (max - min);
  };

  const onTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const raw = valueFromPointer(e.clientX);
    // Grab whichever thumb is nearer to the press.
    const which: 'lower' | 'upper' =
      isRange && Math.abs(raw - lower) < Math.abs(raw - upper) ? 'lower' : 'upper';
    activeThumb.current = which;
    setThumb(which, raw);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || activeThumb.current === null) return;
    setThumb(activeThumb.current, valueFromPointer(e.clientX));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    activeThumb.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const onThumbKeyDown =
    (which: 'lower' | 'upper') => (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (disabled) return;
      const current = which === 'lower' ? lower : upper;
      const big = step * 10;
      let next: number | null = null;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = current + step;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          next = current - step;
          break;
        case 'PageUp':
          next = current + big;
          break;
        case 'PageDown':
          next = current - big;
          break;
        case 'Home':
          next = min;
          break;
        case 'End':
          next = max;
          break;
        default:
          return;
      }
      e.preventDefault();
      setThumb(which, next);
    };

  const fmt = formatValue ?? ((v: number) => String(v));
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;

  const thumb = (which: 'lower' | 'upper') => {
    const v = which === 'lower' ? lower : upper;
    // Each thumb's own bounds stop at the other thumb, so assistive tech
    // announces the real range of travel rather than the full scale.
    const thumbMin = which === 'upper' && isRange ? lower : min;
    const thumbMax = which === 'lower' ? upper : max;
    return (
      <span
        key={which}
        id={`${id}-thumb-${which}`}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={thumbMin}
        aria-valuemax={thumbMax}
        aria-valuenow={v}
        aria-valuetext={fmt(v)}
        aria-orientation="horizontal"
        aria-disabled={disabled || undefined}
        aria-label={isRange ? (which === 'lower' ? 'Minimum' : 'Maximum') : undefined}
        aria-labelledby={!isRange && label ? labelId : undefined}
        aria-describedby={descriptionId}
        className="ui-slider__thumb"
        style={{ left: `${pct(v)}%` }}
        onKeyDown={onThumbKeyDown(which)}
      />
    );
  };

  const displayValue = isRange ? `${fmt(lower)} – ${fmt(upper)}` : fmt(upper);

  return (
    <div
      {...rest}
      ref={ref}
      id={id}
      role={label ? 'group' : undefined}
      aria-labelledby={label ? labelId : undefined}
      data-disabled={disabled ? '' : undefined}
      className={`ui-slider ui-slider--sz-${size}${disabled ? ' ui-slider--disabled' : ''}${className ? ' ' + className : ''}`}
    >
      {(label || showValue) && (
        <div className="ui-slider__header">
          {label ? (
            <Label
              id={labelId}
              size={size}
              disabled={disabled}
              description={description}
              descriptionId={descriptionId}
            >
              {label}
            </Label>
          ) : (
            <span />
          )}
          {showValue && <span className="ui-slider__value">{displayValue}</span>}
        </div>
      )}

      <div
        ref={trackRef}
        className="ui-slider__track"
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="ui-slider__range"
          style={{ left: `${pct(lower)}%`, width: `${pct(upper) - pct(lower)}%` }}
        />
        {isRange && thumb('lower')}
        {thumb('upper')}
      </div>
    </div>
  );
});

Slider.displayName = 'Slider';

export default Slider;
