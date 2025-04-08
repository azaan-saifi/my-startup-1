# Deploying to Vercel

This document outlines the steps to deploy the application to Vercel with Redis support.

## Environment Variables

Ensure the following environment variables are set in the Vercel project settings:

```
KV_URL="rediss://default:AeyFAAIjcDEwZGQ2MjhlMDgxZmY0MmM1YmI1NzYwZDBmMGVjMjhlZnAxMA@real-seal-60549.upstash.io:6379"
KV_REST_API_READ_ONLY_TOKEN="AuyFAAIgcDGBRm2nCOI50UAPuJIXzJpJ3qyhxe2NpD6DdoPX4jX0nw"
REDIS_URL="rediss://default:AeyFAAIjcDEwZGQ2MjhlMDgxZmY0MmM1YmI1NzYwZDBmMGVjMjhlZnAxMA@real-seal-60549.upstash.io:6379"
KV_REST_API_TOKEN="AeyFAAIjcDEwZGQ2MjhlMDgxZmY0MmM1YmI1NzYwZDBmMGVjMjhlZnAxMA"
KV_REST_API_URL="https://real-seal-60549.upstash.io"
```

## Deploy Steps

1. Push your code to a Git repository.
2. Connect your repository to Vercel.
3. During deployment, Vercel will:
   - Read the environment variables
   - Run the build command, which includes populating Redis using `npm run populate-redis`
   - Build the application using `next build`
   - Deploy the application

## Troubleshooting

If you encounter issues with Redis during deployment:

1. Check that all environment variables are correctly set in Vercel.
2. Verify that Redis connection is working by checking the build logs.
3. Ensure the `vercel.json` file is in the root of your project.
4. Check that the `next.config.js` file is properly configured.

## Testing Redis Connection

After deployment, you can verify the Redis connection by:

1. Visiting the pricing page to see if data loads correctly
2. Making changes in the admin panel and checking if they persist

## Manual Redis Population

If needed, you can manually populate Redis with initial data by running:

```bash
npm run populate-redis
```

This will read the data from the local JSON file and store it in Redis. 