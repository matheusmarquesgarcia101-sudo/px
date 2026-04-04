import express from 'express'
import cors from 'cors'
import { env } from './config/env'
import router from './routes'

const app = express()

app.use(cors())
app.use(express.json())
app.use(router)

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`)
})
