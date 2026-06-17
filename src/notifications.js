// Notification service — clean, well-structured code
const VALID_CHANNELS = ['email', 'sms', 'push']
const VALID_PRIORITIES = ['low', 'normal', 'high']

/**
 * Send a notification to a user via the specified channel.
 * @param {string} userId - Target user ID
 * @param {string} channel - Delivery channel: email | sms | push
 * @param {string} message - Notification message content
 * @param {string} priority - Priority level: low | normal | high
 */
export async function sendNotification(userId, channel, message, priority = 'normal') {
  if (!userId || typeof userId !== 'string') {
    throw new TypeError('userId must be a non-empty string')
  }
  if (!VALID_CHANNELS.includes(channel)) {
    throw new TypeError(`channel must be one of: ${VALID_CHANNELS.join(', ')}`)
  }
  if (!message || typeof message !== 'string') {
    throw new TypeError('message must be a non-empty string')
  }
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new TypeError(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`)
  }

  const payload = {
    userId,
    channel,
    message: message.trim(),
    priority,
    sentAt: new Date().toISOString(),
  }

  // Route to appropriate provider
  switch (channel) {
    case 'email':  return sendEmail(payload)
    case 'sms':    return sendSMS(payload)
    case 'push':   return sendPush(payload)
  }
}

async function sendEmail({ userId, message, priority, sentAt }) {
  // In production: call email provider API using env var credentials
  const endpoint = process.env.EMAIL_SERVICE_URL
  const apiKey = process.env.EMAIL_API_KEY
  if (!endpoint || !apiKey) throw new Error('Email service not configured')

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: userId, body: message, priority, timestamp: sentAt }),
  })
  if (!res.ok) throw new Error(`Email delivery failed: ${res.status}`)
  return { channel: 'email', status: 'sent' }
}

async function sendSMS({ userId, message, sentAt }) {
  const endpoint = process.env.SMS_SERVICE_URL
  const apiKey = process.env.SMS_API_KEY
  if (!endpoint || !apiKey) throw new Error('SMS service not configured')

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: userId, text: message.slice(0, 160), timestamp: sentAt }),
  })
  if (!res.ok) throw new Error(`SMS delivery failed: ${res.status}`)
  return { channel: 'sms', status: 'sent' }
}

async function sendPush({ userId, message, priority }) {
  const endpoint = process.env.PUSH_SERVICE_URL
  const apiKey = process.env.PUSH_API_KEY
  if (!endpoint || !apiKey) throw new Error('Push service not configured')

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: userId, body: message, priority }),
  })
  if (!res.ok) throw new Error(`Push delivery failed: ${res.status}`)
  return { channel: 'push', status: 'sent' }
}
