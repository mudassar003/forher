// src/lib/rateLimiter.ts
import { NextRequest } from 'next/server';

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max requests per interval
}

interface TokenBucket {
  count: number;
  lastRefill: number;
}

// In-memory storage for rate limiting (use Redis in production)
const tokenBuckets = new Map<string, TokenBucket>();

export class RateLimiter {
  private interval: number;
  private maxRequests: number;

  constructor(options: RateLimitOptions) {
    this.interval = options.interval;
    this.maxRequests = options.uniqueTokenPerInterval;
  }

  private getClientIdentifier(req: NextRequest): string {
    // Try to get IP from various headers (for deployment environments)
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = req.headers.get('x-client-ip');
    
    const ip = forwarded?.split(',')[0]?.trim() || 
               realIp || 
               clientIp || 
               req.headers.get('cf-connecting-ip') || // Cloudflare
               '127.0.0.1';
    
    return ip;
  }

  public async check(req: NextRequest): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
    const identifier = this.getClientIdentifier(req);
    const now = Date.now();
    
    let bucket = tokenBuckets.get(identifier);
    
    if (!bucket || now - bucket.lastRefill >= this.interval) {
      // Create new bucket or refill existing one
      bucket = {
        count: this.maxRequests - 1,
        lastRefill: now
      };
      tokenBuckets.set(identifier, bucket);
      
      return {
        success: true,
        limit: this.maxRequests,
        remaining: bucket.count,
        resetTime: now + this.interval
      };
    }
    
    if (bucket.count <= 0) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        resetTime: bucket.lastRefill + this.interval
      };
    }
    
    bucket.count--;
    
    return {
      success: true,
      limit: this.maxRequests,
      remaining: bucket.count,
      resetTime: bucket.lastRefill + this.interval
    };
  }
}

// Cleanup old buckets periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [key, bucket] of tokenBuckets.entries()) {
      if (now - bucket.lastRefill > oneHour) {
        tokenBuckets.delete(key);
      }
    }
  }, 15 * 60 * 1000); // Clean up every 15 minutes
}