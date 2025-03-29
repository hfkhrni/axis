import mongoose from 'mongoose'

const config = {
  user: process.env.MONGO_INITDB_ROOT_USERNAME,
  password: process.env.MONGO_INITDB_ROOT_PASSWORD,
  host: process.env.MONGO_HOST || 'localhost',
  port: process.env.MONGO_PORT || '27017',
  dbName: process.env.MONGO_DATABASE
}

const requiredVars = ['user', 'password', 'dbName'] as const
for (const key of requiredVars) {
  if (!config[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

const uri = `mongodb://${config.user}:${config.password}@${config.host}:${config.port}`

export async function connectToMongo(): Promise<void> {
  try {
    await mongoose.connect(uri, { dbName: config.dbName })
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw error
  }
}
