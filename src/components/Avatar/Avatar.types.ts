export type AvatarSize = 'sm' | 'default' | 'lg';
export type AvatarShape = 'circle' | 'square';
/** Overlap amount for a stack. See the note on `AvatarGroupProps.spacing`. */
export type AvatarGroupSpacing = 'sm' | 'default' | 'lg';

/**
 * User/entity image with an initials fallback.
 *
 * If `src` fails to load the component swaps to the fallback automatically (and
 * resets when `src` changes), so a broken URL degrades instead of showing a
 * blank tile. Give every avatar a `fallback` — with neither `src` nor
 * `fallback` you get an empty, nameless box.
 */
export type AvatarProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  /** Image URL. On load failure the component falls back automatically. */
  src?: string;
  /**
   * Alt text for the image. Leave empty when the avatar is decorative and the
   * person's name already sits beside it, so it isn't announced twice.
   */
  alt?: string;
  /** Initials shown when there's no `src`, or it fails. Keep to 1–2 characters. */
  fallback?: string;
  /** Default `default`. Inherited from `AvatarGroup` when nested in one. */
  size?: AvatarSize;
  /** Default `circle`. */
  shape?: AvatarShape;
  /** Corner slot for a `StatusDot` or count — positioned by the avatar. */
  badge?: React.ReactNode;
  className?: string;
};

/**
 * Overlapping stack of avatars with an optional `+N` overflow chip.
 *
 * Children inherit the group's `size`, so set it here rather than on each
 * avatar. Pass `aria-label` (via `...rest`) to name the stack; unlabelled it
 * reads as loose text.
 */
export type AvatarGroupProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  children: React.ReactNode;
  /** Show at most this many avatars; the remainder collapse into a `+N` chip. */
  max?: number;
  /**
   * How far the avatars overlap. **The scale reads inversely to what the names
   * suggest:** `sm` = a *small gap*, i.e. the tightest overlap; `lg` = the most
   * separation. Think "size of the gap", not "amount of overlap".
   */
  spacing?: AvatarGroupSpacing;
  /** Applied to every child avatar. */
  size?: AvatarSize;
  className?: string;
};
