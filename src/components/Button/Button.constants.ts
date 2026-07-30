// Spinner px per size rung. Indexed by a `Size`-typed value, so a missing key is
// a type error rather than a silently-undefined spinner.
export const spinnerSize = {
  xs: 12,
  sm: 16,
  default: 16,
  lg: 20,
} as const;

export const aidenStyles = new Set<string>([
  'default',
  'secondary',
  'outline',
  'ghost',
  'link',
]);
