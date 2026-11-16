import mongoose from 'mongoose'

const inquirySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      default: 'Interested Seeker'
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    lookingFor: {
      type: String,
      default: 'Woman'
    },
    ageRange: {
      type: String,
      default: '22 to 27'
    },
    religion: {
      type: String,
      default: 'Select'
    },
    motherTongue: {
      type: String,
      default: 'Select'
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Closed', 'Archived'],
      default: 'New'
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

export const Inquiry = mongoose.model('Inquiry', inquirySchema)
