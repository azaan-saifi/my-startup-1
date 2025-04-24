import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Video from "@/lib/database/models/video.model";
import Course from "@/lib/database/models/courses.model";
import VideoProgress from "@/lib/database/models/videoProgress.model";

// GET /api/courses/[id]/videos - Get all videos for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const id = params.id;
    
    // Validate course exists
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }
    
    // Get videos for this course
    const videos = await Video.find({ courseId: id }).sort({ position: 1 });
    
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch videos", details: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/videos - Create a new video
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const id = params.id;
    const videoData = await request.json();
    
    // Validate course exists
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }
    
    // Basic validation
    if (!videoData.videoId || !videoData.title || !videoData.url) {
      return NextResponse.json(
        { error: "Missing required fields: videoId, title, and url are required" },
        { status: 400 }
      );
    }
    
    // Get the highest position to add new video at the end
    const highestPositionVideo = await Video.findOne({ courseId: id })
      .sort({ position: -1 })
      .limit(1);
      
    const nextPosition = highestPositionVideo ? highestPositionVideo.position + 1 : 1;
    
    // Create the video
    const newVideo = await Video.create({
      ...videoData,
      courseId: id,
      position: videoData.position || nextPosition,
      locked: videoData.locked !== undefined ? videoData.locked : true
    });
    
    // Update course lessons count
    const totalVideos = await Video.countDocuments({ courseId: id });
    await Course.findByIdAndUpdate(id, {
      lessons: `${totalVideos} lessons`,
      totalLessons: totalVideos
    });
    
    return NextResponse.json({
      success: true,
      message: "Video added successfully",
      video: newVideo
    });
  } catch (error) {
    console.error("Error creating video:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create video", details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id]/videos - Update a video
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const id = params.id;
    const { id: videoId, ...videoData } = await request.json();
    
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }
    
    // Verify this video belongs to the specified course
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo || existingVideo.courseId.toString() !== id) {
      return NextResponse.json(
        { error: "Video not found or doesn't belong to this course" },
        { status: 404 }
      );
    }
    
    // Update the video
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { ...videoData },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      message: "Video updated successfully",
      video: updatedVideo
    });
  } catch (error) {
    console.error("Error updating video:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update video", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]/videos - Delete a video
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const id = params.id;
    
    // Get the video ID from the URL
    const url = new URL(request.url);
    const videoId = url.searchParams.get("id");
    
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }
    
    // Verify this video belongs to the specified course
    const video = await Video.findById(videoId);
    if (!video || video.courseId.toString() !== id) {
      return NextResponse.json(
        { error: "Video not found or doesn't belong to this course" },
        { status: 404 }
      );
    }
    
    // Delete progress records for this video
    await VideoProgress.deleteMany({ videoId });
    
    // Delete the video
    await Video.findByIdAndDelete(videoId);
    
    // Update position of remaining videos
    const remainingVideos = await Video.find({
      courseId: id,
      position: { $gt: video.position }
    }).sort({ position: 1 });
    
    for (const video of remainingVideos) {
      await Video.findByIdAndUpdate(video._id, {
        position: video.position - 1
      });
    }
    
    // Update course lessons count
    const totalVideos = await Video.countDocuments({ courseId: id });
    await Course.findByIdAndUpdate(id, {
      lessons: `${totalVideos} lessons`,
      totalLessons: totalVideos
    });
    
    return NextResponse.json({
      success: true,
      message: "Video deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete video", details: errorMessage },
      { status: 500 }
    );
  }
} 