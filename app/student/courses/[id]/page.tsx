"use client";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  FiClock,
  FiMenu,
  FiLock,
  FiCheckCircle,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

import BlurWrapper from "@/components/student/BlurWrapper";
import CourseAiAssistant from "@/components/student/CourseAiAssistant";
import CourseNotes from "@/components/student/CourseNotes";
import CoursePracticeQuiz from "@/components/student/CoursePracticeQuiz";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { VideoListShimmer, VideoPlayerShimmer } from "@/components/ui/shimmer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCourseById } from "@/lib/actions/course.action";
import {
  getNoteForVideo,
  saveNote,
  NoteData,
} from "@/lib/actions/notes.action";
import { isQuizCompleted } from "@/lib/actions/quizProgress.action";
import {
  getCourseProgress,
  getVideoProgress,
  updateVideoProgress,
} from "@/lib/actions/videoProgress.action";
import { getVideosForCourse } from "@/lib/actions/youtube.action";

// Import ReactPlayer dynamically to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface Video {
  _id: string;
  videoId: string;
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

const CourseContent = () => {
  const { id } = useParams();
  const { userId } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [maxCompletionPercent, setMaxCompletionPercent] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(
    new Set()
  );
  const [quizCompletedForVideo, setQuizCompletedForVideo] = useState(false);

  // Enhanced note state
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const playerRef = useRef<typeof ReactPlayer>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("notes");
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Add refs for scrolling
  const notesRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const [initialStartPosition, setInitialStartPosition] = useState(0);
  const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0);

  // Setup window resize listener to detect mobile
  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 768);
    }

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect to automatically hide sidebar when AI Assistant or Practice Quiz is selected (on desktop)
  useEffect(() => {
    if (!isSmallScreen) {
      if (activeTab === "assistant" || activeTab === "quiz") {
        setSidebarOpen(false);
        setRightSidebarOpen(true);
      } else {
        setRightSidebarOpen(false);
      }
    }
  }, [activeTab, isSmallScreen]);

  // Fetch course data
  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

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

          console.log("Course progress data:", parsedData); // Debug log for progress data

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

          // Add this to extract and set the overall course progress percentage
          if (parsedData.courseProgress) {
            setMaxCompletionPercent(parsedData.courseProgress.progress || 0);
          }
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

    setSelectedVideo(video);

    console.log("Selected video:", video);

    // Load video progress
    if (userId) {
      const progressData = await getVideoProgress(video._id, userId);
      console.log("Video progress data:", progressData); // Debug log for video progress

      if (progressData) {
        const progress = JSON.parse(progressData);
        console.log("Parsed progress:", progress);

        const percent = progress.watchedPercent || 0;
        setMaxCompletionPercent(percent);

        // Use playback position from the database
        if (
          progress.playbackPositionSeconds &&
          progress.playbackPositionSeconds > 0
        ) {
          // Store the position to be used when player mounts
          setInitialStartPosition(progress.playbackPositionSeconds);
          console.log(
            "Setting initial position from DB:",
            progress.playbackPositionSeconds
          );
        } else if (percent > 0 && percent < 95) {
          // Fallback to estimating position based on percentage if no position is saved
          const estimatedDuration = 600;
          const startTimeSeconds = Math.floor(
            (percent / 100) * estimatedDuration
          );
          setInitialStartPosition(startTimeSeconds);
          console.log("Estimating position from percent:", startTimeSeconds);
        } else {
          // Reset for completed or new videos
          setInitialStartPosition(0);
          console.log("Resetting position to 0");
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
        console.log("No progress data found, starting from beginning");
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
          courseId: id,
          userId,
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
          console.log("Marked video as completed:", selectedVideo._id);
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

  // Find the current video index and next video
  const currentVideoIndex = selectedVideo
    ? videos.findIndex((v) => v._id === selectedVideo._id)
    : 0;

  const nextVideo =
    currentVideoIndex < videos.length - 1
      ? videos[currentVideoIndex + 1]
      : null;

  // Check if quiz is completed for current video when it changes
  useEffect(() => {
    const checkQuizCompletion = async () => {
      if (!selectedVideo?.videoId || !userId) {
        setQuizCompletedForVideo(false);
        return;
      }

      try {
        const completed = await isQuizCompleted(selectedVideo.videoId, userId);
        setQuizCompletedForVideo(completed);
      } catch (error) {
        console.error("Error checking quiz completion:", error);
        setQuizCompletedForVideo(false);
      }
    };

    checkQuizCompletion();
  }, [selectedVideo?.videoId, userId]);

  // Update canAccessNextVideo to check if quiz is completed or not needed
  const canAccessNextVideo =
    (maxCompletionPercent > 95 && quizCompletedForVideo) || // Quiz completed
    (maxCompletionPercent > 95 && activeTab !== "quiz"); // Not on quiz tab yet

  // Handle quiz completion - just refresh the check
  const handleQuizCompleted = () => {
    console.log("Quiz completed!");
    setQuizCompletedForVideo(true);
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

  const handleNextVideo = () => {
    if (canAccessNextVideo && nextVideo) {
      handleVideoSelect(nextVideo);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // For desktop only
    if (!isSmallScreen) {
      if (value === "notes") {
        // Close right sidebar and scroll to notes section
        setRightSidebarOpen(false);
        // Use setTimeout to ensure the DOM has updated before scrolling
        setTimeout(() => {
          if (notesRef.current) {
            notesRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else if (value === "assistant" || value === "quiz") {
        // If clicking the same tab that's already active AND the sidebar is open
        if (activeTab === value && rightSidebarOpen) {
          // Close the sidebar
          setRightSidebarOpen(false);
        } else {
          // Either opening a new tab or reopening after closing
          setRightSidebarOpen(true);
        }
      }
    }
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen(false);
  };

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

      {/* Fixed Sidebar for Desktop - Left */}
      {!isSmallScreen && sidebarOpen && (
        <div className="left-18 fixed top-32 z-10 hidden h-[calc(100vh-8rem)] w-72 bg-black transition-transform duration-300 ease-in-out md:block">
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

      {/* Fixed Sidebar for Desktop - Right */}
      {!isSmallScreen && rightSidebarOpen && (
        <div className="fixed right-0 top-32 z-10 hidden h-[calc(100vh-8rem)] w-1/3 border-l border-zinc-800 bg-black transition-transform duration-300 ease-in-out md:block">
          <div className="relative h-full bg-black">
            <button
              onClick={toggleRightSidebar}
              className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <FiX className="size-5" />
            </button>

            <div className="h-full overflow-y-auto pt-12">
              {activeTab === "assistant" && (
                <BlurWrapper
                  componentName="assistant"
                  videoId={selectedVideo?.videoId || ""}
                  userId={userId as string}
                >
                  <CourseAiAssistant
                    userId={userId as string}
                    videoId={selectedVideo?.videoId}
                    currentTimestamp={currentPlaybackPosition}
                    courseId={id as string}
                    onSeekTo={(seconds) => {
                      if (playerRef.current) {
                        // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
                        playerRef.current.seekTo(seconds);
                      }
                    }}
                  />
                </BlurWrapper>
              )}

              {activeTab === "quiz" && (
                <CoursePracticeQuiz
                  videoTitle={selectedVideo?.title || ""}
                  videoId={selectedVideo?.videoId || ""}
                  userId={userId as string}
                  courseId={id as string}
                  watchedPercent={maxCompletionPercent}
                  onQuizCompleted={handleQuizCompleted}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 p-4 pt-16 transition-all duration-300 ease-in-out ${
          !isSmallScreen && sidebarOpen ? "ml-72" : ""
        } ${!isSmallScreen && rightSidebarOpen ? "mr-[33.333%]" : ""}`}
      >
        {selectedVideo ? (
          <div>
            {/* Desktop-specific layout with tabs above video */}
            {!isSmallScreen && (
              <div className="mb-6">
                <Tabs value={activeTab} className="w-full">
                  <div className="flex justify-end">
                    <TabsList className="mb-4 flex w-auto justify-end rounded-lg border border-zinc-800 bg-black p-1">
                      <TabsTrigger
                        value="notes"
                        onClick={() => handleTabChange("notes")}
                        data-state={activeTab === "notes" ? "active" : ""}
                        className="rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        Notes
                      </TabsTrigger>
                      <TabsTrigger
                        value="assistant"
                        onClick={() => handleTabChange("assistant")}
                        data-state={activeTab === "assistant" ? "active" : ""}
                        className="rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        AI Assistant
                      </TabsTrigger>
                      <TabsTrigger
                        value="quiz"
                        onClick={() => handleTabChange("quiz")}
                        data-state={activeTab === "quiz" ? "active" : ""}
                        className="rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        Practice Questions
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
              </div>
            )}

            {/* Main layout - Adjusts based on both small screen and sidebar states */}
            <div className={`${!isSmallScreen ? "flex gap-6" : "space-y-6"}`}>
              {/* Left column with video and notes */}
              <div
                className={`${
                  !isSmallScreen && rightSidebarOpen ? "w-full" : "w-full"
                }`}
              >
                {/* Video player */}
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-zinc-900">
                  <ReactPlayer
                    // key={playerKey}
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
                        console.log(
                          "Seeking to saved position:",
                          initialStartPosition
                        );
                      }
                    }}
                    onProgress={(state) => {
                      if (playerReady) {
                        // Calculate current progress percentage
                        const currentPercent = Math.round(state.played * 100);
                        handleVideoProgress(
                          currentPercent,
                          state.playedSeconds
                        );
                        setCurrentPlaybackPosition(state.playedSeconds);
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

                {/* Video Title with Next Video button */}
                <div className="my-4 flex items-center justify-between">
                  <h1 className="text-xl font-bold text-white">
                    {selectedVideo.title}
                  </h1>
                  {nextVideo && (
                    <button
                      onClick={handleNextVideo}
                      disabled={!canAccessNextVideo}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${
                        canAccessNextVideo
                          ? "bg-gradient-yellow text-black hover:bg-gradient-yellow-hover"
                          : "cursor-not-allowed bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      Next Video
                      <FiChevronRight />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-6 space-y-2">
                  <div className="h-1.5 w-full rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-gradient-yellow"
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

                {/* Mobile tabs or desktop Notes tab */}
                {isSmallScreen ? (
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="mb-4 flex w-full justify-between rounded-lg border border-zinc-800 bg-black p-1">
                      <TabsTrigger
                        value="notes"
                        className="flex-1 rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        Notes
                      </TabsTrigger>
                      <TabsTrigger
                        value="assistant"
                        className="flex-1 rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        AI Assistant
                      </TabsTrigger>
                      <TabsTrigger
                        value="quiz"
                        className="flex-1 rounded-md data-[state=active]:bg-gradient-yellow data-[state=active]:text-black"
                      >
                        Practice Questions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="notes">
                      <BlurWrapper
                        componentName="notes"
                        videoId={selectedVideo?.videoId || ""}
                        userId={userId as string}
                      >
                        <CourseNotes
                          noteContent={noteContent}
                          noteTitle={noteTitle}
                          isSavingNote={isSavingNote}
                          onNoteContentChange={(content) =>
                            setNoteContent(content)
                          }
                          onNoteTitleChange={(title) => setNoteTitle(title)}
                          onSaveNote={handleSaveNote}
                        />
                      </BlurWrapper>
                    </TabsContent>

                    <TabsContent value="assistant">
                      <BlurWrapper
                        componentName="assistant"
                        videoId={selectedVideo?.videoId || ""}
                        userId={userId as string}
                      >
                        <CourseAiAssistant
                          userId={userId as string}
                          videoId={selectedVideo?.videoId}
                          currentTimestamp={currentPlaybackPosition}
                          courseId={id as string}
                          onSeekTo={(seconds) => {
                            if (playerRef.current) {
                              // @ts-expect-error - playerRef.current.seekTo exists but TypeScript doesn't know the type
                              playerRef.current.seekTo(seconds);
                            }
                          }}
                        />
                      </BlurWrapper>
                    </TabsContent>

                    <TabsContent value="quiz">
                      {/* Only render quiz component in mobile view here */}
                      <CoursePracticeQuiz
                        videoTitle={selectedVideo.title}
                        videoId={selectedVideo.videoId}
                        userId={userId as string}
                        courseId={id as string}
                        watchedPercent={maxCompletionPercent}
                        onQuizCompleted={handleQuizCompleted}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  // Always show notes in desktop mode (regardless of active tab)
                  <div
                    ref={notesRef}
                    id="notes-section"
                    className="scroll-mt-16"
                  >
                    <BlurWrapper
                      componentName="notes"
                      videoId={selectedVideo?.videoId || ""}
                      userId={userId as string}
                    >
                      <CourseNotes
                        noteContent={noteContent}
                        noteTitle={noteTitle}
                        isSavingNote={isSavingNote}
                        onNoteContentChange={(content) =>
                          setNoteContent(content)
                        }
                        onNoteTitleChange={(title) => setNoteTitle(title)}
                        onSaveNote={handleSaveNote}
                      />
                    </BlurWrapper>
                  </div>
                )}
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

export default CourseContent;
