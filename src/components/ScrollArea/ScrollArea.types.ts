export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';
export type ScrollAreaType = 'auto' | 'hover';

export type ScrollAreaProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  children: React.ReactNode;
  orientation?: ScrollAreaOrientation;
  type?: ScrollAreaType;
  className?: string;
};
