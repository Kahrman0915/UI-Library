/* Route → screen. Keyed by the active tab, so each tab keeps its own local
   state (form drafts, open menus) while you switch between them. */

import { useNav } from '../nav';
import type { Route } from '../types';
import { Home } from './home/Home';
import { Placeholder } from './Placeholder';
import { WhatsNew, WhatsNewStory } from './whatsNew';
import { MyRequests, NewRequest, RequestDetail, RequestForm, RequestSubmitted } from './requests';
import {
  AdminAccess,
  AdminActivity,
  AdminApplied,
  AdminBanners,
  AdminDashboards,
  AdminOverview,
  AdminPromotions,
  AdminQueue,
  AdminRedirects,
  AdminReview,
  AdminUsage,
} from './admin';
import { Browse } from './boards/browse';
import { DashboardViewer } from './boards/dashboard';
import { SharedWithMe, SpacePage } from './boards/space';
import { Builder } from './boards/builder';
import { AidenChatPage, AidenLauncherPage } from './aiden';

function Screen({ route }: { route: Route }) {
  switch (route.page) {
    case 'home':
      return <Home />;
    case 'my-requests':
      return <MyRequests />;
    case 'request-detail':
      return <RequestDetail id={route.id} />;
    case 'new-request':
      return <NewRequest />;
    case 'request-form':
      return <RequestForm kind={route.kind} mode={route.mode} />;
    case 'request-submitted':
      return <RequestSubmitted id={route.id} />;
    case 'whats-new':
      return <WhatsNew />;
    case 'whats-new-story':
      return <WhatsNewStory id={route.id} />;
    case 'placeholder':
      return <Placeholder title={route.title} />;
    case 'admin-overview':
      return <AdminOverview />;
    case 'admin-queue':
      return <AdminQueue />;
    case 'admin-review':
      return <AdminReview id={route.id} />;
    case 'admin-applied':
      return <AdminApplied id={route.id} />;
    case 'admin-activity':
      return <AdminActivity />;
    case 'admin-dashboards':
      return <AdminDashboards />;
    case 'admin-banners':
      return <AdminBanners />;
    case 'admin-promotions':
      return <AdminPromotions />;
    case 'admin-redirects':
      return <AdminRedirects />;
    case 'admin-usage':
      return <AdminUsage />;
    case 'admin-access':
      return <AdminAccess />;
    case 'browse':
      return <Browse />;
    case 'space':
      return <SpacePage id={route.id} />;
    case 'shared':
      return <SharedWithMe />;
    case 'builder':
      return <Builder spaceId={route.spaceId} seedDashboardId={route.seedDashboardId} />;
    case 'dashboard':
      return <DashboardViewer id={route.id} fromSpaceId={route.fromSpaceId} />;
    case 'aiden-launcher':
      return <AidenLauncherPage />;
    case 'aiden-chat':
      return <AidenChatPage chatId={route.chatId} />;
  }
}

export function Router() {
  const { tabs, activeId } = useNav();
  // Every open tab stays mounted, hidden when inactive — switching tabs must not
  // throw away a half-filled form (that is what the leave guard protects).
  return (
    <>
      {tabs.map((t) => (
        <div key={t.id} hidden={t.id !== activeId} style={{ display: t.id === activeId ? 'contents' : 'none' }}>
          <Screen key={JSON.stringify(t.route)} route={t.route} />
        </div>
      ))}
    </>
  );
}
