export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

export type DrawerProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: DrawerSide;
  closeOnOutsideClick?: boolean;
  className?: string;
};

export type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  title: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
};

export type DrawerBodyProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};
