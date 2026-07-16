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
          <span className="ui-label__description">{description}</span>
        )}
      </label>
    );
  },
);

Label.displayName = 'Label';

export default Label;
