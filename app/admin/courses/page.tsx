"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiBookOpen, FiPlus } from "react-icons/fi";

import CourseManagement from "@/components/admin/CourseManagement";
import CoursesDistribution from "@/components/admin/CoursesDistribution";
import StatCard from "@/components/admin/StatCard";
import { getAllCourses } from "@/lib/actions/course.action";

// Define the Course interface
interface Course {
  _id: string;
  title: string;
  thumbnail: string;
  lessons: string;
  playlistId?: string;
}

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getAllCourses();
        const parsedCourses = JSON.parse(coursesData);
        setCourses(parsedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCreateCourse = () => {
    router.push("/admin/courses/create");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Course Management</h1>
          <p className="mt-1 text-zinc-400">Manage your course catalog</p>
        </div>
        
        <button 
          onClick={handleCreateCourse}
          className="flex items-center gap-2 rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
        >
          <FiPlus />
          <span>Create New Course</span>
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <StatCard
            title="Total Courses"
            value={loading ? "..." : String(courses.length)}
            change=""
            isPositive={true}
            icon={<FiBookOpen size={20} />}
          />
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="col-span-2"
        >
          <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm h-full">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="flex h-full flex-col justify-center">
              <h3 className="text-xl font-medium text-white">Course Creation Tips</h3>
              <ul className="mt-4 space-y-2 text-zinc-400">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#f0bb1c]"></div>
                  <span>Start with a clear outline and learning objectives</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#f0bb1c]"></div>
                  <span>Include videos that teach skills in a logical progression</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#f0bb1c]"></div>
                  <span>Add practice quizzes to test students' knowledge</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CourseManagement courses={courses} loading={loading} setCourses={setCourses} />
        </div>
        <div>
          <CoursesDistribution courses={courses} loading={loading} />
        </div>
      </div>
      
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium text-white">Course Analytics</h3>
          <p className="mt-1 text-sm text-zinc-400">Top performing courses by enrollment</p>
        </div>
        
        <div className="space-y-4">
          {[
            { title: "Advanced Web Development", enrollment: 75, color: "#f0bb1c" },
            { title: "Data Science Fundamentals", enrollment: 65, color: "#3a86ff" },
            { title: "Mobile App Development", enrollment: 58, color: "#ff006e" },
            { title: "UI/UX Design Masterclass", enrollment: 42, color: "#8338ec" },
            { title: "Cybersecurity Essentials", enrollment: 36, color: "#38b000" },
          ].map((course, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">{course.title}</span>
                <span className="text-sm text-zinc-400">{course.enrollment}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${course.enrollment}%`,
                    backgroundColor: course.color 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 