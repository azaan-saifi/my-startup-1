"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FiClock, FiMenu, FiLock, FiCheckCircle, FiSave } from "react-icons/fi";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { VideoListShimmer, VideoPlayerShimmer } from "@/components/ui/shimmer";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { getCourseById } from "@/lib/actions/course.action";
import {
  getNoteForVideo,
  saveNote,
  NoteData,
} from "@/lib/actions/notes.action";
import {
  getCourseProgress,
  getVideoProgress,
  updateVideoProgress,
} from "@/lib/actions/videoProgress.action";
import { getVideosForCourse } from "@/lib/actions/youtube.action";

// Import shimmer components

// Import ReactPlayer dynamically to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-md bg-zinc-800"></div>
  ),
});

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  duration: string;
  url: string;
  position: number;
}

interface Course {
  _id: string;
  title: string;
}

interface VideoProgress {
  _id: string;
  videoId: string;
  watchedPercent: number;
  completed: boolean;
}

interface Note {
  _id: string;
  content: string;
  markdownContent: string;
  title: string;
  tags: string[];
  isPublic: boolean;
}

const CourseDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useStudentAuth();
  const [userId, setUserId] = useState<string>("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [maxCompletionPercent, setMaxCompletionPercent] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(
    new Set()
  );

  // Enhanced note state
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef<typeof ReactPlayer>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Add a ref to track last update time
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Add these new states
  const [playerKey, setPlayerKey] = useState(0); // Used to force player remount
  const [initialStartPosition, setInitialStartPosition] = useState(0);

  // Setup window resize listener to detect mobile
  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 768);
    }

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set userId from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated) {
      // Using the email as userId for now
      // In a real app, you would use a proper user ID
      const email = localStorage.getItem("userEmail") || "student@example.com";
      setUserId(email);
    }
  }, [isAuthenticated]);

  // Fetch course data
  useEffect(() => {
    if (!userId) return;

    const fetchCourseData = async () => {
      try {
        setLoading(true);

        // Get course details
        const courseData = await getCourseById(id as string);
        if (courseData) {
          setCourse(JSON.parse(courseData));
        }

        // Get videos
        const videosData = await getVideosForCourse(id as string);
        const parsedVideos = JSON.parse(videosData);
        setVideos(parsedVideos);

        // Get progress for all videos
        const progressData = await getCourseProgress(id as string, userId);
        if (progressData) {
          const parsedData = JSON.parse(progressData);
          const completed = new Set<string>();

          if (
            parsedData.progressRecords &&
            Array.isArray(parsedData.progressRecords)
          ) {
            parsedData.progressRecords.forEach((record: VideoProgress) => {
              if (record.completed) {
                completed.add(record.videoId);
              }
            });
          }

          setCompletedVideos(completed);
        }

        // Select the first video
        if (parsedVideos.length > 0) {
          handleVideoSelect(parsedVideos[0]);
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, userId]);

  // Update handleVideoSelect to set initial position without changing URL mid-playback
  const handleVideoSelect = async (video: Video) => {
    // Check if the user can access this video
    const videoIndex = videos.findIndex((v) => v._id === video._id);

    // If it's not the first video, check if previous videos are completed
    if (videoIndex > 0) {
      const previousVideoId = videos[videoIndex - 1]._id;
      if (!completedVideos.has(previousVideoId)) {
        // Cannot access this video yet
        return;
      }
    }

    // Reset player state whenever a new video is selected
    setPlayerReady(false);

    // Increment key to force player to remount
    setPlayerKey((prevKey) => prevKey + 1);

    setSelectedVideo(video);

    // Load video progress
    if (userId) {
      const progressData = await getVideoProgress(video._id, userId);
      if (progressData) {
        const progress = JSON.parse(progressData);
        const percent = progress.watchedPercent;
        setMaxCompletionPercent(percent);

        // Use playback position from the database
        if (
          progress.playbackPositionSeconds &&
          progress.playbackPositionSeconds > 0
        ) {
          // Store the position to be used when player mounts
          setInitialStartPosition(progress.playbackPositionSeconds);
        } else if (percent > 0 && percent < 95) {
          // Fallback to estimating position based on percentage if no position is saved
          const estimatedDuration = 600;
          const startTimeSeconds = Math.floor(
            (percent / 100) * estimatedDuration
          );
          setInitialStartPosition(startTimeSeconds);
        } else {
          // Reset for completed or new videos
          setInitialStartPosition(0);
        }

        // Load notes
        const noteData = await getNoteForVideo(video._id, userId);
        if (noteData) {
          const note = JSON.parse(noteData) as Note;
          setNoteContent(note.markdownContent || note.content);
          setNoteTitle(note.title || "Untitled Note");
        } else {
          setNoteContent("");
          setNoteTitle(`Notes for: ${video.title}`);
        }
      } else {
        setMaxCompletionPercent(0);
        setInitialStartPosition(0);
      }
    }
  };

  // Update handleVideoProgress to save position without causing re-renders
  const handleVideoProgress = async (
    percent: number,
    playedSeconds: number
  ) => {
    if (selectedVideo && userId) {
      // Only update database periodically to reduce server calls
      const now = Date.now();
      if (playedSeconds > 0 && now - lastUpdateTimeRef.current > 5000) {
        // Log values for debugging
        console.log("Sending progress update:", {
          videoId: selectedVideo._id,
          percent: Math.max(percent, maxCompletionPercent),
          playedSeconds: Math.floor(playedSeconds),
        });

        // Only save to database, don't update state that would cause re-renders
        const result = await updateVideoProgress(
          selectedVideo._id,
          id as string,
          Math.max(percent, maxCompletionPercent), // Only send the highest percentage
          userId,
          Math.floor(playedSeconds) // Save playback position in seconds
        );

        console.log("Progress update result:", result);

        // Update completed videos if needed
        if (result.completed && !completedVideos.has(selectedVideo._id)) {
          // Mark as completed
          setCompletedVideos((prev) => new Set([...prev, selectedVideo._id]));
        }

        lastUpdateTimeRef.current = now;
      }

      // Only update max percentage locally if it increases
      if (percent > maxCompletionPercent) {
        setMaxCompletionPercent(percent);
      }
    }
  };

  // Save note
  const handleSaveNote = async () => {
    if (!selectedVideo || !userId) return;

    try {
      setIsSavingNote(true);

      const noteData: NoteData = {
        content: noteContent, // Plain text fallback
        markdownContent: noteContent,
        title: noteTitle,
      };

      await saveNote(selectedVideo._id, noteData, userId);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full">
        {/* Fixed Header Placeholder */}
        <div className="fixed left-0 top-16 z-20 flex h-16 w-full items-center border-b border-zinc-800 bg-black px-4">
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-full bg-zinc-800" />
            <div className="h-6 w-48 animate-pulse rounded-md bg-zinc-800" />
          </div>
        </div>

        {/* Fixed Sidebar Placeholder */}
        {!isSmallScreen && (
          <div className="left-18 fixed top-32 z-10 hidden h-[calc(100vh-8rem)] w-72 bg-black md:block">
            <div className="h-full p-4">
              <VideoListShimmer />
            </div>
          </div>
        )}

        {/* Main Content Area with Shimmer */}
        <div className={`flex-1 p-4 pt-20 ${!isSmallScreen ? "ml-72" : ""}`}>
          <VideoPlayerShimmer />
        </div>
      </div>
    );
  }

  // Find the current video index
  const currentVideoIndex = selectedVideo
    ? videos.findIndex((v) => v._id === selectedVideo._id)
    : 0;

  return (
    <div className="flex h-full">
      {/* Page Header - Course Title and Hamburger */}
      <div className="fixed left-0 top-16 z-20 flex h-16 w-full items-center border-b border-zinc-800 bg-black px-4">
        <div className="flex items-center gap-3">
          {!isSmallScreen ? (
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="rounded-full p-2 text-white hover:text-[#f0bb1c]"
            >
              <FiMenu className="size-5" />
            </button>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="rounded-full p-2 text-white hover:text-[#f0bb1c]"
                  aria-label="Open menu"
                >
                  <FiMenu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[85%] border-r border-zinc-800 bg-black p-0"
              >
                <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
                  <h2 className="text-lg font-bold text-[#f0bb1c]">
                    Course Videos
                  </h2>
                </div>
                <div className="custom-scrollbar h-[calc(100vh-4rem)] overflow-y-auto p-4">
                  <div className="space-y-3">
                    {videos.map((video, index) => {
                      const isCompleted = completedVideos.has(video._id);
                      const isPrevCompleted =
                        index === 0 ||
                        completedVideos.has(videos[index - 1]._id);
                      const isLocked = index > 0 && !isPrevCompleted;

                      return (
                        <button
                          key={video._id}
                          onClick={() => !isLocked && handleVideoSelect(video)}
                          className={`group flex w-full items-center gap-3 rounded-md p-3 text-left transition-all ${
                            isLocked
                              ? "cursor-not-allowed text-white opacity-60"
                              : selectedVideo?._id === video._id
                              ? "bg-[#f0bb1c]/10 text-[#f0bb1c]"
                              : "text-white hover:bg-zinc-900 hover:text-[#f0bb1c]"
                          }`}
                        >
                          {/* Thumbnail with completion overlay */}
                          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md">
                            <Image
                              src={video.thumbnail}
                              alt={video.title}
                              width={100}
                              height={100}
                              className="size-full object-cover"
                            />
                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                <FiLock className="size-5 text-zinc-400" />
                              </div>
                            )}
                            {isCompleted && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <div className="rounded-full bg-black/70 p-1">
                                  <FiCheckCircle className="size-5 text-[#f0bb1c]" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h3 className="truncate text-sm font-medium">
                              {video.title}
                            </h3>
                            <p className="mt-1 flex items-center text-xs text-zinc-400">
                              <FiClock className="mr-1 size-3" />
                              {video.duration}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
          <h1 className="text-xl font-bold text-white">
            {course?.title || "Course Content"}
          </h1>
        </div>
      </div>

      {/* Fixed Sidebar for Desktop */}
      {!isSmallScreen && sidebarOpen && (
        <div className="left-18 fixed top-32 z-10 hidden h-[calc(100vh-8rem)] w-72 bg-black md:block">
          <div className="custom-scrollbar h-full overflow-y-auto p-4">
            <div className="space-y-3">
              {videos.map((video, index) => {
                const isCompleted = completedVideos.has(video._id);
                const isPrevCompleted =
                  index === 0 || completedVideos.has(videos[index - 1]._id);
                const isLocked = index > 0 && !isPrevCompleted;

                return (
                  <button
                    key={video._id}
                    onClick={() => !isLocked && handleVideoSelect(video)}
                    className={`group flex w-full items-center gap-3 rounded-md p-3 text-left transition-all ${
                      isLocked
                        ? "cursor-not-allowed text-white opacity-60"
                        : selectedVideo?._id === video._id
                        ? "bg-[#f0bb1c]/10 text-[#f0bb1c]"
                        : "text-white hover:bg-zinc-900 hover:text-[#f0bb1c]"
                    }`}
                  >
                    {/* Thumbnail with completion overlay */}
                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        width={100}
                        height={100}
                        className="size-full object-cover"
                      />
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                          <FiLock className="size-5 text-zinc-400" />
                        </div>
                      )}
                      {isCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="rounded-full bg-black/70 p-1">
                            <FiCheckCircle className="size-5 text-[#f0bb1c]" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="truncate text-sm font-medium">
                        {video.title}
                      </h3>
                      <p className="mt-1 flex items-center text-xs text-zinc-400">
                        <FiClock className="mr-1 size-3" />
                        {video.duration}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Adjust top padding to account for both navbars */}
      <div
        className={`flex-1 p-4 pt-16 ${
          !isSmallScreen && sidebarOpen ? "ml-72" : ""
        }`}
      >
        {selectedVideo ? (
          <div className="space-y-6">
            {/* Video player */}
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-zinc-900">
              <ReactPlayer
                key={playerKey}
                ref={playerRef}
                url={selectedVideo.url}
                width="100%"
                height="100%"
                playing={true}
                controls={true}
                onReady={() => {
                  setPlayerReady(true);
                  // Seek to initial position when player is ready
                  if (initialStartPosition > 0 && playerRef.current) {
                    // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
                    playerRef.current.seekTo(initialStartPosition);
                  }
                }}
                onProgress={(state) => {
                  if (playerReady) {
                    // Calculate current progress percentage
                    const currentPercent = Math.round(state.played * 100);
                    handleVideoProgress(currentPercent, state.playedSeconds);
                  }
                }}
                config={{
                  youtube: {
                    playerVars: {
                      rel: 0,
                      modestbranding: 1,
                      iv_load_policy: 3,
                      disablekb: 1,
                      showinfo: 0,
                      origin:
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "",
                    },
                  },
                }}
              />
            </div>

            {/* Video Title moved below video */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">
                {selectedVideo.title}
              </h1>
              <button
                onClick={() => window.history.back()}
                className="text-sm text-zinc-400 hover:text-white"
              >
                Back
              </button>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="h-1.5 w-full rounded-full bg-zinc-800">
                <div
                  className="h-1.5 rounded-full bg-[#f0bb1c]"
                  style={{ width: `${maxCompletionPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{maxCompletionPercent}% complete</span>
                <span>
                  {currentVideoIndex + 1} of {videos.length}
                </span>
              </div>
            </div>

            {/* Enhanced Notes Section with Markdown Editor */}
            <div className="rounded-lg border border-zinc-800 bg-black/40 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Your Notes</h3>
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="flex items-center justify-center rounded bg-[#f0bb1c] px-4 py-2 text-sm font-medium text-black hover:bg-[#f0bb1c]/80"
                >
                  {isSavingNote ? (
                    "Saving..."
                  ) : (
                    <>
                      <FiSave className="mr-2" /> Save Notes
                    </>
                  )}
                </button>
              </div>

              {/* Note Title */}
              <div className="mb-4">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note Title"
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-white"
                />
              </div>

              {/* Markdown Editor */}
              <div data-color-mode="dark">
                <MDEditor
                  value={noteContent}
                  onChange={(val) => setNoteContent(val || "")}
                  height={300}
                  preview="edit"
                  className="border border-zinc-800"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-zinc-900">
            <p className="text-zinc-400">No videos available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
