import { Redis } from '@upstash/redis'

// Initialize Redis client
export const redis = new Redis({
  url: process.env.KV_REST_API_URL || 'https://real-seal-60549.upstash.io',
  token: process.env.KV_REST_API_TOKEN || 'AeyFAAIjcDEwZGQ2MjhlMDgxZmY0MmM1YmI1NzYwZDBmMGVjMjhlZnAxMA',
})

// Helper functions for pricing data
export async function getPricingPlans() {
  try {
    const data = await redis.get('pricing_plans')
    return data || null
  } catch (error) {
    console.error('Error fetching pricing data from Redis:', error)
    return null
  }
}

export async function setPricingPlans(plans: any) {
  try {
    await redis.set('pricing_plans', plans)
    return true
  } catch (error) {
    console.error('Error setting pricing data in Redis:', error)
    return false
  }
} 