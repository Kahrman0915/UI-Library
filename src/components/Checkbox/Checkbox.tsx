import { forwardRef, useEffect, useRef } from 'react';
import type { CheckboxProps } from './Checkbox.types';
import '../Label/Label.scss';
import './Checkbox.scss';

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      checked,
      defaultChecked,
      indeterminate = false,
      onCheckedChange,
      label,
      description,
      disabled = false,
      required,
      size = 'default',
      name,
      value,
      className,
      ...rest
    },
    ref,
  ) => {
    const localRef = useRef<HTMLInputElement | null>(null);

    // React has no prop for `indeterminate` — it must be set on the DOM node.
    useEffect(() => {
      if (localRef.current) {
        localRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate, checked, defaultChecked]);

    const composedRef = (node: HTMLInputElement | null) => {
      localRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (
          ref as unknown as React.MutableRefObject<HTMLInputElement | null>
        ).current = node;
    };

    return (
      <label
        className={`ui-checkbox-wrap ui-checkbox-wrap--sz-${size}${disabled ? ' ui-checkbox-wrap--disabled' : ''}${className ? ' ' + className : ''}`}
        htmlFor={id}
      >
        <input
          {...rest}
          ref={composedRef}
          id={id}
          type="checkbox"
          className="ui-checkbox__input"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          required={required}
          name={name}
          value={value}
          aria-describedby={description ? `${id}-description` : undefined}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
        />
        <span className="ui-checkbox" aria-hidden="true">
          <svg
            className="ui-checkbox__check"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg
            className="ui-checkbox__indeterminate-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
        {(label || description) && (
          <span
            className={`ui-label${disabled ? ' ui-label--disabled' : ''}`}
          >
            {label && <span className="ui-label__text">{label}</span>}
            {description && (
              // aria-hidden keeps the helper out of the checkbox's accessible
              // NAME (this whole block is inside the wrapping <label>); the id
              // re-exposes it as a description via the input's aria-describedby.
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

Checkbox.displayName = 'Checkbox';

export default Checkbox;
