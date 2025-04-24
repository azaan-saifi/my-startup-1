# Deployment Guide for Admin Panel Pricing Management Feature

This document provides instructions for deploying the admin panel pricing management feature, which now uses MongoDB to store pricing plans instead of a JSON file.

## Prerequisites

1. A MongoDB Atlas database (or other MongoDB provider)
2. Proper environment variables set up in Vercel

## Environment Variables

Ensure the following environment variable is set in your Vercel project:

- `MONGODB_URL`: Your MongoDB connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/my-startup?retryWrites=true&w=majority`)

## Migration Process

The application includes automatic data migration that will be triggered when:

1. The first API request to `/api/pricing` is made
2. No pricing data exists in the MongoDB database

The migration process will:
- Check if pricing data already exists in MongoDB
- If not, it will look for the `data/pricing.json` file
- If the JSON file exists, it will import that data into MongoDB
- If the JSON file doesn't exist, it will create default pricing plans

## Manual Data Migration

If you want to manually trigger the migration before deploying, you can run:

```bash
# First, build the project
npm run build

# Then run the migration script
node -r ts-node/register scripts/migrate-pricing.ts
```

## Deployment Steps

1. Commit all changes to your Git repository
2. Push to your Vercel-connected repository
3. Vercel will automatically build and deploy the application
4. The first time the pricing page is accessed, the data will be migrated to MongoDB if needed

## Testing the Deployment

After deployment, verify that:

1. The pricing page shows the correct pricing plans
2. The admin panel's pricing management page loads correctly
3. You can create, edit, and delete pricing plans
4. Changes are saved to the database and persist across page refreshes and redeployments

## Troubleshooting

If you encounter issues:

1. Check that your MongoDB connection string is correct
2. Verify that your MongoDB user has read/write permissions
3. Check the Vercel function logs for any errors
4. Ensure your IP address is whitelisted in MongoDB Atlas if applicable

## Rollback Plan

If necessary, you can roll back to the previous JSON-based implementation by:

1. Reverting the code changes
2. Redeploying to Vercel 