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
import { ReportDetails, ReportsBrowse } from './boards/reports';
import { MetricPage, MetricsBrowse } from './boards/metrics';
import { MarketplaceAll } from './boards/marketplace';
import { SuiteBrowse } from './boards/suite/SuiteBrowse';
import { AidenChatPage, AidenLauncherPage } from './aiden';
import {
  IrmActivity,
  IrmAuditLog,
  IrmBoard,
  IrmChange,
  IrmChanges,
  IrmDeployments,
  IrmGovernance,
  IrmHome,
  IrmIntegrations,
  IrmNewChange,
  IrmRecord,
  IrmRecords,
  IrmWorkflows,
} from './irm';

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
      return <RequestForm key={route.reach ?? route.kind} kind={route.kind} mode={route.mode} dashboardId={route.dashboardId} record={route.record} reach={route.reach} />;
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
      return route.suite ? <SuiteBrowse suiteId={route.suite} sectionId={route.section} /> : <Browse />;
    case 'marketplace':
      return <MarketplaceAll />;
    case 'reports':
      return <ReportsBrowse />;
    case 'metrics':
      return <MetricsBrowse />;
    case 'metric':
      return <MetricPage id={route.id} />;
    case 'report':
      return <ReportDetails id={route.id} />;
    case 'space':
      return <SpacePage id={route.id} />;
    case 'shared':
      return <SharedWithMe />;
    case 'builder':
      return <Builder spaceId={route.spaceId} seedDashboardId={route.seedDashboardId} seedAssetId={route.seedAssetId} />;
    case 'dashboard':
      return <DashboardViewer id={route.id} fromSpaceId={route.fromSpaceId} widget={route.widget} />;
    case 'aiden-launcher':
      return <AidenLauncherPage />;
    case 'aiden-chat':
      return <AidenChatPage chatId={route.chatId} />;
    case 'irm-home':
      return <IrmHome />;
    case 'irm-records':
      return <IrmRecords />;
    case 'irm-record':
      return <IrmRecord number={route.number} />;
    case 'irm-changes':
      return <IrmChanges />;
    case 'irm-change':
      return <IrmChange id={route.id} />;
    case 'report-request':
      return <IrmNewChange type={route.type} record={route.record} hosted />;
    case 'report-request-detail':
      return <IrmChange id={route.id} hosted />;
    case 'irm-new-change':
      return <IrmNewChange type={route.type} record={route.record} />;
    case 'irm-board':
      return <IrmBoard />;
    case 'irm-activity':
      return <IrmActivity />;
    case 'irm-governance':
      return <IrmGovernance />;
    case 'irm-deployments':
      return <IrmDeployments />;
    case 'irm-integrations':
      return <IrmIntegrations />;
    case 'irm-audit':
      return <IrmAuditLog />;
    case 'irm-workflows':
      return <IrmWorkflows />;
  }
}

/** A suite's section is a filter on one page, not a new page — keep the page mounted (and focus in its filter). */
const screenKey = (r: Route) => (r.page === 'browse' && r.suite ? `browse:${r.suite}` : JSON.stringify(r));

export function Router() {
  const { tabs, activeId } = useNav();
  // Every open tab stays mounted, hidden when inactive — switching tabs must not
  // throw away a half-filled form (that is what the leave guard protects).
  return (
    <>
      {tabs.map((t) => (
        <div key={t.id} hidden={t.id !== activeId} style={{ display: t.id === activeId ? 'contents' : 'none' }}>
          <Screen key={screenKey(t.route)} route={t.route} />
        </div>
      ))}
    </>
  );
}
