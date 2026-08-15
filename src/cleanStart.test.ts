import { describe, expect, it } from 'vitest'
import { requestsCleanStart } from './storage'

describe('enlace de inicio limpio', () => {
  it('reconoce exclusivamente el enlace especial', () => {
    expect(requestsCleanStart('?inicio=limpio')).toBe(true)
    expect(requestsCleanStart('')).toBe(false)
    expect(requestsCleanStart('?inicio=normal')).toBe(false)
  })
})
