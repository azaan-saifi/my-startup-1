'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StudentAuthPage() {
  const router = useRouter();
  const [accessKey, setAccessKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('accessKey', accessKey);

      const response = await fetch('/api/student-auth', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Authentication successful!');
        router.push('/student-dashboard');
      } else {
        toast.error(data.message || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Student Access</h1>
          <p className="mt-2 text-zinc-400">Enter your student key to continue</p>
        </div>
        
        <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="accessKey" className="block text-sm font-medium text-zinc-300">
                Access Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiKey className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  id="accessKey"
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  required
                  className="block w-full rounded-md border border-zinc-800 bg-zinc-900/50 py-2 pl-10 pr-3 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none focus:ring-1 focus:ring-[#f0bb1c]"
                  placeholder="Enter your student key"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#ffc20b31] px-4 py-2.5 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Verifying...' : 'Access Student Portal'}</span>
              {!isLoading && <FiArrowRight className="h-4 w-4" />}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-zinc-500">
            <p>The key is "wearethebest"</p>
            <p className="mt-1">This is for demonstration purposes only.</p>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-white">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
} 