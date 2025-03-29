import type { NextFunction, Request, Response } from 'express'
import User from '../models/user.ts'
import logger from '../utils/logger.ts'
import Joi from 'joi'
import Transaction from '../models/transaction.ts'
import { createError } from '../utils/error.ts'

interface AccountsRequestBody {
  user: {
    userId: string
    iat: number
    exp: number
  }
  amount?: number
}

const amountSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'any.required': 'Amount is required'
  })
})

export async function getBalance(
  req: Request<{}, {}, AccountsRequestBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await User.findOne({ _id: req.user.userId })
    if (!user) {
      throw createError('NOT_FOUND', 'User not found')
    }

    logger.info('Balance fetched successfully', {
      userId: user._id,
      balance: user.account.balance
    })

    res.status(200).json({
      // OK
      balance: user.account.balance
    })
  } catch (error) {
    next(error)
  }
}

export async function deposit(
  req: Request<{}, {}, AccountsRequestBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const { error } = amountSchema.validate(req.body)
    if (error) {
      throw createError('VALIDATION_ERROR', 'Validation failed', error)
    }

    const user = await User.findOne({ _id: req.user.userId })
    if (!user) {
      throw createError('NOT_FOUND', 'User not found')
    }

    const transaction = new Transaction({
      userId: user._id,
      type: 'deposit',
      amount: req.body.amount,
      reference: `DEP${Date.now()}`,
      status: 'completed'
    })

    user.account.balance += req.body.amount!
    await Promise.all([user.save(), transaction.save()])

    // await session.commitTransaction()

    logger.info('Deposit processed successfully', {
      transactionId: transaction._id,
      userId: user._id,
      amount: req.body.amount,
      newBalance: user.account.balance
    })

    res.status(201).json({
      // Created
      transactionId: transaction._id,
      balance: user.account.balance
    })
  } catch (error) {
    next(error)
  }
}
export async function withdraw(
  req: Request<{}, {}, AccountsRequestBody>,
  res: Response,
  next: NextFunction
) {
  // const session = await mongoose.startSession()
  try {
    const { error } = amountSchema.validate(req.body)
    if (error) {
      throw createError('VALIDATION_ERROR', 'Validation failed', error)
    }
    // session.startTransaction()

    const user = await User.findOne({ _id: req.user.userId })
    if (!user) {
      throw createError('NOT_FOUND', 'User not found')
    }

    if (user.account.balance < req.body.amount!) {
      throw createError('BAD_REQUEST', 'Insufficient balance')
    }

    const transaction = new Transaction({
      userId: user._id,
      type: 'withdrawal',
      amount: req.body.amount,
      reference: `WDR${Date.now()}`,
      status: 'completed'
    })

    user.account.balance -= req.body.amount!
    await Promise.all([user.save(), transaction.save()])

    // await session.commitTransaction()

    logger.info('Withdrawal processed successfully', {
      transactionId: transaction._id,
      userId: user._id,
      amount: req.body.amount,
      newBalance: user.account.balance
    })

    res.status(201).json({
      transactionId: transaction._id,
      balance: user.account.balance
    })
  } catch (error) {
    next(error)
  }
}
