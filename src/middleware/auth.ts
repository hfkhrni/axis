import { type Request, type Response, type NextFunction } from 'express'
import jwt, { type Secret } from 'jsonwebtoken'
import { JWT_SECRET } from '../config.ts'

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new Error()
    }

    const decoded = jwt.verify(token, JWT_SECRET as Secret)
    req.body.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Unauthenticated' })
  }
}
