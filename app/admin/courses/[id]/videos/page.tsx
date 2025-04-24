"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiLock, FiUnlock } from "react-icons/fi";
import Image from "next/image";

interface Course {
  _id: string;
  title: string;
  thumbnail: string;
  lessons: string;
}

interface Video {
  _id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  url: string;
  position: number;
  locked: boolean;
}

const CourseVideosPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoFormVisible, setVideoFormVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  
  const [newVideo, setNewVideo] = useState({
    videoId: "",
    title: "",
    thumbnail: "",
    duration: "",
    url: "",
    locked: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course data
        const courseResponse = await fetch(`/api/courses/${id}`);
        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course");
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // Fetch videos for this course
        const videosResponse = await fetch(`/api/courses/${id}/videos`);
        if (!videosResponse.ok) {
          throw new Error("Failed to fetch videos");
        }
        const videosData = await videosResponse.json();
        setVideos(videosData);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error loading data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (editingVideo) {
      setEditingVideo({
        ...editingVideo,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      });
    } else {
      setNewVideo({
        ...newVideo,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (editingVideo) {
      setEditingVideo({
        ...editingVideo,
        [name]: checked
      });
    } else {
      setNewVideo({
        ...newVideo,
        [name]: checked
      });
    }
  };

  const resetForm = () => {
    setNewVideo({
      videoId: "",
      title: "",
      thumbnail: "",
      duration: "",
      url: "",
      locked: true
    });
    setEditingVideo(null);
    setVideoFormVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVideo) {
        // Update existing video
        const response = await fetch(`/api/courses/${id}/videos`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingVideo._id,
            title: editingVideo.title,
            videoId: editingVideo.videoId,
            thumbnail: editingVideo.thumbnail,
            duration: editingVideo.duration,
            url: editingVideo.url,
            locked: editingVideo.locked
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update video");
        }

        const updatedVideo = await response.json();
        
        // Update videos list
        setVideos(videos.map(video => 
          video._id === editingVideo._id ? updatedVideo.video : video
        ));
        
        alert("Video updated successfully!");
      } else {
        // Create new video
        const response = await fetch(`/api/courses/${id}/videos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newVideo)
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to add video");
        }

        const data = await response.json();
        
        // Add new video to the list
        setVideos([...videos, data.video]);
        
        alert("Video added successfully!");
      }
      
      // Reset the form
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video? This will remove all progress data for students.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/courses/${id}/videos?id=${videoId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete video");
      }
      
      // Remove video from the list
      setVideos(videos.filter(video => video._id !== videoId));
      
      alert("Video deleted successfully!");
    } catch (error) {
      console.error("Error deleting video:", error);
      alert(`Failed to delete video: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setVideoFormVisible(true);
  };

  const handleMoveVideo = async (videoId: string, direction: 'up' | 'down') => {
    const videoIndex = videos.findIndex(v => v._id === videoId);
    if (videoIndex === -1) return;
    
    const video = videos[videoIndex];
    
    // Calculate new position
    let newPosition: number;
    if (direction === 'up' && videoIndex > 0) {
      newPosition = videos[videoIndex - 1].position;
    } else if (direction === 'down' && videoIndex < videos.length - 1) {
      newPosition = videos[videoIndex + 1].position;
    } else {
      return;
    }
    
    try {
      const response = await fetch(`/api/courses/${id}/videos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: videoId,
          position: newPosition
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update video position");
      }
      
      // Refetch videos to get the updated order
      const videosResponse = await fetch(`/api/courses/${id}/videos`);
      if (!videosResponse.ok) {
        throw new Error("Failed to fetch updated videos");
      }
      
      const videosData = await videosResponse.json();
      setVideos(videosData);
    } catch (error) {
      console.error("Error moving video:", error);
      alert(`Failed to reorder video: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleToggleLock = async (videoId: string, currentLocked: boolean) => {
    try {
      const response = await fetch(`/api/courses/${id}/videos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: videoId,
          locked: !currentLocked
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update video lock status");
      }
      
      // Update video in the list
      setVideos(videos.map(video => 
        video._id === videoId ? { ...video, locked: !currentLocked } : video
      ));
    } catch (error) {
      console.error("Error toggling video lock:", error);
      alert(`Failed to update lock status: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
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
          onClick={() => router.push(`/admin/courses/${id}`)}
          className="inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <FiArrowLeft className="mr-1" /> Back to course details
        </button>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">{course.title}</h1>
          <p className="mt-1 text-zinc-400">Manage course videos</p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setVideoFormVisible(!videoFormVisible);
          }}
          className="flex items-center gap-2 rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
        >
          <FiPlus />
          <span>{videoFormVisible ? "Cancel" : "Add Video"}</span>
        </button>
      </div>

      {/* Video Form */}
      {videoFormVisible && (
        <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-6 backdrop-blur-sm">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <h3 className="mb-4 text-xl font-medium text-white">
            {editingVideo ? "Edit Video" : "Add New Video"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white">
                  Video Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editingVideo ? editingVideo.title : newVideo.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                  placeholder="Introduction to the Course"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="videoId" className="block text-sm font-medium text-white">
                  YouTube Video ID
                </label>
                <input
                  type="text"
                  id="videoId"
                  name="videoId"
                  value={editingVideo ? editingVideo.videoId : newVideo.videoId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                  placeholder="dQw4w9WgXcQ"
                  required
                />
                <p className="mt-1 text-xs text-zinc-500">
                  The part after ?v= in YouTube URL
                </p>
              </div>
              
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-white">
                  Video URL
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={editingVideo ? editingVideo.url : newVideo.url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-white">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={editingVideo ? editingVideo.duration : newVideo.duration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                  placeholder="10:30"
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
                  value={editingVideo ? editingVideo.thumbnail : newVideo.thumbnail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-white placeholder-zinc-500 focus:border-[#f0bb1c] focus:outline-none"
                  placeholder="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="locked"
                  name="locked"
                  checked={editingVideo ? editingVideo.locked : newVideo.locked}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-[#f0bb1c]"
                />
                <label htmlFor="locked" className="ml-2 block text-sm text-white">
                  Locked (requires completing previous videos)
                </label>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-zinc-800 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
              >
                {editingVideo ? "Update Video" : "Add Video"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black/60 p-4 sm:p-6 backdrop-blur-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <h3 className="mb-4 text-xl font-medium text-white">Course Videos</h3>
        
        {videos.length === 0 ? (
          <div className="py-8 text-center text-zinc-400">
            <p>No videos added to this course yet.</p>
            <button
              onClick={() => setVideoFormVisible(true)}
              className="mt-4 inline-flex items-center rounded-md bg-[#ffc20b31] px-4 py-2 text-sm font-medium text-[#f0bb1c] transition-colors hover:bg-[#ffc20b50]"
            >
              <FiPlus className="mr-2" /> Add First Video
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video, index) => (
              <div 
                key={video._id} 
                className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/20 p-4 transition-colors hover:bg-zinc-900/40"
              >
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                  <div className="relative mb-3 h-24 w-40 shrink-0 overflow-hidden rounded md:mb-0">
                    <Image 
                      src={video.thumbnail} 
                      alt={video.title} 
                      fill 
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/640x360?text=Video+Thumbnail";
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <h4 className="text-lg font-medium text-white">
                        {index + 1}. {video.title}
                      </h4>
                      <div className="mt-2 flex items-center space-x-2 text-sm text-zinc-400 md:mt-0">
                        <span>Duration: {video.duration}</span>
                        <span>•</span>
                        <span className={video.locked ? "text-amber-500" : "text-emerald-500"}>
                          {video.locked ? "Locked" : "Unlocked"}
                        </span>
                      </div>
                    </div>
                    
                    <p className="mt-1 text-sm text-zinc-400">
                      Video ID: {video.videoId}
                    </p>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditVideo(video)}
                        className="inline-flex items-center rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
                      >
                        <FiEdit2 className="mr-1" /> Edit
                      </button>
                      
                      <button
                        onClick={() => handleDelete(video._id)}
                        className="inline-flex items-center rounded bg-rose-900/30 px-2 py-1 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-900/50"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                      
                      <button
                        onClick={() => handleToggleLock(video._id, video.locked)}
                        className="inline-flex items-center rounded bg-amber-900/30 px-2 py-1 text-xs font-medium text-amber-500 transition-colors hover:bg-amber-900/50"
                      >
                        {video.locked ? (
                          <>
                            <FiUnlock className="mr-1" /> Unlock
                          </>
                        ) : (
                          <>
                            <FiLock className="mr-1" /> Lock
                          </>
                        )}
                      </button>
                      
                      {index > 0 && (
                        <button
                          onClick={() => handleMoveVideo(video._id, 'up')}
                          className="inline-flex items-center rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
                        >
                          <FiArrowUp className="mr-1" /> Move Up
                        </button>
                      )}
                      
                      {index < videos.length - 1 && (
                        <button
                          onClick={() => handleMoveVideo(video._id, 'down')}
                          className="inline-flex items-center rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
                        >
                          <FiArrowDown className="mr-1" /> Move Down
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseVideosPage;