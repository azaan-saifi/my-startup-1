import mongoose from "mongoose";
import { NextResponse } from "next/server";

import VideoProgress from "@/lib/database/models/videoProgress.model";
import { connectToDatabase } from "@/lib/database/mongoose";

export async function GET() {
  try {
    await connectToDatabase();

    // Generate valid ObjectIds
    const videoId = new mongoose.Types.ObjectId().toString();
    const courseId = new mongoose.Types.ObjectId().toString();
    const timestamp = Math.floor(Date.now() / 1000) % 1000; // Use current time as a unique value

    // Test 1: Direct document creation
    console.log("TEST 1: Direct document creation");
    const testData1 = {
      userId: "test-user-1",
      videoId,
      courseId,
      watchedPercent: 50,
      playbackPositionSeconds: timestamp,
      completed: false,
      lastWatchedAt: new Date(),
    };

    console.log("Test data 1 being sent to MongoDB:", testData1);
    const testDoc1 = new VideoProgress(testData1);
    await testDoc1.save();
    console.log("Saved test document 1:", testDoc1);

    // Retrieve to verify
    const retrievedDoc1 = await VideoProgress.findById(testDoc1._id);
    console.log("Retrieved document 1:", retrievedDoc1);

    // Test 2: Find and update approach
    console.log("TEST 2: Find and update approach");
    let testDoc2;
    const existingDoc = await VideoProgress.findOne({
      userId: "test-user-2",
      videoId,
    });

    if (existingDoc) {
      existingDoc.watchedPercent = 60;
      existingDoc.playbackPositionSeconds = timestamp + 1;
      existingDoc.lastWatchedAt = new Date();
      await existingDoc.save();
      testDoc2 = existingDoc;
      console.log("Updated existing document 2:", testDoc2);
    } else {
      const testData2 = {
        userId: "test-user-2",
        videoId,
        courseId,
        watchedPercent: 60,
        playbackPositionSeconds: timestamp + 1,
        completed: false,
        lastWatchedAt: new Date(),
      };
      testDoc2 = new VideoProgress(testData2);
      await testDoc2.save();
      console.log("Created new document 2:", testDoc2);
    }

    // Retrieve to verify
    const retrievedDoc2 = await VideoProgress.findById(testDoc2._id);
    console.log("Retrieved document 2:", retrievedDoc2);

    // Test 3: findOneAndUpdate approach
    console.log("TEST 3: findOneAndUpdate approach");
    const testData3 = {
      userId: "test-user-3",
      videoId,
      courseId,
      watchedPercent: 70,
      playbackPositionSeconds: timestamp + 2,
      completed: false,
      lastWatchedAt: new Date(),
    };

    const testDoc3 = await VideoProgress.findOneAndUpdate(
      { userId: "test-user-3", videoId },
      testData3,
      { upsert: true, new: true }
    );
    console.log("findOneAndUpdate result for document 3:", testDoc3);

    // Retrieve to verify
    const retrievedDoc3 = await VideoProgress.findById(testDoc3._id);
    console.log("Retrieved document 3:", retrievedDoc3);

    return NextResponse.json({
      success: true,
      message: "Tests completed",
      results: {
        test1: {
          input: testData1,
          saved: testDoc1,
          retrieved: retrievedDoc1,
        },
        test2: {
          saved: testDoc2,
          retrieved: retrievedDoc2,
        },
        test3: {
          input: testData3,
          saved: testDoc3,
          retrieved: retrievedDoc3,
        },
      },
    });
  } catch (error) {
    console.error("Error in test-progress API:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
