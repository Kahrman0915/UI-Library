export type BlockquoteProps = Omit<
  React.BlockquoteHTMLAttributes<HTMLQuoteElement>,
  'cite'
> & {
  /**
   * Optional attribution, rendered as a footer beneath the quote. (Redefines
   * the native `cite` URL attribute as displayed content.)
   */
  cite?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};
