import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { Profile } from '../models/Profile.js'
import {
  sendWelcomeEmail,
  sendApprovalEmail,
  sendRejectionEmail
} from '../services/emailService.js'

/**
 * Generate cryptographically secure random temporary password
 * Contains a guaranteed combination of:
 * - Uppercase letters (A-Z)
 * - Lowercase letters (a-z)
 * - Digits (0-9)
 * - Special characters (!@#$%&*?)
 */
export const generateSecureTempPassword = () => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const special = '!@#$%&*?'
  const all = upper + lower + digits + special

  // Pick guaranteed characters: 2 upper, 3 lower, 3 digits, 2 special
  const pick = (charset, count) => {
    let res = ''
    const bytes = crypto.randomBytes(count)
    for (let i = 0; i < count; i++) {
      res += charset[bytes[i] % charset.length]
    }
    return res
  }

  const chars = (
    pick(upper, 2) +
    pick(lower, 3) +
    pick(digits, 3) +
    pick(special, 2)
  ).split('')

  // Fisher-Yates cryptographically secure shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomBytes(1)[0] % (i + 1)
    const tmp = chars[i]
    chars[i] = chars[j]
    chars[j] = tmp
  }

  return chars.join('')
}

export const getProfiles = async (req, res) => {
  try {
    const { search, gender, religion, status, verified, isApproved } = req.query
    const query = {}

    if (search) {
      const regex = new RegExp(search, 'i')
      query.$or = [
        { name: regex },
        { email: regex },
        { profession: regex },
        { location: regex },
        { caste: regex }
      ]
    }

    if (gender && gender !== 'all') {
      const g = String(gender).trim().toLowerCase()
      if (g === 'bride' || g === 'female' || g === 'woman') {
        query.gender = { $in: [/^bride$/i, /^female$/i, /^woman$/i] }
      } else if (g === 'groom' || g === 'male' || g === 'man') {
        query.gender = { $in: [/^groom$/i, /^male$/i, /^man$/i] }
      } else {
        query.gender = new RegExp(`^${gender}$`, 'i')
      }
    }

    if (religion && religion !== 'all') {
      query.religion = new RegExp(`^${religion.trim()}$`, 'i')
    }

    if (status && status !== 'all') {
      if (status === 'pending') {
        query.$or = [{ status: 'pending' }, { status: 'Under Review' }]
      } else if (status === 'approved') {
        query.$or = [{ status: 'approved' }, { status: 'Active' }]
      } else {
        query.status = status
      }
    }

    if (verified !== undefined && verified !== 'all') {
      query.verified = verified === 'true'
    }

    if (isApproved !== undefined && isApproved !== 'all') {
      query.isApproved = isApproved === 'true'
    }

    const profiles = await Profile.find(query).sort({ createdAt: -1 })
    res.json(profiles)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id })
    if (!profile) return res.status(404).json({ error: 'Profile not found' })
    res.json(profile)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const createProfile = async (req, res) => {
  try {
    const {
      name,
      gender,
      age,
      height,
      religion,
      caste,
      motherTongue,
      education,
      profession,
      location,
      email,
      phone,
      password,
      photo
    } = req.body

    // 1. Validate fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' })
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required' })
    }
    const cleanEmail = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address format' })
    }

    // 2. Check for duplicate email addresses
    const existing = await Profile.findOne({ email: cleanEmail })
    if (existing) {
      return res.status(400).json({
        error: `An account with email "${cleanEmail}" already exists. Please login or use a different email address.`
      })
    }

    // 3. Hash passwords using bcrypt
    let plainPassword = password ? String(password).trim() : ''
    if (!plainPassword) {
      // Secure random placeholder until admin generates temporary password upon approval
      plainPassword = crypto.randomBytes(16).toString('hex')
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(plainPassword, salt)

    // 4. Save the user in MongoDB with status: 'pending', isApproved: false, mustChangePassword: false
    const newProfile = new Profile({
      id: `PRF-${Date.now().toString().slice(-5)}`,
      name: name.trim(),
      gender: gender || 'Bride',
      age: Number(age) || 25,
      height: height || "5'5\"",
      religion: religion || 'Hindu',
      caste: caste ? caste.trim() : '',
      motherTongue: motherTongue || 'Malayalam',
      education: education ? education.trim() : 'Graduate',
      profession: profession ? profession.trim() : 'Professional',
      location: location ? location.trim() : 'Kerala, India',
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
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

    // 5. Automatically send a welcome email using Nodemailer
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
      emailDetails: welcomeEmailResult,
      profile: {
        id: newProfile.id,
        name: newProfile.name,
        email: newProfile.email,
        gender: newProfile.gender,
        age: newProfile.age,
        location: newProfile.location,
        status: newProfile.status,
        isApproved: newProfile.isApproved,
        mustChangePassword: newProfile.mustChangePassword
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const payload = { ...req.body, updatedAt: new Date() }
    // If password provided in update, hash it
    if (payload.password && !payload.password.startsWith('$2a$') && !payload.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10)
      payload.password = await bcrypt.hash(payload.password, salt)
    }

    const updated = await Profile.findOneAndUpdate(
      { id: req.params.id },
      payload,
      { returnDocument: 'after' }
    )
    if (!updated) return res.status(404).json({ error: 'Profile not found' })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Admin Approval Workflow
 * 1. Generate cryptographically secure random temporary password.
 * 2. Hash temporary password using bcrypt.
 * 3. Update user's MongoDB record: status: 'approved', isApproved: true, mustChangePassword: true.
 * 4. Save temporary password hash (NEVER plaintext).
 * 5. Send approval email with Nodemailer.
 */
export const approveProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id })
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    // 1. Generate cryptographically secure random temporary password
    const temporaryPassword = generateSecureTempPassword()

    // 2. Hash temporary password using bcrypt
    const salt = await bcrypt.genSalt(10)
    const temporaryPasswordHash = await bcrypt.hash(temporaryPassword, salt)

    // 3. Update MongoDB record
    profile.password = temporaryPasswordHash
    profile.status = 'approved'
    profile.isApproved = true
    profile.verified = true
    profile.mustChangePassword = true
    profile.approvedAt = new Date()
    profile.rejectedAt = null
    profile.temporaryPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // Valid for 10 minutes only
    profile.updatedAt = new Date()

    await profile.save()

    // 4. Send approval email with Nodemailer (including temporary password)
    let emailResult = null
    if (profile.email) {
      emailResult = await sendApprovalEmail(profile, temporaryPassword)
    }

    res.json({
      success: true,
      message: `Profile for "${profile.name}" has been approved! Login credentials sent to ${profile.email}.`,
      temporaryPassword,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        status: profile.status,
        isApproved: profile.isApproved,
        mustChangePassword: profile.mustChangePassword,
        verified: profile.verified
      },
      emailSent: emailResult?.success || false,
      emailError: emailResult?.success ? null : emailResult?.error,
      emailDetails: emailResult
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Admin Rejection Workflow
 */
export const rejectProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id })
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    profile.status = 'rejected'
    profile.isApproved = false
    profile.verified = false
    profile.rejectedAt = new Date()
    profile.updatedAt = new Date()

    await profile.save()

    let emailResult = null
    if (profile.email) {
      emailResult = await sendRejectionEmail(profile)
    }

    res.json({
      success: true,
      message: `Profile for "${profile.name}" has been rejected. Notification sent to ${profile.email}.`,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        status: profile.status,
        isApproved: profile.isApproved,
        verified: profile.verified
      },
      emailSent: emailResult?.success || false,
      emailError: emailResult?.success ? null : emailResult?.error
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Resend Approval Email with new temporary credentials
 */
export const resendApprovalEmail = async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id })
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const temporaryPassword = generateSecureTempPassword()
    const salt = await bcrypt.genSalt(10)
    profile.password = await bcrypt.hash(temporaryPassword, salt)
    profile.mustChangePassword = true
    profile.status = 'approved'
    profile.isApproved = true
    profile.verified = true
    profile.temporaryPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // Valid for 10 minutes only
    profile.updatedAt = new Date()

    await profile.save()

    const emailResult = await sendApprovalEmail(profile, temporaryPassword)

    res.json({
      success: true,
      message: `New temporary credentials dispatched to ${profile.email}.`,
      temporaryPassword,
      emailSent: emailResult?.success || false,
      emailError: emailResult?.success ? null : emailResult?.error,
      emailDetails: emailResult
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Legacy toggle verify (kept for backward compatibility, mapped to approve/revert)
 */
export const toggleVerifyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id })
    if (!profile) return res.status(404).json({ error: 'Profile not found' })

    const willBeApproved = !profile.isApproved && !profile.verified

    if (willBeApproved) {
      return approveProfile(req, res)
    } else {
      profile.isApproved = false
      profile.verified = false
      profile.status = 'pending'
      profile.updatedAt = new Date()
      await profile.save()

      return res.json({
        success: true,
        verified: false,
        status: 'pending',
        profile,
        message: `Profile "${profile.name}" reverted to Pending approval.`
      })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteProfile = async (req, res) => {
  try {
    const deleted = await Profile.findOneAndDelete({ id: req.params.id })
    if (!deleted) return res.status(404).json({ error: 'Profile not found' })
    res.json({ success: true, message: `Profile "${deleted.name}" deleted successfully` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * Seed approved sample matches across religions and genders
 */
export const seedSampleMatches = async (req, res) => {
  try {
    const sampleProfiles = [
      {
        id: 'PRF-10001',
        name: 'Ananya Nair',
        email: 'ananya.nair@example.com',
        gender: 'Bride',
        age: 24,
        height: "5'4\"",
        religion: 'Hindu',
        caste: 'Nair',
        motherTongue: 'Malayalam',
        education: 'B.Tech Computer Science',
        profession: 'Software Engineer',
        location: 'Kochi, Kerala',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      },
      {
        id: 'PRF-10002',
        name: 'Sneha Menon',
        email: 'sneha.menon@example.com',
        gender: 'Bride',
        age: 25,
        height: "5'5\"",
        religion: 'Hindu',
        caste: 'Menon',
        motherTongue: 'Malayalam',
        education: 'B.Arch',
        profession: 'Interior Architect',
        location: 'Thrissur, Kerala',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      },
      {
        id: 'PRF-10003',
        name: 'Dr. Revathi Pillai',
        email: 'revathi.pillai@example.com',
        gender: 'Bride',
        age: 27,
        height: "5'6\"",
        religion: 'Hindu',
        caste: 'Nair',
        motherTongue: 'Malayalam',
        education: 'MBBS, MD',
        profession: 'Physician',
        location: 'Thiruvananthapuram, Kerala',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      },
      {
        id: 'PRF-10004',
        name: 'Meera Krishnan',
        email: 'meera.krishnan@example.com',
        gender: 'Bride',
        age: 23,
        height: "5'3\"",
        religion: 'Hindu',
        caste: 'OBC',
        motherTongue: 'Malayalam',
        education: 'M.Com, CA Inter',
        profession: 'Financial Analyst',
        location: 'Kozhikode, Kerala',
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      },
      {
        id: 'PRF-10005',
        name: 'Fatima Zahra',
        email: 'fatima.zahra@example.com',
        gender: 'Bride',
        age: 24,
        height: "5'4\"",
        religion: 'Muslim',
        caste: 'Sunni',
        motherTongue: 'Malayalam',
        education: 'B.Des Fashion Design',
        profession: 'Creative Director',
        location: 'Malappuram, Kerala',
        photo: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      },
      {
        id: 'PRF-10006',
        name: 'Rebecca Thomas',
        email: 'rebecca.thomas@example.com',
        gender: 'Bride',
        age: 25,
        height: "5'6\"",
        religion: 'Christian',
        caste: 'RC Catholic',
        motherTongue: 'Malayalam',
        education: 'MBA Marketing',
        profession: 'Brand Manager',
        location: 'Kottayam, Kerala',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      },
      {
        id: 'PRF-10007',
        name: 'Rahul Warrier',
        email: 'rahul.warrier@example.com',
        gender: 'Groom',
        age: 28,
        height: "5'11\"",
        religion: 'Hindu',
        caste: 'Warrier',
        motherTongue: 'Malayalam',
        education: 'B.Tech IT',
        profession: 'Senior Product Engineer',
        location: 'Bengaluru / Palakkad',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      },
      {
        id: 'PRF-10008',
        name: 'Mohammed Bilal',
        email: 'bilal.mohd@example.com',
        gender: 'Groom',
        age: 29,
        height: "5'10\"",
        religion: 'Muslim',
        caste: 'Sunni',
        motherTongue: 'Malayalam',
        education: 'M.S Mechanical',
        profession: 'Project Manager',
        location: 'Dubai / Kochi',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      },
      {
        id: 'PRF-10009',
        name: 'Jerry Varghese',
        email: 'jerry.varghese@example.com',
        gender: 'Groom',
        age: 28,
        height: "6'0\"",
        religion: 'Christian',
        caste: 'Syrian Catholic',
        motherTongue: 'Malayalam',
        education: 'B.Tech Civil',
        profession: 'Structural Consultant',
        location: 'Ernakulam, Kerala',
        photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      },
      {
        id: 'PRF-10010',
        name: 'Kavya Suresh',
        email: 'kavya.suresh@example.com',
        gender: 'Bride',
        age: 24,
        height: "5'4\"",
        religion: 'Hindu',
        caste: 'OBC',
        motherTongue: 'Malayalam',
        education: 'BCA, MCA',
        profession: 'Software Developer',
        location: 'Kannur, Kerala',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      },
      {
        id: 'PRF-10011',
        name: 'Dr. Aishwarya Rajan',
        email: 'aishwarya.rajan@example.com',
        gender: 'Bride',
        age: 25,
        height: "5'5\"",
        religion: 'Hindu',
        caste: 'OBC',
        motherTongue: 'Malayalam',
        education: 'BDS Dental Surgeon',
        profession: 'Dental Consultant',
        location: 'Kozhikode, Kerala',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member'
      }
    ]

    const salt = await bcrypt.genSalt(10)
    const defaultPass = await bcrypt.hash('Member@123', salt)

    let createdCount = 0
    for (const p of sampleProfiles) {
      const exists = await Profile.findOne({ id: p.id })
      if (!exists) {
        p.password = defaultPass
        await new Profile(p).save()
        createdCount++
      }
    }

    res.json({ success: true, seeded: createdCount, totalSample: sampleProfiles.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
