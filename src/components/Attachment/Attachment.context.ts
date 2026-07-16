import { createContext } from 'react';
import type {
  AttachmentOrientation,
  AttachmentSize,
  AttachmentState,
} from './Attachment.types';

export type AttachmentContextValue = {
  state: AttachmentState;
  size: AttachmentSize;
  orientation: AttachmentOrientation;
};

export const AttachmentContext =
  createContext<AttachmentContextValue | null>(null);
