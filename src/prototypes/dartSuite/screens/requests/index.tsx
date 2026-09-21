/* DART Central · the requester flow (Figma: Request Flow, page 1816:25326).
   Router.tsx imports these five names; each lives in its own file here. */

import type { DashboardRequestMode, RequestKind } from '../../types';
import { BannerForm } from './BannerForm';
import { DashboardForm } from './DashboardForm';
import { FeatureForm, GeneralForm } from './SimpleForms';

export { MyRequests } from './MyRequests';
export { RequestDetail } from './RequestDetail';
export { NewRequest } from './NewRequest';
export { RequestSubmitted } from './RequestSubmitted';

export function RequestForm({ kind, mode }: { kind: RequestKind; mode?: DashboardRequestMode }) {
  switch (kind) {
    case 'dashboard':
      return <DashboardForm initialMode={mode ?? 'add'} />;
    case 'banner':
      return <BannerForm />;
    case 'general':
      return <GeneralForm />;
    case 'feature':
      return <FeatureForm />;
  }
}
