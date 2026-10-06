/* R4.1c · Scope — a SEARCHABLE MULTI-SELECT: the library's Combobox in `multiple`
   mode (Figma draws it as a Combobox with checkbox rows). Filtering never deselects:
   the trigger count can exceed the rows on screen, and clearing the search brings
   the checked rows back. There is deliberately no "All" row (③). */

import Combobox from '../../../../components/Combobox';

export function ScopeMultiSelect({
  id,
  options,
  selected,
  onChange,
  noun = 'dashboards',
}: {
  id: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** What the options are, plural — "dashboards", "applications". */
  noun?: string;
}) {
  return (
    <Combobox
      id={id}
      multiple
      label="Scope"
      description="Where this notice appears."
      required
      options={options}
      values={selected}
      onValuesChange={onChange}
      placeholder="Select…"
      searchPlaceholder={`Search ${noun}…`}
      emptyMessage={`No ${noun} match.`}
      summary={(picked) => (picked.length === 1 ? picked[0].label : `${picked.length} ${noun} selected`)}
    />
  );
}
