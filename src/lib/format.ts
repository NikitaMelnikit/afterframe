export function formatRuntime(minutes: number | null | undefined) {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h`;
}

export function formatRating(r: number | null | undefined) {
  return r == null ? null : r.toFixed(1);
}

export function formatMoney(n: number | null | undefined) {
  if (!n) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function joinList(items: string[], max = 3) {
  const list = items.filter(Boolean).slice(0, max);
  if (list.length <= 1) return list.join('');
  return `${list.slice(0, -1).join(', ')} & ${list[list.length - 1]}`;
}

export function pad(n: number, size = 2) {
  return String(n).padStart(size, '0');
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', fr: 'French', ja: 'Japanese', ko: 'Korean', zh: 'Chinese', cn: 'Cantonese', es: 'Spanish',
  de: 'German', it: 'Italian', ru: 'Russian', pt: 'Portuguese', sv: 'Swedish', da: 'Danish', hi: 'Hindi',
};
export function languageName(code: string | null | undefined) {
  if (!code) return null;
  return LANGUAGE_NAMES[code] ?? code.toUpperCase();
}
