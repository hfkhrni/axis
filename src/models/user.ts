import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

interface UserModel extends Document {
  email: string
  password: string
  isActive: boolean
  account: Account
  comparePassword(candidatePassword: string): Promise<boolean>
}

interface Account {
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

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model<UserModel>('User', userSchema)

export default User
