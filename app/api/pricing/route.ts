import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data/pricing.json");

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Get default pricing data
const getDefaultPricingData = () => {
  return [
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
};

// Initialize with default pricing data if file doesn't exist
const initializeDataFile = () => {
  // In production (Vercel), we can't write to the filesystem
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  
  ensureDataDir();
  
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(getDefaultPricingData(), null, 2));
  }
};

// Read pricing data
const readPricingData = () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      // In production, use the embedded default data or fetch from a database
      // For now, returning default data
      // In a real application, this would be replaced with a database call
      return getDefaultPricingData();
    } else {
      // In development, use the local file
      if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, "utf8");
        return JSON.parse(data);
      } else {
        return getDefaultPricingData();
      }
    }
  } catch (error) {
    console.error("Error reading pricing data:", error);
    return getDefaultPricingData();
  }
};

// GET /api/pricing - Get all pricing plans
export async function GET() {
  try {
    initializeDataFile();
    
    const plans = readPricingData();
    
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
    const plans = await request.json();
    
    // Validate the data
    if (!Array.isArray(plans)) {
      return NextResponse.json(
        { error: "Invalid data format. Expected an array of pricing plans." },
        { status: 400 }
      );
    }
    
    // In production, we can't write to the filesystem
    if (process.env.NODE_ENV === 'production') {
      // In a real application, this would write to a database
      // For now, just simulate success
      console.log('Production environment detected - would save:', plans);
      return NextResponse.json({ 
        success: true, 
        message: "Pricing plans updated successfully (note: changes won't persist in production without a database)" 
      });
    }
    
    // In development, write to the local file
    ensureDataDir();
    fs.writeFileSync(dataFilePath, JSON.stringify(plans, null, 2));
    
    return NextResponse.json({ success: true, message: "Pricing plans updated successfully" });
  } catch (error) {
    console.error("Error updating pricing data:", error);
    return NextResponse.json(
      { error: "Failed to update pricing plans" },
      { status: 500 }
    );
  }
} 