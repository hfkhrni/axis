import express, { type Request, type Response } from 'express'
import { login, signUp } from '../controllers/auth.ts'

const router = express.Router()
router.post('/signup', signUp)
router.post('/login', login)

export default router
