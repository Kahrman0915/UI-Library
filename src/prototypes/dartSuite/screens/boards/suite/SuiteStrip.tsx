/* DartBoards · Browse — the row of team suites above the full library.

   One compact card per suite: its mark, name, team and size. Opening one
   scopes Browse to it (the same page, filtered), so a suite is a way INTO the
   library rather than a separate shelf of it. Hidden while searching or
   filtering — then the question is about dashboards, not collections. */

import { Check } from 'lucide-react';
import Badge from '../../../../../components/Badge';
import Button from '../../../../../components/Button';
import Card, { CardBody, CardDescription, CardTitle } from '../../../../../components/Card';
import FeaturedIcon from '../../../../../components/FeaturedIcon';
import Section from '../../../../../components/Section';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import { countLabel, suiteDashboardIds, suiteIcon } from './suiteShared';
import './Suite.scss';

export function SuiteStrip() {
  const { state } = useSuite();
  const { go } = useNav();
  if (!state.suites.length) return null;

  return (
    <Section id="ds-browse-suites" heading="Team suites" variant="group">
      <div className="ds-suite-strip">
        {state.suites.map((s) => {
          const open = () => go({ page: 'browse', suite: s.id });
          const following = state.followedSuites.includes(s.id);
          return (
            <Card key={s.id} id={`ds-suite-card-${s.id}`} size="sm" interactive className="ds-suite-card" onClick={open}>
              <CardBody>
                <FeaturedIcon id={`ds-suite-card-${s.id}-mark`} Icon={suiteIcon(s.id)} color={s.hue} />
                <div className="ds-suite-card__text">
                  <CardTitle>
                    <Button
                      id={`ds-suite-card-${s.id}-title`}
                      style="link"
                      className="ds-browse-title-link"
                      label={s.name}
                      onClick={open}
                    />
                  </CardTitle>
                  <CardDescription>
                    {s.team} · {countLabel(suiteDashboardIds(s).length, 'dashboard')}
                  </CardDescription>
                </div>
                {following && (
                  <Badge id={`ds-suite-card-${s.id}-following`} className="ds-suite-card__badge" label="Following" color="info" appearance="soft" IconLeft={Check} />
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
