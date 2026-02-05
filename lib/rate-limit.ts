import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory store for development (when Redis is not configured)
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  async increment(key: string, limit: number, window: number): Promise<{ success: boolean; remaining: number }> {
    const now = Date.now()
    const record = this.store.get(key)

    if (!record || now > record.resetTime) {
      // Reset window
      this.store.set(key, { count: 1, resetTime: now + window })
      return { success: true, remaining: limit - 1 }
    }

    if (record.count >= limit) {
      return { success: false, remaining: 0 }
    }

    record.count++
    this.store.set(key, record)
    return { success: true, remaining: limit - record.count }
  }
}

// Create rate limiter instance (uses Redis if configured, otherwise in-memory)
function createRateLimiter(prefix: string, limit: number, windowMs: number) {
  // Check if Redis is configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (redisUrl && redisToken) {
    // Use Upstash Redis
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
      prefix,
    })
  }

  // Fallback to in-memory store
  const memoryStore = new MemoryStore()
  
  return {
    async limit(identifier: string) {
      const result = await memoryStore.increment(
        `${prefix}:${identifier}`,
        limit,
        windowMs
      )
      return {
        success: result.success,
        limit,
        remaining: result.remaining,
        reset: Date.now() + windowMs,
      }
    },
  }
}

// Rate limiters for different endpoints
export const loginRateLimiter = createRateLimiter(
  'ratelimit:login',
  5, // 5 attempts
  15 * 60 * 1000 // per 15 minutes
)

export const registerRateLimiter = createRateLimiter(
  'ratelimit:register',
  3, // 3 attempts
  60 * 60 * 1000 // per hour
)
