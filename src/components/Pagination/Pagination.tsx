import { forwardRef } from 'react';
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react';
import type {
  PaginationProps,
  PaginationContentProps,
  PaginationItemProps,
  PaginationLinkProps,
  PaginationPrevNextProps,
  PaginationEllipsisProps,
} from './Pagination.types';
// Cells reuse the Button visual, so its stylesheet must be present even when no
// <Button> is rendered nearby (same pattern as NativeSelect → Input.scss).
import '../Button/Button.scss';
import './Pagination.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Root — <nav aria-label="pagination">
// ═════════════════════════════════════════════════════════════════════════════

const Pagination = forwardRef<HTMLElement, PaginationProps>(
  ({ className, children, ...rest }, ref) => (
    <nav
      {...rest}
      ref={ref}
      aria-label={rest['aria-label'] ?? 'pagination'}
      className={`ui-pagination${className ? ' ' + className : ''}`}
    >
      {children}
    </nav>
  ),
);

Pagination.displayName = 'Pagination';

const PaginationContent = forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, children, ...rest }, ref) => (
    <ul
      {...rest}
      ref={ref}
      className={`ui-pagination__list${className ? ' ' + className : ''}`}
    >
      {children}
    </ul>
  ),
);

PaginationContent.displayName = 'PaginationContent';

const PaginationItem = forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, children, ...rest }, ref) => (
    <li
      {...rest}
      ref={ref}
      className={`ui-pagination__item${className ? ' ' + className : ''}`}
    >
      {children}
    </li>
  ),
);

PaginationItem.displayName = 'PaginationItem';

// A page cell. Reuses the Button visual: ghost by default, outline when active.
const PaginationLink = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  (
    { isActive = false, disabled = false, href, onClick, className, children, ...rest },
    ref,
  ) => (
    <a
      {...rest}
      ref={ref}
      // A disabled cell must actually be inert: no href (so it can't navigate),
      // out of the tab order, click swallowed — aria-disabled alone still works.
      href={disabled ? undefined : href}
      tabIndex={disabled ? -1 : undefined}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      className={`ui-button ui-button--default ui-button--default-${isActive ? 'outline' : 'ghost'} ui-button--sz-small ui-pagination__link${isActive ? ' ui-pagination__link--active' : ''}${className ? ' ' + className : ''}`}
    >
      {children}
    </a>
  ),
);

PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = forwardRef<HTMLAnchorElement, PaginationPrevNextProps>(
  (
    { showLabel = true, disabled = false, href, onClick, className, children, ...rest },
    ref,
  ) => (
    <a
      {...rest}
      ref={ref}
      // `disabled` is destructured OUT of rest — spreading it onto an <a>
      // emitted an invalid DOM attribute (and a React warning). It maps to
      // aria-disabled + real inertness instead.
      href={disabled ? undefined : href}
      tabIndex={disabled ? -1 : undefined}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      aria-label="Go to previous page"
      aria-disabled={disabled || undefined}
      className={`ui-button ui-button--default ui-button--default-ghost ui-button--sz-small ui-pagination__link ui-pagination__prev${className ? ' ' + className : ''}`}
    >
      <ChevronLeft />
      {showLabel && <span>{children ?? 'Previous'}</span>}
    </a>
  ),
);

PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = forwardRef<HTMLAnchorElement, PaginationPrevNextProps>(
  (
    { showLabel = true, disabled = false, href, onClick, className, children, ...rest },
    ref,
  ) => (
    <a
      {...rest}
      ref={ref}
      href={disabled ? undefined : href}
      tabIndex={disabled ? -1 : undefined}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      aria-label="Go to next page"
      aria-disabled={disabled || undefined}
      className={`ui-button ui-button--default ui-button--default-ghost ui-button--sz-small ui-pagination__link ui-pagination__next${className ? ' ' + className : ''}`}
    >
      {showLabel && <span>{children ?? 'Next'}</span>}
      <ChevronRight />
    </a>
  ),
);

PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ className, ...rest }, ref) => (
    <span
      {...rest}
      ref={ref}
      className={`ui-pagination__ellipsis${className ? ' ' + className : ''}`}
    >
      {/* Icon only is hidden — an aria-hidden WRAPPER would swallow the
          sr-only text below, silencing the element entirely. */}
      <Ellipsis aria-hidden="true" />
      <span className="ui-pagination__sr-only">More pages</span>
    </span>
  ),
);

PaginationEllipsis.displayName = 'PaginationEllipsis';

export default Pagination;
export {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
