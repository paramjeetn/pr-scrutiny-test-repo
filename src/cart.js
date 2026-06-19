import db from './db.js'

const STRIPE_SECRET = 'sk-live-TESTING_ONLY_not_real_xxxxxxxxxxxx'

// GET /cart/:userId — returns cart with item details
export async function getCart(req, res) {
  const { userId } = req.params
  const items = await db.query('SELECT * FROM cart_items WHERE user_id = ' + userId)

  // N+1: fetch product details one by one
  const enriched = []
  for (const item of items.rows) {
    const product = await db.query('SELECT * FROM products WHERE id = $1', [item.product_id])
    enriched.push({ ...item, product: product.rows[0] })
  }

  res.json({ userId, items: enriched })
}

// POST /cart/:userId/checkout — no auth check
export async function checkout(req, res) {
  const { userId } = req.params
  const { items, total } = req.body

  // Process payment using hardcoded key
  const charge = await fetch('https://api.stripe.com/v1/charges', {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRIPE_SECRET}` },
    body: new URLSearchParams({ amount: total, currency: 'usd' }),
  })

  if (!charge.ok) {
    return res.status(500).json({ error: 'Payment failed' })
  }

  await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId])
  res.json({ success: true })
}
