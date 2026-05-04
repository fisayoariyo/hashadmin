import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// TODO: Replace with real API call from src/services/api.js
import { getRecentActivities } from "../services/api";

export function useActivities() {
  const { farmerID } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!farmerID) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getRecentActivities(farmerID);
      setActivities(data);
    } catch (err) {
      setError(err.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  }, [farmerID]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { activities, loading, error, refetch: fetch };
}
