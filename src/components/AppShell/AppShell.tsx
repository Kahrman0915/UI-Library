import { createElement, forwardRef } from 'react';
import Badge from '../Badge';
import Mark from '../Mark';
import type {
  AppShellProps,
  AppShellTabStripProps,
  AppShellRegionProps,
  AppShellMainProps,
  AppRailProps,
  AppRailItemProps,
} from './AppShell.types';
import './AppShell.scss';

// The application shell: the chrome every sub-application shares, as structure rather
// than advice. Strip across the top (logo · TabBar · actions), then a row of AppRail ·
// Sidebar · Main. The geometry is the owner's proof frame — strip 48, rail 48, sidebar
// 256 — so Main Content is 1136 wide at the 1440 design viewport and 1616 at 1920, which
// is exactly the width every flow screen is drawn at. A page fills Main with a
// PageContainer and never re-derives any of this.
//
// Two things it owns because they were hard-won: the workspace's `contain: layout`
// (Sidebar's panel is position: fixed and would otherwise pin to the viewport, covering
// the rail and the strip), and the override of SidebarProvider's `min-height: 100svh`,
// which is right for a bare page and wrong under a strip.

const cx = (base: string, className?: string) => (className ? `${base} ${className}` : base);

const AppShell = forwardRef<HTMLDivElement, AppShellProps>(({ id, className, children, ...rest }, ref) => (
  <div {...rest} ref={ref} id={id} className={cx('ui-app-shell', className)}>
    {children}
  </div>
));
AppShell.displayName = 'AppShell';

export const AppShellTabStrip = forwardRef<HTMLDivElement, AppShellTabStripProps>(
  ({ logo, actions, className, children, ...rest }, ref) => (
    <div {...rest} ref={ref} className={cx('ui-app-shell__strip', className)}>
      {logo !== undefined && <div className="ui-app-shell__logo">{logo}</div>}
      <div className="ui-app-shell__tabs">{children}</div>
      {actions !== undefined && <div className="ui-app-shell__actions">{actions}</div>}
    </div>
  ),
);
AppShellTabStrip.displayName = 'AppShellTabStrip';

export const AppShellBody = forwardRef<HTMLDivElement, AppShellRegionProps>(({ className, children, ...rest }, ref) => (
  <div {...rest} ref={ref} className={cx('ui-app-shell__body', className)}>
    {children}
  </div>
));
AppShellBody.displayName = 'AppShellBody';

export const AppShellWorkspace = forwardRef<HTMLDivElement, AppShellRegionProps>(({ className, children, ...rest }, ref) => (
  <div {...rest} ref={ref} className={cx('ui-app-shell__workspace', className)}>
    {children}
  </div>
));
AppShellWorkspace.displayName = 'AppShellWorkspace';

export const AppShellMain = forwardRef<HTMLElement, AppShellMainProps>(({ className, children, ...rest }, ref) => (
  <main {...rest} ref={ref} className={cx('ui-app-shell__main', className)}>
    {children}
  </main>
));
AppShellMain.displayName = 'AppShellMain';

export const AppRail = forwardRef<HTMLElement, AppRailProps>(
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
  ({ id, label, Icon, theme, active = false, count, href, className, ...rest }, ref) => {
    const cls = cx(`ui-app-rail__item${active ? ' ui-app-rail__item--active' : ''}`, className);
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
        'data-theme': theme,
        className: cls,
      },
      <span className="ui-app-rail__tile">
        <Mark id={`${id}-mark`} Icon={Icon} size="default" motion="none" />
      </span>,
      count ? (
        <span className="ui-app-rail__count">
          <Badge id={`${id}-count`} color="error" label={String(count)} />
        </span>
      ) : null,
    );
  },
);
AppRailItem.displayName = 'AppRailItem';

export default AppShell;
