import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Course from "@/lib/database/models/courses.model";
import Video from "@/lib/database/models/video.model";
import VideoProgress from "@/lib/database/models/videoProgress.model";
import { importVideosFromPlaylist } from "@/lib/actions/youtube.action";

// Helper function to extract video ID from YouTube URL
function extractYouTubeVideoId(url: string): string | null {
  // Regular expressions to match various YouTube URL formats
  const regexps = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^/?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/[^/?]+\/\?v=([^&]+)/i
  ];

  for (const regex of regexps) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

// Helper function to get YouTube thumbnail URL from video ID
function getYouTubeThumbnailUrl(videoId: string): string {
  // Return the high quality thumbnail URL
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// GET /api/courses/[id] - Get a specific course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Wait for params to resolve to fix NextJS warning
    const { id } = await Promise.resolve(params);
    
    // Find the course by ID
    const course = await Course.findById(id);
    
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error fetching course:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch course", details: errorMessage },
      { status: 500 }
    );
  }
} 

// PUT /api/courses/[id] - Replace a course entirely
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Wait for params to resolve to fix NextJS warning
    const { id } = await Promise.resolve(params);
    const courseData = await request.json();
    
    // Get the existing course to check if playlistId changed
    const existingCourse = await Course.findById(id);
    
    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }
    
    // Check if a YouTube URL was provided instead of a thumbnail
    if (courseData.youtubeUrl && !courseData.thumbnail) {
      const videoId = extractYouTubeVideoId(courseData.youtubeUrl);
      if (videoId) {
        courseData.thumbnail = getYouTubeThumbnailUrl(videoId);
      }
    }
    
    // If no thumbnail is provided, keep the existing one
    if (!courseData.thumbnail) {
      courseData.thumbnail = existingCourse.thumbnail;
    }
    
    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { ...courseData },
      { new: true, runValidators: true }
    );
    
    // If playlistId has been added or changed, import videos from the playlist
    let videosImported = false;
    let importedVideos = [];
    
    const playlistChanged = courseData.playlistId && courseData.playlistId !== existingCourse.playlistId;
    if (playlistChanged) {
      try {
        // First update the course to ensure the thumbnail is available for video import
        await Course.findByIdAndUpdate(
          id,
          { thumbnail: courseData.thumbnail },
          { new: true }
        );
        
        // Now import the videos, which will use the course thumbnail
        const videosData = await importVideosFromPlaylist(id, courseData.playlistId);
        importedVideos = JSON.parse(videosData);
        videosImported = true;
      } catch (importError) {
        console.error("Error importing videos from playlist:", importError);
        // Continue with course update even if video import fails
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
      videosImported,
      videosCount: importedVideos.length
    });
  } catch (error) {
    console.error("Error updating course:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update course", details: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id] - Update course fields partially
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Wait for params to resolve to fix NextJS warning
    const { id } = await Promise.resolve(params);
    const courseData = await request.json();
    
    // Get the existing course to check if playlistId changed
    const existingCourse = await Course.findById(id);
    
    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }
    
    // Check if a YouTube URL was provided instead of a thumbnail
    if (courseData.youtubeUrl && !courseData.thumbnail) {
      const videoId = extractYouTubeVideoId(courseData.youtubeUrl);
      if (videoId) {
        courseData.thumbnail = getYouTubeThumbnailUrl(videoId);
      }
    }
    
    // If no thumbnail is provided, keep the existing one
    if (!courseData.thumbnail) {
      courseData.thumbnail = existingCourse.thumbnail;
    }
    
    // Update the course with partial data
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: courseData },
      { new: true, runValidators: true }
    );
    
    // If playlistId has been added or changed, import videos from the playlist
    let videosImported = false;
    let importedVideos = [];
    
    const playlistChanged = courseData.playlistId && courseData.playlistId !== existingCourse.playlistId;
    if (playlistChanged) {
      try {
        // First update the course to ensure the thumbnail is available for video import
        await Course.findByIdAndUpdate(
          id,
          { thumbnail: courseData.thumbnail },
          { new: true }
        );
        
        // Now import the videos, which will use the course thumbnail
        const videosData = await importVideosFromPlaylist(id, courseData.playlistId);
        importedVideos = JSON.parse(videosData);
        videosImported = true;
      } catch (importError) {
        console.error("Error importing videos from playlist:", importError);
        // Continue with course update even if video import fails
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Course partially updated successfully",
      course: updatedCourse,
      videosImported,
      videosCount: importedVideos.length
    });
  } catch (error) {
    console.error("Error updating course:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update course", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a course and all related videos
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Wait for params to resolve to fix NextJS warning
    const { id } = await Promise.resolve(params);
    
    // Find all videos for this course
    const videos = await Video.find({ courseId: id });
    const videoIds = videos.map(video => video._id);
    
    // Delete all video progress records for these videos
    await VideoProgress.deleteMany({ videoId: { $in: videoIds } });
    
    // Delete all videos for this course
    await Video.deleteMany({ courseId: id });
    
    // Delete the course
    const deletedCourse = await Course.findByIdAndDelete(id);
    
    if (!deletedCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Course and all associated videos deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete course", details: errorMessage },
      { status: 500 }
    );
  }
}