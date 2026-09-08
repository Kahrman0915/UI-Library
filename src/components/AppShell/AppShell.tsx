import { forwardRef } from 'react';
import type {
  AppShellProps,
  AppShellTabStripProps,
  AppShellRegionProps,
  AppShellMainProps,
} from './AppShell.types';
import './AppShell.scss';

// The application shell: the chrome every sub-application shares, as structure rather
// than advice. Strip across the top (logo · TabBar · actions), then a row of AppRail ·
// Sidebar · Main. The geometry is the owner's proof frame — strip 48, rail 48, sidebar
// 256 — so Main Content is 1136 wide at the 1440 design viewport and 1616 at 1920, which
// is exactly the width every flow screen is drawn at. A page fills Main with a
// PageContainer and never re-derives any of this. AppRail is its own component (like
// Sidebar and TabBar) that the shell composes.
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

export default AppShell;
