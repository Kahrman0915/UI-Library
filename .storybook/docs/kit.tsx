import { Fragment, type ReactNode } from 'react';
import { Code } from '../../src/index';
import './docs.scss';

/**
 * Render a `parameters.ui` string, turning `backticked` spans into inline code
 * and `**bold**` into `<strong>`.
 *
 * The prose in `parameters.ui` is plain strings by design — parameters cross
 * Storybook's channel on every prepared-story message, so React elements don't
 * belong in them. Three Markdown affordances survive that constraint and are
 * parsed back out at render time: inline code (naming a sibling component, a
 * prop, a token), `{@link Name}` (a real cross-reference in an editor, literal
 * braces in a table), and bold. Paragraph breaks are the fourth — a `\n\n` is
 * honoured by `white-space: pre-line` on the elements that render prose, after
 * `unwrap()` below has made that the ONLY newline that survives.
 *
 * Anything beyond those four renders literally. Don't reach for headings,
 * lists or links here — a docs string that needs them wants to be a story.
 */
export function prose(text: string): ReactNode {
  const src = unwrap(text);
  if (!src.includes('`') && !src.includes('{@link') && !src.includes('**')) {
    return src;
  }
  // Three capture groups, so `split` emits a repeating stride of four:
  // [plain, code, link, bold, plain, …]. Only one group is ever defined per
  // match — the other two come back `undefined` and are dropped.
  return src
    .split(/`([^`]+)`|\{@link\s+([^}]+)\}|\*\*([^*]+)\*\*/g)
    .map((part, i) => {
      if (part === undefined) return null;
      const slot = i % 4;
      if (slot === 0) return <Fragment key={i}>{part}</Fragment>;
      if (slot === 3) return <strong key={i}>{part}</strong>;
      return <Code key={i}>{part.trim()}</Code>;
    });
}

/**
 * Markdown's paragraph rule: a single newline is a source wrap, a blank line is
 * a break. Unwrap the first kind so `white-space: pre-line` only ever sees the
 * second.
 *
 * This is load-bearing, not tidying. Prose reaches `prose()` from two places
 * that wrap differently: `parameters.ui` strings, which are concatenated
 * literals carrying no incidental newlines, and JSDoc comments above a story or
 * a prop, which arrive from docgen with the author's source wrapping intact.
 * Without this, `pre-line` breaks those JSDoc-authored descriptions at whatever
 * column the comment happened to wrap at — mid-sentence, on seven component
 * pages. Collapsing here also means an author can wrap a `parameters.ui` string
 * across lines later without it silently becoming a hard break.
 */
function unwrap(text: string): string {
  if (!text.includes('\n')) return text;
  return text
    .split(/\n[^\S\n]*\n\s*/)
    .map((para) => para.replace(/\s*\n\s*/g, ' ').trim())
    .join('\n\n');
}

/**
 * Layout primitives shared by the Docs template.
 *
 * These are the pieces the six Foundations story files each hand-rolled a copy
 * of. They deliberately follow the tokenized dialect (`var(--p-*)`,
 * `var(--max-w-*)`) rather than the raw-px one the older Foundations pages use.
 */

export type SectionProps = {
  /** Anchor target — also the TOC's href. */
  id: string;
  title: string;
  /** Optional sub-line under the heading. */
  description?: string;
  children: ReactNode;
};

/** A titled, anchored block. One per TOC entry. */
export function Section({ id, title, description, children }: SectionProps) {
  return (
    <section id={id} className="ui-docs-section">
      <h2 className="ui-docs-section__title">{title}</h2>
      {description ? (
        <p className="ui-docs-section__desc">{description}</p>
      ) : null}
      <div className="ui-docs-section__body">{children}</div>
    </section>
  );
}

/** Body copy inside a section. */
export function P({ children }: { children: ReactNode }) {
  return <p className="ui-docs-p">{children}</p>;
}

export type StageProps = {
  /**
   * `fill` drops the centring and tightens the padding — for stories that lay
   * out their own page (Sidebar, Chat, anything full-bleed).
   */
  fill?: boolean;
  children: ReactNode;
};

/**
 * The live-demo surface.
 *
 * Carries no chrome of its own — the surrounding `Block` owns the border,
 * radius and shadow so the demo and the code strip below it read as one card.
 */
export function Stage({ fill, children }: StageProps) {
  return (
    <div className={`ui-docs-stage${fill ? ' ui-docs-stage--fill' : ''}`}>
      {fill ? children : <div className="ui-docs-stage__inner">{children}</div>}
    </div>
  );
}

/**
 * One example: a `Stage` and a `CodePane` inside a single bordered card.
 *
 * The two are deliberately not separate cards. A demo and the source that
 * produced it are one thing, and stacking two framed boxes with a gap between
 * them made the page read as a list of unrelated panels.
 */
export function Block({ children }: { children: ReactNode }) {
  return <div className="ui-docs-block">{children}</div>;
}
