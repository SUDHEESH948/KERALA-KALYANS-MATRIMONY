import express from 'express'
import {
  loginAdmin,
  loginMember,
  registerMember,
  changePassword,
  getMe
} from '../controllers/authController.js'
import { authRateLimiter, changePasswordLimiter } from '../middleware/rateLimiter.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Registration
router.post('/register', registerMember)

// Logins with rate limiting
router.post('/login', authRateLimiter, loginAdmin)
router.post('/member-login', authRateLimiter, loginMember)

// Password management
router.post('/change-password', changePasswordLimiter, verifyToken, changePassword)

// Protected user profile
router.get('/me', verifyToken, getMe)

export default router
