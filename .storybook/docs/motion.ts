/// <reference types="vite/client" />
/**
 * Motion inventory, derived from source at render time.
 *
 * The alternative was hand-writing a token list into each component's
 * `parameters.ui`. That is ~40 lists that nothing checks, and the SCSS is the
 * thing that actually decides what animates — so the list would start accurate
 * and quietly stop being so, which is the failure mode this repo keeps meeting.
 * Reading the SCSS instead means the section cannot lie: change a transition and
 * the docs change with it.
 *
 * Vite resolves these globs eagerly at build time and this whole directory is
 * dev-only, so nothing here reaches the published bundle.
 */

const scssFiles = import.meta.glob('../../src/components/*/*.scss', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const tsxFiles = import.meta.glob('../../src/components/*/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const sharedFiles = import.meta.glob('../../src/styles/*.scss', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const tokensSrc =
  Object.entries(sharedFiles).find(([p]) => p.endsWith('tokens.scss'))?.[1] ?? '';

/**
 * `--duration-fast` → `100ms`. Motion tokens are mode-independent, so the first
 * definition wins; a token defined only inside a `[data-mode]` block still
 * resolves because we are not scoping the search.
 *
 * Comments are stripped FIRST. `tokens.scss` documents its easings in prose that
 * names them (`--ease-premium: confident, fast start with…`), and without this
 * the value pattern matches inside the comment and runs to the next semicolon —
 * so the pill rendered a paragraph of documentation instead of a cubic-bezier.
 */
const stripComments = (css: string) =>
  css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');

const tokenValues = new Map<string, string>();
for (const m of stripComments(tokensSrc).matchAll(
  /(--(?:duration|ease|motion|stagger)[a-z0-9-]*)\s*:\s*([^;]+);/g,
)) {
  if (!tokenValues.has(m[1])) tokenValues.set(m[1], m[2].trim());
}

const TOKEN_RE = /--(?:duration|ease|motion|stagger)[a-z0-9-]*/g;

/**
 * Friendly names for the shared stylesheets a component can pull in. Anything
 * not listed still resolves — it just shows its filename.
 */
const SHARED_LABELS: Record<string, string> = {
  'overlay-entrance.scss': 'Overlay entrance / exit',
  'stagger.scss': 'Staggered list entrance',
  'reveal.scss': 'Skeleton → content reveal',
  'ripple.scss': 'Material ripple',
  'icon-button.scss': 'Shared icon-button shell',
};

export type MotionToken = { name: string; value?: string };

export type MotionInventory = {
  /** Tokens named in the component's own SCSS. */
  own: MotionToken[];
  /** Shared utilities it applies, with the tokens they bring. */
  utilities: { label: string; tokens: MotionToken[] }[];
  /** `@keyframes` the component declares. */
  keyframes: string[];
  hasTransition: boolean;
  hasAnimation: boolean;
  /** True when there is anything at all worth rendering. */
  any: boolean;
};

const toTokens = (names: Iterable<string>): MotionToken[] =>
  [...new Set(names)]
    .sort()
    .map((name) => ({ name, value: tokenValues.get(name) }));

const cache = new Map<string, MotionInventory>();

const EMPTY: MotionInventory = {
  own: [], utilities: [], keyframes: [], hasTransition: false, hasAnimation: false, any: false,
};

/**
 * `Button` → everything that moves in `src/components/Button/`.
 *
 * Takes CANDIDATES because a component's `displayName` is not always its
 * directory: Toast's is `Toaster`, Direction's is `DirectionProvider`. Looking up
 * by displayName alone silently returned nothing for both — the section just
 * didn't render, which is the quietest possible failure. The story title's last
 * segment is the reliable one; displayName is the fallback.
 */
export function motionFor(...candidates: (string | undefined)[]): MotionInventory {
  const names = candidates.filter((c): c is string => Boolean(c));
  const key = names.join('|');
  const hit = cache.get(key);
  if (hit) return hit;

  const component = names.find((n) =>
    Object.keys(scssFiles).some((p) => p.includes(`/src/components/${n}/`)),
  );
  if (!component) {
    cache.set(key, EMPTY);
    return EMPTY;
  }

  const dir = `/src/components/${component}/`;
  // Comments are stripped from component sources for the same reason as from
  // tokens.scss: Drawer.scss explains *why* a `var()` inside `@keyframes` is
  // wrong, and the word "@keyframes parks" in that sentence was being reported
  // as a real keyframe called `parks`.
  const scss = stripComments(
    Object.entries(scssFiles)
      .filter(([p]) => p.includes(dir))
      .map(([, src]) => src)
      .join('\n'),
  );
  const tsx = stripComments(
    Object.entries(tsxFiles)
      .filter(([p]) => p.includes(dir) && !p.includes('.stories.'))
      .map(([, src]) => src)
      .join('\n'),
  );

  // A component declares what it borrows by importing the stylesheet — Textarea
  // imports Input's wrap, Pagination imports Button's classes, CloseButton pulls
  // the shared icon-button shell. Reading those imports is how the section stays
  // honest for the ~10 components whose motion lives in someone else's file;
  // sniffing for class names missed all of them.
  const utilities: { label: string; tokens: MotionToken[] }[] = [];
  const seenSrc = new Set<string>();

  for (const m of tsx.matchAll(/import\s+'([^']+\.scss)'/g)) {
    const spec = m[1];
    const shared = spec.match(/styles\/([\w-]+\.scss)$/);
    const sibling = spec.match(/\.\.\/([\w-]+)\/[\w-]+\.scss$/);

    let src = '';
    let label = '';
    if (shared) {
      src = Object.entries(sharedFiles).find(([p]) => p.endsWith(shared[1]))?.[1] ?? '';
      label = SHARED_LABELS[shared[1]] ?? shared[1];
    } else if (sibling && sibling[1] !== component) {
      src = Object.entries(scssFiles)
        .filter(([p]) => p.includes(`/src/components/${sibling[1]}/`))
        .map(([, v]) => v)
        .join('\n');
      label = `Inherited from ${sibling[1]}`;
    }
    if (!src || seenSrc.has(label)) continue;
    seenSrc.add(label);

    const tokens = toTokens(stripComments(src).match(TOKEN_RE) ?? []);
    if (tokens.length) utilities.push({ label, tokens });
  }

  const inventory: MotionInventory = {
    own: toTokens(scss.match(TOKEN_RE) ?? []),
    utilities,
    keyframes: [...new Set([...scss.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]))].sort(),
    hasTransition: /^\s*transition:/m.test(scss),
    hasAnimation: /^\s*animation:/m.test(scss),
    any: false,
  };
  inventory.any =
    inventory.own.length > 0 ||
    inventory.utilities.length > 0 ||
    inventory.keyframes.length > 0;

  cache.set(key, inventory);
  return inventory;
}

/** Duration / easing / distance — so the pills group by what they control. */
export function groupTokens(tokens: MotionToken[]) {
  const kind = (n: string) =>
    n.startsWith('--duration') ? 'Duration' : n.startsWith('--ease') ? 'Easing' : 'Distance & scale';
  const groups = new Map<string, MotionToken[]>();
  for (const t of tokens) {
    const k = kind(t.name);
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }
  return ['Duration', 'Easing', 'Distance & scale']
    .filter((k) => groups.has(k))
    .map((k) => ({ kind: k, tokens: groups.get(k)! }));
}
