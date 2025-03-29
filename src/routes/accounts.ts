import express from 'express'
import { deposit, getBalance, withdraw } from '../controllers/accounts.ts'

const router = express.Router()
router.get('/balance', getBalance)
router.post('/deposit', deposit)
router.post('/withdraw', withdraw)

export default router
