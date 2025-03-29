import express from 'express'
import { getBalance } from '../controllers/accounts.ts'
import { authMiddleware } from '../middleware/auth.ts'

const router = express.Router()
router.get('/balance', authMiddleware, getBalance)
export default router
