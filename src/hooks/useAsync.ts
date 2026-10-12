import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

export type AsyncState<T> =
  | { status: 'loading'; data: T | undefined; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: T | undefined; error: Error };

/**
 * Runs an async loader whenever `deps` change. Previous requests are aborted,
 * stale responses are ignored, and `reload()` retries after an error.
 */
export function useAsync<T>(loader: (signal: AbortSignal) => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading', data: undefined, error: null });
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ status: 'loading', data: s.data, error: null }));
    loaderRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState((s) => ({ status: 'error', data: s.data, error: error instanceof Error ? error : new Error(String(error)) }));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}
