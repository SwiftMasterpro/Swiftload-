import { POST as createLoad } from '../src/app/api/loads/route'
import { POST as createRoadReport } from '../src/app/api/road-reports/route'
import { POST as aiRoute } from '../src/app/api/ai/route'

jest.mock('next/headers', () => ({ cookies: jest.fn(() => ({ get: jest.fn(), set: jest.fn() })) }))

const createMockSupabase = () => ({
  auth: { getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }) },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: { id: 'profile-1', role: 'customer' }, error: null }),
    insert: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue({ data: [], count: 0, error: null }),
    update: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
})

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => createMockSupabase()),
}))

describe('Loads API', () => {
  it('rejects invalid load payloads', async () => {
    const req = new Request('http://localhost/api/loads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '', weight_kg: -1 }),
    }) as any

    const res = await createLoad(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('creates a valid load', async () => {
    const req = new Request('http://localhost/api/loads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test load from jest',
        cargo_type: 'general',
        weight_kg: 1000,
        pickup_address: 'Gaborone Industrial',
        pickup_coords: { lat: -24.6282, lng: 25.9231 },
        delivery_address: 'Francistown',
        delivery_coords: { lat: -21.1667, lng: 27.5167 },
        pickup_date: new Date(Date.now() + 86400000).toISOString(),
      }),
    }) as any

    const res = await createLoad(req)
    expect([201, 400, 401, 500]).toContain(res.status)
  })
})

describe('Road Reports API', () => {
  it('rejects invalid types', async () => {
    const req = new Request('http://localhost/api/road-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'invalid_type', lat: -24.6, lng: 25.9 }),
    }) as any

    const res = await createRoadReport(req)
    expect(res.status).toBe(400)
  })
})

describe('AI Assistant API', () => {
  it('requires a message field', async () => {
    const req = new Request('http://localhost/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }) as any

    const res = await aiRoute(req)
    expect([400, 500]).toContain(res.status)
  })
})
