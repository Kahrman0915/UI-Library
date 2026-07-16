export type AttachmentState =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'error'
  | 'done';

export type AttachmentSize = 'xs' | 'sm' | 'default';

export type AttachmentOrientation = 'horizontal' | 'vertical';

export type AttachmentMediaVariant = 'icon' | 'image';

export type AttachmentProps = React.HTMLAttributes<HTMLDivElement> & {
  state?: AttachmentState;
  size?: AttachmentSize;
  orientation?: AttachmentOrientation;
  className?: string;
  children?: React.ReactNode;
};

export type AttachmentMediaProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AttachmentMediaVariant;
  className?: string;
  children?: React.ReactNode;
};

export type AttachmentContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type AttachmentTitleProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type AttachmentDescriptionProps =
  React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
    children?: React.ReactNode;
  };

export type AttachmentActionsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type AttachmentActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type AttachmentTriggerProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'type'
> &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href' | 'target' | 'type'> & {
    href?: string;
    className?: string;
    children?: React.ReactNode;
  };

export type AttachmentGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};
