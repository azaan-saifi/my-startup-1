'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { 
  FiArrowLeft, 
  FiBook, 
  FiCalendar, 
  FiClock, 
  FiDownload, 
  FiFileText, 
  FiPlay, 
  FiUser 
} from 'react-icons/fi';

export default function CourseDetailsPage({ params }: { params: Promise<{ courseId: string }> }) {
  // Use React.use to unwrap the promise
  const { courseId } = use(params);
  
  // Determine if this is one of our known courses (for demo purposes)
  const isWebDev = courseId === 'course-1';
  const isDataScience = courseId === 'course-2';
  
  // Course details based on the courseId
  const courseDetails = {
    title: isWebDev 
      ? "Introduction to Web Development" 
      : isDataScience 
        ? "Data Science Fundamentals" 
        : `Course ${courseId.replace('course-', '')}`,
    description: isWebDev
      ? "Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites."
      : isDataScience
        ? "Explore the world of data analysis, visualization, and machine learning."
        : "This course provides comprehensive training on essential concepts and practical applications.",
    instructor: isWebDev ? "Sarah Johnson" : isDataScience ? "Michael Chen" : "John Doe",
    duration: isWebDev ? "8 weeks" : isDataScience ? "10 weeks" : "6 weeks",
    progress: isWebDev ? 65 : isDataScience ? 30 : 0,
    enrolled: isWebDev || isDataScience,
  };
  
  // Sample course modules
  const courseModules = [
    {
      title: "Getting Started",
      lessons: [
        { title: "Course Introduction", duration: "10:25", completed: true },
        { title: "Setting Up Your Environment", duration: "15:40", completed: true },
        { title: "Core Concepts Overview", duration: "20:15", completed: isWebDev }
      ]
    },
    {
      title: isWebDev ? "HTML Fundamentals" : isDataScience ? "Data Collection and Cleaning" : "Module 2",
      lessons: [
        { title: "Introduction to HTML", duration: "18:30", completed: isWebDev },
        { title: "HTML Structure and Elements", duration: "22:15", completed: false },
        { title: "Forms and Inputs", duration: "25:10", completed: false }
      ]
    },
    {
      title: isWebDev ? "CSS Styling" : isDataScience ? "Data Visualization" : "Module 3",
      lessons: [
        { title: "CSS Basics", duration: "20:45", completed: false },
        { title: "Layout and Positioning", duration: "28:20", completed: false },
        { title: "Responsive Design", duration: "24:55", completed: false }
      ]
    },
    {
      title: isWebDev ? "JavaScript Essentials" : isDataScience ? "Machine Learning Basics" : "Module 4",
      lessons: [
        { title: "JavaScript Syntax", duration: "22:10", completed: false },
        { title: "DOM Manipulation", duration: "26:30", completed: false },
        { title: "Event Handling", duration: "19:45", completed: false }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 pl-16 md:pl-64 py-10 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/student-dashboard/my-courses" 
          className="flex items-center text-zinc-400 hover:text-white mb-6 text-sm"
        >
          <FiArrowLeft className="mr-2" /> Back to My Courses
        </Link>
        
        {/* Course Header */}
        <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm mb-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Course icon */}
            <div className="shrink-0 w-20 h-20 rounded-md bg-[#ffc20b31] flex items-center justify-center text-[#f0bb1c] text-4xl">
              <FiBook />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{courseDetails.title}</h1>
              <p className="text-zinc-400 mb-4">{courseDetails.description}</p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center text-sm text-zinc-500">
                  <FiUser className="mr-2" />
                  <span>Instructor: <span className="text-zinc-300">{courseDetails.instructor}</span></span>
                </div>
                <div className="flex items-center text-sm text-zinc-500">
                  <FiCalendar className="mr-2" />
                  <span>Duration: <span className="text-zinc-300">{courseDetails.duration}</span></span>
                </div>
                {courseDetails.enrolled && (
                  <div className="flex items-center text-sm text-zinc-500">
                    <FiClock className="mr-2" />
                    <span>Progress: <span className="text-zinc-300">{courseDetails.progress}%</span></span>
                  </div>
                )}
              </div>
            </div>
            
            {courseDetails.enrolled ? (
              <div className="shrink-0">
                <div className="py-3 px-6 rounded-md bg-[#ffc20b31] text-[#f0bb1c] font-medium hover:bg-[#ffc20b50] cursor-pointer">
                  Continue Learning
                </div>
              </div>
            ) : (
              <div className="shrink-0">
                <div className="py-3 px-6 rounded-md bg-[#ffc20b31] text-[#f0bb1c] font-medium hover:bg-[#ffc20b50] cursor-pointer">
                  Enroll Now
                </div>
              </div>
            )}
          </div>
          
          {courseDetails.enrolled && (
            <div className="mt-6">
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div 
                  className="bg-[#f0bb1c] h-2 rounded-full" 
                  style={{ width: `${courseDetails.progress}%` }} 
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Course Modules */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Course Content</h2>
            
            <div className="space-y-4">
              {courseModules.map((module, moduleIndex) => (
                <div 
                  key={moduleIndex}
                  className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 backdrop-blur-sm"
                >
                  <div className="p-4 border-b border-zinc-800">
                    <h3 className="text-lg font-medium text-white">{module.title}</h3>
                  </div>
                  
                  <div>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div 
                        key={lessonIndex}
                        className={`flex items-center p-4 border-b last:border-b-0 border-zinc-800 hover:bg-zinc-800/50 ${lesson.completed ? 'bg-zinc-900/50' : ''}`}
                      >
                        <div className="mr-3">
                          {lesson.completed ? (
                            <div className="w-8 h-8 rounded-full bg-[#ffc20b31] flex items-center justify-center text-[#f0bb1c]">
                              <FiPlay className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                              <FiPlay className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`text-base ${lesson.completed ? 'text-[#f0bb1c]' : 'text-white'}`}>
                            {lesson.title}
                          </h4>
                        </div>
                        
                        <div className="text-sm text-zinc-500">
                          {lesson.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right: Resources and Information */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Resources</h2>
            
            <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 backdrop-blur-sm p-4 mb-6">
              <h3 className="text-lg font-medium text-white mb-4">Course Materials</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md bg-zinc-800/50 text-white hover:bg-zinc-800">
                  <div className="flex items-center">
                    <FiFileText className="mr-3 text-zinc-400" />
                    <span>Course Syllabus</span>
                  </div>
                  <FiDownload className="text-zinc-400" />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-md bg-zinc-800/50 text-white hover:bg-zinc-800">
                  <div className="flex items-center">
                    <FiFileText className="mr-3 text-zinc-400" />
                    <span>Lecture Notes</span>
                  </div>
                  <FiDownload className="text-zinc-400" />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-md bg-zinc-800/50 text-white hover:bg-zinc-800">
                  <div className="flex items-center">
                    <FiFileText className="mr-3 text-zinc-400" />
                    <span>Practice Exercises</span>
                  </div>
                  <FiDownload className="text-zinc-400" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 backdrop-blur-sm p-4">
              <h3 className="text-lg font-medium text-white mb-4">Need Help?</h3>
              <p className="text-zinc-400 mb-4">
                Have questions about this course? Reach out to your instructor.
              </p>
              <button className="w-full py-2 px-4 rounded-md bg-[#ffc20b31] text-[#f0bb1c] text-sm font-medium hover:bg-[#ffc20b50]">
                Contact Instructor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 