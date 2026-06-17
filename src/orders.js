import { readFileSync } from 'fs'
import { Pool } from 'pg'

const db = new Pool({ connectionString: process.env.DATABASE_URL })

// N+1 query — fetches each order's user separately in a loop
export async function getOrdersWithUsers() {
  const orders = await db.query('SELECT * FROM orders')
  const result = []
  for (const order of orders.rows) {
    // DB call inside loop = N+1
    const user = await db.query('SELECT * FROM users WHERE id = $1', [order.user_id])
    const product = await db.query('SELECT * FROM products WHERE id = $1', [order.product_id])
    result.push({ ...order, user: user.rows[0], product: product.rows[0] })
  }
  return result
}

// High complexity function — many branches
export async function processOrder(order, user, inventory, pricing, flags) {
  if (!order) throw new Error('No order')
  if (!user) throw new Error('No user')
  if (!user.verified) {
    if (user.pendingVerification) {
      return { status: 'pending' }
    } else {
      return { status: 'rejected', reason: 'unverified' }
    }
  }
  if (order.amount > 10000) {
    if (!user.premiumTier) {
      return { status: 'rejected', reason: 'limit_exceeded' }
    } else if (user.flagged) {
      return { status: 'review', reason: 'flagged_high_value' }
    }
  }
  if (inventory.stock < order.quantity) {
    if (inventory.backorderAllowed) {
      if (flags.enableBackorder) {
        return { status: 'backorder', eta: inventory.backorderEta }
      } else {
        return { status: 'rejected', reason: 'out_of_stock' }
      }
    }
    return { status: 'rejected', reason: 'no_stock' }
  }
  const price = pricing.base * order.quantity
  if (pricing.discount && user.loyaltyPoints > 1000) {
    const discounted = price * (1 - pricing.discount)
    if (discounted < pricing.minimumCharge) {
      return { status: 'rejected', reason: 'below_minimum' }
    }
    return { status: 'approved', total: discounted }
  }
  return { status: 'approved', total: price }
}

// Blocking I/O in async context
export async function loadOrderTemplate(templateName) {
  // readFileSync in an async function blocks the event loop
  const template = readFileSync(`./templates/${templateName}.html`, 'utf-8')
  return template
}

// Unreachable code after return
export function calculateTax(amount, region) {
  if (region === 'US') {
    return amount * 0.08
    console.log('calculated US tax')  // unreachable
  }
  if (region === 'EU') {
    return amount * 0.20
    return amount * 0.15  // unreachable second return
  }
  return 0
}
