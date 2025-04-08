"use client";

import React from "react";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import AuthModal from "@/components/admin/AuthModal";
import Sidebar from "@/components/admin/Sidebar";
import PageTransition from "@/components/PageTransition";
import ScrollRestoration from "@/components/ScrollRestoration";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, logout } = useAdminAuth();
  
  if (!isAuthenticated) {
    return <AuthModal />;
  }
  
  // Add logout functionality to the Sidebar component via props
  const SidebarWithLogout = () => {
    return <Sidebar onLogout={logout} />;
  };

  return (
    <div className="flex min-h-screen bg-black">
      <ScrollRestoration />
      
      <SidebarWithLogout />
      
      <div className="flex-1 w-full overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-radial from-black via-yellow-500/5 to-transparent opacity-60 -z-10"></div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-yellow-500/10 to-transparent -z-10"></div>
        
        <PageTransition>
          <main className="p-3 md:p-6 mt-16 md:mt-0 pb-20 md:pb-6 max-w-full overflow-x-hidden">
            {children}
          </main>
        </PageTransition>
      </div>
    </div>
  );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AdminAuthProvider>
  );
} 