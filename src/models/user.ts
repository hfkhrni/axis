import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface UserModel extends Document {
  email: string
  password: string
  isActive: boolean
  account: Account
}

export interface Account {
  accountNumber: string
  balance: number
}

const accountSchema = new Schema<Account>(
  {
    balance: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
)

const userSchema = new Schema<UserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    isActive: {
      type: Boolean,
      default: true
    },
    account: accountSchema
  },
  {
    timestamps: true,
    versionKey: false
  }
)

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
  next()
})

const User = mongoose.model<UserModel>('User', userSchema)

export default User
