import fs from "fs";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "data/pricing.json");

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Initialize with default pricing data if file doesn't exist
const initializeDataFile = () => {
  ensureDataDir();

  if (!fs.existsSync(dataFilePath)) {
    const defaultPricingPlans = [
      {
        id: "1",
        name: "Basic Bender",
        price: 29,
        interval: "monthly",
        description:
          "Perfect for beginners looking to start their coding journey.",
        features: [
          "Access to core courses",
          "Practice exercises",
          "Community forum access",
          "Monthly coding challenges",
          "Email support",
        ],
        isPopular: false,
      },
      {
        id: "2",
        name: "Master Bender",
        price: 89,
        interval: "monthly",
        description:
          "For serious learners ready to master the code of the Matrix.",
        features: [
          "All Basic features",
          "Advanced courses",
          "1-on-1 mentoring sessions",
          "Project reviews",
          "Priority support",
          "Certificate of completion",
          "Job opportunity alerts",
        ],
        isPopular: true,
      },
    ];

    fs.writeFileSync(
      dataFilePath,
      JSON.stringify(defaultPricingPlans, null, 2)
    );
  }
};

// GET /api/pricing - Get all pricing plans
export async function GET() {
  try {
    initializeDataFile();

    const data = fs.readFileSync(dataFilePath, "utf8");
    const plans = JSON.parse(data);

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error reading pricing data:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}

// POST /api/pricing - Update pricing plans
export async function POST(request: NextRequest) {
  try {
    ensureDataDir();

    const plans = await request.json();

    // Validate the data
    if (!Array.isArray(plans)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected an array of pricing plans." },
        { status: 400 }
      );
    }

    // Write the updated plans to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(plans, null, 2));

    return NextResponse.json({
      success: true,
      message: "Pricing plans updated successfully",
    });
  } catch (error) {
    console.error("Error updating pricing data:", error);
    return NextResponse.json(
      { error: "Failed to update pricing plans" },
      { status: 500 }
    );
  }
}
