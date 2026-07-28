import type { ReactNode } from 'react';
import './docs.scss';

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

/** The framed live-demo surface. */
export function Stage({ fill, children }: StageProps) {
  return (
    <div className={`ui-docs-stage${fill ? ' ui-docs-stage--fill' : ''}`}>
      {fill ? children : <div className="ui-docs-stage__inner">{children}</div>}
    </div>
  );
}
