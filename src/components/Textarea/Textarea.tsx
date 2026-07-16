import { forwardRef } from 'react';
import Label from '#components/Label/Label';
import type { TextareaProps } from './Textarea.types';
import '../Label/Label.scss';
import '../Input/Input.scss';
import './Textarea.scss';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      label,
      description,
      error = false,
      errorMessage,
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
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
          className={`ui-input-wrap ui-input-wrap--multi${error ? ' ui-input-wrap--error' : ''}${disabled ? ' ui-input-wrap--disabled' : ''}`}
        >
          <textarea
            {...rest}
            ref={ref}
            id={id}
            className="ui-textarea"
            required={required}
            disabled={disabled}
            aria-invalid={error || undefined}
            aria-describedby={
              error && errorMessage ? `${id}-error` : undefined
            }
            onChange={handleChange}
          />
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

Textarea.displayName = 'Textarea';

export default Textarea;
