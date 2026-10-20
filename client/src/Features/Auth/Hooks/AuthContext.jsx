import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authService } from "../Services/auth.service";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check the existing session

  // restore the session on first load
  useEffect(() => {
    let active = true;
    authService
      .me()
      .then((data) => active && setUser(data.user))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    if (data.requiresVerification) return data; // unknown device — no session yet
    setUser(data.user);
    return data;
  }, []);

  /** Second step after login() reported requiresVerification: enter the emailed code. */
  const verifyLogin = useCallback(async (payload) => {
    const data = await authService.verifyLogin(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  // called after a profile update so the topbar / pages show fresh values
  const updateUser = useCallback((next) => setUser((u) => (u ? { ...u, ...next } : next)), []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), login, verifyLogin, register, logout, updateUser }),
    [user, loading, login, verifyLogin, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
