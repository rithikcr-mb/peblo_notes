/**
 * In-memory rate limiter to protect against basic API abuse.
 * 
 * IMPORTANT SERVERLESS LIMITATION:
 * In serverless/Edge environments, state is not shared across function instances (isolates).
 * This in-memory Map provides "best-effort" rate limiting per region/isolate.
 * For strict, globally synchronized rate-limiting, a solution like Vercel KV (Redis) + @upstash/ratelimit
 * should be used instead. For this project scope, in-memory is pragmatic and avoids infrastructure bloat.
 */

type RateLimitTracker = {
  count: number;
  resetTime: number;
};

const trackers = new Map<string, RateLimitTracker>();

export function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const tracker = trackers.get(identifier);

  // If no tracker exists, or the time window has expired, reset it
  if (!tracker || tracker.resetTime < now) {
    trackers.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  // If the user has exceeded their request limit
  if (tracker.count >= limit) {
    return { success: false, remaining: 0 };
  }

  // Otherwise, increment the count
  tracker.count += 1;
  return { success: true, remaining: limit - tracker.count };
}