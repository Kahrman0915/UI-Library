import { forwardRef } from 'react';
import Label from '#components/Label/Label';
import type { InputProps } from './Input.types';
import '../Label/Label.scss';
import './Input.scss';

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      description,
      error = false,
      errorMessage,
      IconLeft,
      IconRight,
      size = 'default',
      onChange,
      onValueChange,
      required,
      disabled,
      className,
      ...rest
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    return (
      <div
        className={`ui-input-field ui-input-field--sz-${size}${className ? ' ' + className : ''}`}
      >
        {label && (
          <Label
            htmlFor={id}
            required={required}
            disabled={disabled}
            description={description}
            descriptionId={description ? `${id}-description` : undefined}
            size={size}
          >
            {label}
          </Label>
        )}
        <div
          className={`ui-input-wrap${IconLeft ? ' ui-input-wrap--has-left' : ''}${IconRight ? ' ui-input-wrap--has-right' : ''}${error ? ' ui-input-wrap--error' : ''}${disabled ? ' ui-input-wrap--disabled' : ''}`}
        >
          {IconLeft && (
            <span className="ui-input__icon ui-input__icon--left" aria-hidden="true">
              <IconLeft />
            </span>
          )}
          <input
            {...rest}
            ref={ref}
            id={id}
            className="ui-input"
            required={required}
            disabled={disabled}
            aria-invalid={error || undefined}
            aria-describedby={
              [
                label && description ? `${id}-description` : null,
                error && errorMessage ? `${id}-error` : null,
              ]
                .filter(Boolean)
                .join(' ') || undefined
            }
            onChange={handleChange}
          />
          {IconRight && (
            <span
              className="ui-input__icon ui-input__icon--right"
              aria-hidden="true"
            >
              <IconRight />
            </span>
          )}
        </div>
        {/*
          `role="alert"` so a validation error that appears after submit is
          announced. It is also referenced by the control's aria-describedby,
          which only covers the case where focus lands on the field afterwards —
          without the live role, an error the user never focuses is silent.
          Rendered conditionally on purpose: inserting the node IS the live-region
          trigger, and an always-present empty <p> would carry this element's
          layout. (Toast's region is persistent instead because it is a portal
          container that has to exist to receive anything.)
        */}
        {error && errorMessage && (
          <p id={`${id}-error`} className="ui-input__error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
