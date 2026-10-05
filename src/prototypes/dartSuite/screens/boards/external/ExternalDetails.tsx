/* DartBoards · an external chart's details page.

   The chart itself is in Tableau (or Power BI); this page is its address in
   DartBoards. Three jobs:
   - the stable link to SHARE, so a colleague lands in DartBoards (with the
     suite, the spaces and the way to the chart) rather than cold in a BI tool;
   - the honest statement of what does not apply to it here;
   - the explicit way out — "Open in Tableau", new tab, marked — plus the way
     to keep it (Add to space) and the charts around it in its suite. */

import { ExternalLink, Link2, Plus } from 'lucide-react';
import { Fragment } from 'react';
import Alert from '../../../../../components/Alert';
import Breadcrumb, { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../../../components/Breadcrumb';
import Button from '../../../../../components/Button';
import Card, { CardMedia } from '../../../../../components/Card';
import PageContainer from '../../../../../components/PageContainer';
import PageHeader from '../../../../../components/PageHeader';
import Section from '../../../../../components/Section';
import { useNav } from '../../../nav';
import { useSuite } from '../../../store';
import type { Dashboard } from '../../../types';
import { useUi } from '../../../ui';
import { BrowseRow } from '../browse/BrowseItems';
import { DashboardThumb, addUnavailable, copyDashboardLink, updatedLabel } from '../shared/boardsShared';
import { suitesWith } from '../suite/suiteShared';
import { openAriaLabel, openLabel, useOpenExternal } from './externalShared';
import '../browse/Browse.scss';
import './External.scss';

export function ExternalDetails({ d, fromSpaceId }: { d: Dashboard; fromSpaceId?: string }) {
  const { state } = useSuite();
  const { go } = useNav();
  const ui = useUi();
  const openExternal = useOpenExternal();
  const space = fromSpaceId ? state.spaces.find((s) => s.id === fromSpaceId) : undefined;
  const [suite] = suitesWith(state, d.id);
  const section = suite?.sections.find((s) => s.dashboardIds.includes(d.id));
  const related = (section?.dashboardIds ?? [])
    .filter((id) => id !== d.id)
    .map((id) => state.dashboards.find((x) => x.id === id && x.lifecycle === 'published'))
    .filter((x): x is Dashboard => !!x)
    .slice(0, 3);
  const base = `ds-ext-${d.id}`;

  // The way back up: the space it was opened from, else its suite, else Browse.
  const crumbs = space
    ? [{ label: space.name, onClick: () => go({ page: 'space', id: space.id }) }]
    : suite
      ? [
          { label: 'Dashboards', onClick: () => go({ page: 'browse' }) },
          { label: suite.name, onClick: () => go({ page: 'browse', suite: suite.id }) },
        ]
      : [{ label: 'Dashboards', onClick: () => go({ page: 'browse' }) }];

  return (
    <PageContainer width="narrow" className="ds-ext">
      <Breadcrumb aria-label="Breadcrumb">
        <BreadcrumbList>
          {crumbs.map((c) => (
            <Fragment key={c.label}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    c.onClick();
                  }}
                >
                  {c.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{d.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        id={`${base}-header`}
        overline={`Chart in ${d.source}`}
        title={d.name}
        description={d.description}
        actions={
          <>
            <Button
              id={`${base}-add`}
              style="outline"
              label="Add to space"
              IconLeft={Plus}
              disabled={addUnavailable(state, d.id)}
              onClick={() => ui.openAddToSpace(d.id)}
            />
            <Button
              id={`${base}-open`}
              label={openLabel(d)}
              IconRight={ExternalLink}
              aria-label={openAriaLabel(d)}
              disabled={!d.hasAccess}
              onClick={() => openExternal(d)}
            />
          </>
        }
      />

      <div className="ds-ext-body">
        <Card id={`${base}-preview`} className="ds-ext-preview">
          <CardMedia ratio={16 / 9}>
            <div className="ds-ext-preview__media">
              <DashboardThumb dashboard={d} />
              <span className="ds-ext-preview__stamp">Preview · the live chart is in {d.source}</span>
            </div>
          </CardMedia>
        </Card>

        <div className="ds-ext-side">
          <dl className="ds-ext-facts">
            <div>
              <dt>Owner</dt>
              <dd>{d.owner}</dd>
            </div>
            {suite && (
              <div>
                <dt>Suite</dt>
                <dd>
                  <Button
                    id={`${base}-suite`}
                    style="link"
                    size="sm"
                    className="ds-ext-inline-link"
                    label={section ? `${suite.name} · ${section.name}` : suite.name}
                    onClick={() => go({ page: 'browse', suite: suite.id, section: section?.id })}
                  />
                </dd>
              </div>
            )}
            <div>
              <dt>Updated</dt>
              <dd>{updatedLabel(d)}</dd>
            </div>
            <div>
              <dt>Views</dt>
              <dd>{d.views.toLocaleString('en-US')}</dd>
            </div>
          </dl>

          <Alert
            id={`${base}-limits`}
            variant="info"
            title={`Opens in ${d.source}, in a new tab`}
            description={`Suite filters, Ask Aiden and live charts in spaces don’t reach into ${d.source}. Close its tab to come back here. To share this chart, share this page — it keeps people in DartBoards.`}
          />

          <Button id={`${base}-copy`} style="ghost" size="sm" label="Copy DartBoards link" IconLeft={Link2} onClick={() => copyDashboardLink(d)} />
        </div>
      </div>

      {related.length > 0 && section && (
        <Section id={`${base}-related`} heading={`More in ${section.name}`}>
          <div className="ds-browse-rows">
            {related.map((r) => (
              <BrowseRow key={r.id} d={r} />
            ))}
          </div>
        </Section>
      )}
    </PageContainer>
  );
}
