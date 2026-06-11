import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);

  // On mount, fetch current user if we have a token
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      apiClient
        .get<User>('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<{ access_token: string }>('/auth/login', { email, password });
    const newToken = res.data.access_token;
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    const meRes = await apiClient.get<User>('/auth/me');
    setUser(meRes.data);
  };

  const register = async (fullName: string, email: string, password: string) => {
    await apiClient.post('/auth/register', { full_name: fullName, email, password });
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
