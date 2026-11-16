import { Admin } from '../models/Admin.js'

export const ensureAdminAccount = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@apremiya.com').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  try {
    const existing = await Admin.findOne({ email: adminEmail })
    if (!existing) {
      await Admin.create({
        email: adminEmail,
        password: adminPassword,
        name: 'Super Admin',
        role: 'Chief Administrator'
      })
      console.log(`🔑 Initialized Admin credentials: ${adminEmail}`)
    }
  } catch (error) {
    console.warn('⚠️ Admin check warning:', error.message)
  }
}
