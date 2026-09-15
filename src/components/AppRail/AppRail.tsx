import { createElement, forwardRef } from 'react';
import StatusDot from '../StatusDot';
import { useOptionalSidebar } from '../Sidebar/Sidebar';
import type { AppRailProps, AppRailItemProps } from './AppRail.types';
import '../../styles/icon-button.scss';
import './AppRail.scss';

// The application rail: the switcher that moves a customer between the sub-applications,
// and the one piece of shared chrome nobody had. 52 wide on the sidebar surface, like
// Sidebar and TabBar a component of its own that AppShell composes. Items are icon-only
// links on the shared .ui-icon-button shell (owner's call: the rail reads as icons, not
// brand tiles), so nothing here takes a brand — the rail reads the scope it stands in.
// A count shows as a small StatusDot, not a numbered pill: a 24px badge swamps a 36px
// tile (owner), and the number is still announced ("3 unread"); the visible number
// belongs to the sidebar's row badge.

const cx = (base: string, className?: string) => (className ? `${base} ${className}` : base);

const AppRail = forwardRef<HTMLElement, AppRailProps>(
  ({ label = 'Applications', header, footer, className, children, ...rest }, ref) => (
    <nav aria-label={label} {...rest} ref={ref} className={cx('ui-app-rail', className)}>
      {header !== undefined && <div className="ui-app-rail__header">{header}</div>}
      <div className="ui-app-rail__apps">{children}</div>
      {footer !== undefined && <div className="ui-app-rail__footer">{footer}</div>}
    </nav>
  ),
);
AppRail.displayName = 'AppRail';

export const AppRailItem = forwardRef<HTMLElement, AppRailItemProps>(
  ({ id, label, Icon, active = false, count, href, className, onClick, ...rest }, ref) => {
    const cls = cx(`ui-icon-button ui-app-rail__item${active ? ' ui-app-rail__item--active' : ''}`, className);
    const sidebar = useOptionalSidebar();
    return createElement(
      href ? 'a' : 'button',
      {
        ...rest,
        ref,
        // Clicking the application you are already in toggles its sidebar, the same as the
        // collapse button — an active item's link points at the page you are on, so following
        // it would only reload. The consumer's handler runs first and can opt out with
        // preventDefault. Outside a SidebarProvider there is nothing to toggle, so it is a
        // plain link.
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          (onClick as ((ev: React.MouseEvent<HTMLElement>) => void) | undefined)?.(e);
          if (!active || !sidebar || e.defaultPrevented) return;
          e.preventDefault();
          sidebar.toggleSidebar();
        },
        id,
        href,
        type: href ? undefined : 'button',
        'aria-label': label,
        'aria-current': active ? 'page' : undefined,
        className: cls,
      },
      <Icon size={20} aria-hidden="true" />,
      count ? (
        <span className="ui-app-rail__count">
          <StatusDot id={`${id}-count`} status="busy" label={`${count} unread`} />
        </span>
      ) : null,
    );
  },
);
AppRailItem.displayName = 'AppRailItem';

export default AppRail;
