import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// TODO: Replace with real API call from src/services/api.js
import { getFarmerFarms } from "../services/api";

export function useFarms() {
  const { farmerID } = useAuth();
  const [farms, setFarms] = useState([]);
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
      const data = await getFarmerFarms(farmerID);
      setFarms(data);
    } catch (err) {
      setError(err.message || "Failed to load farms");
    } finally {
      setLoading(false);
    }
  }, [farmerID]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { farms, loading, error, refetch: fetch };
}
