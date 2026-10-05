/* DartBoards · Suites — start a space from a suite.

   The suite stays the team's; this makes a SPACE that is yours. You choose what
   to bring — whole sections, or single dashboards inside one (a 40-dashboard
   suite is rarely wanted whole) — the sections come across as the space's
   section headings, and from then on you edit it like any other space.
   Nothing syncs back to the suite, and the suite's later changes do not reach
   the space — the dialog says so, because that is the question people ask. */

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../../../../../components/Button';
import Checkbox from '../../../../../components/Checkbox';
import Dialog, { DialogBody, DialogFooter, DialogHeader } from '../../../../../components/Dialog';
import Input from '../../../../../components/Input';
import ScrollArea from '../../../../../components/ScrollArea';
import { toast } from '../../../../../components/Toast';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Dashboard, Suite } from '../../../types';
import { countLabel, orderedSections } from './suiteShared';

type Props = {
  open: boolean;
  suite: Suite;
  /** Sections ticked when it opens; absent = all of them. */
  initialSections?: string[];
  onClose: () => void;
};

export function CreateSpaceFromSuiteDialog({ open, suite, initialSections, onClose }: Props) {
  const { state, saveSpace } = useSuite();
  const { go } = useNav();
  const base = `ds-suite-${suite.id}-create`;

  const [name, setName] = useState('');
  /** Dashboard ids. A dashboard in two sections is one pick — it lands under the first. */
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string[]>([]);

  const present = (ids: string[]) =>
    ids.map((id) => state.dashboards.find((d) => d.id === id && d.lifecycle === 'published')).filter((d): d is Dashboard => !!d);
  const sections = orderedSections(suite).map((s) => ({ ...s, list: present(s.dashboardIds) }));

  // Reset each time it opens, so a section's "New space from section" starts from that section.
  useEffect(() => {
    if (!open) return;
    const from = initialSections ?? suite.sections.map((s) => s.id);
    setName(from.length === 1 ? suite.sections.find((s) => s.id === from[0])?.name ?? suite.name : `My ${suite.name}`);
    setPicked(new Set(suite.sections.filter((s) => from.includes(s.id)).flatMap((s) => s.dashboardIds)));
    // Opened for one section: show its dashboards straight away, since picking inside it is the likely next step.
    setExpanded(from.length === 1 ? from : []);
  }, [open, suite, initialSections]);

  const count = sections.flatMap((s) => s.list).filter((d, i, a) => picked.has(d.id) && a.findIndex((x) => x.id === d.id) === i).length;

  const setMany = (ids: string[], on: boolean) =>
    setPicked((p) => {
      const next = new Set(p);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  const toggleExpanded = (id: string) => setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  const create = () => {
    const seen = new Set<string>();
    const items = sections.flatMap((s) =>
      s.list
        .filter((d) => picked.has(d.id) && !seen.has(d.id) && seen.add(d.id))
        .map((d) => ({ dashboardId: d.id, layout: 'card' as const, section: s.name })),
    );
    const space = saveSpace({
      name: name.trim() || suite.name,
      description: suite.description,
      hue: suite.hue,
      items,
      fromSuite: suite.id,
    });
    onClose();
    toast('Space created', { description: `${space.name} is yours to edit. Changes to the suite will not change it.` });
    go({ page: 'space', id: space.id });
  };

  return (
    <Dialog id={base} open={open} onClose={onClose} closeOnOutsideClick>
      <DialogHeader
        id={`${base}-header`}
        title="Create a space from this suite"
        description={`A space of your own, seeded from ${suite.name}. Add, remove and rearrange anything; the suite stays as the ${suite.team} curates it.`}
        onClose={onClose}
      />
      <DialogBody>
        <div className="ds-boards-dialog-stack">
          <Input id={`${base}-name`} label="Space name" value={name} onValueChange={setName} required />
          <fieldset className="ds-suite-sections-pick">
            <legend className="ds-suite-sections-pick__legend">What to bring</legend>
            <ScrollArea id={`${base}-scroll`} className="ds-scroll-max ds-suite-pick-scroll">
              <ul className="ds-suite-pick">
                {sections.map((s) => {
                  const on = s.list.filter((d) => picked.has(d.id)).length;
                  const isOpen = expanded.includes(s.id);
                  return (
                    <li key={s.id} className="ds-suite-pick__section">
                      <div className="ds-suite-pick__row">
                        <Checkbox
                          id={`${base}-sec-${s.id}`}
                          label={s.name}
                          description={on && on < s.list.length ? `${on} of ${countLabel(s.list.length, 'dashboard')}` : countLabel(s.list.length, 'dashboard')}
                          checked={on === s.list.length && on > 0}
                          indeterminate={on > 0 && on < s.list.length}
                          onCheckedChange={() => setMany(s.list.map((d) => d.id), on < s.list.length)}
                        />
                        <Button
                          id={`${base}-sec-${s.id}-expand`}
                          style="ghost"
                          size="xs"
                          label={isOpen ? 'Hide' : 'Choose'}
                          IconRight={isOpen ? ChevronDown : ChevronRight}
                          aria-expanded={isOpen}
                          aria-controls={`${base}-sec-${s.id}-list`}
                          aria-label={`${isOpen ? 'Hide' : 'Choose'} dashboards in ${s.name}`}
                          onClick={() => toggleExpanded(s.id)}
                        />
                      </div>
                      {isOpen && (
                        <ul id={`${base}-sec-${s.id}-list`} className="ds-suite-pick__dashboards">
                          {s.list.map((d) => (
                            <li key={d.id}>
                              <Checkbox
                                id={`${base}-sec-${s.id}-${d.id}`}
                                size="sm"
                                label={d.name}
                                checked={picked.has(d.id)}
                                onCheckedChange={(c) => setMany([d.id], c)}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </fieldset>
        </div>
      </DialogBody>
      <DialogFooter>
        <span className="ds-boards-footer-status" aria-live="polite">
          {count ? `${countLabel(count, 'dashboard')} selected` : 'Nothing selected'}
        </span>
        <Button id={`${base}-cancel`} style="ghost" label="Cancel" onClick={onClose} />
        <Button id={`${base}-save`} label="Create space" disabled={count === 0} onClick={create} />
      </DialogFooter>
    </Dialog>
  );
}
