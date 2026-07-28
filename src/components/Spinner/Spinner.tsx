import { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { SpinnerProps } from './Spinner.types';
import './Spinner.scss';

const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ id, size = 16, className, ...rest }, ref) => (
    <LoaderCircle
      // Deliberate deviation from the spread-first convention: the default
      // role/aria-label sit BEFORE {...rest} so consumers can override them —
      // localize the label, or pass aria-hidden for a decorative spinner that
      // sits next to visible "Loading…" text (avoids double announcement).
      role="status"
      aria-label="Loading"
      {...rest}
      ref={ref}
      id={id}
      size={size}
      className={`ui-spinner${className ? ' ' + className : ''}`}
    />
  ),
);

Spinner.displayName = 'Spinner';

export default Spinner;
