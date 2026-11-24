import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

import { connectDB } from './config/db.js'
import { ensureAdminAccount } from './config/seedAdmin.js'
import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import inquiryRoutes from './routes/inquiryRoutes.js'
import statsRoutes from './routes/statsRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
import { purgeDummyData } from './controllers/statsController.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { startMarriageSurveyScheduler } from './services/marriageSurvey.js'

// Environment Configuration
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5000

// Core Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/inquiries', inquiryRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/contact', contactRoutes)
app.post('/api/admin/clean-dummy-data', purgeDummyData)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected (MongoDB Atlas)' : 'disconnected',
    service: 'Kerala Kalyans Matrimony API Server',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// Error Handling Middleware
app.use(notFound)
app.use(errorHandler)

// Server Initialization
const startServer = async () => {
  try {
    await connectDB()
    await ensureAdminAccount()

    const server = app.listen(PORT, () => {
      const stopMarriageSurveyScheduler = startMarriageSurveyScheduler()
      server.once('close', stopMarriageSurveyScheduler)
      console.log('==============================================')
      console.log(` Apremiya Matrimony Server Running!`)
      console.log(` Mode: ${process.env.NODE_ENV || 'development'}`)
      console.log(` Port: http://localhost:${PORT}`)
      console.log(` MongoDB Atlas: Connected`)
      console.log(` Admin: ${process.env.ADMIN_EMAIL || 'admin@apremiya.com'}`)
      console.log('==============================================')
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use by another process.`)
        console.error(`👉 Stop any background process using port ${PORT} or configure a different PORT in .env\n`)
        process.exit(1)
      } else {
        console.error('Server error:', err)
      }
    })
  } catch (error) {
    console.error('Fatal startup error:', error.message)
    process.exit(1)
  }
}

startServer()

export default app
