import mongoose from 'mongoose'

const platformStatsSchema = new mongoose.Schema(
  {
    verifiedProfiles: {
      type: Number,
      default: 100
    },
    happyConnections: {
      type: Number,
      default: 500
    },
    registeredMembers: {
      type: Number,
      default: 10
    },
    trustedExperience: {
      type: Number,
      default: 10
    }
  },
  {
    timestamps: true
  }
)

export const PlatformStats = mongoose.model('PlatformStats', platformStatsSchema)
