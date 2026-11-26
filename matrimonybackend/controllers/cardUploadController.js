import { randomUUID } from 'node:crypto'
import Profile from '../models/Profile.js'

const JPEG_PREFIX = 'data:image/jpeg;base64,'
const MAX_STORED_PHOTO_BYTES = 5_000
const optionalFields = ['height', 'religion', 'caste', 'star', 'fatherName', 'education', 'district']

export async function extractCandidateCard(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Select a JPEG or PNG card.' })

  const { buffer, mimetype } = req.file
  const isJpeg = buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex'))
  const isPng = buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))
  if (!(mimetype === 'image/jpeg' && isJpeg) && !(mimetype === 'image/png' && isPng)) {
    return res.status(415).json({ error: 'Select a valid JPEG or PNG card.' })
  }

  const form = new FormData()
  form.append('image', new Blob([buffer], { type: mimetype }), isJpeg ? 'card.jpg' : 'card.png')

  const ocrServiceUrl = process.env.OCR_SERVICE_URL?.trim()
  if (process.env.RENDER === 'true' && !ocrServiceUrl) {
    return res.status(503).json({ error: 'Configure OCR_SERVICE_URL on the Render backend to enable card extraction.' })
  }

  try {
    const baseUrl = ocrServiceUrl || 'http://127.0.0.1:5001'
    const response = await fetch(new URL('/extract', baseUrl), {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(120_000)
    })
    const result = await response.json()
    if (response.status >= 500) {
      return res.status(502).json({ error: 'The OCR service could not process this card.' })
    }
    if (!response.ok) return res.status(response.status).json({ error: result.error })
    return res.json(result)
  } catch {
    return res.status(502).json({ error: 'Unable to reach the OCR service. Check that it is running.' })
  }
}

export async function saveCandidateCard(req, res) {
  const body = req.body ?? {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const age = typeof body.age === 'string' && /^\d{1,3}$/.test(body.age.trim())
    ? Number(body.age) : NaN
  const phone = typeof body.phone === 'string' ? body.phone.replace(/[\s()-]/g, '') : ''
  if (!name || name.length > 150 || !Number.isInteger(age) || age < 18 || age > 100 ||
      !['Bride', 'Groom', 'Other'].includes(body.gender) || !/^(?:\+91)?[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'Enter a name, age from 18 to 100, gender, and valid Indian mobile number.' })
  }

  const encoded = typeof body.photo === 'string' && body.photo.startsWith(JPEG_PREFIX)
    ? body.photo.slice(JPEG_PREFIX.length) : ''
  if (!encoded || Buffer.byteLength(body.photo) > MAX_STORED_PHOTO_BYTES) {
    return res.status(400).json({ error: 'A compressed JPEG photo up to 5 KB is required.' })
  }
  const photo = Buffer.from(encoded, 'base64')
  if (photo.toString('base64') !== encoded ||
      !photo.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex')) ||
      !photo.subarray(-2).equals(Buffer.from('ffd9', 'hex'))) {
    return res.status(400).json({ error: 'Invalid cropped JPEG photo.' })
  }

  const details = {}
  for (const field of optionalFields) {
    if (typeof body[field] !== 'string' || body[field].length > 200) {
      return res.status(400).json({ error: 'Check the candidate details and field lengths.' })
    }
    details[field] = body[field].trim()
  }

  try {
    const id = randomUUID()
    const profile = await Profile.create({
      ...details,
      id: 'PRF-' + id,
      name,
      age,
      phone: phone.slice(-10),
      gender: body.gender,
      nakshatra: details.star,
      location: details.district,
      email: 'candidate.' + id + '@keralakalyans.internal',
      password: randomUUID(),
      photo: body.photo,
      status: 'approved',
      isApproved: true,
      approvedAt: new Date(),
      role: 'member'
    })
    return res.status(201).json({ id: profile.id })
  } catch {
    return res.status(500).json({ error: 'Could not save the candidate profile.' })
  }
}
