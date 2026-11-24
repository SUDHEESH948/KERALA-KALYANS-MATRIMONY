import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from './config/db.js'
import { Profile } from './models/Profile.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

async function seed() {
  try {
    console.log('Connecting to database...')
    await connectDB()

    const rawPassword = 'Password@123'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(rawPassword, salt)

    const dummyProfiles = [
      {
        id: 'PRF-MALE01',
        name: 'Rahul Nair',
        gender: 'Groom',
        age: 28,
        height: "5'11\"",
        marriageType: 'Never Married',
        maritalStatus: 'Never Married',
        religion: 'Hindu',
        caste: 'Nair',
        motherTongue: 'Malayalam',
        education: 'B.Tech Computer Science',
        profession: 'Senior Software Engineer',
        location: 'Kochi, Kerala',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
        email: 'rahul.nair@example.com',
        phone: '+91 98471 22334',
        password: hashedPassword,
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member',
        approvedAt: new Date()
      },
      {
        id: 'PRF-FEMALE01',
        name: 'Ananya Menon',
        gender: 'Bride',
        age: 25,
        height: "5'5\"",
        marriageType: 'Never Married',
        maritalStatus: 'Never Married',
        religion: 'Hindu',
        caste: 'Menon',
        motherTongue: 'Malayalam',
        education: 'M.Sc Biotechnology',
        profession: 'Clinical Research Associate',
        location: 'Thrissur, Kerala',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        email: 'ananya.menon@example.com',
        phone: '+91 94472 55667',
        password: hashedPassword,
        status: 'approved',
        isApproved: true,
        verified: true,
        mustChangePassword: false,
        role: 'member',
        approvedAt: new Date()
      }
    ]

    for (const p of dummyProfiles) {
      const existing = await Profile.findOne({ email: p.email })
      if (existing) {
        Object.assign(existing, p)
        await existing.save()
        console.log(`Updated dummy member: ${p.name} (${p.gender}) - ${p.email}`)
      } else {
        await Profile.create(p)
        console.log(`Created dummy member: ${p.name} (${p.gender}) - ${p.email}`)
      }
    }

    console.log('\n--- VERIFICATION TEST ---')
    for (const p of dummyProfiles) {
      const user = await Profile.findOne({ email: p.email })
      const isMatch = await bcrypt.compare(rawPassword, user.password)
      console.log(`User: ${user.name} | Email: ${user.email} | Gender: ${user.gender} | Approved: ${user.isApproved} | Password Match: ${isMatch}`)
    }

    console.log('\nDummy members successfully seeded!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding dummy members:', error)
    process.exit(1)
  }
}

seed()
