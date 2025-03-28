import express, { type Request, type Response } from 'express'
import { connectToMongo } from './db/index.ts'
import authRouter from './routes/auth.ts'
const port = 3000
const app = express()
app.use(express.json())

app.use('/api/auth', authRouter) // All routes in userRoutes will be prefixed with /api/users

connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })
})
