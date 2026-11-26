import { useEffect, useRef, useState, type RefObject } from 'react';
import { useHomeVisible } from '../context/VisibilityContext';

/**
 * Tracks whether `ref` is currently intersecting the viewport (with optional rootMargin)
 * AND the home page & browser tab are visible.
 *
 * Starts `false` so components that are genuinely off-screen at mount never fire
 * a canvas loop before the IntersectionObserver can confirm their position.
 * Components that ARE in the viewport get corrected within the first rAF (~16ms).
 */
export function useIsInViewport(
  ref: RefObject<Element | null>,
  rootMargin = '150px'
): boolean {
  const homeVisible = useHomeVisible();
  // Start false — IntersectionObserver will fire true within 1 frame for visible elements.
  // This prevents off-screen sections (About, Projects, Footer) from starting canvas loops
  // at page load while the curtain is still showing.
  const [inView, setInView] = useState<boolean>(false);
  const [tabVisible, setTabVisible] = useState<boolean>(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );
  // Track the observer instance to avoid re-creating if rootMargin hasn't changed
  const rootMarginRef = useRef(rootMargin);

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      // No IO support — assume visible so animations still work
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin: rootMarginRef.current }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return homeVisible && tabVisible && inView;
}
