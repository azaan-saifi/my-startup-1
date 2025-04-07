"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiUsers, FiUserPlus, FiUserCheck } from "react-icons/fi";

import StatCard from "@/components/admin/StatCard";
import StudentsList from "@/components/admin/StudentsList";
import StudentRetentionChart from "@/components/admin/StudentRetentionChart";
import StudentDemographics from "@/components/admin/StudentDemographics";

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

export default function StudentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Student Management</h1>
          <p className="mt-1 text-zinc-400">Monitor and manage your student base</p>
        </div>
        
        <button className="flex items-center gap-2 rounded-md bg-[#4cc9f0] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4cc9f0]/90">
          <FiUserPlus size={16} />
          <span>Add New Student</span>
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <StatCard
            title="Total Students"
            value="2,845"
            change="12%"
            isPositive={true}
            icon={<FiUsers size={20} />}
          />
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <StatCard
            title="Active Students"
            value="1,586"
            change="8%"
            isPositive={true}
            icon={<FiUserCheck size={20} />}
          />
        </motion.div>
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <StatCard
            title="Average Completion"
            value="73%"
            change="5%"
            isPositive={true}
            icon={<FiUserCheck size={20} />}
          />
        </motion.div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <StudentRetentionChart />
        <StudentDemographics />
      </div>
      
      <div>
        <StudentsList />
      </div>
      
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium text-white">Student Engagement Insights</h3>
          <p className="mt-1 text-sm text-zinc-400">Key metrics about how students interact with your courses</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h4 className="mb-2 text-lg font-medium text-[#4cc9f0]">85%</h4>
            <p className="text-sm text-white">Complete exercises</p>
            <p className="text-xs text-zinc-400">Percentage of students who complete practice exercises</p>
          </div>
          
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h4 className="mb-2 text-lg font-medium text-[#4cc9f0]">62%</h4>
            <p className="text-sm text-white">Active forum users</p>
            <p className="text-xs text-zinc-400">Students who participate in community discussions</p>
          </div>
          
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h4 className="mb-2 text-lg font-medium text-[#4cc9f0]">4.2</h4>
            <p className="text-sm text-white">Average feedback rating</p>
            <p className="text-xs text-zinc-400">On a scale of 1-5 from course feedback</p>
          </div>
          
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h4 className="mb-2 text-lg font-medium text-[#4cc9f0]">78%</h4>
            <p className="text-sm text-white">Monthly retention</p>
            <p className="text-xs text-zinc-400">Students who continue learning month-to-month</p>
          </div>
        </div>
      </div>
    </div>
  );
} 