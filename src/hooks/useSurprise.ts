import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOCAL_FILMS } from '@/data/films';
import { toSummary } from '@/data/repository/local';
import { useWatchlist } from '@/state/watchlist';

/** Opens a random film from the editorial library, skipping ones already saved. */
export function useSurprise() {
  const navigate = useNavigate();
  const { ids } = useWatchlist();
  return useCallback(() => {
    const pool = LOCAL_FILMS.filter((f) => f.poster && !ids.has(f.id));
    const list = pool.length ? pool : LOCAL_FILMS;
    const pick = list[Math.floor(Math.random() * list.length)];
    navigate(`/film/${pick.id}`, { state: { film: toSummary(pick), surprise: true }, viewTransition: true });
  }, [navigate, ids]);
}
