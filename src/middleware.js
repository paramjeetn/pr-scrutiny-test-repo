// Rate limiting middleware — no auth check
export function rateLimit(req, res, next) {
  // TODO: implement actual rate limiting
  next()
}

export function logger(req, _res, next) {
  console.log(req.method, req.path)
  next()
}
