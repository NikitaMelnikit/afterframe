import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Wordmark } from '@/components/layout/Wordmark';

/** Last-resort boundary for unexpected render errors. Deliberately dependency-light. */
export default function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  if (import.meta.env.DEV) console.error(error);
  return (
    <div className="frame flex min-h-[100svh] flex-col justify-center py-24">
      <Link to="/" className="text-xl">
        <Wordmark />
      </Link>
      <p className="eyebrow mt-16">{notFound ? '404 — Lost in the edit' : 'Projector fault'}</p>
      <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.4rem,7vw,6rem)] font-semibold uppercase leading-[0.88] tracking-[-0.05em]">
        {notFound ? 'This scene was cut.' : 'Something slipped off the reel.'}
      </h1>
      <p className="mt-6 max-w-md text-silver">{notFound ? 'That page doesn’t exist.' : 'An unexpected error interrupted the screening. Reloading usually gets things rolling again.'}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <button type="button" onClick={() => window.location.reload()} className="btn-primary">
          Reload
        </button>
        <Link to="/" className="btn-ghost">
          Back home
        </Link>
      </div>
    </div>
  );
}
