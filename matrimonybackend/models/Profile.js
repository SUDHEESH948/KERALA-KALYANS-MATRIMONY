import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const profileSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ['Bride', 'Groom', 'Other'],
      default: 'Bride'
    },
    age: {
      type: Number,
      default: 25
    },
    height: {
      type: String,
      default: "5'5\""
    },
    marriageType: {
      type: String,
      default: 'Never Married',
      trim: true
    },
    maritalStatus: {
      type: String,
      default: 'Never Married',
      trim: true
    },
    religion: {
      type: String,
      default: 'Hindu'
    },
    caste: {
      type: String,
      default: ''
    },
    motherTongue: {
      type: String,
      default: 'Malayalam'
    },
    education: {
      type: String,
      default: 'Graduate'
    },
    profession: {
      type: String,
      default: 'Professional'
    },
    location: {
      type: String,
      default: 'Kerala, India'
    },
    photo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    whatsAppOptIn: Boolean,
    marriageSurvey: {
      status: {
        type: String,
        enum: ['sending', 'accepted', 'rejected', 'uncertain']
      },
      attemptedAt: Date,
      acceptedAt: Date,
      messageId: String
    },
    password: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'Active', 'Under Review', 'Paused', 'Inactive'],
      default: 'pending'
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    mustChangePassword: {
      type: Boolean,
      default: false
    },
    approvedAt: {
      type: Date
    },
    openedProfileIds: {
      type: [String],
      select: false
    },
    rejectedAt: {
      type: Date
    },
    temporaryPasswordExpiresAt: {
      type: Date
    },
    verified: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    }
  },
  {
    timestamps: true
  }
)

profileSchema.index({ whatsAppOptIn: 1, createdAt: 1 })

// Pre-save hook: Hash password with bcrypt before saving if modified
profileSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  // Sync verified with isApproved
  if (this.isApproved !== undefined) {
    this.verified = this.isApproved
  }

  // Only hash if not already a bcrypt hash
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
})

// Compare password method
profileSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) return false
  return bcrypt.compare(candidatePassword, this.password)
}

export const Profile = mongoose.model('Profile', profileSchema)
export const User = Profile
export default Profile
