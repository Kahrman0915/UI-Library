import { Fragment, type ReactNode } from 'react';
import { Code } from '../../src/index';
import './docs.scss';

/**
 * Render a `parameters.ui` string, turning `backticked` spans into inline code.
 *
 * The prose in `parameters.ui` is plain strings by design — parameters cross
 * Storybook's channel on every prepared-story message, so React elements don't
 * belong in them. Markdown's one useful affordance here is inline code (naming
 * a sibling component, a prop, a token), so that much is parsed back out at
 * render time and handed to our own `Code`.
 */
export function prose(text: string): ReactNode {
  if (!text.includes('`')) return text;
  return text.split(/`([^`]+)`/g).map((part, i) =>
    // Odd indices are the captured group — the contents of a backtick pair.
    i % 2 === 1 ? (
      <Code key={i}>{part}</Code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
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
