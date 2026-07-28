import { forwardRef } from 'react';
import type { SwitchProps } from './Switch.types';
import '../Label/Label.scss';
import './Switch.scss';

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      id,
      checked,
      defaultChecked,
      onCheckedChange,
      label,
      description,
      disabled = false,
      required,
      name,
      value,
      size = 'default',
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <label
        className={`ui-switch-wrap ui-switch-wrap--sz-${size}${disabled ? ' ui-switch-wrap--disabled' : ''}${className ? ' ' + className : ''}`}
        htmlFor={id}
      >
        <input
          {...rest}
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          className="ui-switch__input"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          required={required}
          name={name}
          value={value}
          aria-describedby={description ? `${id}-description` : undefined}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
        />
        <span className="ui-switch" aria-hidden="true">
          <span className="ui-switch__thumb" />
        </span>
        {(label || description) && (
          <span
            className={`ui-label ui-label--sz-${size}${disabled ? ' ui-label--disabled' : ''}`}
          >
            {label && <span className="ui-label__text">{label}</span>}
            {description && (
              // aria-hidden keeps the helper out of the switch's accessible NAME
              // (we're inside the wrapping <label>); the id re-exposes it as a
              // description via the input's aria-describedby.
              <span
                className="ui-label__description"
                id={`${id}-description`}
                aria-hidden="true"
              >
                {description}
              </span>
            )}
          </span>
        )}
      </label>
    );
  },
);

Switch.displayName = 'Switch';

export default Switch;
