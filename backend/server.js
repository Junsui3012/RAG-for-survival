// server.js — Express application entry point
// Step 5: Full Express app setup
import express from 'express'
const app = express()
const PORT = process.env.PORT || 5000

app.get('/api/health', (req, res) => res.json({ status: 'ok', step: 1 }))

app.listen(PORT, () => console.log(`Backend placeholder running on ${PORT}`))