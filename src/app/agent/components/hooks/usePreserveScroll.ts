import { useEffect } from "react";

/**
 * Locks the scroll position when `lock` is true,
 * and restores it when `lock` is false.
 */
export function usePreserveScroll(lock: boolean) {
  useEffect(() => {
    if (lock) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Freeze body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore body scroll
        const y = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";

        // Restore scroll position
        if (y) {
          window.scrollTo(0, parseInt(y || "0") * -1);
        }
      };
    }
  }, [lock]);
}
