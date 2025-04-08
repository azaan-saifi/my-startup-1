"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiClock, FiAward, FiBookOpen, FiChevronRight, FiCheck, FiLock, FiPlay, FiBookmark, FiShare2 } from "react-icons/fi";
import Link from "next/link";
import { useParams } from "next/navigation";
import CourseLearningPage from "@/components/student/CourseLearningPage";

// Define interfaces for type safety
interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  isLocked?: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  category: string;
  thumbnail: string;
  instructor: string;
  instructorBio: string;
  instructorAvatar: string;
  lastAccessed: string;
  totalTime: string;
  remainingTime: string;
  rating: number;
  reviewCount: number;
  description: string;
  longDescription: string;
  modules: Module[];
}

// Sample course data - in a real app, you'd fetch this from an API
const coursesData: Course[] = [
  {
    id: "1",
    title: "A Halal Roadmap To $10,000/Month for Muslim Developers (2025)",
    progress: 35,
    totalLessons: 24,
    completedLessons: 8,
    category: "Career Development",
    thumbnail: "/course1.jpg",
    instructor: "Ahmed Malik",
    instructorBio: "Full Stack Developer with 10+ years of experience. Specialized in teaching Islamic business practices for tech professionals.",
    instructorAvatar: "/instructor1.jpg",
    lastAccessed: "2 days ago",
    totalTime: "12 hours",
    remainingTime: "7.8 hours",
    rating: 4.9,
    reviewCount: 342,
    description: "Learn how to build a halal income stream as a developer through this comprehensive roadmap specifically designed for Muslim developers. This course focuses on ethical business practices and strategies that align with Islamic principles.",
    longDescription: "In this course, you'll learn how to leverage your development skills to build a halal income stream of $10,000 per month or more. We cover everything from freelancing best practices to building your own products and services, all while adhering to Islamic business principles. The course includes real-world case studies from successful Muslim developers who have built significant incomes through ethical means. You'll also receive templates for contracts, client communications, and more to help you get started immediately.",
    modules: [
      {
        id: "m1",
        title: "Module 1: Foundations of Halal Business",
        lessons: [
          { id: "l1", title: "Islamic Business Ethics Overview", duration: "15 min", completed: true, isLocked: false },
          { id: "l2", title: "Understanding Halal vs Haram Income Sources", duration: "25 min", completed: true, isLocked: false },
          { id: "l3", title: "Setting Your Financial Goals As A Muslim Developer", duration: "20 min", completed: true, isLocked: false }
        ]
      },
      {
        id: "m2",
        title: "Module 2: Freelancing and Consulting",
        lessons: [
          { id: "l4", title: "Finding Halal Projects", duration: "30 min", completed: true, isLocked: false },
          { id: "l5", title: "Pricing Your Services Correctly", duration: "45 min", completed: true, isLocked: false },
          { id: "l6", title: "Client Contracts from an Islamic Perspective", duration: "35 min", completed: false, isLocked: false },
          { id: "l7", title: "Case Study: $15k/month Freelancing Success Story", duration: "40 min", completed: false, isLocked: false }
        ]
      },
      {
        id: "m3",
        title: "Module 3: Building Your Brand",
        lessons: [
          { id: "l8", title: "Personal Branding as a Muslim Developer", duration: "25 min", completed: true, isLocked: false },
          { id: "l9", title: "Content Creation Strategies", duration: "30 min", completed: true, isLocked: false },
          { id: "l10", title: "Building an Audience While Maintaining Islamic Values", duration: "45 min", completed: false, isLocked: false }
        ]
      },
      {
        id: "m4",
        title: "Module 4: Product Development",
        lessons: [
          { id: "l11", title: "Identifying Halal Product Opportunities", duration: "35 min", completed: false, isLocked: true },
          { id: "l12", title: "MVP Development Strategy", duration: "55 min", completed: false, isLocked: true },
          { id: "l13", title: "Pricing Models and Islamic Finance", duration: "40 min", completed: false, isLocked: true }
        ]
      }
    ]
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
    instructorBio: "AI Researcher and Educator with a passion for making complex technologies accessible to beginners. Former Google AI engineer.",
    instructorAvatar: "/instructor2.jpg",
    lastAccessed: "Yesterday",
    totalTime: "8 hours",
    remainingTime: "2 hours",
    rating: 4.8,
    reviewCount: 267,
    description: "Follow the journey of 6 beginners with no prior coding experience as they learn to build impressive AI projects from scratch. This course breaks down complex AI concepts into simple, digestible lessons suitable for absolute beginners.",
    longDescription: "This course documents a real experiment where I took 6 complete beginners with zero coding experience and guided them to build functioning AI projects in just 8 weeks. You'll learn alongside them, seeing their struggles and breakthroughs, while I break down complex AI concepts into simple, practical steps anyone can follow. The course covers everything from basic Python programming to implementing machine learning models, computer vision applications, and natural language processing. By the end, you'll have built several real-world AI projects and gained the confidence to continue your AI journey independently.",
    modules: [
      {
        id: "m1",
        title: "Module 1: Python Fundamentals for AI",
        lessons: [
          { id: "l1", title: "Setting Up Your Development Environment", duration: "20 min", completed: true, isLocked: false },
          { id: "l2", title: "Python Basics for Beginners", duration: "45 min", completed: true, isLocked: false },
          { id: "l3", title: "Working with Data in Python", duration: "35 min", completed: true, isLocked: false },
          { id: "l4", title: "Introduction to Libraries: NumPy and Pandas", duration: "40 min", completed: true, isLocked: false }
        ]
      },
      {
        id: "m2",
        title: "Module 2: Machine Learning Fundamentals",
        lessons: [
          { id: "l5", title: "Understanding Machine Learning Concepts", duration: "30 min", completed: true, isLocked: false },
          { id: "l6", title: "Your First ML Model: Linear Regression", duration: "50 min", completed: true, isLocked: false },
          { id: "l7", title: "Classification Models for Beginners", duration: "45 min", completed: true, isLocked: false },
          { id: "l8", title: "Evaluating Model Performance", duration: "35 min", completed: true, isLocked: false }
        ]
      },
      {
        id: "m3",
        title: "Module 3: Computer Vision Projects",
        lessons: [
          { id: "l9", title: "Introduction to Computer Vision", duration: "25 min", completed: true, isLocked: false },
          { id: "l10", title: "Image Classification with Keras", duration: "55 min", completed: true, isLocked: false },
          { id: "l11", title: "Building an Object Detection App", duration: "60 min", completed: true, isLocked: false }
        ]
      },
      {
        id: "m4",
        title: "Module 4: Natural Language Processing",
        lessons: [
          { id: "l12", title: "Text Processing Fundamentals", duration: "40 min", completed: true, isLocked: false },
          { id: "l13", title: "Building a Sentiment Analysis Tool", duration: "50 min", completed: true, isLocked: false },
          { id: "l14", title: "Creating a Simple Chatbot", duration: "65 min", completed: true, isLocked: false }
        ]
      },
      {
        id: "m5",
        title: "Module 5: Deploying Your First AI Model",
        lessons: [
          { id: "l15", title: "Web Deployment Basics", duration: "30 min", completed: false, isLocked: false },
          { id: "l16", title: "Creating a Simple API for Your AI Model", duration: "45 min", completed: false, isLocked: false },
          { id: "l17", title: "Building a User Interface", duration: "40 min", completed: false, isLocked: false },
          { id: "l18", title: "Final Project: End-to-End AI Application", duration: "75 min", completed: false, isLocked: false }
        ]
      }
    ]
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
    instructorBio: "Senior Full Stack Developer and SaaS Architect with 12+ years of experience. Previously worked at Vercel and built multiple successful SaaS startups.",
    instructorAvatar: "/instructor3.jpg",
    lastAccessed: "3 days ago",
    totalTime: "18 hours",
    remainingTime: "9.9 hours",
    rating: 4.95,
    reviewCount: 516,
    description: "Learn how to build, deploy, and scale a complete SaaS platform using Next.js 13+ with all the modern features including server components, authentication, payments, and more.",
    longDescription: "This comprehensive course will take you from zero to hero in building production-ready SaaS applications with Next.js 13+ and the latest web technologies. You'll learn how to architect a scalable SaaS platform, implement authentication and authorization, set up recurring payments with Stripe, build a responsive dashboard, and deploy your application to production. By the end of this course, you'll have built your own fully-functional SaaS platform that you can use as a foundation for your next startup or client project. The course includes best practices for security, performance optimization, and developer workflows that I've learned from building and scaling multiple successful SaaS businesses.",
    modules: [
      {
        id: "m1",
        title: "Module 1: Next.js 13+ Foundations",
        lessons: [
          { id: "l1", title: "Introduction to Next.js 13 Features", duration: "30 min", completed: true, isLocked: false },
          { id: "l2", title: "Project Setup and Architecture", duration: "45 min", completed: true, isLocked: false },
          { id: "l3", title: "App Router and Server Components", duration: "55 min", completed: true, isLocked: false },
          { id: "l4", title: "Data Fetching Strategies", duration: "40 min", completed: true, isLocked: false },
          { id: "l5", title: "Authentication Setup", duration: "50 min", completed: true, isLocked: false }
        ]
      },
      {
        id: "m2",
        title: "Module 2: Database and API Design",
        lessons: [
          { id: "l6", title: "Setting Up Prisma with PostgreSQL", duration: "35 min", completed: true, isLocked: false },
          { id: "l7", title: "Designing the Database Schema", duration: "40 min", completed: true, isLocked: false },
          { id: "l8", title: "API Routes with Route Handlers", duration: "45 min", completed: true, isLocked: false },
          { id: "l9", title: "Implementing API Middleware", duration: "30 min", completed: true, isLocked: false },
          { id: "l10", title: "Error Handling and Validation", duration: "35 min", completed: false, isLocked: false }
        ]
      },
      {
        id: "m3",
        title: "Module 3: User Management and Authentication",
        lessons: [
          { id: "l11", title: "Authentication with NextAuth.js", duration: "50 min", completed: true, isLocked: false },
          { id: "l12", title: "User Profiles and Settings", duration: "45 min", completed: true, isLocked: false },
          { id: "l13", title: "Role-Based Authorization", duration: "35 min", completed: true, isLocked: false },
          { id: "l14", title: "Multi-Tenancy Implementation", duration: "60 min", completed: false, isLocked: false }
        ]
      },
      {
        id: "m4",
        title: "Module 4: Billing and Subscription",
        lessons: [
          { id: "l15", title: "Stripe Integration Basics", duration: "40 min", completed: false, isLocked: false },
          { id: "l16", title: "Implementing Subscription Plans", duration: "55 min", completed: false, isLocked: false },
          { id: "l17", title: "Handling Webhooks", duration: "35 min", completed: false, isLocked: false },
          { id: "l18", title: "Building the Billing Dashboard", duration: "50 min", completed: false, isLocked: false }
        ]
      },
      {
        id: "m5",
        title: "Module 5: Advanced Features",
        lessons: [
          { id: "l19", title: "Real-time Features with WebSockets", duration: "45 min", completed: false, isLocked: true },
          { id: "l20", title: "Email Notifications", duration: "30 min", completed: false, isLocked: true },
          { id: "l21", title: "Analytics and Reporting", duration: "55 min", completed: false, isLocked: true },
          { id: "l22", title: "Background Jobs", duration: "40 min", completed: false, isLocked: true }
        ]
      },
      {
        id: "m6",
        title: "Module 6: Deployment and DevOps",
        lessons: [
          { id: "l23", title: "CI/CD Pipeline Setup", duration: "45 min", completed: false, isLocked: true },
          { id: "l24", title: "Vercel Deployment Optimization", duration: "35 min", completed: false, isLocked: true },
          { id: "l25", title: "Environment Management", duration: "30 min", completed: false, isLocked: true },
          { id: "l26", title: "Monitoring and Error Tracking", duration: "40 min", completed: false, isLocked: true },
          { id: "l27", title: "Performance Optimization", duration: "50 min", completed: false, isLocked: true },
          { id: "l28", title: "Launch Checklist and Best Practices", duration: "35 min", completed: false, isLocked: true }
        ]
      }
    ]
  }
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

const CourseDetailPage = () => {
  const { id } = useParams();
  const [activeModule, setActiveModule] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [viewingLesson, setViewingLesson] = useState<string | null>(null);
  
  // Find course by ID
  const course = coursesData.find(c => c.id === id) || coursesData[0];
  
  // Count total completed lessons
  const totalCompletedLessons = course.modules.reduce(
    (total, module) => total + module.lessons.filter(lesson => lesson.completed).length, 
    0
  );
  
  // Calculate next lesson to watch
  const nextLessonToWatch = (() => {
    for (const module of course.modules) {
      const nextLesson = module.lessons.find(lesson => !lesson.completed && !lesson.isLocked);
      if (nextLesson) {
        return {
          moduleTitle: module.title,
          lessonTitle: nextLesson.title,
          lessonId: nextLesson.id
        };
      }
    }
    return null;
  })();

  // If we are viewing a lesson, show the lesson view
  if (viewingLesson) {
    // Create a simplified course object for the learning page
    const learningCourse = {
      id: course.id,
      title: course.title,
      progress: course.progress,
      instructor: course.instructor,
      instructorAvatar: course.instructorAvatar,
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        lessons: module.lessons.map(lesson => ({
          ...lesson,
          // Mock video URLs for demo
          videoUrl: lesson.id === 'l1' 
            ? 'https://youtu.be/3xC88WshA48?si=bXGozbc5OiYryqRi' 
            : lesson.id === 'l2'
            ? 'https://www.youtube.com/watch?v=4UZrsTqkcW4'
            : 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
          // Mock transcript for demo
          transcript: lesson.id === 'l1' 
            ? `00:01 - Introduction to the lesson\n00:15 - Key concepts we'll cover\n00:45 - Getting started with the framework\n02:30 - Building your first component\n05:10 - Working with props\n08:22 - Summary and next steps`
            : undefined,
          // Mock resources for demo
          resources: lesson.id === 'l1' 
            ? [
                { title: 'Lesson Slides', type: 'pdf', url: '#' },
                { title: 'Starter Code', type: 'code', url: '#' },
                { title: 'Additional Resources', type: 'link', url: '#' }
              ]
            : lesson.id === 'l2'
            ? [
                { title: 'Exercise Files', type: 'code', url: '#' }
              ]
            : undefined
        }))
      }))
    };

    return (
      <CourseLearningPage 
        course={learningCourse} 
        initialLessonId={viewingLesson} 
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link 
          href="/student/courses" 
          className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <span className="mr-1">←</span> Back to courses
        </Link>
      </div>

      {/* Course Header */}
      <div className="overflow-hidden relative rounded-lg border border-zinc-800">
        <div className="p-6 pb-0">
          <div className="inline-block rounded-full bg-black/50 px-3 py-0.5 text-xs font-medium text-white backdrop-blur-sm mb-3">
            {course.category}
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white">{course.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center text-sm">
              <span className="text-[#f0bb1c] font-medium">{course.rating}</span>
              <div className="flex ml-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-3 h-3 ${i < Math.floor(course.rating) ? 'text-[#f0bb1c]' : 'text-zinc-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-zinc-400 text-xs">({course.reviewCount} reviews)</span>
            </div>
            <div className="text-zinc-400 text-xs flex items-center">
              <FiBookOpen className="mr-1 h-3 w-3" />
              <span>{course.totalLessons} lessons</span>
            </div>
            <div className="text-zinc-400 text-xs flex items-center">
              <FiClock className="mr-1 h-3 w-3" />
              <span>{course.totalTime}</span>
            </div>
          </div>
        </div>
        
        {/* Progress banner */}
        <div className="bg-zinc-900 p-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-400">Course progress</span>
            <span className="text-sm text-zinc-400">{totalCompletedLessons}/{course.totalLessons} lessons completed</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="h-1.5 w-full rounded-full bg-zinc-800">
                <div 
                  className="h-1.5 rounded-full bg-[#f0bb1c]" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
            
            {nextLessonToWatch && (
              <button
                className="rounded-md bg-[#f0bb1c] px-4 py-1.5 text-sm font-medium text-black hover:bg-[#e0ab1c] transition-colors whitespace-nowrap"
                onClick={() => {
                  // Set the viewing lesson to navigate to the course learning page
                  setViewingLesson(nextLessonToWatch.lessonId);
                }}
              >
                Continue Learning
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Course content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Course content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About this course */}
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-900/50 px-6 py-4">
              <h2 className="text-xl font-medium text-white">About this course</h2>
            </div>
            <div className="p-6">
              <p className="text-zinc-300 text-sm">{course.longDescription}</p>
            </div>
          </div>
          
          {/* Course content */}
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-900/50 px-6 py-4">
              <h2 className="text-xl font-medium text-white">Course Content</h2>
            </div>
            
            {/* Module accordions */}
            <div className="p-4">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="mb-2 border border-zinc-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveModule(moduleIndex === activeModule ? -1 : moduleIndex)}
                    className="w-full flex justify-between items-center p-4 bg-zinc-900/50 text-left"
                  >
                    <div>
                      <h3 className="text-white font-medium">{module.title}</h3>
                      <p className="text-sm text-zinc-400">{module.lessons.length} lessons • {
                        module.lessons.filter(l => l.completed).length
                      } completed</p>
                    </div>
                    <FiChevronRight className={`h-5 w-5 text-zinc-400 transition-transform ${moduleIndex === activeModule ? 'transform rotate-90' : ''}`} />
                  </button>
                  
                  {moduleIndex === activeModule && (
                    <div className="p-2 divide-y divide-zinc-800/50">
                      {module.lessons.map((lesson) => (
                        <div
                          id={lesson.id}
                          key={lesson.id}
                          className={`p-3 flex justify-between items-center 
                            ${lesson.completed ? 'bg-zinc-900/20' : ''} 
                            ${lesson.isLocked ? 'opacity-60' : 'hover:bg-zinc-900/30 cursor-pointer'} 
                            transition-colors rounded-md`}
                          onClick={() => {
                            if (!lesson.isLocked) {
                              // Set the viewing lesson to navigate to the course learning page
                              setViewingLesson(lesson.id);
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <div className={`mr-3 h-8 w-8 rounded-full flex items-center justify-center
                              ${lesson.completed ? 'bg-[#f0bb1c]/20 text-[#f0bb1c]' : lesson.isLocked ? 'bg-zinc-800/50 text-zinc-500' : 'bg-zinc-800 text-zinc-300'}`}
                            >
                              {lesson.completed ? (
                                <FiCheck className="h-4 w-4" />
                              ) : lesson.isLocked ? (
                                <FiLock className="h-4 w-4" />
                              ) : (
                                <FiPlay className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <h4 className={`text-sm font-medium ${lesson.isLocked ? 'text-zinc-500' : 'text-white'}`}>
                                {lesson.title}
                              </h4>
                              <p className="text-xs text-zinc-500">{lesson.duration}</p>
                            </div>
                          </div>
                          
                          {!lesson.isLocked && !lesson.completed && (
                            <button
                              className="text-xs text-[#f0bb1c] hover:text-[#e0ab1c] transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingLesson(lesson.id);
                              }}
                            >
                              Start
                            </button>
                          )}
                          
                          {!lesson.isLocked && lesson.completed && (
                            <button
                              className="text-xs text-zinc-400 hover:text-white transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingLesson(lesson.id);
                              }}
                            >
                              Replay
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right side - Instructor info */}
        <div className="space-y-6">
          {/* Instructor */}
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-900/50 px-6 py-4">
              <h2 className="text-xl font-medium text-white">Instructor</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-zinc-800">
                  <img 
                    src={course.instructorAvatar} 
                    alt={course.instructor}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <div>
                  <h3 className="text-white font-medium">{course.instructor}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{course.instructorBio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage; 