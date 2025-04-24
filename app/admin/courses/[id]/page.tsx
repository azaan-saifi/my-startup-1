"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";

interface Course {
  _id: string;
  title: string;
  thumbnail: string;
  lessons: string;
  playlistId?: string;
}

const EditCoursePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }
        const courseData = await response.json();
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching course:", error);
        alert("Error loading course data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!course) return;
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    
    setSaving(true);
    try {
      const response = await fetch("/api/courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          playlistId: course.playlistId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update course");
      }

      alert("Course updated successfully");
      router.push("/admin/courses");
    } catch (error) {
      console.error("Error updating course:", error);
      alert(`Failed to update course: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-zinc-400">Loading course data...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-red-500">Course not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <FiArrowLeft className="mr-1" /> Back to courses
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Edit Course</h1>
        <p className="mt-1 text-zinc-400">Update course details</p>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white">
                Course Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={course.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                placeholder="e.g., Advanced Web Development"
                required
              />
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-white">
                Thumbnail URL
              </label>
              <input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={course.thumbnail}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                placeholder="https://example.com/image.jpg"
                required
              />
              {course.thumbnail && (
                <div className="mt-2">
                  <p className="text-xs text-zinc-400">Preview:</p>
                  <div className="mt-1 h-20 w-32 overflow-hidden rounded border border-zinc-800">
                    <img
                      src={course.thumbnail}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/640x360?text=Invalid+Image+URL";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="playlistId" className="block text-sm font-medium text-white">
                YouTube Playlist ID (Optional)
              </label>
              <input
                type="text"
                id="playlistId"
                name="playlistId"
                value={course.playlistId || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                placeholder="e.g., PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX"
              />
              <p className="mt-1 text-xs text-zinc-400">
                If provided, videos can be imported from this playlist.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
                Course Statistics
              </label>
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-md border border-zinc-800 bg-zinc-900/30 p-3">
                  <p className="text-xs text-zinc-500">Lessons</p>
                  <p className="text-sm text-zinc-300">{course.lessons}</p>
                </div>
                <div className="rounded-md border border-zinc-800 bg-zinc-900/30 p-3">
                  <p className="text-xs text-zinc-500">Course ID</p>
                  <p className="text-sm text-zinc-300 truncate">{course._id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/admin/courses/${course._id}/videos`)}
              className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Manage Videos
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
              disabled={saving}
            >
              {saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <FiSave className="mr-2" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCoursePage; 