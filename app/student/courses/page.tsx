"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiClock, FiBookOpen, FiCalendar } from "react-icons/fi";
import Link from "next/link";
import { Select } from "@/components/ui/select";

// Sample course data - in a real app, you'd fetch this from an API
const enrolledCourses = [
  {
    id: "1",
    title: "A Halal Roadmap To $10,000/Month for Muslim Developers (2025)",
    progress: 35,
    totalLessons: 24,
    completedLessons: 8,
    category: "Career Development",
    thumbnail: "/course1.jpg",
    instructor: "Ahmed Malik",
    lastAccessed: "2 days ago",
    nextLesson: "Module 3: Building Your Brand",
    totalTime: "12 hours",
    remainingTime: "7.8 hours",
    description: "Learn how to build a halal income stream as a developer through this comprehensive roadmap specifically designed for Muslim developers. This course focuses on ethical business practices and strategies that align with Islamic principles."
  },
  {
    id: "2",
    title: "I Taught 6 Beginners To Build an AI Project (with no experience)",
    progress: 75,
    totalLessons: 18,
    completedLessons: 14,
    category: "AI Development",
    thumbnail: "/course2.jpg",
    instructor: "Sara Ahmed",
    lastAccessed: "Yesterday",
    nextLesson: "Module 5: Deploying Your First AI Model",
    totalTime: "8 hours",
    remainingTime: "2 hours",
    description: "Follow the journey of 6 beginners with no prior coding experience as they learn to build impressive AI projects from scratch. This course breaks down complex AI concepts into simple, digestible lessons suitable for absolute beginners."
  },
  {
    id: "3",
    title: "Build a Full Stack SaaS Platform with Next.js 13+",
    progress: 45,
    totalLessons: 28,
    completedLessons: 12,
    category: "Web Development",
    thumbnail: "/course3.jpg",
    instructor: "Michael Johnson",
    lastAccessed: "3 days ago",
    nextLesson: "Module 4: Billing and Subscription",
    totalTime: "18 hours",
    remainingTime: "9.9 hours",
    description: "Learn how to build, deploy, and scale a complete SaaS platform using Next.js 13+ with all the modern features including server components, authentication, payments, and more."
  },
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const CoursesPage = () => {
  const [sortBy, setSortBy] = useState("last-accessed");
  
  const sortedCourses = [...enrolledCourses].sort((a, b) => {
    if (sortBy === "progress") {
      return b.progress - a.progress;
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    // Default: last-accessed
    return 0; // In a real app, you'd sort by date
  });

  const sortOptions = [
    { value: "last-accessed", label: "Last Accessed" },
    { value: "progress", label: "Progress" },
    { value: "title", label: "Title" }
  ];

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link 
          href="/student" 
          className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <span className="mr-1">←</span> Back to dashboard
        </Link>
      </div>
      
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <motion.h1 
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Courses
          </motion.h1>
          <motion.p 
            className="mt-1 text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Track your learning progress and continue where you left off
          </motion.p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">Sort by:</span>
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
            className="w-40"
          />
        </div>
      </div>
      
      {/* Course List */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {sortedCourses.map((course) => (
          <motion.div 
            key={course.id}
            variants={fadeIn}
            className="relative mb-6 overflow-hidden rounded-lg border border-zinc-800 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <div className="flex">
              <div className="w-1/3 relative flex-shrink-0 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
                  style={{ 
                    backgroundImage: `url(${course.thumbnail})`,
                    backgroundColor: '#18181b' 
                  }}
                ></div>
                <div className="absolute bottom-3 left-4 rounded-full bg-black/50 px-3 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                  {course.category}
                </div>
              </div>
              
              <div className="flex-1 p-6">
                <div>
                  <h2 className="text-xl font-medium text-white">{course.title}</h2>
                  <p className="mt-1 text-sm text-zinc-400">Instructor: {course.instructor}</p>
                </div>

                <p className="mt-3 text-sm text-zinc-300 line-clamp-2">{course.description}</p>
                
                <div className="mt-4 flex items-center gap-5">
                  <div className="flex items-center text-sm text-zinc-400">
                    <FiClock className="mr-1 h-4 w-4" />
                    <div>
                      <p>Next Lesson:</p>
                      <p className="text-white">{course.nextLesson}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">{course.progress}% complete</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800">
                    <div 
                      className="h-1.5 rounded-full bg-[#f0bb1c]" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-xs text-zinc-400">
                      <FiBookOpen className="mr-1 h-3 w-3" />
                      <span>Total: {course.totalTime}</span>
                    </div>
                    <Link
                      href={`/student/courses/${course.id}`}
                      className="rounded-md bg-[#ffc20b31] px-3 py-1.5 text-xs font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CoursesPage; 