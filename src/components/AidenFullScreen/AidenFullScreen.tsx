import { forwardRef } from 'react';
import FullScreenDialog, {
  FullScreenDialogBody,
  FullScreenDialogHeader,
} from '../FullScreenDialog/FullScreenDialog';
import type { AidenFullScreenProps } from './AidenFullScreen.types';
import './AidenFullScreen.scss';

/**
 * Full-screen Aiden — the assistant as a page over the page. A preset of
 * `FullScreenDialog` (the AlertDialog technique): no new portal, focus trap,
 * scroll lock, Escape handling or exit machine, and zero new keyframes.
 *
 * What the preset decides:
 * - `contentWidth="full"` + a `flush` body, so the child owns the viewport.
 *   Put a `ChatLayout` inside — ITS `ChatMessageList` owns the scroll, which
 *   keeps stick-to-bottom watching the right container. (`ChatLayout`'s own
 *   transcript column caps at the same 768px the `lg` width would have given,
 *   so nothing is lost by going full.)
 * - `data-surface="aiden"` on the dialog root — everything inside renders on
 *   the aiden surface.
 * - Escape and the header X close it; there is no click-outside on a
 *   full-screen surface. The nested-surface Escape guard is FullScreenDialog's.
 *
 * The Fab convention applies here too: hide the launcher while this is open.
 */
const AidenFullScreen = forwardRef<HTMLDivElement, AidenFullScreenProps>(
  ({ id, title = 'Aiden', headerActions, children, className, ...rest }, ref) => {
    return (
      <FullScreenDialog
        {...rest}
        ref={ref}
        id={id}
        contentWidth="full"
        data-surface="aiden"
        className={`ui-aiden-full-screen${className ? ' ' + className : ''}`}
      >
        <FullScreenDialogHeader title={title} actions={headerActions} />
        <FullScreenDialogBody flush>{children}</FullScreenDialogBody>
      </FullScreenDialog>
    );
  },
);

AidenFullScreen.displayName = 'AidenFullScreen';

export default AidenFullScreen;
