import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from './Reveal';

interface Props {
  number: string;
  label: string;
  title: ReactNode;
  aside?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
  as?: 'h1' | 'h2';
}

/** Editorial section header: numbered label column + display headline. */
export function SectionHeading({ number, label, title, aside, action, id, className, as: Tag = 'h2' }: Props) {
  return (
    <header className={cn('frame grid-12 items-end gap-y-6', className)}>
      <div className="col-span-4 flex items-center gap-3 md:col-span-8 lg:col-span-3 lg:self-start lg:pt-3">
        <span className="font-mono text-micro text-acid">({number})</span>
        <span className="eyebrow">{label}</span>
      </div>
      <Reveal className="col-span-4 md:col-span-8 lg:col-span-9">
        <Tag id={id} className="text-display-sm font-semibold uppercase">
          {title}
        </Tag>
      </Reveal>
      {(aside || action) && (
        <div className="col-span-4 flex flex-col gap-5 md:col-span-8 md:flex-row md:items-end md:justify-between lg:col-span-9 lg:col-start-4">
          {aside && <div className="max-w-xl text-[0.95rem] leading-relaxed text-silver">{aside}</div>}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
    </header>
  );
}
