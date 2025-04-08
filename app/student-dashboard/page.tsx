'use client';

import React, { useState, useEffect } from 'react';
import { FiBook, FiBookOpen, FiChevronRight, FiHome, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

// Define the course interface
interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  progress: number;
}

export default function StudentDashboard() {
  const [userName, setUserName] = useState("Student");
  
  // Sample courses data
  const enrolledCourses: Course[] = [
    {
      id: "course-1",
      title: "Introduction to Web Development",
      description: "Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.",
      imageUrl: "/images/courses/web-dev.jpg",
      progress: 65,
    },
    {
      id: "course-2",
      title: "Data Science Fundamentals",
      description: "Explore the world of data analysis, visualization, and machine learning.",
      imageUrl: "/images/courses/data-science.jpg",
      progress: 30,
    },
  ];

  // All available courses
  const allCourses: Course[] = [
    ...enrolledCourses,
    {
      id: "course-3",
      title: "Mobile App Development",
      description: "Create cross-platform mobile applications using React Native.",
      imageUrl: "/images/courses/mobile-dev.jpg",
      progress: 0,
    },
    {
      id: "course-4",
      title: "Cloud Computing Essentials",
      description: "Master cloud services, deployment models, and infrastructure management.",
      imageUrl: "/images/courses/cloud-computing.jpg",
      progress: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900">
      {/* Left Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-16 md:w-64 bg-black/60 border-r border-zinc-800 backdrop-blur-sm z-10">
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center space-x-2 mb-8 md:mb-12">
            <div className="w-10 h-10 rounded-full bg-[#ffc20b31] flex items-center justify-center">
              <FiUser className="text-[#f0bb1c]" />
            </div>
            <span className="text-white font-medium hidden md:block">Student Portal</span>
          </div>
          
          <nav className="flex-1 space-y-1">
            <Link 
              href="/student-dashboard"
              className="flex items-center py-2 px-3 rounded-md bg-zinc-800/50 text-white"
            >
              <FiHome className="w-5 h-5 md:mr-3" />
              <span className="hidden md:block">Dashboard</span>
            </Link>
            <Link 
              href="/student-dashboard/courses"
              className="flex items-center py-2 px-3 rounded-md text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            >
              <FiBook className="w-5 h-5 md:mr-3" />
              <span className="hidden md:block">All Courses</span>
            </Link>
            <Link 
              href="/student-dashboard/my-courses"
              className="flex items-center py-2 px-3 rounded-md text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            >
              <FiBookOpen className="w-5 h-5 md:mr-3" />
              <span className="hidden md:block">My Courses</span>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="pl-16 md:pl-64">
        {/* Header */}
        <header className="py-6 px-4 md:px-8 lg:px-12 border-b border-zinc-800 bg-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Welcome, {userName} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-zinc-400 mt-1">
              "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence."
            </p>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="py-8 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Enrolled Courses Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Enrolled Courses</h2>
                <Link 
                  href="/student-dashboard/my-courses" 
                  className="text-sm text-zinc-400 hover:text-[#f0bb1c] flex items-center"
                >
                  View All <FiChevronRight className="ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledCourses.map((course) => (
                  <Link 
                    href={`/student-dashboard/course/${course.id}`} 
                    key={course.id}
                    className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
                  >
                    <div className="flex space-x-4">
                      {/* Course Image */}
                      <div className="relative w-24 h-24 overflow-hidden rounded-md flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl text-[#f0bb1c]">
                          <FiBook />
                        </div>
                      </div>
                      
                      {/* Course Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-1">{course.title}</h3>
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-2">{course.description}</p>
                        <div className="flex items-center">
                          <div className="flex-1 bg-zinc-800 rounded-full h-2 mr-2">
                            <div 
                              className="bg-[#f0bb1c] h-2 rounded-full" 
                              style={{ width: `${course.progress}%` }} 
                            />
                          </div>
                          <span className="text-xs text-zinc-400">{course.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            
            {/* All Courses Section */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">All Courses</h2>
                <Link 
                  href="/student-dashboard/courses" 
                  className="text-sm text-zinc-400 hover:text-[#f0bb1c] flex items-center"
                >
                  View All <FiChevronRight className="ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {allCourses.map((course) => (
                  <Link 
                    href={`/student-dashboard/course/${course.id}`} 
                    key={course.id}
                    className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
                      <div className="absolute inset-0 flex items-center justify-center text-4xl text-[#f0bb1c]">
                        <FiBook />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-medium text-white mb-1 line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-2">{course.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 