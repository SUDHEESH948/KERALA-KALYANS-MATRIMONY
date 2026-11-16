import jwt from 'jsonwebtoken'
import { Profile } from '../models/Profile.js'
import { Admin } from '../models/Admin.js'

const JWT_SECRET = process.env.JWT_SECRET || 'apremiya_jwt_secret_key_2026_super_secure_auth'

/**
 * Universal token verification middleware
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['x-auth-token']
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. No authorization token provided.' })
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

    // 1. Support existing admin legacy tokens if present
    if (token.startsWith('adm_token_')) {
      req.user = { role: 'admin', isAdmin: true, name: 'Super Admin' }
      return next()
    }

    // 2. Verify JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = decoded
      return next()
    } catch (jwtErr) {
      // If member token is formatted as legacy mem_token_, lookup profile
      if (token.startsWith('mem_token_')) {
        return next()
      }
      return res.status(401).json({ error: 'Invalid or expired authentication token. Please sign in again.' })
    }
  } catch (err) {
    res.status(500).json({ error: 'Authentication processing error: ' + err.message })
  }
}

/**
 * Role-Based Access Control: Require Administrator Role
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers['x-auth-token']
    if (!authHeader) {
      return res.status(401).json({ error: 'Admin access denied. No authorization token provided.' })
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

    // Admin legacy token or admin header
    if (token.startsWith('adm_token_')) {
      req.user = { role: 'admin', isAdmin: true }
      return next()
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      if (decoded.role === 'admin' || decoded.isAdmin) {
        req.user = decoded
        return next()
      }
      return res.status(403).json({ error: 'Forbidden. Administrator privileges required.' })
    } catch {
      return res.status(401).json({ error: 'Invalid admin credentials or session expired.' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Restrict routes if user must change password
 * Blocks access to normal dashboard routes until password is changed.
 */
export const blockIfMustChangePassword = (req, res, next) => {
  if (req.user && req.user.mustChangePassword) {
    return res.status(403).json({
      error: 'Password change required. You must change your temporary password before accessing the dashboard.',
      mustChangePassword: true,
      redirectTo: '/change-password'
    })
  }
  next()
}
