import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'Super Admin'
    },
    role: {
      type: String,
      default: 'Chief Administrator'
    }
  },
  { timestamps: true }
)

export const Admin = mongoose.model('Admin', adminSchema)
