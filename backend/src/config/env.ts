import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY não definida no .env')
}

export const env = {
  ANTHROPIC_API_KEY,
  PORT: Number(process.env.PORT) || 3001,
}
