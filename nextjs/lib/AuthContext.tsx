'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, Employee } from '@/types';

interface AuthContextType {
  user: UserSession | null;
  employee: Employee | null;
  isEmployee: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  employee: null,
  isEmployee: false,
  isAdmin: false,
  isLoading: true,
  refreshAuth: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data?.authenticated && data.user) {
          setUser(data.user);
          if (data.employee) setEmployee(data.employee);

          if (typeof window !== 'undefined') {
            sessionStorage.setItem('hrms_session_user', JSON.stringify(data.user));
            if (data.employee) {
              sessionStorage.setItem('hrms_session_emp', JSON.stringify(data.employee));
            }
          }
        } else {
          setUser(null);
          setEmployee(null);
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('hrms_session_user');
            sessionStorage.removeItem('hrms_session_emp');
          }
        }
      }
    } catch {
      // Offline or network error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Restore from sessionStorage on client mount after hydration
    if (typeof window !== 'undefined') {
      try {
        const cachedUser = sessionStorage.getItem('hrms_session_user');
        if (cachedUser) setUser(JSON.parse(cachedUser));
        const cachedEmp = sessionStorage.getItem('hrms_session_emp');
        if (cachedEmp) setEmployee(JSON.parse(cachedEmp));
      } catch (err) {
        console.error('Session cache read error:', err);
      }
    }
    fetchSession();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue
    } finally {
      setUser(null);
      setEmployee(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('hrms_session_user');
        sessionStorage.removeItem('hrms_session_emp');
        window.location.href = '/login';
      }
    }
  };

  const isEmployee = user?.role === 'EMPLOYEE';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR_MANAGER';

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        isEmployee,
        isAdmin,
        isLoading,
        refreshAuth: fetchSession,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
