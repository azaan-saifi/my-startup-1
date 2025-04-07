import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

// Sample data - this would come from API in a real application
const initialCourses = [
  {
    id: "1",
    title: "Advanced Web Development",
    category: "Web Development",
    price: 149.99,
    students: 785,
    isActive: true,
  },
  {
    id: "2",
    title: "Mobile App Development with React Native",
    category: "Mobile Development",
    price: 129.99,
    students: 543,
    isActive: true,
  },
  {
    id: "3",
    title: "Data Science Fundamentals",
    category: "Data Science",
    price: 199.99,
    students: 421,
    isActive: true,
  },
  {
    id: "4",
    title: "Cybersecurity Essentials",
    category: "Cybersecurity",
    price: 189.99,
    students: 312,
    isActive: true,
  },
  {
    id: "5",
    title: "UI/UX Design Masterclass",
    category: "UI/UX Design",
    price: 99.99,
    students: 156,
    isActive: false,
  },
];

interface Course {
  id: string;
  title: string;
  category: string;
  price: number;
  students: number;
  isActive: boolean;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusToggle = (id: string) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, isActive: !course.isActive } : course
      )
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter((course) => course.id !== id));
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-medium text-white">Course Management</h3>
          <p className="mt-1 text-sm text-zinc-400">Manage your course catalog</p>
        </div>
        
        <button className="flex items-center gap-2 rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]">
          <FiPlus />
          <span>Add Course</span>
        </button>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search courses..."
          className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-left">
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">Course</th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">Category</th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">Price</th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">Students</th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">Status</th>
              <th className="pb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredCourses.map((course) => (
              <tr key={course.id} className="group hover:bg-zinc-900/20">
                <td className="py-4 text-sm font-medium text-white">{course.title}</td>
                <td className="py-4 text-sm text-zinc-400">{course.category}</td>
                <td className="py-4 text-sm text-zinc-400">${course.price.toFixed(2)}</td>
                <td className="py-4 text-sm text-zinc-400">{course.students}</td>
                <td className="py-4 text-sm">
                  <button
                    onClick={() => handleStatusToggle(course.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      course.isActive
                        ? "bg-emerald-900/30 text-emerald-500"
                        : "bg-rose-900/30 text-rose-500"
                    }`}
                  >
                    {course.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="py-4 text-sm">
                  <div className="flex gap-2">
                    <button className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white">
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-rose-500"
                      onClick={() => handleDelete(course.id)}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseManagement; 