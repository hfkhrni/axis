import { type Request, type Response } from 'express'
import User from '../models/user.ts'
import Joi from 'joi'
import { JWT_SECRET } from '../config.ts'
import jwt, { type Secret } from 'jsonwebtoken'

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string.',
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password must be a string.',
    'string.min': 'Password must be at least 6 characters long.',
    'any.required': 'Password is required.'
  })
})

interface RegisterRequestBody {
  email: string
  password: string
}

export async function signUp(
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
) {
  try {
    const { error } = registerSchema.validate(req.body)
    if (error) {
      res.status(400).json({
        message: 'Validation error.',
        details: error.details.map((err) => err.message)
      })
      return
    }

    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400).json({ message: 'User already exists.' })
      return
    }

    const newUser = new User({
      email,
      password,
      account: {
        balance: 0
      }
    })
    await newUser.save()

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET as Secret, {
      expiresIn: '1h'
    })

    res.status(201).json({
      userId: newUser._id,
      token: token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      message: 'Server error.',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
