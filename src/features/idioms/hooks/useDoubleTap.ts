import { useCallback, useEffect, useRef } from "react";

export function useDoubleTap(
  onSingleTap: () => void,
  onDoubleTap: () => void,
  delay = 300,
) {
  const onSingleRef = useRef(onSingleTap);
  const onDoubleRef = useRef(onDoubleTap);
  onSingleRef.current = onSingleTap;
  onDoubleRef.current = onDoubleTap;

  const lastTapRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < delay) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onDoubleRef.current();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        lastTapRef.current = 0;
        onSingleRef.current();
      }, delay);
    }
  }, [delay]);
}
