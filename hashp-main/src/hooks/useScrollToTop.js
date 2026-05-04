import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls window (or a provided element ref) to the top whenever
 * the route pathname changes. Drop this in any screen component.
 */
export function useScrollToTop(ref = null) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (ref?.current) {
      ref.current.scrollTop = 0;
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, ref]);
}
