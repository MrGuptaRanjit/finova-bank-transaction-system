import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("token") || localStorage.getItem("user"));
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check existing authentication session
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data?.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        throw new Error("No user found");
      }
    } catch (error) {
      console.warn("Session check failed or unauthenticated:", error.message || error);
      // If server returned 401 and there's no valid session
      if (!localStorage.getItem("token")) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login user
  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        isLoading,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};