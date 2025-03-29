import type { Request, Response } from 'express'
import User from '../models/user.ts'
import logger from '../utils/logger.ts'
import Joi from 'joi'
import Transaction from '../models/transaction.ts'

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
  res: Response
) {
  try {
    logger.info('Fetching account balance', {
      userId: req.user.userId
    })

    const user = await User.findOne({
      _id: req.user.userId
    })

    if (!user) {
      res.status(404).json({ message: 'User not found.' })
      return
    }

    logger.info('Balance fetched successfully', {
      userId: user._id,
      balance: user.account.balance
    })

    res.json({ balance: user.account.balance })
  } catch (error) {
    logger.error('Balance fetch failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export async function deposit(
  req: Request<{}, {}, AccountsRequestBody>,
  res: Response
) {
  // const session = await mongoose.startSession()
  try {
    console.log(req.user)
    const { error } = amountSchema.validate(req.body)
    if (error) {
      res.status(400).json({
        message: 'Validation error.',
        details: error.details.map((err) => err.message)
      })
      return
    }
    logger.info('Processing deposit transaction', {
      userId: req.user.userId
    })

    // session.startTransaction()

    const user = await User.findOne({
      _id: req.user.userId
    })

    if (!user) {
      res.status(404).json({ message: 'User not found.' })
      return
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
    res.json({ balance: user.account.balance })
  } catch (error) {
    logger.error('Deposit failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      accountId: req.user.userId
    })
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}

export async function withdraw(
  req: Request<{}, {}, AccountsRequestBody>,
  res: Response
) {
  // const session = await mongoose.startSession()
  try {
    console.log(req.user)
    const { error } = amountSchema.validate(req.body)
    if (error) {
      res.status(400).json({
        message: 'Validation error.',
        details: error.details.map((err) => err.message)
      })
      return
    }
    logger.info('Processing withdrawal transaction', {
      userId: req.user.userId
    })

    // session.startTransaction()

    const user = await User.findOne({
      _id: req.user.userId
    })

    if (!user) {
      res.status(404).json({ message: 'User not found.' })
      return
    }

    if (user.account.balance < req.body.amount!) {
      res.status(400).json({
        message: 'Insufficient balance.',
        currentBalance: user.account.balance
      })
      return
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
    res.json({ transactionId: transaction._id, balance: user.account.balance })
  } catch (error) {
    logger.error('Withdrawal failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      accountId: req.user.userId
    })
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Server error'
    })
  }
}
