import { forwardRef } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { SpinnerProps } from './Spinner.types';
import './Spinner.scss';

const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ id, size = 16, className }, ref) => (
    <LoaderCircle
      ref={ref}
      id={id}
      role="status"
      aria-label="Loading"
      size={size}
      className={`ui-spinner${className ? ' ' + className : ''}`}
    />
  ),
);

Spinner.displayName = 'Spinner';

export default Spinner;
