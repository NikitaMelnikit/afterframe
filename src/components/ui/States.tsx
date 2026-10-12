import { RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StateProps {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Use h1 when the state replaces a whole page. */
  as?: 'h1' | 'h2';
}

/** Editorial empty state — big type, a thin rule, and somewhere useful to go. */
export function EmptyState({ eyebrow, title, body, actions, className, as: Tag = 'h2' }: StateProps) {
  return (
    <div className={cn('relative border-t border-line py-16 md:py-24', className)}>
      <span className="eyebrow flex items-center gap-3">
        <span className="h-1.5 w-1.5 bg-acid" aria-hidden />
        {eyebrow}
      </span>
      <Tag className="mt-6 max-w-4xl text-display-sm font-semibold uppercase">{title}</Tag>
      {body && <div className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-silver">{body}</div>}
      {actions && <div className="mt-10 flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }: { error?: Error | null; onRetry?: () => void; className?: string }) {
  const unauthorized = error && 'status' in error && (error as { status?: number }).status === 401;
  return (
    <EmptyState
      className={className}
      eyebrow="Signal lost"
      title="The projector jammed."
      body={
        unauthorized
          ? 'TMDB rejected the configured API key. Check VITE_TMDB_API_KEY (or VITE_TMDB_READ_TOKEN) in your .env file and restart the dev server.'
          : 'We couldn’t reach the film data source just now. It may be a network hiccup — give it another go.'
      }
      actions={
        onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary">
            <RotateCw className="h-4 w-4" aria-hidden /> Try again
          </button>
        )
      }
    />
  );
}
