import mongoose from 'mongoose'

const happyCoupleSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    coupleName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 240,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

export const HappyCouple = mongoose.model('HappyCouple', happyCoupleSchema)
