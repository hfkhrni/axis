import { MongoClient, ServerApiVersion, type Db } from 'mongodb'

const user = process.env.MONGO_INITDB_ROOT_USERNAME || ''
const password = process.env.MONGO_INITDB_ROOT_PASSWORD || ''
const host = process.env.MONGO_HOST || 'localhost'
const port = process.env.MONGO_PORT || '27017'
const dbName = process.env.MONGO_DATABASE || ''

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

let db: Db | null = null

export async function connectToMongo(): Promise<void> {
  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })

    await client.connect()
    console.log('Connected to MongoDB')

    db = client.db(dbName)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw error
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectToMongo first.')
  }
  return db
}
