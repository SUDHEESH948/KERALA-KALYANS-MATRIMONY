import express from 'express'
import {
  getStats,
  updateStats,
  purgeDummyData
} from '../controllers/statsController.js'

const router = express.Router()

router.get('/', getStats)
router.put('/', updateStats)
router.post('/clean-dummy-data', purgeDummyData)

export default router
