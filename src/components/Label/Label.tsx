import { forwardRef } from 'react';
import type { LabelProps } from './Label.types';
import './Label.scss';

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      children,
      htmlFor,
      size = 'default',
      required = false,
      disabled = false,
      description,
      descriptionId,
      className,
      ...rest
    },
    ref,
  ) => {
    return (
      <label
        {...rest}
        ref={ref}
        htmlFor={htmlFor}
        className={`ui-label ui-label--sz-${size}${disabled ? ' ui-label--disabled' : ''}${className ? ' ' + className : ''}`}
      >
        <span className="ui-label__text">
          {children}
          {required && (
            <span className="ui-label__required" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {description && (
          // aria-hidden removes the helper text from the control's accessible
          // NAME (label-content computation skips hidden descendants), while the
          // id lets the control expose it as a DESCRIPTION via aria-describedby —
          // directly-referenced hidden nodes are still read (accname §2A). This
          // keeps the DOM/layout identical while un-polluting the name.
          <span
            className="ui-label__description"
            id={descriptionId}
            aria-hidden="true"
          >
            {description}
          </span>
        )}
      </label>
    );
  },
);

Label.displayName = 'Label';

export default Label;
