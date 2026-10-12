import { useEffect } from 'react';

const DEFAULT = 'AFTERFRAME — Find the film that stays with you';

export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} — AFTERFRAME` : DEFAULT;
  }, [title]);
}
