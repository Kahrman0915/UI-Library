import { Fragment, forwardRef, useCallback, useRef, useState } from 'react';
import Label from '../Label/Label';
import type { InputOTPProps } from './InputOTP.types';
import './InputOTP.scss';

// One real <input> holds the whole value (so native paste, mobile one-time-code
// autofill and selection all work); the visual slots render from that value.

const DEFAULT_PATTERN = /[0-9]/;

const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(
  (
    {
      id,
      length = 6,
      value: valueProp,
      defaultValue,
      onChange,
      onComplete,
      disabled = false,
      error = false,
      errorMessage,
      size = 'default',
      autoFocus = false,
      pattern = DEFAULT_PATTERN,
      inputMode = 'numeric',
      groupSize,
      label,
      description,
      required = false,
      className,
      'aria-label': ariaLabel,
      onFocus,
      onBlur,
      onKeyUp,
      onClick,
      onSelect,
      ...rest
    },
    ref,
  ) => {
    const controlled = valueProp !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? '');
    const value = controlled ? valueProp : internal;
    const [focused, setFocused] = useState(false);
    const [caret, setCaret] = useState(0);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const setInputNode = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const syncCaret = () => {
      const el = inputRef.current;
      if (el) setCaret(el.selectionStart ?? 0);
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const filtered = e.target.value
        .split('')
        .filter((c) => pattern.test(c))
        .join('')
        .slice(0, length);
      if (filtered !== value) {
        if (!controlled) setInternal(filtered);
        onChange?.(filtered);
        if (filtered.length === length && value.length < length) {
          onComplete?.(filtered);
        }
      }
      syncCaret();
    };

    const activeIndex = focused ? Math.min(caret, length - 1) : -1;
    const errorId = error && errorMessage ? `${id}-error` : undefined;
    const descId = !error && description ? `${id}-description` : undefined;

    return (
      <div className={`ui-otp-field${className ? ' ' + className : ''}`}>
        {label && (
          <Label htmlFor={id} size={size} required={required} disabled={disabled}>
            {label}
          </Label>
        )}

        <div
          className={`ui-otp ui-otp--sz-${size}${disabled ? ' ui-otp--disabled' : ''}${error ? ' ui-otp--error' : ''}`}
          data-disabled={disabled ? '' : undefined}
          data-invalid={error ? '' : undefined}
        >
          <input
            {...rest}
            ref={setInputNode}
            id={id}
            className="ui-otp__input"
            value={value}
            disabled={disabled}
            required={required}
            inputMode={inputMode}
            autoComplete="one-time-code"
            autoFocus={autoFocus}
            maxLength={length}
            aria-label={ariaLabel}
            aria-invalid={error || undefined}
            aria-describedby={errorId ?? descId}
            onChange={handleInput}
            onFocus={(e) => {
              onFocus?.(e);
              setFocused(true);
              syncCaret();
            }}
            onBlur={(e) => {
              onBlur?.(e);
              setFocused(false);
            }}
            onKeyUp={(e) => {
              onKeyUp?.(e);
              syncCaret();
            }}
            onClick={(e) => {
              onClick?.(e);
              syncCaret();
            }}
            onSelect={(e) => {
              onSelect?.(e);
              syncCaret();
            }}
          />

          <div className="ui-otp__slots" aria-hidden="true">
            {Array.from({ length }).map((_, i) => {
              const active = focused && i === activeIndex;
              const char = value[i] ?? '';
              const showSep =
                groupSize && (i + 1) % groupSize === 0 && i < length - 1;
              return (
                <Fragment key={i}>
                  <div
                    className={`ui-otp__slot${active ? ' ui-otp__slot--active' : ''}${char ? ' ui-otp__slot--filled' : ''}`}
                  >
                    {char}
                    {active && !char && <span className="ui-otp__caret" />}
                  </div>
                  {showSep && <span className="ui-otp__separator" />}
                </Fragment>
              );
            })}
          </div>
        </div>

        {error && errorMessage ? (
          <span id={errorId} className="ui-otp__error" role="alert">
            {errorMessage}
          </span>
        ) : (
          description && (
            <span id={descId} className="ui-otp__description">
              {description}
            </span>
          )
        )}
      </div>
    );
  },
);

InputOTP.displayName = 'InputOTP';

export default InputOTP;
