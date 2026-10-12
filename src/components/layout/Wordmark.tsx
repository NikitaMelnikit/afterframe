import { cn } from '@/lib/cn';

/** AFTERFRAME wordmark: tight grotesk caps with a single acid "frame edge". */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-[0.35em] font-display font-semibold uppercase leading-none tracking-[-0.03em]', className)}>
      <span>
        After<span className="text-silver">frame</span>
      </span>
      <span className="inline-block h-[0.72em] w-[0.22em] bg-acid" aria-hidden />
    </span>
  );
}
