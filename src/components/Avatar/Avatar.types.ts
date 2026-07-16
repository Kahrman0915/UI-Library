export type AvatarSize = 'sm' | 'default' | 'lg';
export type AvatarShape = 'circle' | 'square';
export type AvatarGroupSpacing = 'sm' | 'default' | 'lg';

export type AvatarProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  badge?: React.ReactNode;
  className?: string;
};

export type AvatarGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  children: React.ReactNode;
  max?: number;
  spacing?: AvatarGroupSpacing;
  size?: AvatarSize;
  className?: string;
};
