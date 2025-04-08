import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { redis, getPricingPlans, setPricingPlans } from "@/lib/redis";

const dataFilePath = path.join(process.cwd(), "data/pricing.json");

// Default pricing data
const defaultPricingPlans = [
  {
    id: "1",
    name: "Basic Bender",
    price: 29,
    interval: "monthly",
    description: "Perfect for beginners looking to start their coding journey.",
    features: [
      "Access to core courses",
      "Practice exercises",
      "Community forum access",
      "Monthly coding challenges",
      "Email support"
    ],
    isPopular: false,
  },
  {
    id: "2",
    name: "Master Bender",
    price: 89,
    interval: "monthly",
    description: "For serious learners ready to master the code of the Matrix.",
    features: [
      "All Basic features",
      "Advanced courses",
      "1-on-1 mentoring sessions",
      "Project reviews",
      "Priority support",
      "Certificate of completion",
      "Job opportunity alerts"
    ],
    isPopular: true,
  }
];

// GET /api/pricing - Get all pricing plans
export async function GET() {
  try {
    // Try to get pricing plans from Redis
    let plans = await getPricingPlans();
    
    // If no data in Redis, try to read from file as fallback
    if (!plans) {
      try {
        if (fs.existsSync(dataFilePath)) {
          const data = fs.readFileSync(dataFilePath, "utf8");
          plans = JSON.parse(data);
          
          // Store in Redis for future use
          await setPricingPlans(plans);
        } else {
          // Use default plans if no file exists
          plans = defaultPricingPlans;
          
          // Store default plans in Redis
          await setPricingPlans(plans);
        }
      } catch (fileError) {
        console.error("Error reading from file, using defaults:", fileError);
        plans = defaultPricingPlans;
        await setPricingPlans(plans);
      }
    }
    
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching pricing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}

// POST /api/pricing - Update pricing plans
export async function POST(request: NextRequest) {
  try {
    const plans = await request.json();
    
    // Validate the data
    if (!Array.isArray(plans)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected an array of pricing plans." },
        { status: 400 }
      );
    }
    
    // Store in Redis
    const success = await setPricingPlans(plans);
    
    if (!success) {
      throw new Error("Failed to save pricing plans to Redis");
    }
    
    // Also update the file as backup
    try {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(dataFilePath, JSON.stringify(plans, null, 2));
    } catch (fileError) {
      console.error("Warning: Could not write to backup file:", fileError);
      // Continue even if file write fails, as Redis is our primary storage
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Pricing plans updated successfully" 
    });
  } catch (error) {
    console.error("Error updating pricing data:", error);
    return NextResponse.json(
      { error: "Failed to update pricing plans" },
      { status: 500 }
    );
  }
} 