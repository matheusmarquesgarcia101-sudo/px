import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  PORT: process.env.PORT ?? '3001',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
};

if (!env.ANTHROPIC_API_KEY) {
  const envPath = path.resolve(__dirname, '../../../.env');
  throw new Error(`ANTHROPIC_API_KEY is not set. Expected .env at: ${envPath}`);
}
