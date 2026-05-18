export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
}

export function errorHandler(err, req, res, next) {
  const statusCode = Number(err.statusCode || err.status || 500);
  const safeStatus = statusCode >= 400 && statusCode < 600 ? statusCode : 500;

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);

  res.status(safeStatus).json({
    success: false,
    message: safeStatus === 500 && process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
