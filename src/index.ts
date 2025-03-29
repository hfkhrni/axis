import express, { type Request, type Response } from 'express'
import { connectToMongo } from './db/index.ts'
import authRouter from './routes/auth.ts'
import { authMiddleware } from './middleware/auth.ts'
import accountsRouter from './routes/accounts.ts'

const port = 3000
const app = express()

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/accounts', authMiddleware, accountsRouter)

connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })
})
