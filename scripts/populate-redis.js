// This script will populate Redis with initial pricing data
const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function main() {
  try {
    // Initialize Redis client
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });

    // Check if data file exists
    const dataFilePath = path.join(process.cwd(), "data/pricing.json");
    let pricingData;

    if (fs.existsSync(dataFilePath)) {
      console.log('Reading pricing data from local file...');
      const data = fs.readFileSync(dataFilePath, "utf8");
      pricingData = JSON.parse(data);
    } else {
      console.log('No local file found, using default pricing plans...');
      pricingData = [
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
    }

    // Set the data in Redis
    console.log('Storing pricing data in Redis...');
    await redis.set('pricing_plans', pricingData);
    
    // Verify data was stored correctly
    const storedData = await redis.get('pricing_plans');
    console.log('Data stored in Redis:', storedData);
    console.log('Population complete!');
  } catch (error) {
    console.error('Error populating Redis:', error);
  }
}

main(); 