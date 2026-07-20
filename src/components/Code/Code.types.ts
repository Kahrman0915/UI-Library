export type CodeProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  children?: React.ReactNode;
};

export type CodeBlockProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  id: string;
  /** The source to render and copy. Alternatively pass `children`. */
  code?: string;
  /** Optional filename shown in the header. */
  filename?: React.ReactNode;
  /** Language label (data attribute only — no syntax highlighting). */
  language?: string;
  /** Show the copy button. Default `true`. */
  showCopy?: boolean;
  className?: string;
  children?: React.ReactNode;
};
