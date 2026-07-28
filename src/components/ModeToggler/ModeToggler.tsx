import { forwardRef, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';
import type { Mode, ModeTogglerProps } from './ModeToggler.types';
import './ModeToggler.scss';

const DEFAULT_STORAGE_KEY = 'ui-mode';

const isMode = (v: unknown): v is Mode => v === 'light' || v === 'dark';

/** Derive the starting mode: explicit `data-mode` → localStorage → system. */
const readInitialMode = (storageKey: string | null): Mode => {
  if (typeof document === 'undefined') return 'light';
  const attr = document.documentElement.getAttribute('data-mode');
  if (isMode(attr)) return attr;
  if (storageKey) {
    try {
      const stored = localStorage.getItem(storageKey);
      if (isMode(stored)) return stored;
    } catch {
      /* localStorage blocked (private mode / sandbox) — fall through */
    }
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const ModeToggler = forwardRef<HTMLButtonElement, ModeTogglerProps>(
  (
    {
      id,
      variant = 'ghost',
      size = 'default',
      mode: modeProp,
      defaultMode,
      onModeChange,
      storageKey = DEFAULT_STORAGE_KEY,
      disableAnimation = false,
      className,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const controlled = modeProp !== undefined;
    const [internal, setInternal] = useState<Mode>(defaultMode ?? 'light');
    const [mounted, setMounted] = useState(false);
    const mode = controlled ? (modeProp as Mode) : internal;

    // Reflect the real theme: read it on mount, then keep the icon in sync with
    // whoever owns `data-mode` (a theme provider, another toggler, Storybook's
    // theme switcher) via a MutationObserver — never fight the source of truth.
    useEffect(() => {
      setMounted(true);
      if (controlled) return;

      if (defaultMode === undefined) {
        setInternal(readInitialMode(storageKey));
      } else {
        // An explicit defaultMode must actually take effect: previously the
        // icon showed defaultMode while <html data-mode> kept whatever it had,
        // desynced until the first click.
        document.documentElement.setAttribute('data-mode', defaultMode);
      }

      const el = document.documentElement;
      const observer = new MutationObserver(() => {
        const attr = el.getAttribute('data-mode');
        if (isMode(attr)) setInternal(attr);
      });
      observer.observe(el, {
        attributes: true,
        attributeFilter: ['data-mode'],
      });
      return () => observer.disconnect();
    }, [controlled, defaultMode, storageKey]);

    const commit = (next: Mode) => {
      document.documentElement.setAttribute('data-mode', next);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, next);
        } catch {
          /* persistence best-effort */
        }
      }
      if (!controlled) setInternal(next);
      onModeChange?.(next);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      const next: Mode = mode === 'dark' ? 'light' : 'dark';

      const prefersReduced = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const supportsVT =
        typeof document !== 'undefined' && 'startViewTransition' in document;

      if (disableAnimation || prefersReduced || !supportsVT) {
        commit(next);
        return;
      }

      // Circular clip-path reveal emanating from the click point.
      const x = e.clientX;
      const y = e.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      const durationRaw = getComputedStyle(document.documentElement)
        .getPropertyValue('--duration-reveal')
        .trim();
      const duration = parseFloat(durationRaw) || 500;

      const transition = (
        document as Document & {
          startViewTransition: (cb: () => void) => { ready: Promise<void> };
        }
      ).startViewTransition(() => {
        flushSync(() => commit(next));
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration,
              easing: 'ease-in-out',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        })
        .catch(() => {
          /* transition skipped (e.g. tab hidden) — state already committed */
        });
    };

    return (
      <button
        {...rest}
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={mode === 'dark'}
        aria-label={
          mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        }
        // Before mount we don't know the real theme; omit to avoid a flash.
        data-mode={mounted ? mode : undefined}
        className={`ui-mode-toggler ui-mode-toggler--${variant} ui-mode-toggler--sz-${size}${className ? ' ' + className : ''}`}
        onClick={handleClick}
      >
        <span className="ui-mode-toggler__icons" aria-hidden="true">
          <Sun className="ui-mode-toggler__icon ui-mode-toggler__icon--sun" />
          <Moon className="ui-mode-toggler__icon ui-mode-toggler__icon--moon" />
        </span>
      </button>
    );
  },
);

ModeToggler.displayName = 'ModeToggler';

export default ModeToggler;
