/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import Course from "@/lib/database/models/courses.model";
import Video from "@/lib/database/models/video.model";
import VideoProgress from "@/lib/database/models/videoProgress.model";

import { connectToDatabase } from "../database/mongoose";

export async function getYoutubePlaylistsByChannelId() {
  try {
    await connectToDatabase();

    const channelId = "UCjEXry5mjyhACMxTxCu7VWg";

    // Get existing courses to preserve enrolled status and progress
    const existingCourses = await Course.find({});
    const courseDataMap = new Map(
      existingCourses.map((course) => [
        course.title,
        {
          enrolled: course.enrolled,
          progress: course.progress,
          completedLessons: course.completedLessons,
        },
      ])
    );

    // Fetch playlists data - optimize with parallel requests
    const url = `https://youtube-media-downloader.p.rapidapi.com/v2/channel/playlists?channelId=${channelId}&type=playlists&sortBy=dateAdded`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY!,
        "x-rapidapi-host": process.env.RAPID_API_HOST!,
      },
    };

    console.log("Fetching playlists data...");
    const response = await fetch(url, options);
    const result = await response.json();

    // Check if the API response is valid
    if (!result.status || !Array.isArray(result.items)) {
      throw new Error("Invalid API response structure for playlists");
    }

    // Process playlists in parallel
    console.log(`Processing ${result.items.length} playlists...`);
    await Promise.all(
      result.items.map(async (playlist: any) => {
        // Create or update the course
        const courseData = {
          title: playlist.title,
          lessons: `${playlist.videoCountText.split(" ")[0] || 0}`,
          thumbnail: playlist.thumbnails?.[0]?.url || "",
          playlistId: playlist.id,
          totalLessons: playlist.videoCountText.split(" ")[0] || 0,
        };

        // Preserve existing course data
        const existingData = courseDataMap.get(playlist.title);
        if (existingData) {
          Object.assign(courseData, {
            enrolled: existingData.enrolled || false,
            progress: existingData.progress || 0,
            completedLessons: existingData.completedLessons || 0,
          });
        } else {
          Object.assign(courseData, {
            enrolled: false,
            progress: 0,
            completedLessons: 0,
          });
        }

        const course = await Course.findOneAndUpdate(
          { title: courseData.title },
          courseData,
          { upsert: true, new: true }
        );

        // Fetch videos for this playlist
        const videosUrl = `https://youtube-media-downloader.p.rapidapi.com/v2/playlist/videos?playlistId=${playlist.id}`;
        const videosResponse = await fetch(videosUrl, options);
        const videosResult = await videosResponse.json();

        if (!videosResult.status || !Array.isArray(videosResult.items)) {
          console.error(
            `Failed to fetch videos for playlist: ${playlist.title}`
          );
          return;
        }

        // Process videos in parallel for each playlist
        const videoPromises = videosResult.items.map(async (video: any) => {
          const position = video.index || 0;
          const videoData = {
            videoId: video.id,
            title: video.title,
            description: video.description || "",
            thumbnail: video.thumbnails?.[0]?.url || "",
            duration: video.lengthText || "0:00",
            courseId: course._id,
            position,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            locked: position !== 0, // First video (position 0) is unlocked
          };

          return Video.findOneAndUpdate(
            { videoId: videoData.videoId, courseId: course._id },
            videoData,
            { upsert: true }
          );
        });

        await Promise.all(videoPromises);
      })
    );

    console.log("Playlists and videos sync completed");
    return { message: "All Courses and Videos updated in db" };
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
