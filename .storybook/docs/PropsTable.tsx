import { useOf } from '@storybook/blocks';
import { prose } from './kit';
import type { StrictArgTypes } from 'storybook/internal/types';
import './docs.scss';

/**
 * The API reference table, built from docgen `argTypes`.
 *
 * We render this ourselves rather than restyling Storybook's `<ArgTypes>` so
 * the table is made of the same tokens as everything else on the page — and so
 * required / union type / default read the way we want them to.
 *
 * Prop copy comes from the JSDoc on each `{Name}.types.ts` surface (wave 5),
 * surfaced by the `reactDocgenTypescriptOptions` in `.storybook/main.ts`.
 */

/**
 * Standing copy for props that mean the same thing on every component.
 *
 * `className` appears on all 59 of them — hard rule 4 in CLAUDE.md — and would
 * otherwise need the identical sentence written into 228 separate JSDoc
 * comments. One line here beats 228 copies that can drift. Anything with a
 * component-specific meaning must still be documented at the source.
 */
const UNIVERSAL: Record<string, string> = {
  className:
    'Merged onto the root element, after the component’s own classes. `style` works the same way unless a component Omits it.',
};

/** Squash a union summary onto one line so the type column stays scannable. */
function tidyType(summary: string | undefined): string {
  if (!summary) return '—';
  return summary.replace(/\s*\|\s*/g, ' | ').replace(/\s+/g, ' ').trim();
}

function tidyDefault(summary: string | undefined): string | null {
  if (summary === undefined || summary === null || summary === '') return null;
  if (summary === 'undefined' || summary === '-') return null;
  return summary;
}

type Row = {
  key: string;
  name: string;
  required: boolean;
  type: string;
  defaultValue: string | null;
  description: string;
};

function toRows(argTypes: StrictArgTypes | undefined): Row[] {
  if (!argTypes) return [];
  return Object.entries(argTypes)
    .filter(([, arg]) => !arg?.table?.disable)
    .map(([key, arg]) => ({
      key,
      name: arg.name ?? key,
      required: Boolean(arg.type?.required),
      type: tidyType(arg.table?.type?.summary ?? arg.type?.name),
      defaultValue: tidyDefault(arg.table?.defaultValue?.summary),
      description: arg.description || UNIVERSAL[key] || '',
    }))
    .sort((a, b) => {
      // Required props first — they're what a consumer has to supply.
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function PropsTable({
  argTypes,
  caption,
}: {
  argTypes: StrictArgTypes | undefined;
  caption?: string;
}) {
  const rows = toRows(argTypes);

  if (rows.length === 0) {
    return (
      <div className="ui-docs-props__wrap">
        {caption ? <p className="ui-docs-props__caption">{caption}</p> : null}
        <div className="ui-docs-props__empty">
          No documented props — this part takes only its native element
          attributes.
        </div>
      </div>
    );
  }

  return (
    <div className="ui-docs-props__wrap">
      {caption ? <p className="ui-docs-props__caption">{caption}</p> : null}
      <table className="ui-docs-props">
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>
                <span className="ui-docs-props__name">
                  {row.name}
                  {row.required ? (
                    <abbr className="ui-docs-props__req" title="Required">
                      *
                    </abbr>
                  ) : null}
                </span>
              </td>
              <td>
                <code className="ui-docs-props__type">{row.type}</code>
              </td>
              <td>
                {row.defaultValue ? (
                  <code className="ui-docs-props__default">
                    {row.defaultValue}
                  </code>
                ) : (
                  <span className="ui-docs-props__default">—</span>
                )}
              </td>
              <td className="ui-docs-props__desc">
                {row.description ? prose(row.description) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Props table for a subcomponent declared in `meta.subcomponents`.
 *
 * A subcomponent has no story to carry prepared `argTypes`, so we run the
 * project's own docgen extractor over the component — the same call Storybook's
 * `<ArgTypes of={Component} />` makes internally. Kept as its own component so
 * `useOf` is called once per part rather than in a loop.
 */
export function SubcomponentPropsTable({
  name,
  component,
}: {
  name: string;
  component: unknown;
}) {
  const resolved = useOf(component as never, ['component']);
  const extract = resolved.projectAnnotations?.parameters?.docs?.extractArgTypes;
  const argTypes =
    typeof extract === 'function'
      ? (extract(resolved.component) as StrictArgTypes | undefined)
      : undefined;

  return <PropsTable argTypes={argTypes} caption={name} />;
}
