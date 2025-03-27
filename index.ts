import express from 'express'

const port = 3000
const app = express()

app.get('/', (req, res) => {
  res.send('hi')
})

app.listen(port, () => {
  console.log(`listening on ${port}`)
})
