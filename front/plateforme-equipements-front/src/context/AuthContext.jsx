import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi, AUTH_EXPIRED_EVENT } from "../services/api";

const AuthContext = createContext(null);

// Lit l'expiration (en ms) dans le JWT. Le payload est du JSON encodé en base64, pas besoin de librairie.
function getTokenExpiry(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const expireSession = useCallback(() => {
    sessionStorage.setItem("session_expired", "1");
    clearSession();
  }, [clearSession]);

  // 1. Au chargement : on restaure la session SEULEMENT si le token n'est pas expiré
  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");

    if (token && stored && stored !== "undefined") {
      const exp = getTokenExpiry(token);
      if (exp && exp <= Date.now()) {
        expireSession();
      } else {
        try {
          setUser(JSON.parse(stored));
        } catch {
          clearSession();
        }
      }
    } else if (token || stored) {
      clearSession(); // état incohérent : l'un sans l'autre
    }
    setLoading(false);
  }, [clearSession, expireSession]);

  // 2. En cours d'utilisation : api.js signale un 401 (il a déjà vidé le localStorage)
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  // 3. Déconnexion automatique à l'heure exacte d'expiration
  useEffect(() => {
    if (!user) return;
    const exp = getTokenExpiry(localStorage.getItem("token") || "");
    if (!exp) return;
    const delay = exp - Date.now();
    if (delay <= 0) {
      expireSession();
      return;
    }
    const timer = setTimeout(expireSession, Math.min(delay, 2147483647)); // limite de setTimeout
    return () => clearTimeout(timer);
  }, [user, expireSession]);

  async function login(credentials) {
    const { token, utilisateur } = await authApi.login(credentials);
    sessionStorage.removeItem("session_expired");
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(utilisateur));
    setUser(utilisateur);
    return utilisateur;
  }

  async function register(data) {
    const { token, utilisateur } = await authApi.register(data);
    sessionStorage.removeItem("session_expired");
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(utilisateur));
    setUser(utilisateur);
    return utilisateur;
  }

  function logout() {
    clearSession();
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
