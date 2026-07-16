export type SidebarSide = 'left' | 'right';
export type SidebarVariant = 'sidebar' | 'floating' | 'inset';
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';
export type SidebarState = 'expanded' | 'collapsed';

export type SidebarContextValue = {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

export type SidebarProviderProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

export type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: SidebarCollapsible;
  children: React.ReactNode;
  className?: string;
};

export type SidebarTriggerProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
  };

export type SidebarRailProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

export type SidebarInsetProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

export type SidebarInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export type SidebarSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

export type SidebarMenuButtonSize = 'sm' | 'default' | 'lg';
export type SidebarMenuButtonVariant = 'default' | 'outline';

export type SidebarMenuButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive?: boolean;
    size?: SidebarMenuButtonSize;
    variant?: SidebarMenuButtonVariant;
    /** Shown as a Tooltip when the sidebar is collapsed to icon mode. */
    tooltip?: React.ReactNode;
    /** Render the single child element instead of a <button> (e.g. an <a>). */
    asChild?: boolean;
    children: React.ReactNode;
    className?: string;
  };

export type SidebarMenuActionProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Reveal the action only on row hover / focus. */
    showOnHover?: boolean;
    asChild?: boolean;
    className?: string;
  };

export type SidebarMenuBadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

export type SidebarMenuSkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  showIcon?: boolean;
  className?: string;
};

export type SidebarGroupLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
};

export type SidebarGroupActionProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    className?: string;
  };

export type SidebarMenuSubButtonProps =
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    size?: 'sm' | 'default';
    isActive?: boolean;
    asChild?: boolean;
    children: React.ReactNode;
    className?: string;
  };
