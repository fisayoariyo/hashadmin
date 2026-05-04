import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// TODO: Replace with real API call from src/services/api.js
import { getFarmerID } from "../services/api";

export function useFarmerID() {
  const { farmerID } = useAuth();
  const [idData, setIdData] = useState(null);
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
      const data = await getFarmerID(farmerID);
      setIdData(data);
    } catch (err) {
      setError(err.message || "Failed to load Farmer ID");
    } finally {
      setLoading(false);
    }
  }, [farmerID]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { idData, loading, error, refetch: fetch };
}
