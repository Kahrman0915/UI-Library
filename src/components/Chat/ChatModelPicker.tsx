import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import Badge from '../Badge/Badge';
import type { ChatModelPickerProps } from './Chat.types';

/**
 * The model / response-style control for a chat header — the slot
 * `ChatLayoutHeader`'s JSDoc has reserved since the layout shipped.
 *
 * Composes `DropdownMenu` wholesale (the Menubar precedent — the menu-item
 * styling copy count stays at 4): positioning, arrow-key navigation, Escape
 * and outside-click all come free. `DropdownMenu`, not `Select`, because the
 * trigger is a ghost button showing the current choice — a form field with a
 * border would read as part of a form, and a chat header is not a form.
 */
const ChatModelPicker = forwardRef<HTMLButtonElement, ChatModelPickerProps>(
  (
    { id, models, value, onValueChange, disabled, align = 'start', className, ...rest },
    ref,
  ) => {
    const current = models.find((m) => m.value === value);
    return (
      <DropdownMenu id={id}>
        <DropdownMenuTrigger>
          <button
            {...rest}
            ref={ref}
            type="button"
            disabled={disabled}
            className={`ui-chat-model-picker${className ? ' ' + className : ''}`}
          >
            <span className="ui-chat-model-picker__label">
              {current ? current.label : 'Choose model'}
            </span>
            <ChevronDown className="ui-chat-model-picker__chevron" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(v) => onValueChange?.(v)}
          >
            {models.map((m) => (
              <DropdownMenuRadioItem key={m.value} value={m.value} disabled={m.disabled}>
                <span className="ui-chat-model-picker__item">
                  <span className="ui-chat-model-picker__item-label">
                    {m.label}
                    {m.badge && (
                      <Badge id={`${id}-${m.value}-badge`} variant="outline">
                        {m.badge}
                      </Badge>
                    )}
                  </span>
                  {m.description && (
                    <span className="ui-chat-model-picker__item-description">
                      {m.description}
                    </span>
                  )}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

ChatModelPicker.displayName = 'ChatModelPicker';

export default ChatModelPicker;
