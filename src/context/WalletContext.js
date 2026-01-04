import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { getMyPoints } from "../api/api";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [points, setPoints] = useState({
    total: 0,
    available: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      if (!getMyPoints || typeof getMyPoints !== 'function') {
        console.error("WalletContext Error: getMyPoints is not available");
        return;
      }
      const res = await getMyPoints();
      setPoints({
        total: res.data?.total || 0,
        available: res.data?.available || 0,
      });
    } catch (err) {
      console.error("WalletContext Error:", err);
      // Don't show alert for network errors, just log
      if (err?.response?.status !== 401) {
        console.log("Failed to load wallet data:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePoints = (earned) => {
    setPoints((prev) => ({
      total: prev.total + earned,
      available: prev.available + earned,
    }));
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  return (
    <WalletContext.Provider value={{ points, loading, fetchPoints, updatePoints }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
