import { forwardRef } from 'react';
import { ChevronRight, Ellipsis } from 'lucide-react';
import type {
  BreadcrumbEllipsisProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbListProps,
  BreadcrumbPageProps,
  BreadcrumbProps,
  BreadcrumbSeparatorProps,
} from './Breadcrumb.types';
import './Breadcrumb.scss';

// ═════════════════════════════════════════════════════════════════════════════
// Root — <nav aria-label="breadcrumb">
// ═════════════════════════════════════════════════════════════════════════════

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, ...rest }, ref) => (
    <nav
      {...rest}
      ref={ref}
      aria-label={rest['aria-label'] ?? 'breadcrumb'}
      className={`ui-breadcrumb${className ? ' ' + className : ''}`}
    >
      {children}
    </nav>
  ),
);

Breadcrumb.displayName = 'Breadcrumb';

// ═════════════════════════════════════════════════════════════════════════════
// List — <ol>, flex row with gap
// ═════════════════════════════════════════════════════════════════════════════

const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, children, ...rest }, ref) => (
    <ol
      {...rest}
      ref={ref}
      className={`ui-breadcrumb__list${className ? ' ' + className : ''}`}
    >
      {children}
    </ol>
  ),
);

BreadcrumbList.displayName = 'BreadcrumbList';

// ═════════════════════════════════════════════════════════════════════════════
// Item — <li>, aligns content vertically
// ═════════════════════════════════════════════════════════════════════════════

const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, children, ...rest }, ref) => (
    <li
      {...rest}
      ref={ref}
      className={`ui-breadcrumb__item${className ? ' ' + className : ''}`}
    >
      {children}
    </li>
  ),
);

BreadcrumbItem.displayName = 'BreadcrumbItem';

// ═════════════════════════════════════════════════════════════════════════════
// Link — <a> with hover underline. Consumers using a client-side router's
// own Link component can skip this and apply the class
// `.ui-breadcrumb__link` to their own component.
// ═════════════════════════════════════════════════════════════════════════════

const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, children, ...rest }, ref) => (
    <a
      {...rest}
      ref={ref}
      className={`ui-breadcrumb__link${className ? ' ' + className : ''}`}
    >
      {children}
    </a>
  ),
);

BreadcrumbLink.displayName = 'BreadcrumbLink';

// ═════════════════════════════════════════════════════════════════════════════
// Page — the current, non-clickable item. aria-current="page".
// ═════════════════════════════════════════════════════════════════════════════

const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      {...rest}
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={`ui-breadcrumb__page${className ? ' ' + className : ''}`}
    >
      {children}
    </span>
  ),
);

BreadcrumbPage.displayName = 'BreadcrumbPage';

// ═════════════════════════════════════════════════════════════════════════════
// Separator — <li role="presentation">, default chevron.
// ═════════════════════════════════════════════════════════════════════════════

const BreadcrumbSeparator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  ({ className, children, ...rest }, ref) => (
    <li
      {...rest}
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={`ui-breadcrumb__separator${className ? ' ' + className : ''}`}
    >
      {children ?? <ChevronRight />}
    </li>
  ),
);

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// ═════════════════════════════════════════════════════════════════════════════
// Ellipsis — visual placeholder for collapsed items.
// ═════════════════════════════════════════════════════════════════════════════

const BreadcrumbEllipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ className, children, ...rest }, ref) => (
    <span
      {...rest}
      ref={ref}
      className={`ui-breadcrumb__ellipsis${className ? ' ' + className : ''}`}
    >
      {/* Hide the ICON, not the wrapper. `aria-hidden` on the wrapper removed
          the whole subtree from the accessibility tree, sr-only text included —
          so the collapsed-items marker announced nothing at all. Matches
          PaginationEllipsis. */}
      {children ?? <Ellipsis aria-hidden="true" />}
      <span className="ui-breadcrumb__sr-only">More</span>
    </span>
  ),
);

BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

export default Breadcrumb;
export {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
