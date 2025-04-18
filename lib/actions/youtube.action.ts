/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import Video from "@/lib/database/models/video.model";
import VideoProgress from "@/lib/database/models/videoProgress.model";

import { connectToDatabase } from "../database/mongoose";

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

// New function to get videos for a course
export async function getVideosForCourse(courseId: string) {
  try {
    await connectToDatabase();
    const videos = await Video.find({ courseId }).sort({ position: 1 });
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
