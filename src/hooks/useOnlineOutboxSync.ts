import { useEffect } from "react";
import { flushOutboxIfOnline } from "@/lib/syncOutbox";

/**
 * Flushes the SQLite-backed outbox when the browser goes online (and once on mount if online).
 * Pair with `enqueueOutbox` so offline actions sync after connectivity returns.
 */
export function useOnlineOutboxSync() {
  useEffect(() => {
    const onOnline = () => {
      void flushOutboxIfOnline();
    };
    window.addEventListener("online", onOnline);
    if (typeof navigator !== "undefined" && navigator.onLine) {
      void flushOutboxIfOnline();
    }
    return () => window.removeEventListener("online", onOnline);
  }, []);
}
