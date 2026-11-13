"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// useLayoutEffect warns during server rendering; it only matters in the browser
const useBrowserLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A selected tab (or tab-like filter) that survives a page refresh.
 *
 * The choice is kept in sessionStorage per page path and `name`, so each
 * page (and each model / job detail page) remembers its own tab while the
 * browser tab stays open. It is read before the first paint, so the page
 * doesn't flash the default tab. A saved value not in `allowed` (a tab that
 * was renamed or isn't shown to this panel) falls back to `initial`.
 */
export function usePersistedTab<T extends string>(
  name: string,
  initial: T,
  allowed?: readonly T[],
) {
  const pathname = usePathname();
  const storageKey = `tab:${pathname}:${name}`;
  const [value, setValue] = useState<T>(initial);
  // The restored / latest value, readable right away from effects that run
  // in the same render as the restore (state only updates on the next one)
  const latest = useRef<T>(initial);
  const allowedKey = allowed?.join("\u0000");

  // Restore on mount, and when the same component is reused for another
  // page (e.g. moving from one model's detail page to another's)
  useBrowserLayoutEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.sessionStorage.getItem(storageKey);
    } catch {
      // Storage blocked (private mode etc.): keep the default
    }
    const valid = saved !== null && (!allowed || allowed.includes(saved as T));
    latest.current = valid ? (saved as T) : initial;
    setValue(latest.current);
    // `allowed` is compared by content through allowedKey
  }, [storageKey, allowedKey, initial]);

  const update = useCallback(
    (next: T) => {
      latest.current = next;
      setValue(next);
      try {
        window.sessionStorage.setItem(storageKey, next);
      } catch {
        // Not saved; the tab still changes
      }
    },
    [storageKey],
  );

  return [value, update, latest] as const;
}
