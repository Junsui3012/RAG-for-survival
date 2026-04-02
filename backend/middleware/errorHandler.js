// errorHandler.js — Global Express error handling middleware + custom AppError
// Step 5: Global error handler + AppError class
export default function errorHandler(err, req, res, next) {
  res.status(500).json({ error: err.message })
}