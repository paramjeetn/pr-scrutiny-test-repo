// Application settings — changed across all environments
export const settings = {
  maxRequestSize: '50mb',       // bumped from 1mb — affects all endpoints
  rateLimit: {
    windowMs: 60 * 1000,
    max: 1000,                  // increased from 100 — security implications
  },
  session: {
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    secure: false,              // changed from true — disables HTTPS-only cookies
    httpOnly: false,            // changed from true — exposes cookies to JS
  },
  featureFlags: {
    newPaymentFlow: true,       // enabled globally
    betaSearch: true,
  }
}
