import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Admin } from '../models/Admin.js'
import { Profile } from '../models/Profile.js'
import { sendWelcomeEmail } from '../services/emailService.js'

const JWT_SECRET = process.env.JWT_SECRET || 'apremiya_jwt_secret_key_2026_super_secure_auth'

/**
 * Validate password strength
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
 */
export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') return { valid: false, message: 'Password is required' }
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' }
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z)' }
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter (a-z)' }
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number (0-9)' }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' }
  return { valid: true }
}

/**
 * Admin Login
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const cleanEmail = email.trim().toLowerCase()
    const admin = await Admin.findOne({ email: cleanEmail })

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials. Please check your email and password.' })
    }

    // Verify password (plain or bcrypt)
    let isMatch = false
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, admin.password)
    } else {
      isMatch = admin.password === password
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials. Please check your email and password.' })
    }

    // Generate Admin JWT
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: 'admin',
        isAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    )

    return res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Member Registration API
 */
export const registerMember = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      age,
      height,
      religion,
      caste,
      motherTongue,
      education,
      profession,
      location,
      phone,
      photo
    } = req.body

    // 1. Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' })
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Valid email address is required' })
    }
    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email format (e.g. name@example.com)' })
    }

    // Check duplicate email
    const existing = await Profile.findOne({ email: cleanEmail })
    if (existing) {
      return res.status(400).json({
        error: `An account with email "${cleanEmail}" is already registered. Please sign in or use another email.`
      })
    }

    // Password validation if provided
    let passwordToHash = password ? String(password).trim() : ''
    if (!passwordToHash) {
      // Secure random placeholder until admin generates temporary password upon approval
      passwordToHash = crypto.randomBytes(16).toString('hex')
    }

    // 2. Hash Password using bcrypt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(passwordToHash, salt)

    // 3. Create Profile/User record
    const newProfile = new Profile({
      id: `PRF-${Date.now().toString().slice(-5)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      gender: gender || 'Bride',
      age: Number(age) || 25,
      height: height || "5'5\"",
      religion: religion || 'Hindu',
      caste: caste ? caste.trim() : '',
      motherTongue: motherTongue || 'Malayalam',
      education: education ? education.trim() : 'Graduate',
      profession: profession ? profession.trim() : 'Professional',
      location: location ? location.trim() : 'Kerala, India',
      photo: photo || (gender === 'Groom'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'),
      status: 'pending',
      isApproved: false,
      mustChangePassword: false,
      verified: false,
      role: 'member'
    })

    await newProfile.save()

    // 4. Send Welcome Email via Nodemailer
    let welcomeEmailResult = null
    try {
      welcomeEmailResult = await sendWelcomeEmail(newProfile)
    } catch (mailErr) {
      console.error('[WELCOME EMAIL ERROR]', mailErr.message)
    }

    res.status(201).json({
      success: true,
      message: 'Your registration has been submitted successfully. Please wait for admin approval before logging in.',
      detail: 'Once approved by our administrator, an approval confirmation with your temporary password will be sent to your registered email address.',
      emailSent: welcomeEmailResult?.success || false,
      user: {
        id: newProfile.id,
        name: newProfile.name,
        email: newProfile.email,
        status: newProfile.status,
        isApproved: newProfile.isApproved,
        mustChangePassword: newProfile.mustChangePassword
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Member Login API
 */
export const loginMember = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email) {
      return res.status(400).json({ error: 'Email or mobile number is required' })
    }

    const cleanInput = email.trim().toLowerCase()

    // Find profile by email or phone
    const profile = await Profile.findOne({
      $or: [
        { email: cleanInput },
        { phone: email.trim() }
      ]
    })

    if (!profile) {
      return res.status(404).json({
        error: 'No registered profile found with this email or mobile number. Please register your profile first.'
      })
    }

    // 1. REJECT PENDING / REJECTED ACCOUNTS
    const isApproved = profile.isApproved || profile.verified || profile.status === 'approved' || profile.status === 'Active'
    const isPending = profile.status === 'pending' || profile.status === 'Under Review' || (!isApproved && profile.status !== 'rejected')

    if (profile.status === 'rejected') {
      return res.status(403).json({
        error: 'Your account registration was not approved by the administrator.',
        status: 'rejected',
        isRejected: true
      })
    }

    if (isPending) {
      return res.status(403).json({
        title: 'Awaiting Admin Approval',
        error: 'Your registration has been submitted successfully. Please wait for admin approval before logging in.',
        detail: 'Once approved by our administrator, an approval confirmation with your temporary password will be sent to your registered email address.',
        status: 'pending',
        isApproved: false,
        isPendingApproval: true,
        name: profile.name
      })
    }

    // 2. VERIFY PASSWORD WITH BCRYPT
    if (!password) {
      return res.status(400).json({ error: 'Password is required to sign in.' })
    }

    let isPasswordMatch = false
    if (profile.password.startsWith('$2a$') || profile.password.startsWith('$2b$')) {
      isPasswordMatch = await bcrypt.compare(password, profile.password)
    } else {
      // Legacy plaintext fallback
      isPasswordMatch = profile.password === password
    }

    if (!isPasswordMatch) {
      return res.status(401).json({
        error: 'Incorrect password. If this is your first time logging in, please use the temporary password sent to your email.'
      })
    }

    // 3. CHECK MUST CHANGE PASSWORD & 10-MINUTE TEMPORARY EXPIRATION
    if (profile.mustChangePassword) {
      if (profile.temporaryPasswordExpiresAt && new Date() > new Date(profile.temporaryPasswordExpiresAt)) {
        return res.status(401).json({
          error: 'Your temporary password has expired (valid for 10 minutes only). Please ask the administrator to approve or re-issue your credentials.',
          isExpired: true,
          mustChangePassword: true
        })
      }

      // Issue restricted JWT with 15 minutes expiration
      const restrictedToken = jwt.sign(
        {
          id: profile.id,
          email: profile.email,
          role: 'member',
          mustChangePassword: true
        },
        JWT_SECRET,
        { expiresIn: '15m' }
      )

      return res.json({
        success: true,
        mustChangePassword: true,
        redirectTo: '/change-password',
        message: 'Temporary password verified. For your security, you must create a new password before accessing your account.',
        token: restrictedToken,
        member: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          mustChangePassword: true,
          status: profile.status
        }
      })
    }

    // 4. NORMAL FULL ACCESS JWT TOKEN (Expires in 7 days)
    const token = jwt.sign(
      {
        id: profile.id,
        email: profile.email,
        role: 'member',
        mustChangePassword: false
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      mustChangePassword: false,
      message: 'Login successful! Welcome to your Apremiya dashboard.',
      token,
      member: {
        id: profile.id,
        name: profile.name,
        gender: profile.gender,
        age: profile.age,
        religion: profile.religion,
        caste: profile.caste,
        profession: profile.profession,
        location: profile.location,
        photo: profile.photo,
        email: profile.email,
        phone: profile.phone,
        verified: true,
        isApproved: true,
        mustChangePassword: false,
        status: profile.status
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Mandatory Change Password API
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword, email } = req.body

    // 1. Inputs validation
    if (!currentPassword) {
      return res.status(400).json({ error: 'Current/temporary password is required' })
    }
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' })
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match' })
    }

    // 2. Validate password strength
    const strength = validatePasswordStrength(newPassword)
    if (!strength.valid) {
      return res.status(400).json({ error: strength.message })
    }

    // 3. Resolve user identity (from authenticated JWT or provided email)
    if (!req.user) {
      const authHeader = req.headers.authorization || req.headers['x-auth-token']
      if (authHeader) {
        const rawToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
        try {
          req.user = jwt.verify(rawToken, JWT_SECRET)
        } catch {}
      }
    }

    const userEmail = req.user?.email || (email ? email.trim().toLowerCase() : null)
    const userId = req.user?.id

    let profile = null
    if (userId) {
      profile = await Profile.findOne({ id: userId })
    }
    if (!profile && userEmail) {
      profile = await Profile.findOne({ email: userEmail })
    }

    if (!profile) {
      return res.status(404).json({ error: 'User account not found' })
    }

    // 4. Verify current/temporary password
    let isCurrentMatch = false
    if (profile.password.startsWith('$2a$') || profile.password.startsWith('$2b$')) {
      isCurrentMatch = await bcrypt.compare(currentPassword, profile.password)
    } else {
      isCurrentMatch = profile.password === currentPassword
    }

    if (!isCurrentMatch) {
      return res.status(400).json({
        error: 'The current/temporary password you entered is incorrect. Please verify and try again.'
      })
    }

    // 5. Prevent reusing same password
    const isSame = await bcrypt.compare(newPassword, profile.password)
    if (isSame) {
      return res.status(400).json({
        error: 'Your new password cannot be the same as your temporary password. Please choose a new secure password.'
      })
    }

    // 6. Hash new password with bcrypt
    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(newPassword, salt)

    // 7. Update MongoDB user record
    profile.password = newHash
    profile.mustChangePassword = false
    profile.temporaryPasswordExpiresAt = null
    profile.isApproved = true
    profile.verified = true
    if (profile.status === 'pending' || profile.status === 'Under Review') {
      profile.status = 'approved'
    }
    profile.updatedAt = new Date()

    await profile.save()

    // 8. Invalidate temporary session and issue unrestricted full JWT (7 days)
    const fullToken = jwt.sign(
      {
        id: profile.id,
        email: profile.email,
        role: 'member',
        mustChangePassword: false
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Password changed successfully! You may now access your dashboard.',
      token: fullToken,
      member: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        gender: profile.gender,
        age: profile.age,
        religion: profile.religion,
        location: profile.location,
        photo: profile.photo,
        verified: true,
        isApproved: true,
        mustChangePassword: false,
        status: profile.status
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Get current authenticated user profile
 */
export const getMe = async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.user.id })
    if (!profile) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      member: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        gender: profile.gender,
        age: profile.age,
        religion: profile.religion,
        caste: profile.caste,
        profession: profile.profession,
        location: profile.location,
        photo: profile.photo,
        status: profile.status,
        isApproved: profile.isApproved,
        verified: profile.verified,
        mustChangePassword: profile.mustChangePassword
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
