import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface StudentAuthContextType {
  isAuthenticated: boolean;
  authenticate: (key: string) => boolean;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
};

interface StudentAuthProviderProps {
  children: ReactNode;
}

export const StudentAuthProvider = ({ children }: StudentAuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  
  // Check if user is already authenticated
  useEffect(() => {
    const authStatus = getStudentAuthStatus();
    setIsAuthenticated(authStatus);
  }, []);

  const authenticate = (key: string): boolean => {
    const isValid = key === 'wearethebest';
    
    if (isValid) {
      setIsAuthenticated(true);
      setStudentAuthStatus(true);
    }
    
    return isValid;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setStudentAuthStatus(false);
    // Redirect to landing page after logout
    router.push('/');
  };

  return (
    <StudentAuthContext.Provider value={{ isAuthenticated, authenticate, logout }}>
      {children}
    </StudentAuthContext.Provider>
  );
};

// Helper functions for student authentication status
function getStudentAuthStatus(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('studentAuth') === 'authenticated';
}

function setStudentAuthStatus(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem('studentAuth', 'authenticated');
  } else {
    localStorage.removeItem('studentAuth');
  }
} 