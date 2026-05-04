import { useState, useEffect, useCallback } from "react";

// TODO: Replace with real API call from src/services/api.js
import { getHelpContent } from "../services/api";

export function useHelp() {
  const [data, setData] = useState({ faqs: [], supportContact: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getHelpContent();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load help content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { faqs: data.faqs, supportContact: data.supportContact, loading, error, refetch: fetch };
}
