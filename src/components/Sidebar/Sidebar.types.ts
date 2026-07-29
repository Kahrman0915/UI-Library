/** Which edge the panel is docked to. */
export type SidebarSide = 'left' | 'right';

/**
 * How the panel sits against the page.
 * - `sidebar` — flush to the edge, sharing a border with the content.
 * - `floating` — inset from the edge with its own rounded card and shadow.
 * - `inset` — the *content* is the card: the page area gets a rounded, raised
 *   surface and the sidebar sits on the page background behind it.
 */
export type SidebarVariant = 'sidebar' | 'floating' | 'inset';

/**
 * What collapsing does.
 * - `offcanvas` — the panel slides fully off-screen and the content reclaims
 *   the width.
 * - `icon` — the panel narrows to `--sidebar-width-icon`, keeping icons
 *   visible; labels hide and `SidebarMenuButton tooltip` takes over.
 * - `none` — not collapsible; the trigger and rail do nothing.
 */
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none';

/** Derived from `open` — what the panel is doing right now. */
export type SidebarState = 'expanded' | 'collapsed';

/** Shape returned by `useSidebar()`. Read it from anywhere inside the provider. */
export type SidebarContextValue = {
  /** `expanded` | `collapsed` — the derived form of `open`. */
  state: SidebarState;
  /** Desktop open state. On mobile the panel is a Drawer — see `openMobile`. */
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Whether the mobile Drawer is showing. Tracked separately from `open`. */
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  /** True below 768px, where the sidebar renders as a `Drawer` instead. */
  isMobile: boolean;
  /** Flips whichever of `open` / `openMobile` applies at the current width. */
  toggleSidebar: () => void;
};

/**
 * Owns the open state for everything below it, and lays out the sidebar beside
 * the page content. Wrap your whole app shell in one.
 */
export type SidebarProviderProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Initial desktop open state. Ignored when `open` is supplied — and ignored
   * on any later visit, since the resolved state persists to localStorage.
   */
  defaultOpen?: boolean;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

/**
 * The panel itself. Must sit inside a `SidebarProvider`.
 *
 * Below 768px it renders as a `Drawer` regardless of `collapsible`, so a
 * collapsed desktop sidebar and a mobile one are different surfaces.
 */
export type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Default `left`. */
  side?: SidebarSide;
  /** Default `sidebar`. See {@link SidebarVariant}. */
  variant?: SidebarVariant;
  /** Default `offcanvas`. See {@link SidebarCollapsible}. */
  collapsible?: SidebarCollapsible;
  children: React.ReactNode;
  className?: string;
};

/**
 * Button that toggles the sidebar. Put it in your page header — it works from
 * anywhere inside the provider, not just inside the panel.
 *
 * `⌘B` toggles too, and is registered by the provider.
 */
export type SidebarTriggerProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
  };

/**
 * The hit-strip along the panel's inner edge — a second, mouse-friendly way to
 * collapse it. Deliberately out of the tab order (the trigger is the keyboard
 * path), so it needs no label of its own.
 */
export type SidebarRailProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

/**
 * The page content beside the sidebar. Required for `variant="inset"`, which
 * styles this element as the raised card; harmless with the other variants.
 */
export type SidebarInsetProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  className?: string;
};

/** Search field styled for the sidebar's own token surface. */
export type SidebarInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

/**
 * Shared shape for the structural parts — `SidebarHeader`, `SidebarFooter`,
 * `SidebarContent`, `SidebarGroup`, `SidebarGroupContent`, `SidebarMenu`,
 * `SidebarMenuItem`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarSeparator`.
 * They differ in element and spacing, not in API.
 */
export type SidebarSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

/** Row height. `lg` suits a row with a two-line label or an avatar. */
export type SidebarMenuButtonSize = 'sm' | 'default' | 'lg';
/** `outline` adds a border — for a row that reads as its own control. */
export type SidebarMenuButtonVariant = 'default' | 'outline';

/** A navigation row. The main interactive element inside `SidebarMenuItem`. */
export type SidebarMenuButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Marks the current page. Sets `aria-current` and the active surface. */
    isActive?: boolean;
    /** Default `default`. See {@link SidebarMenuButtonSize}. */
    size?: SidebarMenuButtonSize;
    /** Default `default`. See {@link SidebarMenuButtonVariant}. */
    variant?: SidebarMenuButtonVariant;
    /** Shown as a Tooltip when the sidebar is collapsed to icon mode. */
    tooltip?: React.ReactNode;
    /** Render the single child element instead of a <button> (e.g. an <a>). */
    asChild?: boolean;
    children: React.ReactNode;
    className?: string;
  };

/**
 * Trailing control on a menu row — an overflow menu, a pin, a close. Renders
 * outside the row's own button so the two don't nest.
 */
export type SidebarMenuActionProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Reveal the action only on row hover / focus. */
    showOnHover?: boolean;
    /** Render the single child element instead of a `<button>`. */
    asChild?: boolean;
    className?: string;
  };

/** Trailing count or status pill on a menu row. Hidden in icon mode. */
export type SidebarMenuBadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
};

/** Placeholder row for a menu that is still loading. Composes `Skeleton`. */
export type SidebarMenuSkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Include a leading icon block, to match rows that have one. */
  showIcon?: boolean;
  className?: string;
};

/** Heading above a `SidebarGroup`. Fades out in icon mode. */
export type SidebarGroupLabelProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Render the single child element instead of a `<div>`. */
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Control aligned to a group label — typically "add" or "see all". */
export type SidebarGroupActionProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Render the single child element instead of a `<button>`. */
    asChild?: boolean;
    className?: string;
  };

/** A nested row inside `SidebarMenuSub`. Renders as an `<a>` by default. */
export type SidebarMenuSubButtonProps =
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    /** Default `default`. `sm` for a denser nested list. */
    size?: 'sm' | 'default';
    /** Marks the current page. Sets `aria-current`. */
    isActive?: boolean;
    /** Render the single child element instead of an `<a>`. */
    asChild?: boolean;
    children: React.ReactNode;
    className?: string;
  };
