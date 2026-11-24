import express from 'express'
import mongoose from 'mongoose'
import { requireSignedAdmin } from '../middleware/auth.js'

const defaults = {
  whatsapp: '(+91) 79073 48468',
  phone: '(+91) 80755 88406',
  email: 'keralakalyan.matrimonial@gmail.com',
}

const ContactSettings = mongoose.model('ContactSettings', new mongoose.Schema({
  _id: String,
  whatsapp: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
}))

const fields = Object.keys(defaults)
const projection = { whatsapp: 1, phone: 1, email: 1, _id: 0 }
const contactId = 'public'
const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const contact = await ContactSettings.findById(contactId, projection).lean()
    res.set('Cache-Control', 'no-store').json(contact ?? defaults)
  } catch {
    res.status(500).json({ error: 'Could not load contact details.' })
  }
})

router.put('/', requireSignedAdmin, async (req, res) => {
  const contact = Object.fromEntries(fields.map(field => [
    field, typeof req.body?.[field] === 'string' ? req.body[field].trim() : '',
  ]))
  const validPhone = value => value.length <= 32 && /^[+()0-9\s.-]+$/.test(value)
    && /^[1-9]\d{6,14}$/.test(value.replace(/\D/g, ''))

  if (!validPhone(contact.whatsapp) || !validPhone(contact.phone)) {
    return res.status(400).json({ error: 'Enter valid phone numbers with country codes.' })
  }
  if (contact.email.length > 254 || !/^[a-z0-9.!$&'*+/=_~^%-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(contact.email)) {
    return res.status(400).json({ error: 'Enter a valid contact email address.' })
  }

  try {
    const saved = await ContactSettings.findByIdAndUpdate(
      contactId, { $set: contact }, { upsert: true, new: true, projection, runValidators: true },
    ).lean()
    res.json(saved)
  } catch {
    res.status(500).json({ error: 'Could not save contact details.' })
  }
})

export default router
