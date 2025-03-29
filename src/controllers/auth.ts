import { type NextFunction, type Request, type Response } from 'express'
import User from '../models/user.ts'
import Joi from 'joi'
import { JWT_SECRET } from '../config.ts'
import jwt, { type Secret } from 'jsonwebtoken'
import logger from '../utils/logger.ts'
import { createError } from '../utils/error.ts'

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

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.base': 'Email must be a string.',
    'string.email': 'Email must be a valid email address.',
    'any.required': 'Email is required.'
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': 'Password must be a string.',
    'any.required': 'Password is required.'
  })
})

interface RegisterRequestBody {
  email: string
  password: string
}

// Auth Controllers
export async function signUp(
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { error } = registerSchema.validate(req.body)
    if (error) {
      throw createError('VALIDATION_ERROR', 'Validation failed', error)
    }

    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw createError('BAD_REQUEST', 'User already exists')
    }

    const newUser = new User({
      email,
      password,
      account: { balance: 0 }
    })
    await newUser.save()

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET as Secret, {
      expiresIn: '1h'
    })

    res.status(201).json({
      // Created
      userId: newUser._id,
      token
    })
  } catch (error) {
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { error } = loginSchema.validate(req.body)
    if (error) {
      throw createError('VALIDATION_ERROR', 'Validation failed', error)
    }

    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      throw createError('UNAUTHORIZED', 'Invalid credentials')
    }

    const isValidPassword = await user.comparePassword(req.body.password)
    if (!isValidPassword) {
      throw createError('UNAUTHORIZED', 'Invalid credentials')
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET as Secret, {
      expiresIn: '1h'
    })

    res.status(200).json({
      // OK
      userId: user._id,
      token
    })
  } catch (error) {
    next(error)
  }
}
