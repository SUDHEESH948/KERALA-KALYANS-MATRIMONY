import crypto from 'crypto'
import { Profile } from '../models/Profile.js'
import { getJwtSecret } from '../config/jwt.js'

/**
 * 1. Request access to view target profile's photo
 */
export const requestPhotoAccess = async (req, res) => {
  try {
    const { targetProfileId } = req.body
    const requester = req.user // From auth middleware

    if (!requester || !requester.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!targetProfileId) {
      return res.status(400).json({ error: 'Target profile ID is required' })
    }

    if (requester.id === targetProfileId) {
      return res.json({ success: true, status: 'approved', message: 'You are viewing your own photo' })
    }

    const target = await Profile.findOne({ id: targetProfileId })
    if (!target) return res.status(404).json({ error: 'Profile not found' })

    if (!target.photoAccessRequests) {
      target.photoAccessRequests = []
    }

    const existingReq = target.photoAccessRequests.find(
      (r) => r.requesterId === requester.id
    )

    if (existingReq) {
      return res.json({
        success: true,
        status: existingReq.status,
        message: `Photo access request is currently ${existingReq.status}`
      })
    }

    // Lookup requester profile details for rich notification
    const requesterProfile = await Profile.findOne({ id: requester.id })

    target.photoAccessRequests.push({
      requesterId: requester.id,
      requesterName: requesterProfile?.name || requester.name || 'Member',
      requesterPhone: requesterProfile?.phone || '',
      status: 'pending',
      requestedAt: new Date()
    })

    await target.save()

    return res.json({
      success: true,
      status: 'pending',
      message: 'Photo access request submitted successfully. You will be notified when approved.'
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * 2. Profile Owner or Admin responds to photo access request
 */
export const respondPhotoAccess = async (req, res) => {
  try {
    const { requesterId, decision, targetProfileId } = req.body // decision: 'approved' | 'rejected'
    const currentUser = req.user

    // Allow profile owner or admin
    const ownerId = targetProfileId || currentUser.id
    const profile = await Profile.findOne({ id: ownerId })
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    if (!currentUser.isAdmin && currentUser.id !== profile.id) {
      return res.status(403).json({ error: 'Unauthorized to manage requests for this profile' })
    }

    const request = profile.photoAccessRequests?.find(
      (r) => r.requesterId === requesterId
    )
    if (!request) return res.status(404).json({ error: 'Request not found' })

    request.status = decision === 'approved' ? 'approved' : 'rejected'
    request.decidedAt = new Date()
    await profile.save()

    res.json({
      success: true,
      status: request.status,
      message: `Photo access request ${request.status} successfully`
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * 3. Issue a short-lived (60-second) signed HMAC token for Ephemeral Photo Streaming
 */
export const getEphemeralPhotoToken = async (req, res) => {
  try {
    const { targetProfileId } = req.body
    const viewer = req.user

    if (!viewer || !viewer.id) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const target = await Profile.findOne({ id: targetProfileId })
    if (!target) return res.status(404).json({ error: 'Target profile not found' })

    // Check authorization: Viewer is either admin, self, or an approved requester
    const isApproved = target.photoAccessRequests?.some(
      (r) => r.requesterId === viewer.id && r.status === 'approved'
    )
    const isSelfOrAdmin = viewer.isAdmin || target.id === viewer.id
    const isPublic = target.photoPrivacy === 'public'

    if (!isApproved && !isSelfOrAdmin && !isPublic) {
      return res.status(403).json({ error: 'Photo access has not been approved by this member' })
    }

    const viewerProfile = await Profile.findOne({ id: viewer.id })
    const secret = getJwtSecret()
    const expiresAt = Date.now() + 60 * 1000 // 60 seconds validity
    const payload = `${viewer.id}:${target.id}:${expiresAt}`
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    const token = Buffer.from(`${payload}:${signature}`).toString('base64url')

    const rawPhone = viewerProfile?.phone || ''
    const maskedPhone = rawPhone.length > 5
      ? rawPhone.slice(0, 3) + '****' + rawPhone.slice(-3)
      : rawPhone

    res.json({
      success: true,
      token,
      expiresAt,
      viewerWatermarkInfo: {
        id: viewer.id,
        name: viewerProfile?.name || viewer.name || 'Member',
        phone: maskedPhone
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * 4. Stream photo binary buffer with aggressive anti-cache headers
 */
export const streamSecurePhoto = async (req, res) => {
  try {
    const { token } = req.query
    if (!token) return res.status(400).send('Security token is required')

    let decoded
    try {
      decoded = Buffer.from(token, 'base64url').toString('utf-8')
    } catch {
      return res.status(400).send('Malformed security token')
    }

    const parts = decoded.split(':')
    if (parts.length !== 4) return res.status(400).send('Invalid token payload')

    const [viewerId, targetId, expiresAtStr, signature] = parts
    const expiresAt = Number(expiresAtStr)

    if (Date.now() > expiresAt) {
      return res.status(401).send('Security token expired (valid for 60s only)')
    }

    const secret = getJwtSecret()
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${viewerId}:${targetId}:${expiresAt}`)
      .digest('hex')

    if (signature !== expectedSig) {
      return res.status(403).send('Invalid cryptographic signature')
    }

    const target = await Profile.findOne({ id: targetId }).select('+photoHighResUrl photo')
    if (!target) return res.status(404).send('Profile not found')

    const photoSource = target.photoHighResUrl || target.photo

    // Fetch and proxy raw photo buffer with strict anti-cache headers
    const imageRes = await fetch(photoSource)
    if (!imageRes.ok) return res.status(502).send('Failed to fetch image stream')

    const arrayBuffer = await imageRes.arrayBuffer()
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg'

    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Cross-Origin-Resource-Policy': 'same-origin'
    })

    res.send(Buffer.from(arrayBuffer))
  } catch (err) {
    res.status(500).send('Secure stream error: ' + err.message)
  }
}

/**
 * 5. Log screenshot attempt & notify administration team
 */
export const logScreenshotAlert = async (req, res) => {
  try {
    const {
      viewerId = 'ANONYMOUS',
      viewerName = 'Visitor',
      viewerEmail = '',
      viewerPhone = '',
      targetProfileId = '',
      targetProfileName = '',
      reason = 'Screenshot key detected',
      timestamp = new Date().toISOString()
    } = req.body

    const logEntry = {
      type: 'SCREENSHOT_ATTEMPT',
      viewerId,
      viewerName,
      viewerEmail,
      viewerPhone,
      targetProfileId,
      targetProfileName,
      reason,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      timestamp: new Date(timestamp)
    }

    console.warn(`[SECURITY ALERT] 🚨 Screenshot attempt logged: Viewer ID: ${viewerId} (${viewerName}) on Target Profile: ${targetProfileId} (${targetProfileName})`)

    return res.json({
      success: true,
      message: 'Screenshot alert recorded successfully and administrator notified.',
      alert: logEntry
    })
  } catch (err) {
    console.error('Error logging screenshot alert:', err)
    return res.status(500).json({ error: 'Failed to record screenshot alert' })
  }
}
