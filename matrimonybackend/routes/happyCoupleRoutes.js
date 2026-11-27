import express from 'express'
import mongoose from 'mongoose'
import { HappyCouple } from '../models/HappyCouple.js'
import { requireSignedAdmin } from '../middleware/auth.js'

const router = express.Router()

const MAX_IMAGE_CHARS = 3_000_000
const MAX_HAPPY_COUPLES = 10

const isValidImageString = (value) => {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_IMAGE_CHARS) return false
  return /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(trimmed) ||
    /^https?:\/\/.+/i.test(trimmed)
}

// Public: list all happy couples (newest first)
router.get('/', async (_req, res) => {
  try {
    const couples = await HappyCouple.find()
      .sort({ createdAt: -1 })
      .select('image coupleName location caption createdAt')
      .lean()
    res.set('Cache-Control', 'no-store').json(couples)
  } catch {
    res.status(500).json({ error: 'Could not load happy couples.' })
  }
})

// Admin: add a happy couple image
router.post('/', requireSignedAdmin, async (req, res) => {
  const image = typeof req.body?.image === 'string' ? req.body.image.trim() : ''
  const coupleName = typeof req.body?.coupleName === 'string' ? req.body.coupleName.trim().slice(0, 100) : ''
  const location = typeof req.body?.location === 'string' ? req.body.location.trim().slice(0, 100) : ''
  const caption = typeof req.body?.caption === 'string' ? req.body.caption.trim().slice(0, 240) : ''

  if (!isValidImageString(image)) {
    return res.status(400).json({ error: 'Please upload a valid JPEG, PNG, or WebP image (under 2 MB).' })
  }

  try {
    const existingCount = await HappyCouple.countDocuments()
    if (existingCount >= MAX_HAPPY_COUPLES) {
      return res.status(400).json({
        error: `Maximum limit of ${MAX_HAPPY_COUPLES} Happy Couple images reached. Remove an existing image to add a new one.`,
      })
    }

    const created = await HappyCouple.create({
      image,
      coupleName,
      location,
      caption,
    })
    res.status(201).json({
      _id: created._id,
      image: created.image,
      coupleName: created.coupleName,
      location: created.location,
      caption: created.caption,
      createdAt: created.createdAt,
    })
  } catch {
    res.status(500).json({ error: 'Could not save happy couple image.' })
  }
})

// Admin: remove a happy couple image
router.delete('/:id', requireSignedAdmin, async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid happy couple ID.' })
  }

  try {
    const deleted = await HappyCouple.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ error: 'Happy couple entry not found.' })
    }
    res.json({ ok: true, id })
  } catch {
    res.status(500).json({ error: 'Could not delete happy couple entry.' })
  }
})

export default router
