import express, { type Request, type Response } from 'express'
import { signUp } from '../controllers/auth.ts'

const router = express.Router()
router.post('/signup', signUp)

export default router
