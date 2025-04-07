"use client";

import React from "react";
import SettingsForm from "@/components/admin/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-zinc-400">Configure your admin panel preferences</p>
        </div>
      </div>
      
      <SettingsForm />
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <h3 className="mb-4 text-xl font-medium text-white">System Information</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Version</span>
              <span className="text-sm font-medium text-white">1.0.5</span>
            </div>
            
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Last Updated</span>
              <span className="text-sm font-medium text-white">May 15, 2023</span>
            </div>
            
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Environment</span>
              <span className="text-sm font-medium text-white">Production</span>
            </div>
            
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Database</span>
              <span className="text-sm font-medium text-white">MongoDB 6.0</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-zinc-400">Node.js Version</span>
              <span className="text-sm font-medium text-white">18.17.1 LTS</span>
            </div>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <h3 className="mb-4 text-xl font-medium text-white">License Information</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">License Type</span>
              <span className="text-sm font-medium text-white">Enterprise</span>
            </div>
            
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Valid Until</span>
              <span className="text-sm font-medium text-white">December 31, 2023</span>
            </div>
            
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Registered To</span>
              <span className="text-sm font-medium text-white">Code Benders Academy</span>
            </div>
            
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-sm text-zinc-400">Licensed Users</span>
              <span className="text-sm font-medium text-white">Unlimited</span>
            </div>
            
            <div className="mt-4">
              <button className="rounded-md bg-[#4cc9f0]/20 px-3 py-1 text-sm font-medium text-[#4cc9f0]">
                Renew License
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 