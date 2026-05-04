import { createContext, useContext, useState, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// TODO: Replace mock auth logic with real API calls from src/services/api.js

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken, removeToken] = useLocalStorage("hcx_token", null);
  const [farmerID, setFarmerID, removeFarmerID] = useLocalStorage(
    "hcx_farmer_id",
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(token && farmerID);

  const login = useCallback(
    ({ token: newToken, farmerID: newFarmerID }) => {
      setToken(newToken);
      setFarmerID(newFarmerID);
    },
    [setToken, setFarmerID]
  );

  const logout = useCallback(() => {
    removeToken();
    removeFarmerID();
  }, [removeToken, removeFarmerID]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        farmerID,
        isLoading,
        setIsLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
