import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const refreshUser = useCallback(async () => {
    // On app load and protected-page refreshes, /api/me asks Express to forward
    // the browser cookies to FreeAPI's /users/current-user endpoint.
    const response = await apiRequest("/me");
    const normalizedUser = normalizeUser(response.data);
    setUser(normalizedUser);
    return normalizedUser;
  }, []);

  useEffect(() => {
    let isMounted = true;

    refreshUser()
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsCheckingSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const register = useCallback(async (payload) => {
    await apiRequest("/register", {
      method: "POST",
      body: payload,
    });
  }, []);

  const login = useCallback(async (payload) => {
    await apiRequest("/login", {
      method: "POST",
      body: payload,
    });

    return refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await apiRequest("/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isCheckingSession,
      register,
      login,
      logout,
      refreshUser,
    }),
    [user, isCheckingSession, register, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

function normalizeUser(data) {
  const candidate = data?.user || data;
  const role = String(candidate?.role || "USER").toUpperCase();

  return {
    id: candidate?._id || candidate?.id || "",
    username: candidate?.username || candidate?.userName || "User",
    email: candidate?.email || "No email available",
    role: role === "ADMIN" ? "ADMIN" : "USER",
  };
}
