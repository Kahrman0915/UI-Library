import { createContext, forwardRef, useContext } from 'react';
import type {
  InputGroupAddonProps,
  InputGroupButtonProps,
  InputGroupInputProps,
  InputGroupProps,
  InputGroupTextProps,
  InputGroupTextareaProps,
} from './InputGroup.types';
import '../Input/Input.scss';
import './InputGroup.scss';

// Internal only — carries the group's `disabled` down to the real controls so
// `<InputGroup disabled>` actually disables the input/textarea/buttons (it
// previously only painted the classes, leaving everything typeable). A child's
// own `disabled` prop still wins.
const InputGroupContext = createContext<{ disabled: boolean }>({
  disabled: false,
});

// ═════════════════════════════════════════════════════════════════════════════
// InputGroup — reuses `.ui-input-wrap` for border/focus-within/hover, layers
// on flex ordering so addons can sit on either side or stack above/below.
// ═════════════════════════════════════════════════════════════════════════════

const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  (
    {
      size = 'default',
      disabled = false,
      error = false,
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <InputGroupContext.Provider value={{ disabled }}>
      <div
        {...rest}
        ref={ref}
        data-size={size}
        data-disabled={disabled ? '' : undefined}
        data-invalid={error ? '' : undefined}
        className={`ui-input-field ui-input-field--sz-${size} ui-input-group${className ? ' ' + className : ''}`}
      >
        <div
          className={`ui-input-wrap ui-input-group__wrap${disabled ? ' ui-input-wrap--disabled' : ''}${error ? ' ui-input-wrap--error' : ''}`}
        >
          {children}
        </div>
      </div>
    </InputGroupContext.Provider>
  ),
);

InputGroup.displayName = 'InputGroup';

// ═════════════════════════════════════════════════════════════════════════════
// Input — raw <input>, no border. Sits at CSS order 2 (middle).
// ═════════════════════════════════════════════════════════════════════════════

const InputGroupInput = forwardRef<HTMLInputElement, InputGroupInputProps>(
  ({ className, disabled, ...rest }, ref) => {
    const group = useContext(InputGroupContext);
    return (
      <input
        {...rest}
        ref={ref}
        disabled={disabled ?? group.disabled}
        data-slot="input-group-control"
        className={`ui-input ui-input-group__input${className ? ' ' + className : ''}`}
      />
    );
  },
);

InputGroupInput.displayName = 'InputGroupInput';

// ═════════════════════════════════════════════════════════════════════════════
// Textarea — raw <textarea>, no border. Wraps drop the fixed height so the
// textarea can size itself; padding lives on the field.
// ═════════════════════════════════════════════════════════════════════════════

const InputGroupTextarea = forwardRef<
  HTMLTextAreaElement,
  InputGroupTextareaProps
>(({ className, disabled, ...rest }, ref) => {
  const group = useContext(InputGroupContext);
  return (
    <textarea
      {...rest}
      ref={ref}
      disabled={disabled ?? group.disabled}
      data-slot="input-group-control"
      className={`ui-input ui-input-group__textarea${className ? ' ' + className : ''}`}
    />
  );
});

InputGroupTextarea.displayName = 'InputGroupTextarea';

// ═════════════════════════════════════════════════════════════════════════════
// Addon — icon/text/button container. CSS `order` puts it in the right slot
// while the DOM order stays semantic (input first for tab flow).
// ═════════════════════════════════════════════════════════════════════════════

const InputGroupAddon = forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ align = 'inline-start', className, children, ...rest }, ref) => (
    <div
      {...rest}
      ref={ref}
      data-align={align}
      className={`ui-input-group__addon ui-input-group__addon--${align}${className ? ' ' + className : ''}`}
    >
      {children}
    </div>
  ),
);

InputGroupAddon.displayName = 'InputGroupAddon';

// ═════════════════════════════════════════════════════════════════════════════
// Text — muted inline text (currency, unit, kbd hint).
// ═════════════════════════════════════════════════════════════════════════════

const InputGroupText = forwardRef<HTMLSpanElement, InputGroupTextProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      {...rest}
      ref={ref}
      className={`ui-input-group__text${className ? ' ' + className : ''}`}
    >
      {children}
    </span>
  ),
);

InputGroupText.displayName = 'InputGroupText';

// ═════════════════════════════════════════════════════════════════════════════
// Button — small, flat button that fits inside the input wrap.
// ═════════════════════════════════════════════════════════════════════════════

const InputGroupButton = forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  (
    {
      size = 'xs',
      variant = 'ghost',
      className,
      children,
      type,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const group = useContext(InputGroupContext);
    return (
      <button
        {...rest}
        ref={ref}
        type={type ?? 'button'}
        disabled={disabled ?? group.disabled}
        data-size={size}
        data-variant={variant}
        className={`ui-input-group__button ui-input-group__button--sz-${size} ui-input-group__button--${variant}${className ? ' ' + className : ''}`}
      >
        {children}
      </button>
    );
  },
);

InputGroupButton.displayName = 'InputGroupButton';

export default InputGroup;
export {
  InputGroupInput,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
};
