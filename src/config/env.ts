import dotenv from 'dotenv'
import path from 'path'

const nodeEnv = process.env.NODE_ENV ?? 'development'

dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) })