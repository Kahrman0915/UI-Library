import { useContext } from 'react';
import { DocsContext, Source, Story, Unstyled, useOf } from '@storybook/blocks';
import type { PreparedStory } from 'storybook/internal/types';
import {
  Badge,
  CodeBlock,
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
  Kbd,
} from '../../src/index';
import type {
  UiDocsParameters,
  UiDocsStatus,
} from '../../src/types/DocsTypes';
import { CodePane } from './CodePane';
import { PropsTable, SubcomponentPropsTable } from './PropsTable';
import { Toc, type TocEntry } from './Toc';
import { Block, P, Section, Stage, prose } from './kit';
import { useDocsMode } from './useDocsMode';
import './docs.scss';

/**
 * The bespoke Docs template, registered globally in `.storybook/preview.tsx`.
 *
 * Shape follows the shadcn component-doc reading order — title · description ·
 * preview/code · install · usage · composition · examples · API · a11y — but
 * every pixel of it is built from this library's own components and tokens, so
 * the docs page doubles as a proof that the system composes.
 *
 * Prose comes from `parameters.ui` (see `src/types/DocsTypes.ts`). Every section
 * renders only when its data exists, so a component with no `parameters.ui` at
 * all still produces a complete-looking page.
 *
 * Two blocks come from Storybook rather than from us, deliberately:
 * `<Story>` (renders a real story inline) and `<Source>` (syntax-highlighted,
 * auto-generated from the story's own code). Our `CodeBlock` has no
 * highlighting — an accepted no-dependency trade-off — so it takes the
 * hand-written snippets instead. `.storybook/` is dev-only, so leaning on
 * Storybook here costs the shipped bundle nothing.
 */

const STATUS_VARIANT: Record<UiDocsStatus, 'success' | 'info' | 'warning' | 'error'> =
  {
    stable: 'success',
    beta: 'info',
    experimental: 'warning',
    deprecated: 'error',
  };

/** Stories whose canvas wants the full column rather than a centred specimen. */
const FILL_TITLES = /Sidebar|Chat|Layout|Menubar|Command|Pagination|Breadcrumb/;

/**
 * One example: the rendered story over its own source, in a single card.
 *
 * The same block serves the page's primary preview and every example below it,
 * so the page reads as one repeating unit rather than switching format halfway
 * down.
 */
function StoryBlock({
  story,
  isDark,
}: {
  story: PreparedStory;
  isDark: boolean;
}) {
  return (
    <Block>
      <Stage fill={FILL_TITLES.test(story.title)}>
        <Story of={story.moduleExport} />
      </Stage>
      <CodePane>
        <Source of={story.moduleExport} dark={isDark} />
      </CodePane>
    </Block>
  );
}

/** Anchor id for a story heading, e.g. "Aiden Surface" → "story-aiden-surface". */
function storyAnchor(id: string) {
  return `story-${id}`;
}

function ShowcasePage({
  group,
  name,
  description,
  stories,
}: {
  group: string;
  name: string;
  description?: string;
  stories: PreparedStory[];
}) {
  const toc: TocEntry[] = stories.map((story) => ({
    id: storyAnchor(story.id),
    label: story.name,
  }));

  return (
    <Unstyled>
      <div className="ui-docs ui-docs--showcase">
        <div className="ui-docs__main">
          <header className="ui-docs__header">
            <p className="ui-docs__eyebrow">{group}</p>
            <h1 className="ui-docs__title">{name}</h1>
            {description ? (
              <p className="ui-docs__lede">{prose(description)}</p>
            ) : null}
          </header>

          {stories.map((story) => (
            <section
              key={story.id}
              id={storyAnchor(story.id)}
              className="ui-docs-section"
            >
              <h2 className="ui-docs-section__title">{story.name}</h2>
              <div className="ui-docs-section__body">
                <Story of={story.moduleExport} />
              </div>
            </section>
          ))}
        </div>

        <aside className="ui-docs__rail">
          <Toc entries={toc} />
        </aside>
      </div>
    </Unstyled>
  );
}

