"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiClock, FiAward, FiBookOpen } from "react-icons/fi";
import Link from "next/link";

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
  },
  {
    id: "2",
    title: "I Taught 6 Beginners To Build an AI Project (with no experience)",
    progress: 75,
    totalLessons: 18,
    completedLessons: 14,
    category: "AI Development",
    thumbnail: "/course2.jpg",
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

// Motivational quotes
const motivationalQuotes = [
  "The only way to learn is by doing. Start where you are, use what you have.",
  "Consistency is the key. Small daily improvements lead to stunning results.",
  "Every expert was once a beginner. Keep learning, keep growing.",
  "Your future is created by what you do today, not tomorrow.",
  "The best way to predict your future is to create it."
];

// Randomly select a motivational quote
const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[randomIndex];
};

const StudentDashboard = () => {
  const quote = getRandomQuote();
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <motion.h1 
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome, Student 👋
          </motion.h1>
          <motion.p 
            className="mt-1 text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {quote}
          </motion.p>
        </div>
      </div>
      
      {/* Enrolled courses section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">Enrolled Courses</h2>
          <Link href="/student/courses" className="text-sm text-[#f0bb1c] hover:underline">
            View all
          </Link>
        </div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2"
        >
          {enrolledCourses.map((course) => (
            <motion.div 
              key={course.id}
              variants={fadeIn}
              className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              <div className="flex gap-4">
                <div className="relative h-24 w-36 flex-shrink-0 overflow-hidden rounded-md">
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
                    style={{ 
                      backgroundImage: `url(${course.thumbnail})`,
                      backgroundColor: '#18181b' // Fallback color
                    }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col min-w-0">
                  <h3 className="text-md font-medium text-white line-clamp-2">{course.title}</h3>
                  <div className="mt-1 text-xs text-zinc-400">{course.category}</div>
                  
                  <div className="mt-auto pt-2">
                    <div className="h-1.5 w-full rounded-full bg-zinc-800">
                      <div 
                        className="h-1.5 rounded-full bg-[#f0bb1c]" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-2 flex justify-between text-xs">
                      <div className="flex items-center text-zinc-400">
                        <FiClock className="mr-1 h-3 w-3" />
                        <span>{course.progress}% complete</span>
                      </div>
                      <div className="flex items-center text-zinc-400">
                        <FiBookOpen className="mr-1 h-3 w-3" />
                        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      
      {/* All courses section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">All Courses</h2>
          <span className="rounded-full bg-[#ffc20b31] px-2 py-0.5 text-xs font-medium text-[#f0bb1c]">
            2 Courses
          </span>
        </div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 place-items-center"
        >
          {/* Course 1 */}
          <motion.div
            variants={fadeIn}
            className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-3 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg w-full max-w-[380px] h-[380px]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="relative h-[200px] w-full overflow-hidden rounded-md bg-zinc-800">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
                style={{
                  backgroundImage: "url('/course1.jpg')",
                  backgroundColor: '#18181b',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                Career Development
              </div>
            </div>

            <div className="p-2 flex flex-col h-[140px] justify-between">
              <div>
                <h3 className="text-sm font-medium text-white line-clamp-2">A Halal Roadmap To $10,000/Month for Muslim Developers (2025)</h3>

                <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-400">
                  <div className="flex items-center">
                    <FiBookOpen className="mr-1 h-3 w-3" />
                    <span>24 lessons</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <FiAward className="mr-1 h-3 w-3" />
                    <span>Certificate</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/student/courses/1`}
                className="flex w-full items-center justify-center rounded-md bg-[#ffc20b31] px-3 py-1.5 text-xs font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
              >
                View Course
              </Link>
            </div>
          </motion.div>
          
          {/* Course 2 */}
          <motion.div
            variants={fadeIn}
            className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-3 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg w-full max-w-[380px] h-[380px]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="relative h-[200px] w-full overflow-hidden rounded-md bg-zinc-800">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
                style={{
                  backgroundImage: "url('/course2.jpg')",
                  backgroundColor: '#18181b',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                AI Development
              </div>
            </div>

            <div className="p-2 flex flex-col h-[140px] justify-between">
              <div>
                <h3 className="text-sm font-medium text-white line-clamp-2">I Taught 6 Beginners To Build an AI Project (with no experience)</h3>

                <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-400">
                  <div className="flex items-center">
                    <FiBookOpen className="mr-1 h-3 w-3" />
                    <span>18 lessons</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <FiAward className="mr-1 h-3 w-3" />
                    <span>Certificate</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/student/courses/2`}
                className="flex w-full items-center justify-center rounded-md bg-[#ffc20b31] px-3 py-1.5 text-xs font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
              >
                View Course
              </Link>
            </div>
          </motion.div>

          {/* Course 3 */}
          <motion.div
            variants={fadeIn}
            className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-3 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:shadow-lg w-full max-w-[380px] h-[380px]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="relative h-[200px] w-full overflow-hidden rounded-md bg-zinc-800">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
                style={{
                  backgroundImage: "url('/course3.jpg')",
                  backgroundColor: '#18181b',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                Web Development
              </div>
            </div>

            <div className="p-2 flex flex-col h-[140px] justify-between">
              <div>
                <h3 className="text-sm font-medium text-white line-clamp-2">Build a Full Stack SaaS Platform with Next.js 13+</h3>

                <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-400">
                  <div className="flex items-center">
                    <FiBookOpen className="mr-1 h-3 w-3" />
                    <span>32 lessons</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center">
                    <FiAward className="mr-1 h-3 w-3" />
                    <span>Certificate</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/student/courses/3`}
                className="flex w-full items-center justify-center rounded-md bg-[#ffc20b31] px-3 py-1.5 text-xs font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
              >
                View Course
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default StudentDashboard; 