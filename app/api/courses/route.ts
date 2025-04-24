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

// GET /api/courses - Get all courses
export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch courses from MongoDB
    const courses = await Course.find({}).sort({ title: 1 });
    
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch courses", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // For the admin panel, we'll skip authentication for now
    // TODO: Add proper authentication check
    
    const courseData = await request.json();
    
    // Basic validation for title
    if (!courseData.title) {
      return NextResponse.json(
        { error: "Missing required field: title is required" },
        { status: 400 }
      );
    }
    
    // Check if a YouTube URL was provided instead of a thumbnail
    if (courseData.youtubeUrl && !courseData.thumbnail) {
      const videoId = extractYouTubeVideoId(courseData.youtubeUrl);
      if (videoId) {
        courseData.thumbnail = getYouTubeThumbnailUrl(videoId);
      }
    }
    
    // Ensure we have a thumbnail one way or another
    if (!courseData.thumbnail) {
      return NextResponse.json(
        { error: "Either thumbnail or a valid YouTube URL is required" },
        { status: 400 }
      );
    }
    
    // Create the course
    const newCourse = await Course.create({
      title: courseData.title,
      thumbnail: courseData.thumbnail,
      youtubeUrl: courseData.youtubeUrl || null,
      lessons: courseData.lessons || "0 lessons",
      playlistId: courseData.playlistId || null,
      enrolled: false,
      progress: 0,
      completedLessons: 0,
      totalLessons: 0
    });
    
    // If playlistId is provided, import videos from the playlist
    let videosImported = false;
    let importedVideos = [];
    
    if (courseData.playlistId) {
      try {
        // Make sure the course is fully saved with its thumbnail before importing videos
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Now import the videos, which will use the course thumbnail
        const videosData = await importVideosFromPlaylist(newCourse._id.toString(), courseData.playlistId);
        importedVideos = JSON.parse(videosData);
        videosImported = true;
      } catch (importError) {
        console.error("Error importing videos from playlist:", importError);
        // Continue with course creation even if video import fails
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Course created successfully",
      course: newCourse,
      videosImported,
      videosCount: importedVideos.length
    });
  } catch (error) {
    console.error("Error creating course:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create course", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/courses - Update a course
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { id, ...courseData } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }
    
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

// DELETE /api/courses - Delete a course and all related videos
export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get the course ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }
    
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