import { ChevronDown } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { DECADES, FILTER_GENRES } from '@/data/genres';
import type { SortKey } from '@/data/types';
import { cn } from '@/lib/cn';
import { RATING_STEPS as RATINGS, sortOptions, type FilterValue } from './filter-model';

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="eyebrow mb-2 block">
        {label}
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field appearance-none pr-10 font-mono text-[0.75rem] uppercase tracking-[0.08em]">
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-silver" aria-hidden />
      </div>
    </div>
  );
}

/** Desktop: compact native selects that apply immediately. */
export function InlineFilters({ value, onChange, hasRatings }: { value: FilterValue; onChange: (v: Partial<FilterValue>) => void; hasRatings: boolean }) {
  return (
    <div className={cn('grid gap-4', hasRatings ? 'grid-cols-4' : 'grid-cols-3')}>
      <Select label="Genre" value={value.genre ?? ''} onChange={(v) => onChange({ genre: v || null })}>
        <option value="">All genres</option>
        {FILTER_GENRES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </Select>
      <Select label="Decade" value={value.decade ? String(value.decade) : ''} onChange={(v) => onChange({ decade: v ? Number(v) : null })}>
        <option value="">Any decade</option>
        {DECADES.map((d) => (
          <option key={d} value={d}>
            {d}s
          </option>
        ))}
      </Select>
      {hasRatings && (
        <Select label="Min. TMDB rating" value={value.minRating ? String(value.minRating) : ''} onChange={(v) => onChange({ minRating: v ? Number(v) : null })}>
          <option value="">Any rating</option>
          {RATINGS.map((r) => (
            <option key={r} value={r}>
              {r}+ / 10
            </option>
          ))}
        </Select>
      )}
      <Select label="Sort by" value={value.sort} onChange={(v) => onChange({ sort: v as SortKey })}>
        {sortOptions(hasRatings).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function ChipGroup<T extends string | number>({ legend, options, value, onChange }: { legend: string; options: { value: T; label: string }[]; value: T | null; onChange: (v: T | null) => void }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={String(o.value)} type="button" aria-pressed={value === o.value} onClick={() => onChange(value === o.value ? null : o.value)} className="chip">
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Mobile drawer body: large, touch-friendly chip groups operating on a draft. */
export function StackedFilters({ value, onChange, hasRatings }: { value: FilterValue; onChange: (v: Partial<FilterValue>) => void; hasRatings: boolean }) {
  return (
    <div className="space-y-8">
      <ChipGroup legend="Sort by" options={sortOptions(hasRatings)} value={value.sort} onChange={(v) => onChange({ sort: v ?? 'relevance' })} />
      <ChipGroup legend="Genre" options={FILTER_GENRES.map((g) => ({ value: g, label: g }))} value={value.genre} onChange={(v) => onChange({ genre: v })} />
      <ChipGroup legend="Decade" options={DECADES.map((d) => ({ value: d, label: `${d}s` }))} value={value.decade} onChange={(v) => onChange({ decade: v })} />
      {hasRatings && (
        <ChipGroup legend="Min. TMDB rating" options={RATINGS.map((r) => ({ value: r, label: `${r}+` }))} value={value.minRating} onChange={(v) => onChange({ minRating: v })} />
      )}
    </div>
  );
}
