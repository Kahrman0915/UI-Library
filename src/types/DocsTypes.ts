/**
 * The `parameters.ui` contract read by the bespoke Storybook Docs template
 * (`.storybook/docs/DocsPage.tsx`).
 *
 * Every field is optional and every section of the page renders only when its
 * data exists, so a component with no `parameters.ui` at all still produces a
 * complete-looking page (header → preview → import → examples → API).
 *
 * **Prose is plain strings, deliberately.** Storybook serialises `parameters`
 * over its channel to the manager; React elements survive but bloat every
 * story-prepared message. Keep copy as text and let the template do the markup.
 *
 * This module is types-only — it is erased at build time and is intentionally
 * **not** re-exported from `src/index.ts`. It lives under `src/` only so story
 * files (which are typechecked) can import it.
 *
 * @example
 * const meta: Meta<typeof Button> = {
 *   title: 'Components/Button',
 *   component: Button,
 *   parameters: {
 *     ui: {
 *       description: 'Triggers an action…',
 *       usage: { when: ['…'], avoid: ['…'] },
 *     } satisfies UiDocsParameters,
 *   },
 * };
 */

/** Maturity pill shown in the page header. */
export type UiDocsStatus = 'stable' | 'beta' | 'experimental' | 'deprecated';

/** One row of the Composition section — a part of a compound component. */
export type UiDocsPart = {
  /** Export name, e.g. `SelectTrigger`. Rendered in mono. */
  name: string;
  /** What the part is responsible for. One sentence. */
  description: string;
  /** Marks the part as structurally required by its parent. */
  required?: boolean;
};

/** One row of the keyboard table in the Accessibility section. */
export type UiDocsKey = {
  /** Keys rendered as `<Kbd>` caps, joined by `+` (chord) — e.g. `['⌘', 'K']`. */
  keys: string[];
  /** What pressing them does. */
  description: string;
};

/** When to reach for the component, and when to reach for something else. */
export type UiDocsUsage = {
  /** "Use it when…" bullets. */
  when?: string[];
  /** "Reach for something else when…" bullets — name the alternative. */
  avoid?: string[];
  /** Free prose rendered under the two columns. */
  notes?: string;
};

/** Keyboard map + screen-reader notes. */
export type UiDocsA11y = {
  keyboard?: UiDocsKey[];
  /** Roles, live regions, focus management — anything a consumer can get wrong. */
  notes?: string;
};

/**
 * One entry in a component's change log.
 *
 * **Deliberately records no author.** A design system's history is about what
 * moved and why, not who moved it — git already answers the latter, and putting
 * names on a docs page invites reading changes as personal rather than
 * systemic.
 */
export type UiDocsChange = {
  /** ISO `YYYY-MM-DD`. Rendered as-is, so keep the format consistent. */
  date: string;
  /**
   * What changed, for someone who *uses* the component — no file paths, no
   * internals. "The error message is now announced by screen readers."
   */
  summary: string;
  /**
   * The same change for someone who *maintains* it: the prop, the token, the
   * mechanism, the reason. Omit when the summary already says everything.
   */
  detail?: string;
};

/**
 * Prose for the Motion section.
 *
 * **The token list is NOT here** — it is derived from the component's SCSS at
 * render time (`.storybook/docs/motion.ts`), because a hand-copied list of
 * tokens starts accurate and quietly stops being so. This type carries only the
 * part a machine cannot infer: what the movement is *for*.
 */
export type UiDocsMotion = {
  /** What moves and why. One short paragraph — the reader can see the tokens. */
  notes?: string;
  /** Individual moments worth calling out: "Hover", "Open", "Exit". */
  moments?: UiDocsMoment[];
};

export type UiDocsMoment = {
  /** The trigger: `'Hover'`, `'Open'`, `'Checked'`, `'Dismiss'`. */
  trigger: string;
  /** What happens, in plain language. Backticks render as inline code. */
  description: string;
};

export type UiDocsParameters = {
  /** One-paragraph lede under the title. The single highest-value field. */
  description?: string;
  /** Maturity pill. Omit for `stable` — the default reads as unremarkable. */
  status?: UiDocsStatus;
  /** Extra header pills: `'compound'`, `'portal'`, `'form control'`, … */
  tags?: string[];
  usage?: UiDocsUsage;
  /** One entry per compound part, in the order a consumer nests them. */
  composition?: UiDocsPart[];
  a11y?: UiDocsA11y;
  /**
   * Motion prose. The section renders for any component that animates, whether
   * or not this is set — without it the reader still gets the derived token
   * inventory, just no explanation of intent.
   */
  motion?: UiDocsMotion;
  /** Replaces the auto-generated `import { X } from '@ui/lib';` line. */
  importCode?: string;
  /**
   * Change history, **newest first**. Every change to a component should add an
   * entry here in the same commit — the docs page is where a consumer looks to
   * find out whether something moved under them.
   */
  changelog?: UiDocsChange[];
};
