import rateLimit from 'express-rate-limit'

/**
 * Rate limiter for sensitive authentication endpoints (Login & Password Change)
 * Limit each IP to 10 requests per 15 minutes window.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
})

/**
 * Strict limiter for change password endpoint
 */
export const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many password change attempts. Please try again after 15 minutes.'
  }
})
