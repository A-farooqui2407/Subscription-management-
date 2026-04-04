import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/**
 * API returns Sequelize ENUM: Admin | InternalUser | PortalUser.
 * UI uses lowercase slugs for route/nav checks.
 */
export function normalizeRole(raw) {
  const r = String(raw || '').trim();
  if (r === 'Admin' || r === 'admin') return 'admin';
  if (r === 'InternalUser' || r === 'internalUser') return 'internalUser';
  if (r === 'PortalUser' || r === 'portalUser' || r === 'Portal') return 'user';
  if (r === 'user') return 'user';
  return 'user';
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setRole(normalizeRole(parsedUser.role));
      } catch (e) {
        logout();
      }
    }
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setRole(normalizeRole(userData.role));
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const canWrite = role === 'admin' || role === 'internalUser';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        canWrite,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
