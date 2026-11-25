import express from 'express'
import {
  requestPhotoAccess,
  respondPhotoAccess,
  getEphemeralPhotoToken,
  streamSecurePhoto
} from '../controllers/photoSecurityController.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Authenticated photo privacy workflow
router.post('/request-access', verifyToken, requestPhotoAccess)
router.post('/respond-access', verifyToken, respondPhotoAccess)
router.post('/ephemeral-token', verifyToken, getEphemeralPhotoToken)

// Public binary stream verified via token parameter
router.get('/stream', streamSecurePhoto)

export default router
