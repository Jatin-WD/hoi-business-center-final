const buckets = new Map();

export function createRateLimiter({ windowMs, limit, message }) {
  return (req, res, next) => {
    const key = `${req.ip || 'unknown'}:${req.method}:${req.originalUrl}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    bucket.count += 1;
    next();
  };
}
