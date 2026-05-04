import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// TODO: Replace with real API call from src/services/api.js
import { getNotifications } from "../services/api";

export function useNotifications() {
  const { farmerID } = useAuth();
  const [notifications, setNotifications] = useState([]);
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
      const data = await getNotifications(farmerID);
      setNotifications(data);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [farmerID]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading, error, refetch: fetch };
}
