/* R4.1c · Scope — a SEARCHABLE MULTI-SELECT. The library has none (Combobox is
   single-select, DropdownMenu checkbox items have no search), so it is composed
   here at the call site: a Select-shaped trigger opening a Popover that holds a
   Command search over Checkbox rows. Filtering never deselects: the trigger
   count can exceed the rows on screen, and clearing the search brings the
   checked rows back. There is deliberately no "All" row (③). */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Checkbox from '../../../../components/Checkbox';
import Command, { CommandEmpty, CommandInput, CommandItem, CommandList } from '../../../../components/Command';
import Label from '../../../../components/Label';
import Popover, { PopoverContent, PopoverTrigger } from '../../../../components/Popover';
import '../../../../components/Select/Select.scss';
import '../../../../components/Input/Input.scss';

export function ScopeMultiSelect({
  id,
  options,
  selected,
  onChange,
}: {
  id: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  const summary =
    selected.length === 0
      ? ''
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label
        : `${selected.length} dashboards selected`;

  return (
    <div className="ui-input-field ui-input-field--sz-default">
      <Label htmlFor={`${id}-trigger`} required description="Where this notice appears.">
        Scope
      </Label>
      <div
        className={`ui-input-wrap ui-select__trigger-wrap${open ? ' ui-select__trigger-wrap--open' : ''}`}
        onClick={(e) => {
          // The whole field opens it, like the Select trigger it looks like.
          // Portalled panel clicks bubble here through React, so ignore anything
          // outside this element's own DOM, and the trigger button itself.
          const t = e.target as HTMLElement;
          if (e.currentTarget.contains(t) && !t.closest('button')) setOpen((o) => !o);
        }}
      >
        <Popover
          id={`${id}-popover`}
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setSearch('');
          }}
        >
          <PopoverTrigger>
            <button id={`${id}-trigger`} type="button" className="ui-select__trigger" aria-required="true">
              <span className={`ui-select__value${summary ? '' : ' ui-select__value--placeholder'}`}>{summary || 'Select…'}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="ds-requests-scope">
            <Command id={`${id}-command`} value={search} onValueChange={setSearch}>
              <CommandInput placeholder="Search dashboards…" aria-label="Search dashboards" />
              <CommandList aria-multiselectable="true">
                <CommandEmpty>No dashboards match “{search}”.</CommandEmpty>
                {options.map((o) => (
                  <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)} aria-selected={selected.includes(o.value)}>
                    <span className="ds-requests-scope__check" aria-hidden="true">
                      <Checkbox id={`${id}-cb-${o.value}`} checked={selected.includes(o.value)} tabIndex={-1} size="sm" />
                    </span>
                    {o.label}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <span className="ui-select__chevron" aria-hidden="true">
          <ChevronDown />
        </span>
      </div>
    </div>
  );
}
