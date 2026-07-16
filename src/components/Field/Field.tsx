import { forwardRef } from 'react';
import Separator from '#components/Separator/Separator';
import type {
  FieldContentProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldGroupProps,
  FieldLabelProps,
  FieldLegendProps,
  FieldProps,
  FieldSeparatorProps,
  FieldSetProps,
  FieldTitleProps,
} from './Field.types';
import '../Label/Label.scss';
import './Field.scss';

// ═════════════════════════════════════════════════════════════════════════════
// FieldSet — semantic <fieldset> wrapper.
// ═════════════════════════════════════════════════════════════════════════════

const FieldSet = forwardRef<HTMLFieldSetElement, FieldSetProps>(
  ({ className, children, disabled, ...rest }, ref) => (
    <fieldset
      {...rest}
      ref={ref}
      disabled={disabled}
      data-disabled={disabled ? '' : undefined}
      className={`ui-field-set${className ? ' ' + className : ''}`}
    >
      {children}
    </fieldset>
  ),
);

FieldSet.displayName = 'FieldSet';

// ═════════════════════════════════════════════════════════════════════════════
// FieldLegend — <legend>. Two visual variants (heading-style vs label-style).
// ═════════════════════════════════════════════════════════════════════════════

const FieldLegend = forwardRef<HTMLLegendElement, FieldLegendProps>(
  ({ variant = 'legend', className, children, ...rest }, ref) => (
    <legend
      {...rest}
      ref={ref}
      data-variant={variant}
      className={`ui-field-legend ui-field-legend--${variant}${className ? ' ' + className : ''}`}
    >
      {children}
    </legend>
  ),
);

FieldLegend.displayName = 'FieldLegend';

// ═════════════════════════════════════════════════════════════════════════════
// FieldGroup — flex column of Fields with consistent spacing.
// ═════════════════════════════════════════════════════════════════════════════

const FieldGroup = forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      role="group"
      className={`ui-field-group${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

FieldGroup.displayName = 'FieldGroup';

// ═════════════════════════════════════════════════════════════════════════════
// Field — single-field wrapper. Stacks label/control/description/error.
// ═════════════════════════════════════════════════════════════════════════════

const Field = forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      orientation = 'vertical',
      invalid = false,
      disabled = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <div
      {...rest}
      ref={ref}
      role="group"
      data-orientation={orientation}
      data-invalid={invalid ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      className={`ui-field ui-field--${orientation}${invalid ? ' ui-field--invalid' : ''}${disabled ? ' ui-field--disabled' : ''}${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

Field.displayName = 'Field';

// ═════════════════════════════════════════════════════════════════════════════
// FieldContent — inner column for controls whose "label" is a sibling row
// (Checkbox, Switch etc. laid out horizontal).
// ═════════════════════════════════════════════════════════════════════════════

const FieldContent = forwardRef<HTMLDivElement, FieldContentProps>(
  ({ className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-field__content${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

FieldContent.displayName = 'FieldContent';

// ═════════════════════════════════════════════════════════════════════════════
// FieldLabel — <label htmlFor>. Composes the shared Label primitive's classes
// (`.ui-label__text` / `.ui-label__required`) so typography stays in one place.
// ═════════════════════════════════════════════════════════════════════════════

const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ required = false, className, children, ...rest }, ref) => (
    <label
      {...rest}
      ref={ref}
      className={`ui-field-label ui-label ui-label--sz-default${className ? ' ' + className : ''}`}
    >
      <span className="ui-label__text">
        {children}
        {required && (
          <span className="ui-label__required" aria-hidden="true">
            *
          </span>
        )}
      </span>
    </label>
  ),
);

FieldLabel.displayName = 'FieldLabel';

// ═════════════════════════════════════════════════════════════════════════════
// FieldTitle — same styling as FieldLabel but for a container that isn't
// semantically a `<label>` (e.g. a Checkbox card row).
// ═════════════════════════════════════════════════════════════════════════════

const FieldTitle = forwardRef<HTMLDivElement, FieldTitleProps>(
  ({ required = false, className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      className={`ui-field-title ui-label ui-label--sz-default${className ? ' ' + className : ''}`}
    >
      <span className="ui-label__text">
        {children}
        {required && (
          <span className="ui-label__required" aria-hidden="true">
            *
          </span>
        )}
      </span>
    </div>
  ),
);

FieldTitle.displayName = 'FieldTitle';

// ═════════════════════════════════════════════════════════════════════════════
// FieldDescription — helper text under the control.
// ═════════════════════════════════════════════════════════════════════════════

const FieldDescription = forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(({ className, children, ...rest }, ref) => (
  <p
    {...rest}
    ref={ref}
    className={`ui-field-description${className ? ' ' + className : ''}`}
  >
    {children}
  </p>
));

FieldDescription.displayName = 'FieldDescription';

// ═════════════════════════════════════════════════════════════════════════════
// FieldError — error text or list. role="alert" so SR announces it.
// ═════════════════════════════════════════════════════════════════════════════

const FieldError = forwardRef<HTMLDivElement, FieldErrorProps>(
  ({ errors, className, children, ...rest }, ref) => {
    const list =
      errors && errors.length > 0 ? errors.filter(Boolean) : undefined;

    if (!list && !children) return null;

    return (
      <div
        {...rest}
        ref={ref}
        role="alert"
        aria-live="polite"
        className={`ui-field-error${className ? ' ' + className : ''}`}
      >
        {list ? (
          list.length === 1 ? (
            list[0]
          ) : (
            <ul className="ui-field-error__list">
              {list.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          )
        ) : (
          children
        )}
      </div>
    );
  },
);

FieldError.displayName = 'FieldError';

// ═════════════════════════════════════════════════════════════════════════════
// FieldSeparator — thin wrapper over the shared Separator primitive.
// ═════════════════════════════════════════════════════════════════════════════

const FieldSeparator = forwardRef<HTMLDivElement, FieldSeparatorProps>(
  ({ className, children, ...rest }, ref) => (
    <Separator
      {...rest}
      ref={ref}
      label={children}
      className={`ui-field-separator${className ? ' ' + className : ''}`}
    />
  ),
);

FieldSeparator.displayName = 'FieldSeparator';

export {
  Field,
  FieldSet,
  FieldLegend,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldError,
  FieldSeparator,
};

export default Field;
