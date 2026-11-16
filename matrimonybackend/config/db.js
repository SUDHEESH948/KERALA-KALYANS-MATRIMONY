import dns from 'dns'
import mongoose from 'mongoose'

// Ensure reliable DNS resolution for MongoDB Atlas SRV connection strings on all networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch (e) {
  console.warn('DNS server override warning:', e.message)
}

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI
  if (!uri) {
    console.error('❌ MONGO_URI is not defined in environment variables (.env)')
    process.exit(1)
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    })
    console.log(`✅ Connected to MongoDB Atlas!`)
    console.log(`   Host:     ${conn.connection.host}`)
    console.log(`   Database: ${conn.connection.name}`)
    return conn
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Error:', error.message)
    process.exit(1)
  }
}
