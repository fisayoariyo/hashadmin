import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// TODO: Replace with real API call from src/services/api.js
import { getFarmerProfile } from "../services/api";

export function useFarmer() {
  const { farmerID } = useAuth();
  const [farmer, setFarmer] = useState(null);
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
      const data = await getFarmerProfile(farmerID);
      setFarmer(data);
    } catch (err) {
      setError(err.message || "Failed to load farmer profile");
    } finally {
      setLoading(false);
    }
  }, [farmerID]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { farmer, loading, error, refetch: fetch };
}
