import { createElement, forwardRef } from 'react';
import Badge from '../Badge';
import type { AppRailProps, AppRailItemProps } from './AppRail.types';
import '../../styles/icon-button.scss';
import './AppRail.scss';

// The application rail: the switcher that moves a customer between the sub-applications,
// and the one piece of shared chrome nobody had. 48 wide on the sidebar surface, like
// Sidebar and TabBar a component of its own that AppShell composes. Items are icon-only
// links on the shared .ui-icon-button shell (owner's call: the rail reads as icons, not
// brand tiles), so nothing here takes a brand — the rail reads the scope it stands in.

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
  ({ id, label, Icon, active = false, count, href, className, ...rest }, ref) => {
    const cls = cx(`ui-icon-button ui-app-rail__item${active ? ' ui-app-rail__item--active' : ''}`, className);
    return createElement(
      href ? 'a' : 'button',
      {
        ...rest,
        ref,
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
          <Badge id={`${id}-count`} color="error" label={String(count)} />
        </span>
      ) : null,
    );
  },
);
AppRailItem.displayName = 'AppRailItem';

export default AppRail;
