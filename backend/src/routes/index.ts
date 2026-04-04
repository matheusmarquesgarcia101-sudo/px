import { Router } from 'express'
import { healthCheck } from '../controllers/health'
import { chat } from '../controllers/chat'

const router = Router()

router.get('/health', healthCheck)
router.post('/chat', chat)

export default router
