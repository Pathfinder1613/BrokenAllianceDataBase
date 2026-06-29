import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}me`, { credentials: 'include' })
      .then(res => setIsAdmin(res.ok))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, []);

  const login = () => setIsAdmin(true);

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setIsAdmin(false);
  };

  if (checking) return null;

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
