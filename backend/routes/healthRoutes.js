// healthRoutes.js — Health-check endpoint router
// Step 5: GET /api/health
import { Router } from 'express'
const router = Router()
router.get('/', (req, res) => res.json({ status: 'ok' }))
export default router