import { type Request, type Response, type NextFunction } from 'express'
import jwt, { type Secret } from 'jsonwebtoken'
import { JWT_SECRET } from '../config.ts'
import { createError } from '../utils/error.ts'

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw createError('UNAUTHORIZED', 'Authorization token is missing')
    }

    const decoded = jwt.verify(token, JWT_SECRET as Secret)

    req.user = decoded

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      const message =
        error.name === 'TokenExpiredError'
          ? 'Authorization token has expired'
          : 'Invalid authorization token'
      const customError = createError('UNAUTHORIZED', message)
      res.status(customError.statusCode!).json(customError)
      return
    }

    const customError = createError(
      'UNAUTHORIZED',
      'Failed to authenticate user'
    )
    res.status(customError.statusCode!).json(customError)
  }
}
