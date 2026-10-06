/* R2.1 New Request · chooser. DART Central is where a person asks for anything
   under it, so this is the ONE place to start a request. Options are worded by
   what the person needs, never by which system holds it, and grouped by what
   the request is about. Each says who handles it; the report options open IRM's
   form, the listing options open the DartBoards form, the rest stay here. */

import { useState } from 'react';
import { Archive, Bell, ChevronRight, Megaphone, Eye, EyeOff, FilePlus, Lightbulb, MessageSquare, Pencil, Rocket, Upload, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Alert from '../../../../components/Alert';
import Badge from '../../../../components/Badge';
import Button from '../../../../components/Button';
import Card, { CardDescription, CardTitle } from '../../../../components/Card';
import FeaturedIcon from '../../../../components/FeaturedIcon';
import type { FeaturedIconColor } from '../../../../components/FeaturedIcon/FeaturedIcon.types';
import Grid from '../../../../components/Grid';
import PageContainer from '../../../../components/PageContainer';
import PageHeader from '../../../../components/PageHeader';
import Section from '../../../../components/Section';
import Stack from '../../../../components/Stack';
import Text from '../../../../components/Text';
import { AUDIENCE_LABEL, HANDLER, audienceOf, canRequest, reportRequestRoute } from '../../hub';
import type { Handler, RequestOptionId } from '../../hub';
import { useNav } from '../../nav';
import { useSignedIn, useSuite } from '../../store';
import type { Route } from '../../types';

/** `isNew`: a request type that just shipped — tagged here, where someone picking one will see it. */
type Option = { id: RequestOptionId; title: string; description: string; Icon: LucideIcon; color: FeaturedIconColor; route: Route; isNew?: boolean };

const GROUPS: { id: string; heading: string; handler: Handler; options: Option[] }[] = [
  {
    id: 'report',
    heading: 'A report itself',
    handler: 'irm',
    options: [
      { id: 'new', title: 'A new report', description: 'Ask for a report or dashboard that does not exist yet.', Icon: FilePlus, color: 'info', route: { page: 'irm-new-change', type: 'new' } },
      { id: 'break', title: 'Something is wrong', description: 'Wrong numbers, a failed refresh, a broken view — a fix to a report.', Icon: Wrench, color: 'error', route: { page: 'irm-new-change', type: 'break' } },
      { id: 'change', title: 'Change what a report shows', description: 'New data, a new measure, a different view, access or controls.', Icon: Pencil, color: 'default', route: { page: 'irm-new-change', type: 'modification' } },
      { id: 'retire', title: 'Retire a report', description: 'Stop a report altogether, with a notice period for the people who use it.', Icon: Archive, color: 'warning', route: { page: 'irm-new-change', type: 'decommission' } },
    ],
  },
  {
    id: 'listing',
    heading: 'How a report appears in DartBoards',
    handler: 'boards',
    options: [
      { id: 'publish', title: 'Show a finished report in DartBoards', description: 'List a report that is in production so people can find it.', Icon: Upload, color: 'info', route: { page: 'request-form', kind: 'dashboard', mode: 'add' } },
      { id: 'edit', title: 'Change how a dashboard is listed', description: 'Its title, description, category or tags in DartBoards.', Icon: Eye, color: 'default', route: { page: 'request-form', kind: 'dashboard', mode: 'edit' } },
      { id: 'promote', title: 'Promote a dashboard', description: 'Feature it in Browse for a period.', Icon: Rocket, color: 'violet', route: { page: 'request-form', kind: 'dashboard', mode: 'promote' } },
      { id: 'unpublish', title: 'Take a dashboard out of DartBoards', description: 'Remove the listing. The report keeps running — to stop it, retire it instead.', Icon: EyeOff, color: 'default', route: { page: 'request-form', kind: 'dashboard', mode: 'remove' } },
      // A banner has two homes because it has two reaches: on dashboards it is routine (late data, an
      // outage), across an application it interrupts everyone. Same form, picker scoped to each.
      { id: 'banner', title: 'Post a banner on a dashboard', description: 'A notice on one or more dashboards — late data, an outage, maintenance.', Icon: Bell, color: 'warning', route: { page: 'request-form', kind: 'banner', reach: 'dashboards' } },
    ],
  },
  {
    id: 'central',
    heading: 'Everything else',
    handler: 'central',
    options: [
      { id: 'feature', title: 'Suggest a feature', description: 'An idea or improvement, reviewed and then published to the feature backlog.', Icon: Lightbulb, color: 'violet', route: { page: 'request-form', kind: 'feature' }, isNew: true },
      { id: 'general', title: 'Something else', description: 'A question or a request that fits nowhere above.', Icon: MessageSquare, color: 'default', route: { page: 'request-form', kind: 'general' } },
      // Last: rarer, and bigger — it shows to everyone using an application.
      { id: 'banner-app', title: 'Post an application or site-wide banner', description: 'A notice across a whole application, or everywhere in DART Central.', Icon: Megaphone, color: 'warning', route: { page: 'request-form', kind: 'banner', reach: 'applications' } },
    ],
  },
];

// §9's "Submit feature requests" news: a banner at the top of New request, where it is acted on, shown until
// dismissed (once a session). It was on My Requests / Open items; it is site news, not one of your items.
let featureNewsSeen = false;

export function NewRequest() {
  const [featureNews, setFeatureNews] = useState(!featureNewsSeen);
  const dismissFeatureNews = () => {
    featureNewsSeen = true;
    setFeatureNews(false);
  };
  const { go } = useNav();
  const { state } = useSuite();
  const { person } = useSignedIn();
  // Only what this person can ask for: by role, and for business users by whether they own a report.
  const audience = audienceOf(state, person.id);
  const groups = GROUPS.map((g) => ({ ...g, options: g.options.filter((o) => canRequest(o.id, audience)) })).filter((g) => g.options.length);
  return (
    <PageContainer width="narrow">
      <PageHeader
        id="ds-newreq-header"
        title="New request"
        description="What do you need? Every request — whoever handles it — is tracked in Open items."
      />
      <Stack level={2}>
        {featureNews && groups.some((g) => g.options.some((o) => o.id === 'feature')) && (
          <Alert
            id="ds-newreq-feature-news"
            variant="info"
            title="You can now submit feature requests"
            description="Pick Suggest a feature below, describe the feature and its impact, and submit. The admin team reviews it like any other request."
            action={
              <Button
                id="ds-newreq-feature-news-go"
                style="outline"
                size="sm"
                label="Suggest a feature"
                onClick={() => {
                  dismissFeatureNews();
                  go({ page: 'request-form', kind: 'feature' });
                }}
              />
            }
            onClose={dismissFeatureNews}
          />
        )}
        {groups.map((g) => (
          <Section key={g.id} id={`ds-newreq-${g.id}`} heading={g.heading} actions={<Text as="span" size="sm" tone="muted">{HANDLER[g.handler]}</Text>}>
            <Grid level={3} minItemWidth="var(--w-72)" stretch>
              {g.options.map((o) => {
                // A business person files a report request without leaving DART Central.
                const pick = () => go(o.route.page === 'irm-new-change' ? reportRequestRoute(audience, o.route.type ?? 'new', o.route.record) : o.route);
                return (
                  <Card
                    id={`ds-newreq-${o.id}`}
                    key={o.id}
                    interactive
                    role="link"
                    tabIndex={0}
                    aria-label={`${o.title}. ${HANDLER[g.handler]}.`}
                    onClick={pick}
                    onKeyDown={(e) => e.key === 'Enter' && pick()}
                  >
                    <div className="ds-requests-option">
                      <FeaturedIcon Icon={o.Icon} color={o.color} />
                      <div>
                        <span className="ds-requests-option__title">
                          <CardTitle>{o.title}</CardTitle>
                          {o.isNew && <Badge id={`ds-newreq-${o.id}-new`} label="New" color="info" appearance="soft" />}
                        </span>
                        <CardDescription>{o.description}</CardDescription>
                      </div>
                      <div className="ds-requests-option__action" onClick={(e) => e.stopPropagation()}>
                        <Button id={`ds-newreq-${o.id}-select`} style="link" size="sm" label="Select" IconRight={ChevronRight} tabIndex={-1} onClick={pick} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </Grid>
          </Section>
        ))}
        <Text size="sm" tone="muted">{`Showing the requests for your role — ${AUDIENCE_LABEL[audience]}. Don’t see what you need? Use Something else and the DART Central team will route it.`}</Text>
      </Stack>
    </PageContainer>
  );
}
