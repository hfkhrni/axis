import type { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger.ts'

interface CustomError extends Error {
  type?: string
  statusCode?: number
  errors?: Record<string, string>
}

function errorHandler(error: CustomError, req: Request, res: Response) {
  const timestamp = new Date().toISOString()

  logger.error('Error occurred', {
    timestamp,
    path: req.path,
    method: req.method,
    error: {
      type: error.type || 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      statusCode: error.statusCode || 500,
      errors: error.errors, // for validation errors
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    }
  })

  // check if the error is a custom error (e.g., created by createError)
  if (error.type && error.statusCode) {
    res.status(error.statusCode).json({
      type: error.type,
      message: error.message,
      ...(error.errors && { errors: error.errors }),
      timestamp
    })
    return
  }

  // unexpected errors
  res.status(500).json({
    type: 'INTERNAL_ERROR',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message || 'An unexpected error occurred',
    timestamp
  })
}

export default errorHandler
