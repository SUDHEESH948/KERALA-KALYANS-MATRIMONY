import express from 'express'
import {
  getProfiles,
  getMembershipStatus,
  getProfileById,
  createProfile,
  updateProfile,
  toggleVerifyProfile,
  approveProfile,
  rejectProfile,
  resendApprovalEmail,
  deleteProfile,
  seedSampleMatches,
  bulkImportProfiles,
  uploadBiodataPdf
} from '../controllers/profileController.js'
import { requireSignedAdmin, requireSignedSession } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getProfiles)
router.get('/admin', requireSignedAdmin, getProfiles)
router.get('/membership-status', requireSignedSession, getMembershipStatus)
router.get('/:id', requireSignedSession, getProfileById)
router.post('/', createProfile)
router.post('/seed-sample-matches', requireSignedAdmin, seedSampleMatches)
router.post('/bulk-import', requireSignedAdmin, bulkImportProfiles)
router.post('/upload-pdf', requireSignedAdmin, uploadBiodataPdf)

// Admin managed routes (with role-based access control)
router.put('/:id', requireSignedAdmin, updateProfile)
router.patch('/:id/verify', requireSignedAdmin, toggleVerifyProfile)
router.patch('/:id/approve', requireSignedAdmin, approveProfile)
router.patch('/:id/reject', requireSignedAdmin, rejectProfile)
router.post('/:id/resend-approval', requireSignedAdmin, resendApprovalEmail)
router.delete('/:id', requireSignedAdmin, deleteProfile)

export default router
