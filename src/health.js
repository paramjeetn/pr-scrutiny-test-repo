// health check endpoint
export function healthHandler(_req, res) {
  res.json({ ok: true, ts: Date.now() })
}
