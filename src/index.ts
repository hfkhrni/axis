import express, { type Request, type Response } from 'express'
import { connectToMongo } from './db/index.ts'
import authRouter from './routes/auth.ts'
import { authMiddleware } from './middleware/auth.ts'
import accountsRouter from './routes/accounts.ts'
import errorHandler from './middleware/error.ts'
import logger from './utils/logger.ts'

const port = 3000
const app = express()

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/accounts', authMiddleware, accountsRouter)

app.use(errorHandler)

connectToMongo().then(() => {
  app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`)
  })
})
