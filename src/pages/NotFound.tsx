import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/States';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Lost in the edit');
  return (
    <div className="frame pb-24 pt-[calc(var(--nav-h)+4rem)]">
      <EmptyState
        as="h1"
        eyebrow="404 — Lost in the edit"
        title="This scene was cut."
        body="The page you’re looking for doesn’t exist — or ended up on the cutting-room floor."
        actions={
          <>
            <Link to="/" viewTransition className="btn-primary">
              Back to the start
            </Link>
            <Link to="/discover" viewTransition className="btn-ghost">
              Explore films
            </Link>
          </>
        }
      />
    </div>
  );
}
