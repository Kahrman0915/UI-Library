import { forwardRef, useContext, useState } from 'react';
import type {
  RadioGroupProps,
  RadioGroupItemProps,
} from './RadioGroup.types';
import { RadioGroupContext } from './RadioGroup.context';
import '../Label/Label.scss';
import './RadioGroup.scss';

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      id,
      name,
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      required = false,
      orientation = 'vertical',
      label,
      description,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string | undefined>(
      defaultValue,
    );
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    };

    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        role="radiogroup"
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={description ? `${id}-description` : undefined}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        className={`ui-radio-group ui-radio-group--${orientation}${className ? ' ' + className : ''}`}
      >
        {(label || description) && (
          <div className="ui-radio-group__header">
            {label && (
              <span id={`${id}-label`} className="ui-label__text">
                {label}
                {required && (
                  <span className="ui-label__required" aria-hidden="true">
                    *
                  </span>
                )}
              </span>
            )}
            {description && (
              <span
                id={`${id}-description`}
                className="ui-label__description"
              >
                {description}
              </span>
            )}
          </div>
        )}
        <div className="ui-radio-group__items">
          <RadioGroupContext.Provider
            value={{
              name: name ?? id,
              value: currentValue,
              onValueChange: handleChange,
              groupDisabled: disabled,
              groupRequired: required,
            }}
          >
            {children}
          </RadioGroupContext.Provider>
        </div>
      </div>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';

const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  (
    {
      id,
      value,
      label,
      description,
      disabled: itemDisabled = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const ctx = useContext(RadioGroupContext);
    if (!ctx) {
      throw new Error(
        'RadioGroupItem must be rendered inside a <RadioGroup>.',
      );
    }
    const disabled = ctx.groupDisabled || itemDisabled;
    const checked = ctx.value === value;

    return (
      <label
        className={`ui-radio-wrap${disabled ? ' ui-radio-wrap--disabled' : ''}${className ? ' ' + className : ''}`}
        htmlFor={id}
      >
        <input
          {...rest}
          ref={ref}
          id={id}
          type="radio"
          className="ui-radio__input"
          name={ctx.name}
          value={value}
          checked={checked}
          disabled={disabled}
          required={ctx.groupRequired}
          onChange={(e) => {
            if (e.target.checked) ctx.onValueChange?.(value);
          }}
        />
        <span className="ui-radio" aria-hidden="true">
          <span className="ui-radio__dot" />
        </span>
        {(label || description) && (
          <span
            className={`ui-label${disabled ? ' ui-label--disabled' : ''}`}
          >
            {label && <span className="ui-label__text">{label}</span>}
            {description && (
              <span className="ui-label__description">{description}</span>
            )}
          </span>
        )}
      </label>
    );
  },
);

RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroupItem };
export default RadioGroup;
