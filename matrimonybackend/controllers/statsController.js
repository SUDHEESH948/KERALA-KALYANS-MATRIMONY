import { PlatformStats } from '../models/PlatformStats.js'
import { Profile } from '../models/Profile.js'
import { Inquiry } from '../models/Inquiry.js'

export const getStats = async (req, res) => {
  try {
    let statsDoc = await PlatformStats.findOne()
    if (!statsDoc) {
      statsDoc = await PlatformStats.create({
        verifiedProfiles: 100,
        happyConnections: 500,
        registeredMembers: 10,
        trustedExperience: 10
      })
    }

    const totalProfiles = await Profile.countDocuments()
    const verifiedCount = await Profile.countDocuments({ verified: true })
    const pendingCount = await Profile.countDocuments({
      $or: [{ verified: false }, { status: 'Under Review' }]
    })
    const totalInquiries = await Inquiry.countDocuments()
    const newInquiries = await Inquiry.countDocuments({ status: 'New' })

    res.json({
      platform: {
        verifiedProfiles: statsDoc.verifiedProfiles,
        happyConnections: statsDoc.happyConnections,
        registeredMembers: statsDoc.registeredMembers,
        trustedExperience: statsDoc.trustedExperience
      },
      metrics: {
        totalProfiles,
        verifiedCount,
        pendingCount,
        totalInquiries,
        newInquiries
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateStats = async (req, res) => {
  try {
    let statsDoc = await PlatformStats.findOne()
    if (!statsDoc) {
      statsDoc = new PlatformStats(req.body)
    } else {
      Object.assign(statsDoc, req.body)
    }
    await statsDoc.save()
    res.json({ success: true, stats: statsDoc })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const purgeDummyData = async (req, res) => {
  try {
    const dummyNames = [
      'Dr. Ananya Menon',
      'Rahul V. Nair',
      'Meera Thomas',
      'Kabeer Ahmed',
      'Pooja Krishnan'
    ]
    const profResult = await Profile.deleteMany({
      $or: [
        { name: { $in: dummyNames } },
        { id: { $in: ['PRF-101', 'PRF-102', 'PRF-103', 'PRF-104', 'PRF-105'] } },
        { name: /sample|demo|test/i }
      ]
    })
    const inqResult = await Inquiry.deleteMany({
      $or: [
        { id: { $in: ['INQ-201', 'INQ-202'] } },
        { name: /sample|demo|test|anonymous/i }
      ]
    })

    res.json({
      success: true,
      message: 'All dummy and test data purged successfully',
      removedProfiles: profResult.deletedCount,
      removedInquiries: inqResult.deletedCount
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
