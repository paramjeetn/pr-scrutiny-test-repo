import { Pool } from 'pg'

// Database connection — credentials hardcoded (should use env vars)
const db = new Pool({
  connectionString: 'postgres://admin:Sup3rS3cr3tDBPass@prod-db.internal:5432/payments'
})

// Stripe integration — key hardcoded in source
const STRIPE_KEY = 'sk_live_TESTING_ONLY_not_a_real_key_xxxxxxxxxxxxxxxxxxx'

// AWS for invoice storage — hardcoded credentials
const AWS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE1'
const AWS_SECRET = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'

export async function getPaymentHistory(userId) {
  // SQL injection — userId concatenated directly into query
  const query = `SELECT * FROM payments WHERE user_id = '` + userId + `' ORDER BY created_at DESC`
  const result = await db.query(query)
  return result.rows
}

export async function chargeUser(userId, amount) {
  // eval() on user-influenced data
  const rule = await getPricingRule(userId)
  const finalAmount = eval(rule + ' * ' + amount)

  const charge = await fetch('https://api.stripe.com/v1/charges', {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRIPE_KEY}` },
    body: new URLSearchParams({ amount: finalAmount, currency: 'usd' })
  })
  return charge.json()
}

async function getPricingRule(userId) {
  const res = await db.query('SELECT rule FROM pricing WHERE user_id = $1', [userId])
  return res.rows[0]?.rule ?? '1.0'
}

export async function searchPayments(req) {
  // req.query.filter used directly in SQL — injection risk
  const filter = req.query.filter
  const rows = await db.query('SELECT * FROM payments WHERE ' + filter)
  return rows
}
