import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * The attributes that scope the token system to a subtree: mode, brand theme,
 * tint, spacing density and the Aiden surface.
 */
export const PORTAL_SCOPE_ATTRS = ['data-mode', 'data-theme', 'data-tint', 'data-density', 'data-surface'] as const;

export type PortalScope = Partial<Record<(typeof PORTAL_SCOPE_ATTRS)[number], string>>;

/**
 * The nearest value of each scope attribute above `el`. A value set on `<html>`
 * is skipped: a portal under `document.body` already inherits it, and copying it
 * would freeze a mode or theme the page changes while the surface is open.
 */
export function readPortalScope(el: Element | null): PortalScope {
  const scope: PortalScope = {};
  if (!el) return scope;
  for (const attr of PORTAL_SCOPE_ATTRS) {
    const host = el.closest(`[${attr}]`);
    if (host && host !== el.ownerDocument.documentElement) scope[attr] = host.getAttribute(attr) ?? '';
  }
  return scope;
}

const sameScope = (a: PortalScope, b: PortalScope) =>
  PORTAL_SCOPE_ATTRS.every((attr) => a[attr] === b[attr]);

/**
 * Carries a subtree's theming onto a portaled surface.
 *
 * Every floating surface renders into `document.body`, outside the subtree that
 * opened it, so a menu opened inside `<section data-theme="rm">` used to render
 * in the page's theme instead. This hook reads the scope where the component
 * sits and returns it as attributes to spread on the portal root.
 *
 * Render the returned `anchorRef` on a hidden element **in the tree** — beside
 * the portal, rendered only while the surface is — and spread `scope` on the
 * portal root BEFORE `{...rest}`, so a consumer's own `data-theme` still wins:
 *
 * ```tsx
 * const { anchorRef, scope } = usePortalScope(open);
 * return (
 *   <>
 *     <span ref={anchorRef} hidden />
 *     {createPortal(<div {...scope} {...rest}>…</div>, document.body)}
 *   </>
 * );
 * ```
 *
 * Measured in a layout effect, so the first paint is already in scope.
 */
export function usePortalScope(active: boolean) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [scope, setScope] = useState<PortalScope>({});

  useIsomorphicLayoutEffect(() => {
    if (!active) return;
    const next = readPortalScope(anchorRef.current);
    setScope((prev) => (sameScope(prev, next) ? prev : next));
  }, [active]);

  return { anchorRef, scope };
}
