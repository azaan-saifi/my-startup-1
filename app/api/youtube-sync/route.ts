import { NextResponse } from "next/server";

import Course from "@/lib/database/models/courses.model";
import {
  ProcessedVideo,
  VideoTranscript,
} from "@/lib/database/models/transcript.model";
import Video from "@/lib/database/models/video.model";
import { connectToDatabase } from "@/lib/database/mongoose";

// Configure Vercel Cron to run this API route every 30 days
export const config = {
  runtime: "edge",
  maxDuration: 300, // 5 minutes, adjust as needed
};

// Define a CRON schedule of "0 0 1,16 * *" which runs at midnight on the 1st and 16th of each month
// Effectively runs approximately every 15-16 days
// For Vercel Cron jobs, see: https://vercel.com/docs/cron-jobs
export const dynamic = "force-dynamic";

// Type definition for video data
interface VideoData {
  videoId: string;
  title: string;
}

// GET /api/youtube-sync - Manually trigger YouTube content sync
// Also runs automatically via Vercel Cron
export async function GET() {
  try {
    const result = await syncYoutubeContent();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in YouTube sync API:", error);
    return NextResponse.json(
      { error: "Failed to sync YouTube content" },
      { status: 500 }
    );
  }
}

async function syncYoutubeContent() {
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

    // To track newly added videos for transcript processing
    const newVideos: VideoData[] = [];

    // Process playlists in parallel
    console.log(`Processing ${result.items.length} playlists...`);
    await Promise.all(
      result.items.map(
        async (playlist: {
          title: string;
          videoCountText: string;
          thumbnails?: { url: string }[];
          id: string;
        }) => {
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
          const videoPromises = videosResult.items.map(
            async (video: {
              id: string;
              title: string;
              description?: string;
              thumbnails?: { url: string }[];
              lengthText?: string;
              index?: number;
            }) => {
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

              // Check if this video has already been processed for transcripts
              const processedVideo = await ProcessedVideo.findOne({
                videoId: video.id,
              });

              // If video doesn't exist in ProcessedVideo collection, mark for transcript processing
              if (!processedVideo) {
                // Check if we already have the transcript
                const existingTranscript = await VideoTranscript.findOne({
                  videoId: video.id,
                });

                if (!existingTranscript) {
                  newVideos.push({
                    videoId: video.id,
                    title: video.title,
                  });
                }
              }

              return Video.findOneAndUpdate(
                { videoId: videoData.videoId, courseId: course._id },
                videoData,
                { upsert: true }
              );
            }
          );

          await Promise.all(videoPromises);
        }
      )
    );

    console.log("Playlists and videos sync completed");

    // Process transcripts for new videos
    if (newVideos.length > 0) {
      console.log(
        `Processing transcripts for ${newVideos.length} new videos...`
      );
      await processVideoTranscripts(newVideos);
    } else {
      console.log("No new videos to process transcripts for");
    }

    return {
      success: true,
      message: "All Courses and Videos updated in db",
      transcriptsProcessed: newVideos.length,
    };
  } catch (error) {
    console.error("Error in syncYoutubeContent:", error);
    throw error;
  }
}

// Process transcripts for new videos
async function processVideoTranscripts(videos: VideoData[]) {
  try {
    // Process each video sequentially to avoid rate limiting
    for (const video of videos) {
      try {
        console.log(`Fetching transcript for video: ${video.videoId}`);

        // Create record to mark that processing has started
        await ProcessedVideo.findOneAndUpdate(
          { videoId: video.videoId },
          {
            videoId: video.videoId,
            processed: false,
            processingFailed: false,
          },
          { upsert: true }
        );

        // Fetch transcript
        const transcriptUrl = `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/download-json/${video.videoId}?language=en`;
        const options = {
          method: "GET",
          headers: {
            "x-rapidapi-key": process.env.RAPID_API_KEY!,
            "x-rapidapi-host": process.env.RAPID_API_TRANSCRIPT_HOST!,
          },
        };

        const response = await fetch(transcriptUrl, options);
        if (!response.ok) {
          throw new Error(`Failed to fetch transcript: ${response.statusText}`);
        }

        const transcriptData = await response.json();

        // Validate transcript data
        if (!Array.isArray(transcriptData)) {
          throw new Error("Invalid transcript data format");
        }

        // Store the full transcript in MongoDB
        await VideoTranscript.findOneAndUpdate(
          { videoId: video.videoId },
          {
            videoId: video.videoId,
            videoTitle: video.title,
            transcript: JSON.stringify(transcriptData),
            updatedAt: new Date(),
          },
          { upsert: true }
        );

        // Mark video as processed
        await ProcessedVideo.findOneAndUpdate(
          { videoId: video.videoId },
          {
            processed: true,
            processingFailed: false,
            updatedAt: new Date(),
          }
        );

        console.log(
          `Successfully processed transcript for video: ${video.videoId}`
        );
      } catch (error) {
        console.error(
          `Error processing transcript for video ${video.videoId}:`,
          error
        );

        // Mark as failed
        await ProcessedVideo.findOneAndUpdate(
          { videoId: video.videoId },
          {
            processed: false,
            processingFailed: true,
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
            updatedAt: new Date(),
          }
        );
      }

      // Add a small delay between video processing to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Error processing video transcripts:", error);
    throw error;
  }
}
