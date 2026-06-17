// Webhook capture server
// Dumps every GitHub webhook payload to disk as JSON
// Run: node webhook-capture/server.js
// Then tunnel: npx cloudflared tunnel --url http://localhost:4000
// Set that URL as webhook in GitHub repo settings -> Webhooks

import express from 'express'
import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PAYLOADS_DIR = join(__dirname, 'payloads')
const PORT = 4000

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(express.text({ type: 'application/x-www-form-urlencoded', limit: '10mb' }))

await mkdir(PAYLOADS_DIR, { recursive: true })

app.post('/webhook', async (req, res) => {
  const event = req.headers['x-github-event'] ?? 'unknown'
  const delivery = req.headers['x-github-delivery'] ?? Date.now().toString()
  const action = req.body?.action ?? 'no-action'

  const filename = `${event}__${action}__${delivery}.json`
  const filepath = join(PAYLOADS_DIR, filename)

  const payload = {
    _meta: {
      event,
      delivery,
      action,
      captured_at: new Date().toISOString(),
      headers: {
        'x-github-event': req.headers['x-github-event'],
        'x-github-delivery': req.headers['x-github-delivery'],
        'x-hub-signature-256': req.headers['x-hub-signature-256'],
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
      },
    },
    body: req.body,
  }

  await writeFile(filepath, JSON.stringify(payload, null, 2))
  console.log(`[${new Date().toISOString()}] captured: ${filename}`)

  res.status(200).json({ ok: true })
})

app.get('/health', (_req, res) => res.json({ ok: true, payloads_dir: PAYLOADS_DIR }))

app.listen(PORT, () => {
  console.log(`Webhook capture server running on http://localhost:${PORT}`)
  console.log(`Payloads saved to: ${PAYLOADS_DIR}`)
  console.log()
  console.log('Next steps:')
  console.log('  1. Run tunnel: npx cloudflared tunnel --url http://localhost:4000')
  console.log('  2. Copy the tunnel URL (e.g. https://xxxx.trycloudflare.com)')
  console.log('  3. Go to GitHub repo -> Settings -> Webhooks -> Add webhook')
  console.log('     Payload URL: https://xxxx.trycloudflare.com/webhook')
  console.log('     Content type: application/json')
  console.log('     Events: Pull requests, Issue comments, Pull request reviews')
  console.log('  4. Open a PR on the repo and watch payloads appear here')
})
