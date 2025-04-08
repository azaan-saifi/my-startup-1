'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiBook } from 'react-icons/fi';

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 pl-16 md:pl-64 py-10 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/student-dashboard" 
            className="flex items-center text-zinc-400 hover:text-white mb-4 text-sm"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">All Courses</h1>
          <p className="text-zinc-400 mt-1">Browse our complete course catalog</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Link 
              href={`/student-dashboard/course/course-${index + 1}`} 
              key={index}
              className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl text-[#f0bb1c]">
                  <FiBook />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-1">
                  Course Title {index + 1}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2">
                  This is a placeholder description for course {index + 1}. In a real application, this would contain actual course information.
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 