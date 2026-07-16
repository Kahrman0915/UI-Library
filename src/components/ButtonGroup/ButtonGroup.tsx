import { forwardRef } from 'react';
import type {
  ButtonGroupProps,
  ButtonGroupSeparatorProps,
  ButtonGroupTextProps,
} from './ButtonGroup.types';
import './ButtonGroup.scss';

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ id, children, orientation = 'horizontal', className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        role="group"
        className={`ui-button-group ui-button-group--${orientation}${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

ButtonGroup.displayName = 'ButtonGroup';

const ButtonGroupSeparator = forwardRef<
  HTMLDivElement,
  ButtonGroupSeparatorProps
>(({ id, orientation = 'vertical', className, ...rest }, ref) => {
  return (
    <div
      {...rest}
      ref={ref}
      id={id}
      role="separator"
      aria-orientation={orientation}
      className={`ui-button-group__separator ui-button-group__separator--${orientation}${className ? ' ' + className : ''}`}
    />
  );
});

ButtonGroupSeparator.displayName = 'ButtonGroupSeparator';

const ButtonGroupText = forwardRef<HTMLDivElement, ButtonGroupTextProps>(
  ({ id, children, className, ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        id={id}
        className={`ui-button-group__text${className ? ' ' + className : ''}`}
      >
        {children}
      </div>
    );
  },
);

ButtonGroupText.displayName = 'ButtonGroupText';

export default ButtonGroup;
export { ButtonGroupSeparator, ButtonGroupText };
