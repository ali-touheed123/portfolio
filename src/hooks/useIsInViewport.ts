import { useEffect, useState, type RefObject } from 'react';
import { useHomeVisible } from '../context/VisibilityContext';

/**
 * Tracks whether `ref` is currently intersecting the viewport (with optional rootMargin)
 * AND the home page & browser tab are visible.
 */
export function useIsInViewport(
  ref: RefObject<Element | null>,
  rootMargin = '150px'
): boolean {
  const homeVisible = useHomeVisible();
  const [inView, setInView] = useState<boolean>(true);
  const [tabVisible, setTabVisible] = useState<boolean>(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return homeVisible && tabVisible && inView;
}
