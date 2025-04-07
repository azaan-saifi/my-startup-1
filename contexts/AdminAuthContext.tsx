import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthStatus, setAuthStatus } from '@/lib/utils';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  authenticate: (key: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  
  // Check if user is already authenticated
  useEffect(() => {
    const authStatus = getAuthStatus();
    setIsAuthenticated(authStatus);
  }, []);

  const authenticate = (key: string): boolean => {
    const isValid = key === 'wearethebest';
    
    if (isValid) {
      setIsAuthenticated(true);
      setAuthStatus(true);
    }
    
    return isValid;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthStatus(false);
    // Redirect to landing page after logout
    router.push('/');
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, authenticate, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}; 