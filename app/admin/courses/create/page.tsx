"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FiArrowLeft, FiSave, FiVideo } from "react-icons/fi";

const CreateCoursePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [importingVideos, setImportingVideos] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [course, setCourse] = useState({
    title: "",
    thumbnail: "",
    youtubeUrl: "",
    lessons: "0 lessons",
    playlistId: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setImportingVideos(!!course.playlistId);
    setImportResult(null);

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.videosImported) {
          setImportResult({
            success: true,
            message: `Course created and ${data.videosCount} videos imported successfully from YouTube playlist!`
          });
          
          // Wait 2 seconds to show the success message before redirecting
          setTimeout(() => {
            router.push(`/admin/courses/${data.course._id}/videos`);
          }, 2000);
        } else if (course.playlistId) {
          setImportResult({
            success: false,
            message: "Course created but failed to import videos from playlist."
          });
          
          // Wait 2 seconds to show the error message before redirecting
          setTimeout(() => {
            router.push(`/admin/courses/${data.course._id}/videos`);
          }, 2000);
        } else {
          // Redirect immediately if no playlist was specified
          router.push(`/admin/courses/${data.course._id}/videos`);
        }
      } else {
        setImportResult({
          success: false,
          message: `Error: ${data.error}`
        });
      }
    } catch (error) {
      console.error("Error creating course:", error);
      setImportResult({
        success: false,
        message: "Failed to create course. Please try again."
      });
    } finally {
      setLoading(false);
      setImportingVideos(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-white">Create New Course</h1>
        <p className="mt-1 text-zinc-400">Add a new course to your platform</p>
      </div>

      {importResult && (
        <div className={`p-4 mb-6 rounded-md ${importResult.success ? 'bg-green-900/30 text-green-500' : 'bg-rose-900/30 text-rose-500'}`}>
          {importResult.message}
        </div>
      )}

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
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-white">
                YouTube Video URL (Optional)
              </label>
              <input
                type="url"
                id="youtubeUrl"
                name="youtubeUrl"
                value={course.youtubeUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              />
              <p className="mt-1 text-xs text-zinc-400">
                If provided, the video thumbnail will be automatically extracted and used.
              </p>
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-white">
                Thumbnail URL (Optional if YouTube URL is provided)
              </label>
              <input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={course.thumbnail}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                placeholder="https://example.com/image.jpg"
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
                value={course.playlistId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                placeholder="e.g., PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX"
              />
              <p className="mt-1 text-xs text-zinc-400">
                If provided, videos will be automatically imported from this playlist.
              </p>
              {course.playlistId && (
                <div className="mt-2 bg-amber-900/20 text-amber-500 p-2 rounded text-xs flex items-center">
                  <FiVideo className="mr-2" />
                  Videos will be imported from this playlist automatically after course creation.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-zinc-800 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              disabled={loading || importingVideos}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
              disabled={loading || importingVideos}
            >
              {loading ? (
                <span>{importingVideos ? "Importing videos..." : "Creating..."}</span>
              ) : (
                <>
                  <FiSave className="mr-2" /> Save Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage; 