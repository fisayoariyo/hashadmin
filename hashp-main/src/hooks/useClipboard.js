import { useCallback } from "react";
import { useToast } from "../context/ToastContext";

export function useClipboard() {
  const { success, error } = useToast();

  const copy = useCallback(
    async (text, label = "Copied!") => {
      if (!text) return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older mobile browsers
          const el = document.createElement("textarea");
          el.value = text;
          el.style.position = "fixed";
          el.style.opacity = "0";
          document.body.appendChild(el);
          el.focus();
          el.select();
          document.execCommand("copy");
          document.body.removeChild(el);
        }
        success(label);
      } catch {
        error("Could not copy to clipboard.");
      }
    },
    [success, error]
  );

  return { copy };
}
