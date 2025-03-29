import { type ValidationError } from 'joi'

type ErrorType =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR'

interface ErrorResponse {
  statusCode: number
  message: string
  type: ErrorType
  errors?: Record<string, string>
}

interface CustomError extends Error {
  type?: string
  statusCode?: number
  errors?: Record<string, string>
}

const ERROR_TYPES: Record<ErrorType, ErrorResponse> = {
  VALIDATION_ERROR: {
    statusCode: 400,
    message: 'Validation error',
    type: 'VALIDATION_ERROR'
  },
  NOT_FOUND: {
    statusCode: 404,
    message: 'Resource not found',
    type: 'NOT_FOUND'
  },
  UNAUTHORIZED: {
    statusCode: 401,
    message: 'Unauthorized',
    type: 'UNAUTHORIZED'
  },
  FORBIDDEN: {
    statusCode: 403,
    message: 'Forbidden',
    type: 'FORBIDDEN'
  },
  BAD_REQUEST: {
    statusCode: 400,
    message: 'Bad request',
    type: 'BAD_REQUEST'
  },
  INTERNAL_ERROR: {
    statusCode: 500,
    message: 'Internal server error',
    type: 'INTERNAL_ERROR'
  }
}

export function createError(
  type: ErrorType,
  customMessage?: string,
  validationError?: ValidationError
): CustomError {
  const error = new Error(
    customMessage || ERROR_TYPES[type].message
  ) as CustomError

  error.type = type
  error.statusCode = ERROR_TYPES[type].statusCode
  error.errors = validationError?.details.reduce(
    (acc, curr) => {
      acc[curr.path.join('.')] = curr.message
      return acc
    },
    {} as Record<string, string>
  )

  return error
}
