import { useRef } from "react";

// Saves incoming handler to the ref in order to avoid "useCallback hell"
export function useEventCallback<T>(
  handler?: (value: T, event: MouseEvent | TouchEvent | KeyboardEvent) => void
): (value: T, event: MouseEvent | TouchEvent | KeyboardEvent) => void {
  const callbackRef = useRef(handler);
  const fn = useRef((value: T, event: MouseEvent | TouchEvent | KeyboardEvent) => {
    callbackRef.current && callbackRef.current(value, event);
  });
  callbackRef.current = handler;

  return fn.current;
}
