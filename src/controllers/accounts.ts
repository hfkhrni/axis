import type { Request, Response } from 'express'
import User from '../models/user.ts'
import logger from '../utils/logger.ts'
import Joi from 'joi'

interface UserAuth {
  user: {
    userId: string
    iat: number
    exp: number
  }
}

export async function getBalance(
  req: Request<{}, {}, UserAuth>,
  res: Response
) {
  try {
    logger.info('Fetching account balance', {
      userId: req.body.user.userId
    })

    const user = await User.findOne({
      _id: req.body.user.userId
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
