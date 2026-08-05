import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import Label from '#components/Label/Label';
import type {
  NativeSelectProps,
  NativeSelectOptionProps,
  NativeSelectOptGroupProps,
} from './NativeSelect.types';
import '../Label/Label.scss';
import '../Input/Input.scss';
import './NativeSelect.scss';

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
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
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
          className={`ui-input-wrap${error ? ' ui-input-wrap--error' : ''}${disabled ? ' ui-input-wrap--disabled' : ''}`}
        >
          <select
            {...rest}
            ref={ref}
            id={id}
            className="ui-input ui-native-select"
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
          >
            {children}
          </select>
          {/* Before the chevron, so the affordance keeps the outer edge — same
              ordering rule as Input's IconRight. */}
          {required && !label && (
            <span className="ui-input__required" aria-hidden="true">
              *
            </span>
          )}
          <span
            className="ui-input__icon ui-native-select__chevron"
            aria-hidden="true"
          >
            <ChevronDown />
          </span>
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

NativeSelect.displayName = 'NativeSelect';

// Thin typed wrappers over native <option> / <optgroup> so a NativeSelect tree
// reads consistently; the browser renders the actual dropdown list.
const NativeSelectOption = forwardRef<
  HTMLOptionElement,
  NativeSelectOptionProps
>(({ children, ...rest }, ref) => (
  <option {...rest} ref={ref}>
    {children}
  </option>
));

NativeSelectOption.displayName = 'NativeSelectOption';

const NativeSelectOptGroup = forwardRef<
  HTMLOptGroupElement,
  NativeSelectOptGroupProps
>(({ children, ...rest }, ref) => (
  <optgroup {...rest} ref={ref}>
    {children}
  </optgroup>
));

NativeSelectOptGroup.displayName = 'NativeSelectOptGroup';

export default NativeSelect;
export { NativeSelectOption, NativeSelectOptGroup };
