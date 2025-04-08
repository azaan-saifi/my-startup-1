'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiBook, FiClock } from 'react-icons/fi';

export default function MyCoursesPage() {
  // Sample enrolled courses data
  const enrolledCourses = [
    {
      id: "course-1",
      title: "Introduction to Web Development",
      description: "Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.",
      progress: 65,
      lastAccessed: "2 days ago",
    },
    {
      id: "course-2",
      title: "Data Science Fundamentals",
      description: "Explore the world of data analysis, visualization, and machine learning.",
      progress: 30,
      lastAccessed: "Yesterday",
    },
  ];

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
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <p className="text-zinc-400 mt-1">Continue your learning journey</p>
        </div>
        
        {enrolledCourses.length > 0 ? (
          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <Link 
                href={`/student-dashboard/course/${course.id}`} 
                key={course.id}
                className="block relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Course icon */}
                  <div className="shrink-0 w-16 h-16 rounded-md bg-[#ffc20b31] flex-center text-[#f0bb1c] text-2xl">
                    <FiBook />
                  </div>
                  
                  {/* Course details */}
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-1">{course.title}</h3>
                    <p className="text-sm text-zinc-400 mb-2">{course.description}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Progress bar */}
                      <div className="flex items-center flex-1">
                        <div className="flex-1 bg-zinc-800 rounded-full h-2 mr-2">
                          <div 
                            className="bg-[#f0bb1c] h-2 rounded-full" 
                            style={{ width: `${course.progress}%` }} 
                          />
                        </div>
                        <span className="text-xs text-zinc-400 whitespace-nowrap">{course.progress}% Complete</span>
                      </div>
                      
                      {/* Last accessed */}
                      <div className="flex items-center text-xs text-zinc-500">
                        <FiClock className="mr-1" />
                        <span>Last accessed {course.lastAccessed}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Continue button */}
                  <div className="shrink-0 mt-3 sm:mt-0">
                    <div className="py-2 px-4 rounded-md bg-[#ffc20b31] text-[#f0bb1c] text-sm font-medium hover:bg-[#ffc20b50]">
                      Continue
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex-center text-zinc-400">
              <FiBook className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Enrolled Courses</h3>
            <p className="text-zinc-400 mb-6">You haven't enrolled in any courses yet.</p>
            <Link 
              href="/student-dashboard/courses"
              className="py-2 px-4 rounded-md bg-[#ffc20b31] text-[#f0bb1c] text-sm font-medium hover:bg-[#ffc20b50]"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 