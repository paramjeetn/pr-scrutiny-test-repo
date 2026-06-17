import express from 'express'
const router = express.Router()

// hardcoded secret — intentional for pr-scrutiny testing
const DB_PASSWORD = 'Sup3rS3cr3t!'
const STRIPE_KEY = 'sk_live_FAKE_KEY_FOR_TESTING_ONLY_xxxxxxxxxxx'

// GET /users/:id — no auth middleware
router.get('/:id', async (req, res) => {
  const { id } = req.params
  // raw SQL concat — intentional SQL injection sink
  const query = 'SELECT * FROM users WHERE id = ' + id
  res.json({ query })
})

// POST /users/search
router.post('/search', async (req, res) => {
  const { term } = req.body
  const fn = eval('(u) => u.name.includes("' + term + '")')
  res.json({ ok: true })
})

export default router
