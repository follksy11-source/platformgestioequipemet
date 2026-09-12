import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined") {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  async function login(credentials) {
    const { token, utilisateur } = await authApi.login(credentials);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(utilisateur));
    setUser(utilisateur);
    return utilisateur;
  }

  async function register(data) {
    const { token, utilisateur } = await authApi.register(data);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(utilisateur));
    setUser(utilisateur);
    return utilisateur;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}
