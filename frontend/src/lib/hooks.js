import { useEffect, useRef, useState } from 'react';
import { api } from './api';

/** Fetch JSON from the API. Returns {data, loading, error, reload}. `fallback` is used if the API is unreachable. */
export function useApi(path, fallback = null, deps = []) {
  const [state, setState] = useState({ data: fallback, loading: true, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    api.get(path)
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: fallback, loading: false, error }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

/** Adds .in class once element scrolls into view. */
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { el.classList.add('in'); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export function useDocTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ARHICA` : 'ARHICA — AfriResilience Hub for Inclusive Climate Action';
  }, [title]);
}
