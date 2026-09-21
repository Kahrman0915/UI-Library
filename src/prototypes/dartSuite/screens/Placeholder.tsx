import { Compass } from 'lucide-react';
import Button from '../../../components/Button';
import Empty, { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../components/Empty';
import PageContainer from '../../../components/PageContainer';
import PageHeader from '../../../components/PageHeader';
import { useNav } from '../nav';

/**
 * Navigation destinations the Figma file lists but does not design (Discover,
 * Community, Reports, Metrics, the other rail apps…). Said plainly rather than
 * faked, so nobody mistakes a gap for a screen.
 */
export function Placeholder({ title }: { title: string }) {
  const { go } = useNav();
  return (
    <PageContainer>
      <PageHeader id="ds-placeholder" title={title} />
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Compass />
          </EmptyMedia>
          <EmptyTitle>{title} is not designed yet</EmptyTitle>
          <EmptyDescription>
            This destination is in the navigation but has no screens in the Figma file, so the prototype stops here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button id="ds-placeholder-home" style="outline" label="Back to Home" onClick={() => go({ page: 'home' })} />
        </EmptyContent>
      </Empty>
    </PageContainer>
  );
}
