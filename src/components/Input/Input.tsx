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
              error && errorMessage ? `${id}-error` : undefined
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
        {error && errorMessage && (
          <p id={`${id}-error`} className="ui-input__error">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
