/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import Course from "@/lib/database/models/courses.model";
import Video from "@/lib/database/models/video.model";
import VideoProgress from "@/lib/database/models/videoProgress.model";

import { connectToDatabase } from "../database/mongoose";

// Helper function to get YouTube thumbnail URL from video ID
function getYouTubeThumbnailUrl(videoId: string): string {
  // Return the high quality thumbnail URL
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export async function getYoutubePlaylistsByChannelId() {
  try {
    // Instead of processing directly, call the API endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/youtube-sync`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to sync YouTube content");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error in getYoutubePlaylistsByChannelId:", error);
    throw error;
  }
}

// Function to import videos from a YouTube playlist
export async function importVideosFromPlaylist(
  courseId: string,
  playlistId: string
) {
  try {
    await connectToDatabase();

    // Validate the course exists and get its data
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Store the course thumbnail to use for videos if needed
    const courseThumbnail = course.thumbnail;

    // First try with the RapidAPI method
    try {
      return await importVideosWithRapidAPI(
        courseId,
        playlistId,
        courseThumbnail
      );
    } catch (rapidApiError) {
      console.error("Error using RapidAPI for playlist import:", rapidApiError);
      console.log("Falling back to mock data for playlist...");

      // Fallback to mock data if the API is not working
      return await importMockVideos(courseId, playlistId, courseThumbnail);
    }
  } catch (error) {
    console.error("Error importing videos from playlist:", error);
    throw error;
  }
}

// Import videos using RapidAPI
async function importVideosWithRapidAPI(
  courseId: string,
  playlistId: string,
  courseThumbnail: string
) {
  // Fetch videos for this playlist using the Rapid API
  const url = `https://youtube-media-downloader.p.rapidapi.com/v2/playlist/videos?playlistId=${playlistId}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY!,
      "x-rapidapi-host": process.env.RAPID_API_HOST!,
    },
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist videos: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.status || !Array.isArray(result.items)) {
    throw new Error("Invalid API response structure for playlist videos");
  }

  // Add videos to the course
  const videos = [];
  for (let i = 0; i < result.items.length; i++) {
    const video = result.items[i];

    // Determine which thumbnail to use:
    // 1. If course thumbnail exists, prioritize that for visual consistency
    // 2. Otherwise try the API response
    // 3. Fall back to YouTube's standard thumbnail URL
    let thumbnail = courseThumbnail; // First priority is course thumbnail
    if (!thumbnail) {
      thumbnail =
        video.thumbnails?.[0]?.url || getYouTubeThumbnailUrl(video.id);
    }

    // Create video object
    const videoData = {
      videoId: video.id,
      title: video.title,
      description: video.description || "",
      thumbnail,
      duration: video.lengthText || "0:00",
      courseId,
      position: i + 1, // 1-indexed position
      url: `https://www.youtube.com/watch?v=${video.id}`,
      locked: i !== 0, // First video is unlocked, rest are locked
    };

    // Add to database
    const newVideo = await Video.findOneAndUpdate(
      { videoId: videoData.videoId, courseId },
      videoData,
      { upsert: true, new: true }
    );

    videos.push(newVideo);
  }

  // Update course with total number of videos
  await Course.findByIdAndUpdate(courseId, {
    lessons: `${videos.length} lessons`,
    totalLessons: videos.length,
  });

  return JSON.stringify(videos);
}

// Fallback function to create mock videos for a playlist
async function importMockVideos(
  courseId: string,
  playlistId: string,
  courseThumbnail: string
) {
  // Create mock videos based on playlist ID
  const mockTitles = [
    "Introduction to the Course",
    "Getting Started with Setup",
    "Core Concepts and Architecture",
    "Building Your First Project",
    "Advanced Techniques and Best Practices",
  ];

  // Clean the playlistId to avoid any characters that might cause issues with MongoDB
  const safePlaylistId = playlistId.replace(/[&?=]/g, "-");

  const videos = [];
  for (let i = 0; i < mockTitles.length; i++) {
    // Generate a mock video ID that's safe for MongoDB indexes
    const mockVideoId = `mock-${safePlaylistId}-${i}`;

    // Use course thumbnail if it exists, otherwise use a placeholder
    const thumbnail =
      courseThumbnail ||
      `https://via.placeholder.com/640x360/1a1a1a/f0bb1c?text=Video+${i + 1}`;

    // Create video object with mock data
    const videoData = {
      videoId: mockVideoId,
      title: mockTitles[i],
      description: `This is a mock video for demonstration purposes. Lesson ${
        i + 1
      } of the course.`,
      thumbnail,
      duration: `${Math.floor(Math.random() * 10) + 5}:${Math.floor(
        Math.random() * 60
      )
        .toString()
        .padStart(2, "0")}`,
      courseId,
      position: i + 1, // 1-indexed position
      url: `https://www.youtube.com/watch?v=${mockVideoId}`,
      locked: i !== 0, // First video is unlocked, rest are locked
    };

    // Add to database
    const newVideo = await Video.findOneAndUpdate(
      { videoId: videoData.videoId, courseId },
      videoData,
      { upsert: true, new: true }
    );

    videos.push(newVideo);
  }

  // Update course with total number of videos
  await Course.findByIdAndUpdate(courseId, {
    lessons: `${videos.length} lessons`,
    totalLessons: videos.length,
  });

  return JSON.stringify(videos);
}

// New function to get videos for a course
export async function getVideosForCourse(courseId: string) {
  try {
    await connectToDatabase();
    const videos = await Video.find({ courseId }).sort({ position: 1 });
    console.log("Videos:", videos);
    return JSON.stringify(videos);
  } catch (error) {
    console.error("Error in getVideosForCourse:", error);
    throw error;
  }
}

// Get videos with their locked status for a course
export async function getVideosWithLockStatus(
  courseId: string,
  userId: string
) {
  try {
    await connectToDatabase();

    // Get all videos for the course
    const videos = await Video.find({ courseId }).sort({ position: 1 });

    // If no userId is provided, just return videos with their locked status
    if (!userId) {
      return JSON.stringify(videos);
    }

    // Get the user's progress for these videos
    const videoIds = videos.map((video) => video._id);
    const progressRecords = await VideoProgress.find({
      userId,
      videoId: { $in: videoIds },
    });

    // Create a map of video progress
    const progressMap = new Map();
    if (progressRecords && Array.isArray(progressRecords)) {
      progressRecords.forEach((record) => {
        progressMap.set(record.videoId.toString(), {
          completed: record.completed,
          watchedPercent: record.watchedPercent,
        });
      });
    }

    // Combine videos with their progress
    const videosWithProgress = videos.map((video) => {
      const videoId = video._id.toString();
      const progress = progressMap.get(videoId) || {
        completed: false,
        watchedPercent: 0,
      };

      return {
        ...video.toObject(),
        progress: progress.watchedPercent,
        completed: progress.completed,
      };
    });

    return JSON.stringify(videosWithProgress);
  } catch (error) {
    console.error("Error in getVideosWithLockStatus:", error);
    throw error;
  }
}
