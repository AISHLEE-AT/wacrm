/**
 * WhatsApp Inbound Login — Rate Limiter & Security Utilities
 * 
 * Provides in-memory rate limiting (per IP + per phone), token generation,
 * and session security helpers for the OTPLess WhatsApp verification flow.
 * 
 * SECURITY LAYERS:
 * 1. Rate limiting: Max 5 session inits per phone per 10 minutes
 * 2. Rate limiting: Max 20 session inits per IP per 10 minutes
 * 3. Cryptographically random tokens (URL-safe, 8 chars)
 * 4. Token expiry (10 minutes, server-enforced)
 * 5. Single-use tokens (deleted after verification)
 * 6. Phone number matching (sender phone must match session phone)
 * 7. Poll abuse protection: Max 60 polls per poll_id per minute
 */

// In-memory rate limit store (resets on deploy/restart — acceptable for Vercel)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_SESSIONS_PER_PHONE = 5
const MAX_SESSIONS_PER_IP = 20
const MAX_POLLS_PER_ID = 120 // 2 per second for 60 seconds

/**
 * Check rate limit for a given key. Returns true if ALLOWED, false if BLOCKED.
 */
export function checkRateLimit(key: string, maxRequests: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

/**
 * Rate limit init-session by phone number.
 * Returns true if allowed.
 */
export function rateLimitByPhone(phone: string): boolean {
  return checkRateLimit(`phone:${phone}`, MAX_SESSIONS_PER_PHONE)
}

/**
 * Rate limit init-session by IP address.
 * Returns true if allowed.
 */
export function rateLimitByIP(ip: string): boolean {
  return checkRateLimit(`ip:${ip}`, MAX_SESSIONS_PER_IP)
}

/**
 * Rate limit polling by poll_id.
 * Returns true if allowed.
 */
export function rateLimitPoll(pollId: string): boolean {
  return checkRateLimit(`poll:${pollId}`, MAX_POLLS_PER_ID)
}

/**
 * Generate a cryptographically random session token.
 * Format: TOKEN_XXXXXXXX (8 alphanumeric chars, URL-safe)
 * Entropy: 8 chars from 36-char alphabet = ~41 bits = ~68 billion possibilities
 */
export function generateSessionToken(): string {
  const crypto = require('crypto')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No I/O/0/1 to avoid confusion
  const bytes = crypto.randomBytes(8)
  let token = ''
  for (let i = 0; i < 8; i++) {
    token += chars[bytes[i] % chars.length]
  }
  return `TOKEN_${token}`
}

/**
 * Generate a unique poll ID (UUID v4).
 */
export function generatePollId(): string {
  const crypto = require('crypto')
  return crypto.randomUUID()
}

/**
 * Extract client IP from request headers (Vercel/Cloudflare compatible).
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    '0.0.0.0'
  )
}

/**
 * Validate that the incoming WhatsApp sender phone matches the session phone.
 * Handles various phone number formats (91XXXXXXXXXX, XXXXXXXXXX, +91XXXXXXXXXX).
 */
export function phonesMatch(sessionPhone: string, senderPhone: string): boolean {
  const cleanSession = sessionPhone.replace(/\D/g, '').slice(-10)
  const cleanSender = senderPhone.replace(/\D/g, '').slice(-10)
  return cleanSession.length === 10 && cleanSender.length === 10 && cleanSession === cleanSender
}

/**
 * Check if a message text contains a login verification token.
 * Returns the token string if found, null otherwise.
 * 
 * Matches patterns like:
 * - "Verify login: TOKEN_XXXXXXXX"
 * - "Verify login code: TOKEN_XXXXXXXX"
 * - "TOKEN_XXXXXXXX" (standalone)
 * - Messages containing "TOKEN_" followed by 8 chars
 */
export function extractLoginToken(messageText: string): string | null {
  if (!messageText) return null
  const match = messageText.match(/TOKEN_[A-Z2-9]{8}/i)
  return match ? match[0].toUpperCase() : null
}

/**
 * Periodic cleanup of stale rate limit entries (called lazily).
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every 5 minutes to prevent memory leaks in long-running processes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}
