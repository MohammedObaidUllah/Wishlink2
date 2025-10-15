import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser, initializeStorage } from '../utils/localStorage';

interface AuthContextType {
  currentUser: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    initializeStorage();
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const user = getUser(username);
    if (user && user.password === password) {
      setCurrentUser(username);
      sessionStorage.setItem('currentUser', username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
