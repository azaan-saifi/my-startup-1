"use client";

import React from "react";
import { StudentAuthProvider, useStudentAuth } from "@/contexts/StudentAuthContext";
import AuthModal from "@/components/student/AuthModal";
import StudentNavbar from "@/components/student/StudentNavbar";
import PageTransition from "@/components/PageTransition";
import ScrollRestoration from "@/components/ScrollRestoration";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, logout } = useStudentAuth();
  
  if (!isAuthenticated) {
    return <AuthModal />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <ScrollRestoration />
      
      <StudentNavbar onLogout={logout} />
      
      <div className="flex-1 w-full">
        <div className="fixed inset-0 bg-gradient-radial from-black via-yellow-500/5 to-transparent opacity-60 -z-10"></div>
        <div className="fixed inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-yellow-500/10 to-transparent -z-10"></div>
        <div className="fixed inset-y-0 right-0 w-1/3 bg-gradient-to-l from-yellow-500/5 to-transparent opacity-30 -z-10"></div>
        
        <PageTransition>
          <main className="p-3 sm:p-6 max-w-7xl mx-auto w-full pb-20 sm:pb-6">
            <div className="relative">
              <div className="absolute top-12 right-0 w-36 h-36 rounded-full bg-yellow-500/5 blur-3xl -z-10"></div>
              <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-yellow-500/5 blur-3xl -z-10"></div>
              
              {children}
            </div>
          </main>
        </PageTransition>
      </div>
    </div>
  );
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentAuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </StudentAuthProvider>
  );
} 