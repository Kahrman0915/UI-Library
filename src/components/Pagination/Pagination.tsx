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
  ({ isActive = false, disabled = false, className, children, ...rest }, ref) => (
    <a
      {...rest}
      ref={ref}
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
  ({ showLabel = true, className, children, ...rest }, ref) => (
    <a
      {...rest}
      ref={ref}
      aria-label="Go to previous page"
      aria-disabled={rest.disabled || undefined}
      className={`ui-button ui-button--default ui-button--default-ghost ui-button--sz-small ui-pagination__link ui-pagination__prev${className ? ' ' + className : ''}`}
    >
      <ChevronLeft />
      {showLabel && <span>{children ?? 'Previous'}</span>}
    </a>
  ),
);

PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = forwardRef<HTMLAnchorElement, PaginationPrevNextProps>(
  ({ showLabel = true, className, children, ...rest }, ref) => (
    <a
      {...rest}
      ref={ref}
      aria-label="Go to next page"
      aria-disabled={rest.disabled || undefined}
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
      aria-hidden="true"
      className={`ui-pagination__ellipsis${className ? ' ' + className : ''}`}
    >
      <Ellipsis />
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