export function DocsPage() {
  const { csfFile, preparedMeta } = useOf('meta');
  const docsContext = useContext(DocsContext);
  const stories = docsContext.componentStories();
  const isDark = useDocsMode() === 'dark';

  const title = preparedMeta.title ?? '';
  const segments = title.split('/');
  const component = preparedMeta.component as
    | { displayName?: string }
    | undefined;
  const name = component?.displayName ?? segments[segments.length - 1] ?? title;
  const group = segments.slice(0, -1).join(' / ') || 'Components';

  const ui = (preparedMeta.parameters?.ui ?? {}) as UiDocsParameters;

  // Foundations, Hooks and Prototypes declare no `component` — they're
  // long-form documents and demos, not API surfaces. Framing those with
  // "Install / API reference / props" would be actively wrong (there is no
  // `import { Themes } from '@ui/lib'`), so they get a stripped page: header,
  // then each story full-bleed, with the TOC as the page's own navigation.
  // Keyed off `component` so none of those 23 story files need editing.
  if (!component) {
    return (
      <ShowcasePage
        group={group}
        name={segments[segments.length - 1] ?? title}
        description={ui.description}
        stories={stories}
      />
    );
  }
  const subcomponents = (preparedMeta.subcomponents ??
    csfFile.meta.subcomponents ??
    {}) as Record<string, unknown>;
  const subcomponentNames = Object.keys(subcomponents);

  const primary = stories[0];
  const rest = stories.slice(1);

  const importCode =
    ui.importCode ?? `import { ${name} } from '@ui/lib';\nimport '@ui/lib/styles.css';`;

  const hasUsage = Boolean(
    ui.usage?.when?.length || ui.usage?.avoid?.length || ui.usage?.notes,
  );
  const hasComposition = Boolean(
    ui.composition?.length || subcomponentNames.length,
  );
  const hasA11y = Boolean(ui.a11y?.keyboard?.length || ui.a11y?.notes);

  // Built here rather than scraped from the DOM — this component already knows
  // exactly which sections it decided to render.
  const toc: TocEntry[] = [
    primary && { id: 'preview', label: 'Preview' },
    { id: 'install', label: 'Install' },
    hasUsage && { id: 'usage', label: 'Usage' },
    hasComposition && { id: 'composition', label: 'Composition' },
    rest.length > 0 && { id: 'examples', label: 'Examples' },
    { id: 'api', label: 'API reference' },
    hasA11y && { id: 'accessibility', label: 'Accessibility' },
  ].filter(Boolean) as TocEntry[];

  return (
    <Unstyled>
      <div className="ui-docs">
        <div className="ui-docs__main">
          <header className="ui-docs__header">
            <p className="ui-docs__eyebrow">{group}</p>
            <h1 className="ui-docs__title">{name}</h1>
            {ui.description ? (
              <p className="ui-docs__lede">{prose(ui.description)}</p>
            ) : null}
            <div className="ui-docs__pills">
              <Badge
                id="docs-pill-status"
                variant={STATUS_VARIANT[ui.status ?? 'stable']}
                label={ui.status ?? 'stable'}
              />
              {subcomponentNames.length > 0 ? (
                <Badge
                  id="docs-pill-compound"
                  variant="outline"
                  label={`${subcomponentNames.length + 1} parts`}
                />
              ) : null}
              {(ui.tags ?? []).map((tag) => (
                <Badge
                  key={tag}
                  id={`docs-pill-${tag}`}
                  variant="outline"
                  label={tag}
                />
              ))}
            </div>
          </header>

          {primary ? (
            <Section id="preview" title="Preview">
              <StoryBlock story={primary} isDark={isDark} />
            </Section>
          ) : null}

          <Section
            id="install"
            title="Install"
            description="One import for the component, one for the stylesheet. The stylesheet only needs importing once, at your app root."
          >
            <CodeBlock
              id="docs-import"
              language="tsx"
              code={importCode}
              filename="app.tsx"
            />
          </Section>

          {hasUsage ? (
            <Section id="usage" title="Usage">
              {ui.usage?.when?.length || ui.usage?.avoid?.length ? (
                <div className="ui-docs-usage">
                  {ui.usage?.when?.length ? (
                    <div className="ui-docs-usage__col ui-docs-usage__col--when">
                      <p className="ui-docs-usage__head">Reach for it when</p>
                      <ul className="ui-docs-usage__list">
                        {ui.usage.when.map((line) => (
                          <li key={line} className="ui-docs-usage__item">
                            {prose(line)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {ui.usage?.avoid?.length ? (
                    <div className="ui-docs-usage__col ui-docs-usage__col--avoid">
                      <p className="ui-docs-usage__head">Reach for something else when</p>
                      <ul className="ui-docs-usage__list">
                        {ui.usage.avoid.map((line) => (
                          <li key={line} className="ui-docs-usage__item">
                            {prose(line)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {ui.usage?.notes ? (
                <div style={{ marginTop: 'var(--p-5)' }}>
                  <P>{prose(ui.usage.notes)}</P>
                </div>
              ) : null}
            </Section>
          ) : null}

          {hasComposition ? (
            <Section
              id="composition"
              title="Composition"
              description="The parts this component is assembled from, in the order you nest them."
            >
              <ItemGroup className="ui-stagger">
                {(ui.composition ??
                  subcomponentNames.map((partName) => ({
                    name: partName,
                    description: '',
                    required: false,
                  }))
                ).map((part) => (
                  <Item key={part.name} variant="outline" size="sm">
                    <ItemContent>
                      <ItemTitle className="ui-docs-part__title">
                        <code className="ui-docs-part__name">{part.name}</code>
                        {part.required ? (
                          <Badge
                            id={`docs-part-${part.name}`}
                            variant="outline"
                            label="required"
                          />
                        ) : null}
                      </ItemTitle>
                      {part.description ? (
                        <ItemDescription>{prose(part.description)}</ItemDescription>
                      ) : null}
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            </Section>
          ) : null}

          {rest.length > 0 ? (
            <Section id="examples" title="Examples">
              {rest.map((story) => (
                <article key={story.id} className="ui-docs-example">
                  <h3 className="ui-docs-example__title">{story.name}</h3>
                  {story.parameters?.docs?.description?.story ? (
                    <p className="ui-docs-example__desc">
                      {prose(story.parameters.docs.description.story)}
                    </p>
                  ) : null}
                  <StoryBlock story={story} isDark={isDark} />
                </article>
              ))}
            </Section>
          ) : null}

          <Section
            id="api"
            title="API reference"
            description="Every prop below also accepts the underlying element's native HTML attributes, which are spread onto it."
          >
            <PropsTable
              argTypes={primary?.argTypes}
              caption={subcomponentNames.length > 0 ? name : undefined}
            />
            {subcomponentNames.map((partName) => (
              <SubcomponentPropsTable
                key={partName}
                name={partName}
                component={subcomponents[partName]}
              />
            ))}
          </Section>

          {hasA11y ? (
            <Section id="accessibility" title="Accessibility">
              {ui.a11y?.notes ? <P>{prose(ui.a11y.notes)}</P> : null}
              {ui.a11y?.keyboard?.length ? (
                <div className="ui-docs-keys">
                  {ui.a11y.keyboard.map((row) => (
                    <div key={row.keys.join('+')} className="ui-docs-keys__row">
                      <div className="ui-docs-keys__combo">
                        {row.keys.map((key, i) => (
                          <span key={key} style={{ display: 'contents' }}>
                            {i > 0 ? (
                              <span className="ui-docs-keys__sep">+</span>
                            ) : null}
                            <Kbd size="sm">{key}</Kbd>
                          </span>
                        ))}
                      </div>
                      <div className="ui-docs-keys__desc">{prose(row.description)}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </Section>
          ) : null}
        </div>

        <aside className="ui-docs__rail">
          <Toc entries={toc} />
        </aside>
      </div>
    </Unstyled>
  );
}
