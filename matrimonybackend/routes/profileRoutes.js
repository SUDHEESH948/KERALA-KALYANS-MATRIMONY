import express from 'express'
import multer from 'multer'
import { extractCandidateCard, saveCandidateCard } from '../controllers/cardUploadController.js'
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
const uploadCard = multer({
  storage: multer.memoryStorage(),
  // The multipart parser rejects files as soon as they reach this threshold.
  limits: { fileSize: 1_000_001, files: 1, fields: 0 }
}).single('image')

function requireCardAdmin(req, res, next) {
  const header = req.headers.authorization || req.headers['x-auth-token']
  if (header?.replace(/^Bearer /, '').startsWith('adm_token_')) {
    return res.status(401).json({ error: 'Sign in again to upload candidate cards.' })
  }
  return requireSignedAdmin(req, res, next)
}

router.get('/', getProfiles)
router.get('/admin', requireSignedAdmin, getProfiles)
router.get('/membership-status', requireSignedSession, getMembershipStatus)
router.get('/:id', requireSignedSession, getProfileById)
router.post('/', createProfile)
router.post('/seed-sample-matches', requireSignedAdmin, seedSampleMatches)
router.post('/bulk-import', requireSignedAdmin, bulkImportProfiles)
router.post('/upload-pdf', requireSignedAdmin, uploadBiodataPdf)
router.post('/card-extract', requireCardAdmin, (req, res, next) => {
  uploadCard(req, res, (error) => {
    if (error?.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Maximum card size is 1 MB.' })
    }
    if (error) return res.status(400).json({ error: 'Upload one image in the image field.' })
    return next()
  })
}, extractCandidateCard)
router.post('/card-save', requireCardAdmin, saveCandidateCard)

// Admin managed routes (with role-based access control)
router.put('/:id', requireSignedAdmin, updateProfile)
router.patch('/:id/verify', requireSignedAdmin, toggleVerifyProfile)
router.patch('/:id/approve', requireSignedAdmin, approveProfile)
router.patch('/:id/reject', requireSignedAdmin, rejectProfile)
router.post('/:id/resend-approval', requireSignedAdmin, resendApprovalEmail)
router.delete('/:id', requireSignedAdmin, deleteProfile)

export default router
