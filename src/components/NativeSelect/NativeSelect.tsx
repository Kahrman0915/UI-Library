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
            aria-describedby={error && errorMessage ? `${id}-error` : undefined}
            onChange={handleChange}
          >
            {children}
          </select>
          <span
            className="ui-input__icon ui-input__icon--right ui-native-select__chevron"
            aria-hidden="true"
          >
            <ChevronDown />
          </span>
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
