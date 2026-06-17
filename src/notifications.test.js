import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendNotification } from './notifications.js'

// Mock all fetch calls
global.fetch = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  process.env.EMAIL_SERVICE_URL = 'https://email.test'
  process.env.EMAIL_API_KEY = 'test-key'
  fetch.mockResolvedValue({ ok: true })
})

describe('sendNotification', () => {
  it('sends email notification', async () => {
    const result = await sendNotification('user-123', 'email', 'Hello!')
    expect(result).toEqual({ channel: 'email', status: 'sent' })
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('rejects invalid channel', async () => {
    await expect(sendNotification('u', 'fax', 'msg')).rejects.toThrow('channel must be one of')
  })

  it('rejects empty userId', async () => {
    await expect(sendNotification('', 'email', 'msg')).rejects.toThrow('userId')
  })

  it('trims message whitespace', async () => {
    await sendNotification('user-1', 'email', '  hello  ')
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.body).toBe('hello')
  })
})
