import express from 'express'
import { connectToMongo, getDb } from './db/index.ts'

const port = 3000
const app = express()

app.get('/', async (req, res) => {
  try {
    const db = getDb()
    const collection = db.collection('testCollection')
    const data = await collection.find({}).toArray()
    res.json(data)
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).send('Internal Server Error')
  }
})

connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })
})
