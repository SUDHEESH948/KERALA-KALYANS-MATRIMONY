import { openAsBlob } from 'node:fs'
import Profile from '../models/Profile.js'

// Asia/Kolkata is UTC+05:30 year-round. Shift before taking calendar dates.
const IST_OFFSET = (5 * 60 + 30) * 60_000
const DAY = 86_400_000
const SEND_HOUR = 9
const TEMPLATE_NAME = 'marriage_status_confirmation'
const HEADER_IMAGE = new URL('../assets/kerala-kalyan-logo.png', import.meta.url)

function istCalendarDay(instant) {
  const shifted = new Date(Number(instant) + IST_OFFSET)
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate())
}

export function surveyDueDay(createdAt) {
  const day = new Date(istCalendarDay(createdAt))
  const year = day.getUTCFullYear()
  const completionMonth = day.getUTCMonth() + 6
  const lastDay = new Date(Date.UTC(year, completionMonth + 1, 0)).getUTCDate()
  return Date.UTC(year, completionMonth, Math.min(day.getUTCDate(), lastDay)) - 2 * DAY
}

export function normalizeIndianPhone(phone) {
  const formatted = String(phone ?? '').replace(/[\s()-]/g, '')
  const match = /^(?:\+?91|0)?([6-9]\d{9})$/.exec(formatted)
  return match ? `91${match[1]}` : null
}

async function uploadHeaderImage(config) {
  const form = new FormData()
  form.set('messaging_product', 'whatsapp')
  form.set('file', await openAsBlob(HEADER_IMAGE, { type: 'image/png' }), 'kerala-kalyan-logo.png')
  const response = await fetch(`https://graph.facebook.com/v21.0/${config.phoneNumberId}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}` },
    body: form,
    signal: AbortSignal.timeout(15_000)
  })
  const body = await response.json().catch(() => null)
  if (!response.ok || !body?.id) {
    throw new Error(`WhatsApp image upload failed (HTTP ${response.status}, Meta code ${body?.error?.code ?? 'unknown'})`)
  }
  return body.id
}

async function sendTemplate(config, to, name, headerImageId) {
  const components = []
  if (headerImageId) {
    components.push({ type: 'header', parameters: [{ type: 'image', image: { id: headerImageId } }] })
  }
  components.push({ type: 'body', parameters: [{ type: 'text', text: name }] })
  const response = await fetch(`https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: config.templateName,
        language: { code: config.languageCode },
        components
      }
    }),
    signal: AbortSignal.timeout(15_000)
  })
  const body = await response.json().catch(() => null)
  const messageId = body?.messages?.[0]?.id
  if (response.ok && typeof messageId === 'string' && messageId) {
    return { status: 'accepted', messageId, acceptedAt: new Date() }
  }

  return {
    status: response.status >= 400 && response.status < 500 ? 'rejected' : 'uncertain',
    httpStatus: response.status,
    metaCode: typeof body?.error?.code === 'number' ? body.error.code : undefined
  }
}

export async function runMarriageSurvey(config, now = new Date()) {
  const today = istCalendarDay(now)
  const completion = new Date(today + 2 * DAY)
  const year = completion.getUTCFullYear()
  const registrationMonth = completion.getUTCMonth() - 6
  const eligible = {
    role: { $ne: 'admin' },
    whatsAppOptIn: true,
    'marriageSurvey.status': { $exists: false }
  }
  const candidates = Profile.find({
    ...eligible,
    createdAt: {
      $gte: new Date(Date.UTC(year, registrationMonth, 1) - IST_OFFSET),
      $lt: new Date(Date.UTC(year, registrationMonth + 1, 1) - IST_OFFSET)
    }
  }).select('name phone createdAt').lean().cursor()

  let headerImageId
  for await (const profile of candidates) {
    if (surveyDueDay(profile.createdAt) !== today) continue

    const phone = normalizeIndianPhone(profile.phone)
    const name = profile.name?.replace(/\s+/g, ' ').trim()
    const profileId = String(profile._id)
    if (!phone || !name) {
      console.warn('[marriage-survey] Invalid recipient data', { profileId })
      continue
    }

    if (config.templateName === TEMPLATE_NAME && !headerImageId) {
      try {
        headerImageId = await uploadHeaderImage(config)
      } catch (error) {
        console.warn('[marriage-survey] Could not upload the template header image', error.message)
        return
      }
    }

    try {
      const claim = await Profile.updateOne(
        { _id: profile._id, phone: profile.phone, ...eligible },
        { $set: { marriageSurvey: { status: 'sending', attemptedAt: new Date() } } },
        { writeConcern: { w: 'majority' } }
      )
      if (claim.modifiedCount !== 1) continue

      // Keep ambiguous attempts reserved. Meta may have accepted them before a timeout.
      const result = await sendTemplate(config, phone, name, headerImageId).catch(() => ({ status: 'uncertain' }))
      const update = { 'marriageSurvey.status': result.status }
      if (result.status === 'accepted') {
        update['marriageSurvey.messageId'] = result.messageId
        update['marriageSurvey.acceptedAt'] = result.acceptedAt
      }
      await Profile.updateOne(
        { _id: profile._id, 'marriageSurvey.status': 'sending' },
        { $set: update },
        { writeConcern: { w: 'majority' } }
      )

      const log = result.status === 'accepted' ? console.info : console.warn
      log('[marriage-survey] Send result', {
        profileId, status: result.status, httpStatus: result.httpStatus, metaCode: result.metaCode
      })
    } catch {
      console.error('[marriage-survey] Could not persist attempt state', { profileId })
    }
  }
}

export function startMarriageSurveyScheduler() {
  const config = {
    token: process.env.WHATSAPP_TOKEN?.trim(),
    phoneNumberId: process.env.PHONE_NUMBER_ID?.trim(),
    templateName: (process.env.TEMPLATE_NAME || TEMPLATE_NAME).trim(),
    languageCode: (process.env.LANGUAGE_CODE || 'ml').trim()
  }
  if (!config.token || !/^\d+$/.test(config.phoneNumberId ?? '') ||
      !config.templateName || !config.languageCode) {
    console.info('[marriage-survey] Scheduler disabled. Check the WhatsApp environment settings.')
    return () => {}
  }

  let timer
  let stopped = false
  const schedule = () => {
    if (stopped) return
    const now = Date.now()
    const todayAtNine = istCalendarDay(now) + SEND_HOUR * 3_600_000 - IST_OFFSET
    const nextRun = now <= todayAtNine ? todayAtNine : todayAtNine + DAY
    timer = setTimeout(async () => {
      try {
        if (istCalendarDay(Date.now()) === istCalendarDay(nextRun)) {
          await runMarriageSurvey(config)
        }
      } catch {
        console.error('[marriage-survey] Daily run failed')
      } finally {
        schedule()
      }
    }, nextRun - now)
    timer.unref()
  }

  schedule()
  console.info('[marriage-survey] Scheduled daily at 09:00 Asia/Kolkata')
  return () => {
    stopped = true
    clearTimeout(timer)
  }
}
