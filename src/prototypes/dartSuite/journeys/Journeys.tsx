/* ── DART Suite prototype · persona journeys ─────────────────────────────────
   Two ways in, one script (`script.ts`):

   - Journey map: every persona's path on one page — the overview to open a
     conversation with. Each step is a card; clicking one starts the
     walkthrough there.
   - Walk through: the presenter. The script on the left, the LIVE prototype on
     the right. Choosing a step signs in as that step's person and opens its
     page; "Do this step for me" performs the action, so nobody fills a form
     live. One store for the whole walkthrough, so "One fix, end to end" really
     is one request moving between five people. */

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Play, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import Alert from '../../../components/Alert';
import Avatar from '../../../components/Avatar';
import Badge from '../../../components/Badge';
import type { BadgeColor } from '../../../components/Badge/Badge.types';
import Button from '../../../components/Button';
import Card, { CardBody } from '../../../components/Card';
import Item, { ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../../../components/Item';
import Kbd from '../../../components/Kbd';
import NativeSelect, { NativeSelectOption } from '../../../components/NativeSelect';
import PageHeader from '../../../components/PageHeader';
import Stack from '../../../components/Stack';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '../../../components/Tabs';
import Text from '../../../components/Text';
import { personById } from '../data';
import { APP_NAME } from '../hub';
import type { Handler } from '../hub';
import { NavProvider, useNav } from '../nav';
import { AidenHost } from '../screens/aiden/AidenHost';
import { Router } from '../screens/Router';
import { Shell } from '../Shell';
import { SuiteProvider, useSuite } from '../store';
import { UiProvider } from '../ui';
import { JOURNEYS } from './script';
import type { Journey, JourneyStep } from './script';
import './Journeys.scss';

/** Each application keeps one color everywhere on this page, so a glance says where a step happens. */
const APP_COLOR: Record<Handler, BadgeColor> = { central: 'default', irm: 'violet', boards: 'blue' };
const firstName = (id: string) => personById(id).name.split(' ')[0];

type View = 'map' | 'present';

export function Journeys({ initialView = 'map' }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView);
  const [journeyId, setJourneyId] = useState(JOURNEYS[0].id);
  const [step, setStep] = useState(0);

  const startAt = (id: string, i: number) => {
    setJourneyId(id);
    setStep(i);
    setView('present');
  };

  return (
    <div className="ds-journeys">
      <Tabs id="ds-journeys-tabs" value={view} onValueChange={(v) => setView(v as View)} variant="line" className="ds-journeys__tabs">
        <div className="ds-journeys__bar">
          <PageHeader
            id="ds-journeys-header"
            size="sm"
            title="Persona journeys"
            description="Who uses DART Central, IRM and DartBoards — and the path each of them takes. Pick a step to walk through it live."
            actions={
              <TabsList aria-label="View">
                <TabsTrigger value="map">Journey map</TabsTrigger>
                <TabsTrigger value="present">Walk through</TabsTrigger>
              </TabsList>
            }
          />
        </div>
        <TabsContent value="map" className="ds-journeys__panel">
          <JourneyMap onPick={startAt} />
        </TabsContent>
        <TabsContent value="present" className="ds-journeys__panel ds-journeys__panel--present">
          {view === 'present' && <Present journeyId={journeyId} step={step} onJourney={(id) => (setJourneyId(id), setStep(0))} onStep={setStep} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── The map ─────────────────────────────────────────────────────────────── */

function JourneyMap({ onPick }: { onPick: (journey: string, step: number) => void }) {
  return (
    <div className="ds-journeys__map">
      <Stack level={4} direction="horizontal" wrap align="center">
        <Text size="sm" tone="muted">
          Where each step happens:
        </Text>
        {(Object.keys(APP_NAME) as Handler[]).map((a) => (
          <Badge key={a} id={`ds-journeys-legend-${a}`} label={APP_NAME[a]} color={APP_COLOR[a]} appearance="soft" />
        ))}
        <Badge id="ds-journeys-legend-improved" label="Improved" color="success" appearance="outline" IconLeft={Sparkles} />
      </Stack>
      <Stack level={4}>
        <h2 className="ds-journeys__lane-title">The people</h2>
        <Cast onPick={(id) => onPick(id, 0)} />
      </Stack>
      {JOURNEYS.map((j) => (
        <Lane key={j.id} journey={j} onPick={(i) => onPick(j.id, i)} />
      ))}
    </div>
  );
}

/** The six people, each a way into their own walkthrough. */
function Cast({ onPick }: { onPick: (journey: string) => void }) {
  const personas = JOURNEYS.filter((j) => j.who);
  return (
    <ul className="ds-journeys__cast-row" aria-label="Personas">
      {personas.map((j) => {
        const who = personById(j.who!);
        const pick = () => onPick(j.id);
        return (
          <li key={j.id}>
            <Card
              id={`ds-journeys-cast-${j.id}`}
              size="sm"
              interactive
              role="button"
              tabIndex={0}
              aria-label={`Walk through as ${who.name}, ${j.role}`}
              className="ds-journeys__persona"
              onClick={pick}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick())}
            >
              <CardBody>
                <Stack level={4}>
                  <Stack level={4} direction="horizontal" align="center">
                    <Avatar id={`ds-journeys-cast-${j.id}-av`} fallback={who.initials} />
                    <Stack level={5}>
                      <Text weight="semibold">{who.name}</Text>
                      <Text as="span" size="xs" tone="muted">
                        {j.role}
                      </Text>
                    </Stack>
                  </Stack>
                  <Text size="sm" tone="muted">
                    {j.goal}
                  </Text>
                  <Text as="span" size="xs" weight="medium" className="ds-journeys__go">
                    <Play aria-hidden="true" /> {`${j.steps.length} steps`}
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

function Lane({ journey: j, onPick }: { journey: Journey; onPick: (i: number) => void }) {
  const cast = [...new Set(j.steps.map((s) => s.who))];
  return (
    <section className="ds-journeys__lane" aria-labelledby={`ds-journeys-${j.id}-title`}>
      <div className="ds-journeys__who">
        {j.who ? (
          <Avatar id={`ds-journeys-${j.id}-avatar`} size="lg" fallback={personById(j.who).initials} />
        ) : (
          <div className="ds-journeys__cast">
            {cast.map((id) => (
              <Avatar key={id} id={`ds-journeys-${j.id}-cast-${id}`} size="sm" fallback={personById(id).initials} />
            ))}
          </div>
        )}
        <Stack level={5}>
          <Text as="span" size="xs" tone="muted">
            {j.who ? `${personById(j.who).name} · ${j.role}` : j.role}
          </Text>
          <h2 id={`ds-journeys-${j.id}-title`} className="ds-journeys__lane-title">
            {j.title}
          </h2>
          <Text size="sm" tone="muted">
            {j.goal}
          </Text>
        </Stack>
      </div>
      <ol className="ds-journeys__track">
        {j.steps.map((s, i) => (
          <li key={i} className="ds-journeys__stop">
            <StepCard id={`ds-journeys-${j.id}-${i}`} step={s} index={i} showWho={!j.who} onPick={() => onPick(i)} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepCard({ id, step: s, index, showWho, onPick }: { id: string; step: JourneyStep; index: number; showWho: boolean; onPick: () => void }) {
  return (
    <Card
      id={id}
      size="sm"
      interactive
      role="button"
      tabIndex={0}
      aria-label={`Step ${index + 1}: ${s.title}. Walk through from here.`}
      className="ds-journeys__card"
      onClick={onPick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick())}
    >
      <CardBody>
        <Stack level={4}>
          <Stack level={5} direction="horizontal" align="center" justify="between">
            <span className="ds-journeys__num" aria-hidden="true">
              {index + 1}
            </span>
            <Badge id={`${id}-app`} label={APP_NAME[s.app]} color={APP_COLOR[s.app]} appearance="soft" />
          </Stack>
          <Stack level={5}>
            <Text weight="semibold">{s.title}</Text>
            <Text size="sm" tone="muted">
              {s.says}
            </Text>
          </Stack>
          {(showWho || s.improved) && (
            <Stack level={5} direction="horizontal" align="center" justify="between" wrap>
              {showWho ? (
                <Stack level={5} direction="horizontal" align="center">
                  <Avatar id={`${id}-who`} size="xs" fallback={personById(s.who).initials} />
                  <Text as="span" size="xs" tone="muted">
                    {firstName(s.who)}
                  </Text>
                </Stack>
              ) : (
                <span />
              )}
              {s.improved && <Badge id={`${id}-improved`} label="Improved" color="success" appearance="outline" IconLeft={Sparkles} />}
            </Stack>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

/* ── The presenter ───────────────────────────────────────────────────────── */

function Present(props: { journeyId: string; step: number; onJourney: (id: string) => void; onStep: (i: number) => void }) {
  // Restart = a fresh store; everything filed or approved during the walkthrough is gone.
  const [run, setRun] = useState(0);
  return (
    <SuiteProvider key={run}>
      <NavProvider>
        <UiProvider>
          <div className="ds-journeys__present">
            <Script {...props} onRestart={() => setRun((r) => r + 1)} />
            <div className="ds-journeys__frame" aria-label="Live prototype">
              <Shell aiden={<AidenHost />}>
                <Router />
              </Shell>
            </div>
          </div>
        </UiProvider>
      </NavProvider>
    </SuiteProvider>
  );
}

function Script({
  journeyId,
  step,
  onJourney,
  onStep,
  onRestart,
}: {
  journeyId: string;
  step: number;
  onJourney: (id: string) => void;
  onStep: (i: number) => void;
  onRestart: () => void;
}) {
  const { state, update } = useSuite();
  const { go } = useNav();
  const journey = JOURNEYS.find((j) => j.id === journeyId) ?? JOURNEYS[0];
  const s = journey.steps[Math.min(step, journey.steps.length - 1)];
  const last = step >= journey.steps.length - 1;

  // The prototype follows the script: sign in as the step's person, open its page.
  // Live values through refs, so this runs on a step change and not on every store write.
  const live = useRef({ state, update, go });
  live.current = { state, update, go };
  useEffect(() => {
    const { state: st, update: up, go: nav } = live.current;
    if (st.userId !== s.who)
      up((d) => {
        d.userId = s.who;
      });
    nav(typeof s.route === 'function' ? s.route(st) : s.route);
  }, [journeyId, step, s]);

  // ← / → step through, unless someone is typing or working inside the prototype.
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const at = document.activeElement;
      const free = !at || at === document.body || panel.current?.contains(at);
      if (!free || (at instanceof HTMLElement && at.matches('input, textarea, select'))) return;
      if (e.key === 'ArrowRight' && !last) onStep(step + 1);
      if (e.key === 'ArrowLeft' && step > 0) onStep(step - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [step, last, onStep]);

  const person = personById(s.who);
  const done = s.done?.(state);

  return (
    <div ref={panel} className="ds-journeys__script">
      <NativeSelect id="ds-journeys-pick" label="Journey" value={journey.id} onValueChange={onJourney}>
        {JOURNEYS.map((j) => (
          <NativeSelectOption key={j.id} value={j.id}>
            {j.who ? `${j.title} · ${personById(j.who).name}` : j.title}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Text size="sm" tone="muted">
        {journey.goal}
      </Text>

      <Card id="ds-journeys-now" size="sm">
        <CardBody>
          <Stack level={3}>
            <Stack level={4} direction="horizontal" align="center">
              <Avatar id="ds-journeys-now-who" fallback={person.initials} />
              <Stack level={5}>
                <Text weight="semibold">{person.name}</Text>
                <Stack level={5} direction="horizontal" align="center" wrap>
                  <Text as="span" size="xs" tone="muted">{`Step ${step + 1} of ${journey.steps.length} ·`}</Text>
                  <Badge id="ds-journeys-now-app" label={APP_NAME[s.app]} color={APP_COLOR[s.app]} appearance="soft" />
                </Stack>
              </Stack>
            </Stack>
            <Stack level={5}>
              <h2 className="ds-journeys__step-title">{s.title}</h2>
              <Text>{s.says}</Text>
            </Stack>
            {s.point && (
              <Text size="sm" tone="muted">
                <strong>Point out:</strong> {s.point}
              </Text>
            )}
            {s.improved && <Alert id="ds-journeys-now-improved" variant="success" title="What changed" description={s.improved} />}
            {s.act &&
              (done ? (
                <Badge id="ds-journeys-now-done" label="Done in the prototype" color="success" appearance="soft" IconLeft={Check} />
              ) : (
                <Button
                  id="ds-journeys-now-act"
                  style="secondary"
                  label={s.act.label}
                  IconLeft={Wand2}
                  onClick={() => s.act?.run({ state, update, go })}
                />
              ))}
            <Stack level={4} direction="horizontal" align="center" justify="between">
              <Button id="ds-journeys-prev" style="ghost" label="Back" IconLeft={ArrowLeft} disabled={step === 0} onClick={() => onStep(step - 1)} />
              <Text as="span" size="xs" tone="muted">
                <Kbd size="sm">←</Kbd> <Kbd size="sm">→</Kbd>
              </Text>
              <Button id="ds-journeys-next" label={last ? 'Done' : 'Next'} IconRight={last ? undefined : ArrowRight} disabled={last} onClick={() => onStep(step + 1)} />
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      <ItemGroup aria-label="Steps">
        {journey.steps.map((st, i) => {
          const isDone = st.done?.(state);
          return (
            <Item
              key={i}
              size="sm"
              variant={i === step ? 'muted' : 'default'}
              aria-current={i === step ? 'step' : undefined}
              onClick={() => onStep(i)}
            >
              <ItemMedia variant="icon">{isDone ? <Check /> : <span className="ds-journeys__num ds-journeys__num--sm">{i + 1}</span>}</ItemMedia>
              <ItemContent>
                <ItemTitle>{st.title}</ItemTitle>
                <ItemDescription>{`${firstName(st.who)} · ${APP_NAME[st.app]}`}</ItemDescription>
              </ItemContent>
            </Item>
          );
        })}
      </ItemGroup>

      <Button id="ds-journeys-restart" style="ghost" size="sm" label="Start over with fresh data" IconLeft={RotateCcw} onClick={onRestart} />
    </div>
  );
}
