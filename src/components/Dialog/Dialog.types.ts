export type DialogContentAlignment = 'left' | 'center';

export type DialogProps = {
  id: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOutsideClick?: boolean;
  inline?: boolean;
  className?: string;
};

export type DialogHeaderProps = {
  id: string;
  title: string;
  description?: string;
  alignment?: DialogContentAlignment;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
};

export type DialogBodyProps = {
  children: React.ReactNode;
  alignment?: DialogContentAlignment;
  className?: string;
};

export type DialogFooterProps = {
  children: React.ReactNode;
  className?: string;
};
