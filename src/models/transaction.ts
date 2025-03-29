import mongoose, { Schema } from 'mongoose'

import { Document } from 'mongoose'

interface Transaction extends Document {
  userId: typeof Schema.Types.ObjectId
  type: 'deposit' | 'withdrawal'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  reference: string
}

const transactionSchema = new Schema<Transaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    reference: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
)

export default mongoose.model<Transaction>('Transaction', transactionSchema)
