import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    // Set a test value in Redis
    const testKey = "redis_test_" + Date.now();
    await redis.set(testKey, "Redis connection is working!");
    
    // Get the test value back from Redis
    const testValue = await redis.get(testKey);
    
    // Clean up by deleting the test key
    await redis.del(testKey);
    
    return NextResponse.json({
      success: true,
      message: "Redis connection successful",
      testValue,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Redis connection test failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Redis connection failed",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 