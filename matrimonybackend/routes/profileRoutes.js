import express from 'express'
import {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  toggleVerifyProfile,
  approveProfile,
  rejectProfile,
  resendApprovalEmail,
  deleteProfile,
  seedSampleMatches
} from '../controllers/profileController.js'
import { requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Public member routes
router.get('/', getProfiles)
router.get('/:id', getProfileById)
router.post('/', createProfile)
router.post('/seed-sample-matches', seedSampleMatches)

// Admin managed routes (with role-based access control)
router.put('/:id', requireAdmin, updateProfile)
router.patch('/:id/verify', requireAdmin, toggleVerifyProfile)
router.patch('/:id/approve', requireAdmin, approveProfile)
router.patch('/:id/reject', requireAdmin, rejectProfile)
router.post('/:id/resend-approval', requireAdmin, resendApprovalEmail)
router.delete('/:id', requireAdmin, deleteProfile)

export default router
