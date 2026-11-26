import { useRef, type RefObject } from 'react';

export interface ParallaxState {
  x: number; // Normalized -1 to 1
  y: number; // Normalized -1 to 1
}

/**
 * Mouse magnetism disabled: returns rock-solid center coordinates (0, 0)
 * without registering any window mousemove listeners.
 */
export function useParallax(): RefObject<ParallaxState> {
  const currentRef = useRef<ParallaxState>({ x: 0, y: 0 });
  return currentRef;
}
