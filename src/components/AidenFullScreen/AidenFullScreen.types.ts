import type { FullScreenDialogProps } from '../FullScreenDialog/FullScreenDialog.types';

export type AidenFullScreenProps = Omit<
  FullScreenDialogProps,
  'contentWidth'
> & {
  /**
   * The page-over-a-page title. Defaults to `Aiden` — pass the assistant's
   * name as the product brands it.
   */
  title?: string;
  /**
   * Extra header controls (a `ChatModelPicker`, a history toggle), rendered
   * beside the close X.
   */
  headerActions?: React.ReactNode;
};
